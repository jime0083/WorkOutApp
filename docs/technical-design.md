# WorkOutApp 技術設計書

## 1. システムアーキテクチャ

### 1.1 全体構成図

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              クライアント層                               │
│  ┌─────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │     iOS App (React Native)   │    │      Web App (React SPA)          │ │
│  │  ┌─────────────────────┐│    │  ┌─────────────────────────────┐   │ │
│  │  │ 偽装UI (ヘルスケア)  ││    │  │  メッセージングUI (LINE風)   │   │ │
│  │  │ - ダミーダッシュボード││    │  │  - トーク一覧              │   │ │
│  │  │ - 設定画面          ││    │  │  - トークルーム            │   │ │
│  │  └─────────────────────┘│    │  │  - 友達管理               │   │ │
│  │  ┌─────────────────────┐│    │  │  - プロフィール           │   │ │
│  │  │ 通知ハンドラー       ││    │  └─────────────────────────────┘   │ │
│  │  └─────────────────────┘│    │  ┌─────────────────────────────┐   │ │
│  └─────────────────────────┘    │  │  Firebase SDK               │   │ │
│                                  │  └─────────────────────────────┘   │ │
│                                  └─────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTPS
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              Firebase層                                  │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────────────────┐  │
│  │ Authentication │ │   Firestore    │ │    Cloud Functions         │  │
│  │                │ │                │ │                            │  │
│  │ - Email/Pass   │ │ - users        │ │ - sendNotification         │  │
│  │ - ダミー認証   │ │ - friendships  │ │ - processMessage           │  │
│  │ - 本命認証     │ │ - conversations│ │ - deleteAllUserData        │  │
│  │                │ │ - messages     │ │ - validateSubscription     │  │
│  └────────────────┘ └────────────────┘ │ - resetMessageCount        │  │
│                                        └────────────────────────────┘  │
│  ┌────────────────┐ ┌────────────────┐                                 │
│  │ Cloud Messaging│ │    Storage     │                                 │
│  │                │ │                │                                 │
│  │ - Push通知     │ │ - 画像保存     │                                 │
│  │ - 偽装メッセージ│ │ - 動画保存     │                                 │
│  └────────────────┘ └────────────────┘                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.2 通信フロー

```
[メッセージ送信フロー]
User A (Web) → Firestore (messages) → Cloud Functions (onWrite trigger)
                                            ↓
                                     FCM → User B (iOS App)
                                            ↓
                                     「アップデートしてください」通知

[認証フロー]
User → iOS App → ログイン画面
                    ↓
        ┌──────────┴──────────┐
        ↓                     ↓
   ダミーPW入力           本命PW入力
        ↓                     ↓
   Firebase Auth          Firebase Auth
   (dummy credential)     (real credential)
        ↓                     ↓
   ダミー画面表示         Safari起動 → Web App
```

---

## 2. データベース設計（Firestore）

### 2.1 コレクション詳細

#### users コレクション

```typescript
interface User {
  // 基本情報
  id: string;                    // Firebase Auth UID
  realEmail: string;             // 本命メールアドレス
  dummyEmail: string;            // ダミーメールアドレス

  // プロフィール
  visibleUserId: string;         // 表示用ユーザーID（友達検索用）
  nickname: string;              // ニックネーム
  profileImageUrl: string | null;// プロフィール画像URL

  // 課金状態
  subscriptionStatus: 'free' | 'premium';
  subscriptionPlan: 'monthly' | 'yearly' | null;
  subscriptionExpiry: Timestamp | null;

  // メッセージ制限（無料ユーザー用）
  monthlyMessageCount: number;   // 今月の送信数
  messageCountResetDate: Timestamp; // 次回リセット日

  // FCMトークン
  fcmToken: string | null;

  // メタデータ
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}
```

**Firestoreパス**: `users/{userId}`

