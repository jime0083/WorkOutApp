/**
 * ユーザー関連の型定義
 */
export type SubscriptionStatus = 'free' | 'premium';
export type SubscriptionPlan = 'monthly' | 'yearly' | null;
export interface User {
    id: string;
    realEmail: string;
    dummyEmail: string;
    visibleUserId: string;
    nickname: string;
    profileImageUrl: string | null;
    subscriptionStatus: SubscriptionStatus;
    subscriptionPlan: SubscriptionPlan;
    subscriptionExpiry: Date | null;
    monthlyMessageCount: number;
    messageCountResetDate: Date;
    fcmToken: string | null;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date;
}
export interface CreateUserInput {
    realEmail: string;
    realPassword: string;
    dummyEmail: string;
    dummyPassword: string;
    nickname?: string;
}
export interface UpdateUserInput {
    nickname?: string;
    profileImageUrl?: string | null;
}
export interface UserProfile {
    visibleUserId: string;
    nickname: string;
    profileImageUrl: string | null;
}
//# sourceMappingURL=user.d.ts.map