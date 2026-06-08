/**
 * サブスクリプション関連の型定義
 */
export type PlanType = 'monthly' | 'yearly';
export interface Subscription {
    userId: string;
    planType: PlanType;
    startDate: Date;
    expiryDate: Date;
    isActive: boolean;
    originalTransactionId: string;
    latestReceiptData: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface PurchaseSubscriptionInput {
    planType: PlanType;
    receiptData: string;
}
export interface PurchaseSubscriptionResult {
    success: boolean;
    subscription?: Subscription;
    error?: string;
}
export interface SubscriptionPricing {
    monthly: {
        price: number;
        currency: string;
        productId: string;
    };
    yearly: {
        price: number;
        currency: string;
        productId: string;
    };
}
export interface FreePlanLimits {
    monthlyMessageLimit: number;
    canSendImages: boolean;
    canSendVideos: boolean;
    canDeleteMessages: boolean;
    hasPanicButton: boolean;
}
export interface PremiumFeatures {
    unlimitedMessages: boolean;
    canSendImages: boolean;
    canSendVideos: boolean;
    canDeleteMessages: boolean;
    hasPanicButton: boolean;
}
//# sourceMappingURL=subscription.d.ts.map