**セキュリティルール**:
```javascript
match /users/{userId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

#### friendships コレクション

```typescript
interface Friendship {
  id: string;                    // ドキュメントID
  requesterId: string;           // 申請者のUID
  receiverId: string;            // 受信者のUID
  status: 'pending' | 'accepted' | 'blocked';
  blockedBy: string | null;      // ブロックした側のUID

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Firestoreパス**: `friendships/{friendshipId}`

**インデックス**:
- `requesterId` + `status`
- `receiverId` + `status`
- `requesterId` + `receiverId`

#### conversations コレクション

```typescript
interface Conversation {
  id: string;                    // ドキュメントID
  participantIds: string[];      // 参加者のUID配列（2人）

  // 最新メッセージ情報（一覧表示用）
  lastMessage: {
    content: string;             // メッセージ内容（プレビュー用）
    senderId: string;
    type: 'text' | 'image' | 'video';
    createdAt: Timestamp;
  } | null;

  // 未読数
  unreadCount: {
    [userId: string]: number;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Firestoreパス**: `conversations/{conversationId}`

#### messages サブコレクション

```typescript
interface Message {
  id: string;                    // ドキュメントID
  conversationId: string;        // 親会話ID
  senderId: string;              // 送信者UID

  // メッセージ内容
  type: 'text' | 'image' | 'video';
  content: string;               // テキスト or メディアURL
  thumbnailUrl: string | null;   // 動画のサムネイル

  // 状態
  isRead: boolean;
  readAt: Timestamp | null;
  isDeleted: boolean;            // 送信取消済みフラグ
  deletedAt: Timestamp | null;

  createdAt: Timestamp;
}
```

**Firestoreパス**: `conversations/{conversationId}/messages/{messageId}`

**インデックス**:
- `conversationId` + `createdAt`
- `senderId` + `createdAt`

#### subscriptions コレクション（課金情報）

```typescript
interface Subscription {
  id: string;                    // ドキュメントID
  userId: string;                // ユーザーUID

  // Apple IAP情報
  productId: string;             // 'monthly_500' | 'yearly_5000'
  transactionId: string;         // Appleトランザクション
  originalTransactionId: string;

  // 期間
  purchaseDate: Timestamp;
  expiresDate: Timestamp;

  // 状態
  status: 'active' | 'expired' | 'cancelled';

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Firestoreパス**: `subscriptions/{subscriptionId}`

### 2.2 データベース図（ER図）

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   users     │     │ friendships  │     │conversations │
├─────────────┤     ├──────────────┤     ├──────────────┤
│ id (PK)     │←────│ requesterId  │     │ id (PK)      │
│ realEmail   │←────│ receiverId   │     │participantIds│──→ users.id
│ dummyEmail  │     │ status       │     │ lastMessage  │
│ visibleUserId│     │ blockedBy    │     │ unreadCount  │
│ nickname    │     └──────────────┘     └──────┬───────┘
│ profileImage│                                 │
│ subscription│     ┌──────────────┐            │
│ fcmToken    │     │  messages    │            │
└─────────────┘     ├──────────────┤            │
                    │ id (PK)      │            │
┌─────────────┐     │conversationId│────────────┘
│subscriptions│     │ senderId     │──→ users.id
├─────────────┤     │ type         │
│ id (PK)     │     │ content      │
│ userId      │──→  │ isRead       │
│ productId   │     │ isDeleted    │
│transactionId│     └──────────────┘
│ expiresDate │
│ status      │
└─────────────┘
```

---

## 3. API設計（Cloud Functions）

### 3.1 認証関連

#### createUser
新規ユーザー作成時にユーザードキュメントを初期化

```typescript
// Trigger: Firebase Auth onCreate
export const createUser = functions.auth.user().onCreate(async (user) => {
  // 処理内容:
  // 1. usersコレクションにドキュメント作成
  // 2. visibleUserIdを自動生成
  // 3. 無料プランとして初期化
  // 4. messageCountResetDateを設定
});
```

#### deleteUser
ユーザー削除時の全データクリーンアップ

```typescript
// Trigger: Firebase Auth onDelete
export const deleteUser = functions.auth.user().onDelete(async (user) => {
  // 処理内容:
  // 1. usersドキュメント削除
  // 2. 関連するfriendships削除
  // 3. 関連するconversations/messages削除
  // 4. Storage内の画像/動画削除
  // 5. subscriptions削除
});
```

### 3.2 メッセージ関連

#### onMessageCreate
メッセージ作成時のトリガー

```typescript
// Trigger: Firestore onCreate
export const onMessageCreate = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    // 処理内容:
    // 1. conversationのlastMessage更新
    // 2. 受信者のunreadCount増加
    // 3. 受信者にプッシュ通知送信
    // 4. 送信者のmonthlyMessageCount増加（無料ユーザーの場合）
  });
