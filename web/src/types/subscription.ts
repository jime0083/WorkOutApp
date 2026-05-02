/**
 * サブスクリプション関連の型定義
 */

// サブスクリプションプラン種別
export type PlanType = 'monthly' | 'yearly';

// サブスクリプション情報
export interface Subscription {
  userId: string;
  planType: PlanType;
  startDate: Date;
  expiryDate: Date;
  isActive: boolean;

  // Apple In-App Purchase関連
  originalTransactionId: string;
  latestReceiptData: string | null;

  createdAt: Date;
  updatedAt: Date;
}

// サブスクリプション購入リクエスト
export interface PurchaseSubscriptionInput {
  planType: PlanType;
  receiptData: string;
}

// サブスクリプション購入結果
export interface PurchaseSubscriptionResult {
  success: boolean;
  subscription?: Subscription;
  error?: string;
}

// サブスクリプション価格情報
export interface SubscriptionPricing {
  monthly: {
    price: number; // 500
    currency: string; // 'JPY'
    productId: string;
  };
  yearly: {
    price: number; // 5000
    currency: string; // 'JPY'
    productId: string;
  };
}

// 無料プラン制限
export interface FreePlanLimits {
  monthlyMessageLimit: number; // 10
  canSendImages: boolean; // false
  canSendVideos: boolean; // false
  canDeleteMessages: boolean; // false
  hasPanicButton: boolean; // false
}

// プレミアムプラン機能
export interface PremiumFeatures {
  unlimitedMessages: boolean; // true
  canSendImages: boolean; // true
  canSendVideos: boolean; // true
  canDeleteMessages: boolean; // true
  hasPanicButton: boolean; // true
}
