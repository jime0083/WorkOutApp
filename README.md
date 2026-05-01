# WorkOutApp

偽装ヘルスケアアプリとして動作する秘密のメッセージングサービス

## プロジェクト構成

```
WorkOutApp/
├── mobile/          # React Native (iOS) アプリ
├── web/             # React SPA (メッセージング機能)
├── functions/       # Firebase Cloud Functions
├── docs/            # ドキュメント
│   ├── requirements.md      # 要件定義書
│   └── technical-design.md  # 技術設計書
├── progress.txt     # AI作業タスク管理
├── manual-work.txt  # 手動作業タスク管理
├── archive.txt      # 完了タスクアーカイブ
└── problem.txt      # 問題記録
```

## 技術スタック

| レイヤー | 技術 |
|----------|------|
| iOS アプリ | React Native |
| Web アプリ | React (Vite) |
| 認証 | Firebase Authentication |
| データベース | Firestore |
| サーバー処理 | Firebase Cloud Functions |
| プッシュ通知 | Firebase Cloud Messaging |
| 課金 | Apple In-App Purchase |
| Web ホスティング | GitHub Pages |

## セットアップ

### 前提条件

- Node.js 18.x 以上
- npm または yarn
- Xcode 15.x 以上（iOS開発用）
- CocoaPods
- Firebase CLI

### インストール

```bash
# Firebase CLI インストール
npm install -g firebase-tools

# リポジトリをクローン後、各プロジェクトの依存関係をインストール

# iOS アプリ
cd mobile
npm install
cd ios && pod install && cd ..

# Web アプリ
cd web
npm install

# Cloud Functions
cd functions
npm install
```

### 開発サーバー起動

```bash
# iOS アプリ
cd mobile
npm run ios

# Web アプリ
cd web
npm run dev

# Firebase Emulator
firebase emulators:start
```

## ドキュメント

- [要件定義書](./docs/requirements.md)
- [技術設計書](./docs/technical-design.md)

## 開発ワークフロー

1. `progress.txt` でタスクを確認
2. タスクを実施
3. 完了したタスクに `[完了: YYYY-MM-DD]` を追記
4. Phase完了後、`archive.txt` に移動
5. 問題発生時は `problem.txt` に記録

## ライセンス

Private - All Rights Reserved