```

#### sendPushNotification
偽装プッシュ通知送信

```typescript
// HTTP Callable Function
export const sendPushNotification = functions.https.onCall(
  async (data, context) => {
    // 処理内容:
    // 1. 受信者のfcmToken取得
    // 2. 「アップデートしてください」通知送信
    // 3. 通知ログ記録
  }
);
```

### 3.3 友達関連

#### sendFriendRequest
友達申請送信

```typescript
// HTTP Callable Function
export const sendFriendRequest = functions.https.onCall(
  async (data: { targetVisibleUserId: string }, context) => {
    // 処理内容:
    // 1. targetVisibleUserIdからユーザー検索
    // 2. 既存の友達関係チェック
    // 3. ブロック状態チェック
    // 4. friendshipsドキュメント作成（status: 'pending'）
    // 5. 相手に通知
  }
);
```

#### respondToFriendRequest
友達申請への応答

```typescript
// HTTP Callable Function
export const respondToFriendRequest = functions.https.onCall(
  async (data: { friendshipId: string, accept: boolean }, context) => {
    // 処理内容:
    // 1. friendshipドキュメント取得・権限チェック
    // 2. statusを'accepted'または削除
    // 3. acceptの場合、conversationドキュメント作成
  }
);
```

#### blockUser
ユーザーブロック

```typescript
// HTTP Callable Function
export const blockUser = functions.https.onCall(
  async (data: { targetUserId: string }, context) => {
    // 処理内容:
    // 1. 既存のfriendship取得または作成
    // 2. status: 'blocked', blockedBy: context.auth.uid に更新
  }
);
```

### 3.4 課金関連

#### verifyAppleReceipt
Appleレシート検証

```typescript
// HTTP Callable Function
export const verifyAppleReceipt = functions.https.onCall(
  async (data: { receiptData: string }, context) => {
    // 処理内容:
    // 1. Apple Storeサーバーにレシート送信
    // 2. レスポンス検証
    // 3. subscriptionsドキュメント作成/更新
    // 4. userのsubscriptionStatus更新
  }
);
```

#### checkSubscriptionExpiry
定期的な課金状態チェック

```typescript
// Scheduled Function (毎日0時実行)
export const checkSubscriptionExpiry = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    // 処理内容:
    // 1. expiresDateが過去のsubscriptions取得
    // 2. statusを'expired'に更新
    // 3. userのsubscriptionStatusを'free'に更新
  });
```

#### resetMonthlyMessageCount
月次メッセージ数リセット

```typescript
// Scheduled Function (毎日0時実行)
export const resetMonthlyMessageCount = functions.pubsub
  .schedule('0 0 * * *')
  .onRun(async (context) => {
    // 処理内容:
    // 1. messageCountResetDateが今日のユーザー取得
    // 2. monthlyMessageCountを0にリセット
    // 3. messageCountResetDateを来月に更新
  });
