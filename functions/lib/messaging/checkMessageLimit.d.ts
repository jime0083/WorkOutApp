interface MessageLimitResult {
    canSend: boolean;
    remaining: number;
    limit: number;
    isPremium: boolean;
    resetDate: Date | null;
}
/**
 * メッセージ送信可否をチェック
 */
export declare const checkMessageLimit: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    data: MessageLimitResult;
}>>;
/**
 * メッセージ送信カウントを増加
 * メッセージ送信成功後に呼び出す
 */
export declare const incrementMessageCount: import("firebase-functions/v2/https").CallableFunction<any, Promise<{
    success: boolean;
    data: {
        newCount: number;
    };
}>>;
export {};
//# sourceMappingURL=checkMessageLimit.d.ts.map