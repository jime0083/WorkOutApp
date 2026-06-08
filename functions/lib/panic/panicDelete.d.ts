interface PanicDeleteData {
    confirmationCode: string;
    lang?: string;
}
export declare const panicDelete: import("firebase-functions/v2/https").CallableFunction<PanicDeleteData, any>;
/**
 * 通常のアカウント削除（プレミアム不要）
 */
/**
 * 全メッセージ削除のみ（アカウントは残す）
 * プレミアムユーザー限定
 * 設定で本物のパスワード → メッセージでダミーパスワードの場合に使用
 */
export declare const deleteAllMessages: import("firebase-functions/v2/https").CallableFunction<{
    lang?: string;
}, any>;
export declare const deleteAccount: import("firebase-functions/v2/https").CallableFunction<{
    lang?: string;
}, any>;
export {};
//# sourceMappingURL=panicDelete.d.ts.map