```

### 3.5 緊急削除

#### panicDelete
全データ緊急削除（パニックボタン）

```typescript
// HTTP Callable Function
export const panicDelete = functions.https.onCall(
  async (data, context) => {
    // 処理内容:
    // 1. 課金ユーザーチェック
    // 2. usersドキュメント削除
    // 3. 全friendships削除
    // 4. 全conversations/messages削除
    // 5. Storage内の全メディア削除
    // 6. Firebase Authアカウント削除
    // 7. subscriptions削除
  }
);
```

---

## 4. コンポーネント設計

### 4.1 iOSアプリ（React Native）

```
src/
├── App.tsx                      # エントリーポイント
├── navigation/
│   ├── RootNavigator.tsx        # ルートナビゲーション
│   ├── AuthNavigator.tsx        # 認証フロー
│   └── MainNavigator.tsx        # メイン画面フロー
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.tsx      # ログイン画面
│   │   └── RegisterScreen.tsx   # 新規登録画面
│   ├── dummy/
│   │   ├── DummyHomeScreen.tsx  # ダミーホーム（ヘルスケア風）
│   │   ├── DummyStatsScreen.tsx # ダミー統計画面
│   │   └── DummySettingsScreen.tsx # ダミー設定画面
│   └── settings/
│       └── AppSettingsScreen.tsx # アプリ設定
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   └── dummy/
│       ├── HealthCard.tsx       # ヘルスケア風カード
│       ├── StepCounter.tsx      # 歩数表示
│       └── ActivityRing.tsx     # アクティビティリング
├── services/
│   ├── firebase.ts              # Firebase初期化
│   ├── auth.ts                  # 認証サービス
│   ├── notification.ts          # 通知ハンドリング
│   └── linking.ts               # ディープリンク/外部ブラウザ
├── hooks/
│   ├── useAuth.ts               # 認証フック
│   └── useNotification.ts       # 通知フック
├── store/
│   ├── index.ts                 # Zustand or Context
│   └── authStore.ts             # 認証状態
├── constants/
│   ├── dummyData.ts             # ダミー運動データ
│   └── theme.ts                 # テーマ定義
├── types/
│   └── index.ts                 # 型定義
└── utils/
    ├── storage.ts               # AsyncStorage
    └── screenshot.ts            # スクショ防止
```

### 4.2 Webアプリ（React SPA）

```
src/
├── App.tsx                      # エントリーポイント
├── main.tsx                     # Vite エントリー
├── routes/
│   ├── index.tsx                # ルート定義
│   ├── ProtectedRoute.tsx       # 認証ガード
│   └── PublicRoute.tsx          # 未認証ルート
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx        # ログイン
│   │   └── RegisterPage.tsx     # 新規登録
│   ├── chat/
│   │   ├── ConversationListPage.tsx  # トーク一覧
│   │   └── ChatRoomPage.tsx     # トークルーム
│   ├── friends/
│   │   ├── FriendListPage.tsx   # 友達一覧
│   │   ├── FriendRequestPage.tsx # 友達申請
│   │   └── AddFriendPage.tsx    # 友達追加
│   ├── profile/
│   │   └── ProfileEditPage.tsx  # プロフィール編集
│   └── settings/
│       ├── SettingsPage.tsx     # 設定
│       ├── SubscriptionPage.tsx # 課金管理
│       └── AccountDeletePage.tsx # アカウント削除
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Avatar.tsx
│   │   └── Loading.tsx
│   ├── chat/
│   │   ├── MessageBubble.tsx    # メッセージ吹き出し
│   │   ├── MessageInput.tsx     # 入力エリア
│   │   ├── MessageList.tsx      # メッセージ一覧
│   │   ├── ConversationItem.tsx # 会話アイテム
│   │   ├── ImagePreview.tsx     # 画像プレビュー
│   │   └── VideoPlayer.tsx      # 動画プレイヤー
│   ├── friends/
│   │   ├── FriendItem.tsx       # 友達アイテム
│   │   └── FriendRequestItem.tsx # 申請アイテム
│   └── layout/
│       ├── Header.tsx           # ヘッダー
│       ├── BottomNav.tsx        # ボトムナビ
│       └── Layout.tsx           # レイアウト
├── services/
│   ├── firebase.ts              # Firebase初期化
│   ├── auth.ts                  # 認証サービス
│   ├── message.ts               # メッセージサービス
│   ├── friend.ts                # 友達サービス
│   ├── subscription.ts          # 課金サービス
│   └── storage.ts               # Storageサービス
├── hooks/
│   ├── useAuth.ts               # 認証
│   ├── useMessages.ts           # メッセージ取得
│   ├── useConversations.ts      # 会話一覧
│   ├── useFriends.ts            # 友達一覧
│   ├── useSubscription.ts       # 課金状態
│   └── useMessageLimit.ts       # メッセージ制限
├── store/
│   ├── index.ts                 # Zustand store
│   ├── authStore.ts             # 認証状態
│   ├── chatStore.ts             # チャット状態
│   └── uiStore.ts               # UI状態
├── types/
│   ├── user.ts
│   ├── message.ts
│   ├── conversation.ts
│   ├── friendship.ts
│   └── subscription.ts
├── constants/
│   ├── config.ts                # 設定値
│   └── theme.ts                 # テーマ
├── utils/
│   ├── date.ts                  # 日付ユーティリティ
│   ├── validation.ts            # バリデーション
│   └── format.ts                # フォーマット
└── styles/
    ├── globals.css              # グローバルスタイル
    └── variables.css            # CSS変数
