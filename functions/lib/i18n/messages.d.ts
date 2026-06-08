/**
 * Cloud Functions 国際化メッセージ
 * エラーメッセージと通知メッセージの多言語対応
 */
type Language = 'ja' | 'en';
interface Messages {
    auth: {
        userNotFound: string;
        unauthorized: string;
    };
    friends: {
        userNotFound: string;
        cannotAddSelf: string;
        alreadyFriends: string;
        requestAlreadySent: string;
        cannotSendRequest: string;
        unblockFirst: string;
        requestNotFound: string;
        notAuthorized: string;
        alreadyProcessed: string;
        sendFailed: string;
        respondFailed: string;
        invalidAction: string;
    };
    block: {
        cannotBlockSelf: string;
        userNotFound: string;
        alreadyBlocked: string;
        notBlocked: string;
        blockNotFound: string;
        notAuthorized: string;
        operationFailed: string;
        invalidAction: string;
    };
    message: {
        limitReached: string;
        sendFailed: string;
        userNotFound: string;
    };
    subscription: {
        invalidReceiptData: string;
        receiptVerificationFailed: string;
        invalidPlanType: string;
        alreadySubscribed: string;
        subscriptionUpdated: string;
        subscriptionCreated: string;
        subscriptionExpired: string;
        verificationError: string;
        userNotFound: string;
    };
    notification: {
        newFriendRequest: string;
        friendRequestAccepted: string;
        newMessage: string;
        messageFromFormat: string;
    };
    common: {
        internalError: string;
    };
}
/**
 * 言語に応じたメッセージを取得
 */
export declare function getMessage(lang: string | undefined, category: keyof Messages, key: string): string;
/**
 * テンプレート文字列を置換
 */
export declare function formatMessage(message: string, params: Record<string, string | number>): string;
/**
 * サポートされている言語かどうかをチェック
 */
export declare function isValidLanguage(lang: string): lang is Language;
/**
 * デフォルト言語
 */
export declare const DEFAULT_LANGUAGE: Language;
export type { Language, Messages };
//# sourceMappingURL=messages.d.ts.map