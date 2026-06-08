/**
 * エラーコード定義
 */
export declare const AUTH_ERRORS: {
    readonly INVALID_CREDENTIALS: "auth/invalid-credentials";
    readonly USER_NOT_FOUND: "auth/user-not-found";
    readonly EMAIL_ALREADY_EXISTS: "auth/email-already-exists";
    readonly WEAK_PASSWORD: "auth/weak-password";
    readonly SESSION_EXPIRED: "auth/session-expired";
    readonly UNAUTHORIZED: "auth/unauthorized";
};
export type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];
export declare const MESSAGE_ERRORS: {
    readonly MESSAGE_LIMIT_EXCEEDED: "message/limit-exceeded";
    readonly CONVERSATION_NOT_FOUND: "message/conversation-not-found";
    readonly SEND_FAILED: "message/send-failed";
    readonly DELETE_NOT_ALLOWED: "message/delete-not-allowed";
    readonly INVALID_CONTENT_TYPE: "message/invalid-content-type";
    readonly FILE_TOO_LARGE: "message/file-too-large";
};
export type MessageErrorCode = (typeof MESSAGE_ERRORS)[keyof typeof MESSAGE_ERRORS];
export declare const FRIENDSHIP_ERRORS: {
    readonly USER_NOT_FOUND: "friendship/user-not-found";
    readonly ALREADY_FRIENDS: "friendship/already-friends";
    readonly REQUEST_ALREADY_SENT: "friendship/request-already-sent";
    readonly REQUEST_NOT_FOUND: "friendship/request-not-found";
    readonly CANNOT_ADD_SELF: "friendship/cannot-add-self";
    readonly USER_BLOCKED: "friendship/user-blocked";
};
export type FriendshipErrorCode = (typeof FRIENDSHIP_ERRORS)[keyof typeof FRIENDSHIP_ERRORS];
export declare const SUBSCRIPTION_ERRORS: {
    readonly PURCHASE_FAILED: "subscription/purchase-failed";
    readonly INVALID_RECEIPT: "subscription/invalid-receipt";
    readonly ALREADY_SUBSCRIBED: "subscription/already-subscribed";
    readonly SUBSCRIPTION_EXPIRED: "subscription/expired";
    readonly RESTORE_FAILED: "subscription/restore-failed";
};
export type SubscriptionErrorCode = (typeof SUBSCRIPTION_ERRORS)[keyof typeof SUBSCRIPTION_ERRORS];
export declare const STORAGE_ERRORS: {
    readonly UPLOAD_FAILED: "storage/upload-failed";
    readonly FILE_NOT_FOUND: "storage/file-not-found";
    readonly PERMISSION_DENIED: "storage/permission-denied";
    readonly QUOTA_EXCEEDED: "storage/quota-exceeded";
};
export type StorageErrorCode = (typeof STORAGE_ERRORS)[keyof typeof STORAGE_ERRORS];
export type AppErrorCode = AuthErrorCode | MessageErrorCode | FriendshipErrorCode | SubscriptionErrorCode | StorageErrorCode;
export interface AppError {
    code: AppErrorCode;
    message: string;
    details?: Record<string, unknown>;
}
export declare const ERROR_MESSAGES: Record<AppErrorCode, string>;
//# sourceMappingURL=errors.d.ts.map