```

### 4.3 Cloud Functions

```
functions/
├── src/
│   ├── index.ts                 # エントリーポイント
│   ├── auth/
│   │   ├── onCreate.ts          # ユーザー作成時
│   │   └── onDelete.ts          # ユーザー削除時
│   ├── messaging/
│   │   ├── onMessageCreate.ts   # メッセージ作成時
│   │   └── sendNotification.ts  # 通知送信
│   ├── friends/
│   │   ├── sendRequest.ts       # 友達申請
│   │   ├── respondRequest.ts    # 申請応答
│   │   └── blockUser.ts         # ブロック
│   ├── subscription/
│   │   ├── verifyReceipt.ts     # レシート検証
│   │   └── checkExpiry.ts       # 期限チェック
│   ├── scheduled/
│   │   ├── resetMessageCount.ts # メッセージ数リセット
│   │   └── cleanupExpired.ts    # 期限切れクリーンアップ
│   ├── panic/
│   │   └── deleteAll.ts         # 緊急全削除
│   └── utils/
│       ├── firebase.ts          # Firebase Admin
│       ├── fcm.ts               # FCMユーティリティ
│       └── apple.ts             # Apple IAP検証
├── package.json
└── tsconfig.json
```

---

## 5. 画面設計詳細

### 5.1 iOSアプリ画面フロー

```
[アプリ起動]
    │
    ▼
[スプラッシュ画面]
    │
    ├─ 未ログイン ──→ [ログイン画面] ←→ [新規登録画面]
    │                      │
    │                      ▼
    │              [パスワード入力]
    │                      │
    │         ┌────────────┴────────────┐
    │         ▼                         ▼
    │   [ダミーPW]                 [本命PW]
    │         │                         │
    │         ▼                         ▼
    └──→ [ダミーホーム]            [Safari起動]
              │                    (Webアプリへ)
              ▼
         [ダミー統計]
              │
              ▼
         [ダミー設定]
```

### 5.2 Webアプリ画面フロー

```
[URLアクセス]
    │
    ├─ 未ログイン ──→ [ログイン画面] ←→ [新規登録画面]
    │                      │
    │                      ▼
    └──→ [トーク一覧] ←─────────────────────┐
              │                              │
              ├──→ [トークルーム]            │
              │         │                    │
              │         ├─ メッセージ送信    │
              │         ├─ 画像/動画送信     │
              │         └─ 削除/取消        │
              │                              │
              ├──→ [友達一覧] ───────────────┤
              │         │                    │
              │         ├─ [友達追加]        │
              │         └─ [友達申請一覧]    │
              │                              │
              ├──→ [プロフィール編集]        │
              │                              │
              └──→ [設定] ──────────────────┘
                      │
                      ├─ [課金管理]
                      ├─ [アカウント削除]
                      └─ [緊急削除(パニック)]
