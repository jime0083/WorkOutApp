/**
 * サブスクリプション関連ヘルパー
 */
export declare const FREE_PLAN_MESSAGE_LIMIT = 10;
export declare function isPremiumUser(userId: string): Promise<boolean>;
export declare function canSendMessage(userId: string): Promise<{
    allowed: boolean;
    remaining?: number;
    isPremium: boolean;
}>;
export declare function incrementMessageCount(userId: string): Promise<number>;
export declare function canSendMedia(userId: string): Promise<boolean>;
export declare function canDeleteMessage(userId: string): Promise<boolean>;
export declare function canUsePanicButton(userId: string): Promise<boolean>;
//# sourceMappingURL=subscription.d.ts.map