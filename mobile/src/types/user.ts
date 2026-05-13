/**
 * ユーザー関連の型定義
 */

// サブスクリプションステータス
export type SubscriptionStatus = 'free' | 'premium';

// サブスクリプションプラン
export type SubscriptionPlan = 'monthly' | 'yearly' | null;

// ユーザー
export interface User {
  // 基本情報
  id: string;
  email: string;  // 単一のメールアドレス（ログイン用）
  password2Hash: string;  // パスワード2のハッシュ（ダミー認証用）

  // プロフィール
  visibleUserId: string;
  nickname: string;
  profileImageUrl: string | null;

  // 課金状態
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: Date | null;

  // メッセージ制限（無料ユーザー用）
  monthlyMessageCount: number;
  messageCountResetDate: Date;

  // FCMトークン
  fcmToken: string | null;

  // メタデータ
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;

  // 言語設定
  language?: string;
}

// プレミアム判定ヘルパー
export function isPremiumUser(user: User | null): boolean {
  return user?.subscriptionStatus === 'premium';
}

// ユーザー作成時の入力
export interface CreateUserInput {
  email: string;       // メールアドレス（単一）
  password1: string;   // パスワード1（Firebase Auth認証用・本物メッセージ用）
  password2: string;   // パスワード2（ダミーメッセージ用）
  nickname?: string;
}

// ユーザー更新時の入力
export interface UpdateUserInput {
  nickname?: string;
  profileImageUrl?: string | null;
}

// ユーザープロフィール（公開情報）
export interface UserProfile {
  visibleUserId: string;
  nickname: string;
  profileImageUrl: string | null;
}

/**
 * 簡易ハッシュ関数（djb2アルゴリズム）
 * 注意: 本番環境ではCloud Functionsでbcrypt等を使用することを推奨
 * @param str - ハッシュ化する文字列
 * @returns ハッシュ値（16進文字列）
 */
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // 絶対値を取得し16進数に変換
  return Math.abs(hash).toString(16);
}

/**
 * パスワードをハッシュ化
 * @param password - プレーンテキストのパスワード
 * @returns ハッシュ化されたパスワード
 */
export function hashPassword(password: string): string {
  // ソルトを追加してセキュリティを向上
  const salt = 'hm_app_salt_2026';
  return simpleHash(salt + password + salt);
}

/**
 * パスワードがハッシュと一致するか検証
 * @param password - プレーンテキストのパスワード
 * @param hash - 保存されているハッシュ
 * @returns 一致する場合true
 */
export function verifyPassword(password: string, hash: string): boolean {
  const inputHash = hashPassword(password);
  return inputHash === hash;
}