```

### 5.3 画面詳細仕様

#### ログイン画面（iOS/Web共通）

| 要素 | 仕様 |
|------|------|
| メールアドレス入力 | テキストフィールド、バリデーションあり |
| パスワード入力 | パスワードフィールド、表示/非表示切替 |
| ログインボタン | プライマリボタン |
| 新規登録リンク | テキストリンク |
| エラー表示 | インラインエラーメッセージ |

#### 新規登録画面（iOS/Web共通）

| 要素 | 仕様 |
|------|------|
| ダミーメール入力 | テキストフィールド |
| ダミーパスワード入力 | パスワードフィールド |
| 本命メール入力 | テキストフィールド |
| 本命パスワード入力 | パスワードフィールド |
| パスワード確認 | パスワードフィールド |
| 利用規約同意 | チェックボックス |
| 登録ボタン | プライマリボタン |

#### ダミーホーム画面（iOS）

| 要素 | 仕様 |
|------|------|
| ヘッダー | 「ヘルスケア」タイトル、設定アイコン |
| 日付表示 | 今日の日付 |
| 歩数カード | 固定値表示（例：2,345歩） |
| アクティビティリング | Apple Watch風リング |
| 運動時間 | 固定値表示（例：15分） |
| 消費カロリー | 固定値表示（例：89kcal） |
| 週間グラフ | 棒グラフ（固定データ） |

#### トーク一覧画面（Web）

| 要素 | 仕様 |
|------|------|
| ヘッダー | 「トーク」タイトル、検索アイコン |
| 検索バー | トーク検索（友達名、メッセージ内容） |
| 会話リスト | スクロール可能リスト |
| 会話アイテム | アバター、名前、最新メッセージ、時刻、未読バッジ |
| ボトムナビ | トーク、友達、設定 |

#### トークルーム画面（Web）

| 要素 | 仕様 |
|------|------|
| ヘッダー | 相手の名前、戻るボタン、メニュー |
| メッセージエリア | スクロール可能、吹き出し表示 |
| 送信メッセージ | 右寄せ、緑色背景 |
| 受信メッセージ | 左寄せ、白色背景 |
| 既読表示 | 「既読」テキスト、時刻 |
| 入力エリア | テキスト入力、画像/動画ボタン、送信ボタン |
| 画像プレビュー | タップで拡大表示 |
| 長押しメニュー | 削除、コピー（テキストのみ） |

---

## 6. セキュリティ設計

### 6.1 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ユーザードキュメント
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }

    // ユーザーID検索用（visibleUserIdのみ公開）
    match /users/{userId} {
      allow read: if request.auth != null
        && request.resource.data.keys().hasOnly(['visibleUserId', 'nickname', 'profileImageUrl']);
    }

    // 友達関係
    match /friendships/{friendshipId} {
      allow read: if request.auth != null
        && (resource.data.requesterId == request.auth.uid
            || resource.data.receiverId == request.auth.uid);
      allow create: if request.auth != null
        && request.resource.data.requesterId == request.auth.uid;
      allow update: if request.auth != null
        && (resource.data.requesterId == request.auth.uid
            || resource.data.receiverId == request.auth.uid);
      allow delete: if request.auth != null
        && (resource.data.requesterId == request.auth.uid
            || resource.data.receiverId == request.auth.uid);
    }

    // 会話
    match /conversations/{conversationId} {
      allow read: if request.auth != null
        && request.auth.uid in resource.data.participantIds;
      allow create: if false; // Cloud Functionsのみ
      allow update: if request.auth != null
        && request.auth.uid in resource.data.participantIds;
      allow delete: if false; // Cloud Functionsのみ

      // メッセージ
      match /messages/{messageId} {
        allow read: if request.auth != null
          && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds;
        allow create: if request.auth != null
          && request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participantIds
          && request.resource.data.senderId == request.auth.uid;
        allow update: if request.auth != null
          && resource.data.senderId == request.auth.uid;
        allow delete: if false; // 論理削除のみ
      }
    }

    // 課金情報
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow write: if false; // Cloud Functionsのみ
    }
  }
}
```

### 6.2 Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // プロフィール画像
    match /profiles/{userId}/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 5 * 1024 * 1024  // 5MB制限
        && request.resource.contentType.matches('image/.*');
    }

    // メッセージ添付ファイル
    match /messages/{conversationId}/{fileName} {
      // 会話参加者のみ読み取り可能
      allow read: if request.auth != null;
      // 課金ユーザーのみ書き込み可能（Cloud Functionsで検証）
      allow write: if request.auth != null
        && request.resource.size < 100 * 1024 * 1024  // 100MB制限
        && (request.resource.contentType.matches('image/.*')
            || request.resource.contentType.matches('video/.*'));
    }
  }
}
```

### 6.3 スクリーンショット防止

#### iOS実装

```typescript
// React Native
import { useEffect } from 'react';
import { Platform } from 'react-native';
import RNScreenshotPrevent from 'react-native-screenshot-prevent';

