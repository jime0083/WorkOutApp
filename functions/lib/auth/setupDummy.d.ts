/**
 * ダミーアカウント設定のCallable Function
 * 新規登録後にクライアントから呼び出す
 */
export declare const setupDummyAccount: import("firebase-functions/v2/https").CallableFunction<any, Promise<import("../utils/response").SuccessResponse<{
    message: string;
    dummyUserId: string;
}>>>;
/**
 * ダミーアカウントでログインした場合に本来のユーザーIDを取得
 */
export declare const resolveRealUserId: import("firebase-functions/v2/https").CallableFunction<any, Promise<import("../utils/response").SuccessResponse<{
    isDummyAccount: boolean;
    realUserId: string;
}>>>;
//# sourceMappingURL=setupDummy.d.ts.map