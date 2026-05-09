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
  realEmail: string;
  dummyEmail: string;

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
  realEmail: string;
  realPassword: string;
  dummyEmail: string;
  dummyPassword: string;
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