export const useScreenshotPrevention = () => {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      RNScreenshotPrevent.enableSecureView();
    }
    return () => {
      if (Platform.OS === 'ios') {
        RNScreenshotPrevent.disableSecureView();
      }
    };
  }, []);
};
```

#### Web実装（ベストエフォート）

```css
/* CSS: 選択・コピー防止 */
.message-content {
  user-select: none;
  -webkit-user-select: none;
}
```

```typescript
// JavaScript: 右クリック・キーボードショートカット防止
useEffect(() => {
  const handleContextMenu = (e: Event) => e.preventDefault();
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
      e.preventDefault();
    }
  };

  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('contextmenu', handleContextMenu);
    document.removeEventListener('keydown', handleKeyDown);
  };
}, []);
```

---

## 7. プッシュ通知設計

### 7.1 通知フロー

```
[メッセージ送信]
      │
      ▼
[Firestore: messages作成]
      │
      ▼
[Cloud Functions: onMessageCreate]
      │
      ├─ lastMessage更新
      ├─ unreadCount更新
      │
      ▼
[FCMトークン取得]
      │
      ▼
[FCM送信]
      │
      ▼
[iOS: 通知受信]
      │
      ▼
[表示: 「アップデートしてください」]
```

### 7.2 通知ペイロード

```typescript
const notificationPayload = {
  notification: {
    title: 'WorkOutApp',
    body: 'アプリのアップデートを行ってください',
  },
  data: {
    type: 'message',
    conversationId: 'xxx',
    // 内容は含めない（セキュリティ）
  },
  apns: {
    payload: {
      aps: {
        badge: unreadCount,
        sound: 'default',
      },
    },
  },
};
```

### 7.3 iOS通知ハンドリング

```typescript
// React Native
import messaging from '@react-native-firebase/messaging';

// フォアグラウンド
messaging().onMessage(async (remoteMessage) => {
  // アプリ内で何もしない（偽装のため）
  console.log('Message received in foreground');
});

// バックグラウンド/終了状態からの起動
messaging().onNotificationOpenedApp((remoteMessage) => {
  // ダミー画面を表示（Webには遷移しない）
  navigation.navigate('DummyHome');
});
```

---

## 8. 課金設計（In-App Purchase）

### 8.1 商品ID

| 商品ID | 種類 | 価格 | 説明 |
|--------|------|------|------|
| `com.workoutapp.subscription.monthly` | 自動更新サブスクリプション | ¥500/月 | 月額プレミアム |
| `com.workoutapp.subscription.yearly` | 自動更新サブスクリプション | ¥5,000/年 | 年額プレミアム |

### 8.2 課金フロー

```
[ユーザー: 課金ボタンタップ]
      │
      ▼
[StoreKit: 商品情報取得]
      │
      ▼
[StoreKit: 購入処理]
      │
      ▼
[Apple: 決済完了]
      │
      ▼
[アプリ: レシート取得]
      │
      ▼
[Cloud Functions: verifyAppleReceipt]
      │
      ├─ Appleサーバーでレシート検証
      ├─ subscriptionsドキュメント作成
      └─ userのsubscriptionStatus更新
      │
      ▼
[アプリ: 課金状態反映]
```

### 8.3 レシート検証

```typescript
// Cloud Functions
import { verifyReceipt } from 'node-apple-receipt-verify';

export const verifyAppleReceipt = functions.https.onCall(
  async (data: { receiptData: string }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'ログインが必要です');
    }

    const result = await verifyReceipt({
      receipt: data.receiptData,
      password: process.env.APPLE_SHARED_SECRET,
      excludeOldTransactions: true,
      environment: ['production', 'sandbox'],
    });

    if (!result.valid) {
      throw new functions.https.HttpsError('invalid-argument', 'レシートが無効です');
    }

    // Firestoreに保存
    const latestReceipt = result.latest_receipt_info[0];
    await db.collection('subscriptions').add({
      userId: context.auth.uid,
      productId: latestReceipt.product_id,
      transactionId: latestReceipt.transaction_id,
      originalTransactionId: latestReceipt.original_transaction_id,
      purchaseDate: new Date(parseInt(latestReceipt.purchase_date_ms)),
      expiresDate: new Date(parseInt(latestReceipt.expires_date_ms)),
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // ユーザー情報更新
    await db.collection('users').doc(context.auth.uid).update({
      subscriptionStatus: 'premium',
      subscriptionPlan: latestReceipt.product_id.includes('monthly') ? 'monthly' : 'yearly',
      subscriptionExpiry: new Date(parseInt(latestReceipt.expires_date_ms)),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  }
);
```

---

## 9. エラーハンドリング

### 9.1 エラーコード定義

```typescript
export const ErrorCodes = {
  // 認証
  AUTH_INVALID_CREDENTIALS: 'auth/invalid-credentials',
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  AUTH_EMAIL_ALREADY_IN_USE: 'auth/email-already-in-use',

  // メッセージ
  MESSAGE_LIMIT_EXCEEDED: 'message/limit-exceeded',
  MESSAGE_SEND_FAILED: 'message/send-failed',
  MESSAGE_DELETE_NOT_ALLOWED: 'message/delete-not-allowed',

  // 友達
  FRIEND_ALREADY_EXISTS: 'friend/already-exists',
  FRIEND_BLOCKED: 'friend/blocked',
  FRIEND_NOT_FOUND: 'friend/not-found',

  // 課金
  SUBSCRIPTION_REQUIRED: 'subscription/required',
  SUBSCRIPTION_VERIFY_FAILED: 'subscription/verify-failed',

  // 汎用
  PERMISSION_DENIED: 'permission/denied',
  NETWORK_ERROR: 'network/error',
  UNKNOWN_ERROR: 'unknown/error',
} as const;
```

### 9.2 エラーメッセージ（ユーザー向け）

```typescript
export const ErrorMessages: Record<string, string> = {
  'auth/invalid-credentials': 'メールアドレスまたはパスワードが間違っています',
  'auth/user-not-found': 'ユーザーが見つかりません',
  'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
  'message/limit-exceeded': '今月のメッセージ送信上限に達しました。プレミアムプランへのアップグレードをご検討ください',
  'message/send-failed': 'メッセージの送信に失敗しました',
  'message/delete-not-allowed': 'メッセージの削除にはプレミアムプランが必要です',
  'friend/already-exists': '既に友達です',
  'friend/blocked': 'このユーザーはブロックされています',
  'friend/not-found': 'ユーザーが見つかりません',
  'subscription/required': 'この機能にはプレミアムプランが必要です',
  'subscription/verify-failed': '購入の確認に失敗しました',
  'permission/denied': '権限がありません',
  'network/error': 'ネットワークエラーが発生しました。接続を確認してください',
  'unknown/error': 'エラーが発生しました。しばらくしてからお試しください',
};
```

---

## 10. テスト戦略

### 10.1 テスト種別

| 種別 | 対象 | ツール |
|------|------|--------|
| ユニットテスト | ユーティリティ関数、フック | Jest, React Testing Library |
| 統合テスト | コンポーネント、サービス | Jest, React Testing Library |
| E2Eテスト | 画面遷移、ユーザーフロー | Detox (iOS), Playwright (Web) |
| セキュリティテスト | Security Rules | Firebase Emulator |

### 10.2 テストカバレッジ目標

- ユニットテスト: 80%以上
- 統合テスト: 主要フローをカバー
- E2Eテスト: クリティカルパスをカバー

### 10.3 Firebase Emulator設定

```json
// firebase.json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "storage": { "port": 9199 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

---

## 改訂履歴

| バージョン | 日付 | 内容 |
|------------|------|------|
| 1.0 | 2026-05-02 | 初版作成 |
