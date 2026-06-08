/**
 * Cloud Functions エラーハンドリング
 */
import { HttpsError } from 'firebase-functions/v2/https';
export declare const AppErrorCode: {
    readonly INVALID_CREDENTIALS: "auth/invalid-credentials";
    readonly USER_NOT_FOUND: "auth/user-not-found";
    readonly EMAIL_ALREADY_EXISTS: "auth/email-already-exists";
    readonly UNAUTHORIZED: "auth/unauthorized";
    readonly MESSAGE_LIMIT_EXCEEDED: "message/limit-exceeded";
    readonly CONVERSATION_NOT_FOUND: "message/conversation-not-found";
    readonly SEND_FAILED: "message/send-failed";
    readonly DELETE_NOT_ALLOWED: "message/delete-not-allowed";
    readonly FRIEND_USER_NOT_FOUND: "friendship/user-not-found";
    readonly ALREADY_FRIENDS: "friendship/already-friends";
    readonly REQUEST_ALREADY_SENT: "friendship/request-already-sent";
    readonly REQUEST_NOT_FOUND: "friendship/request-not-found";
    readonly CANNOT_ADD_SELF: "friendship/cannot-add-self";
    readonly USER_BLOCKED: "friendship/user-blocked";
    readonly PURCHASE_FAILED: "subscription/purchase-failed";
    readonly INVALID_RECEIPT: "subscription/invalid-receipt";
    readonly SUBSCRIPTION_EXPIRED: "subscription/expired";
    readonly INTERNAL_ERROR: "internal/error";
    readonly INVALID_ARGUMENT: "invalid/argument";
};
export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode];
export declare class AppError extends Error {
    code: AppErrorCode;
    details?: Record<string, unknown> | undefined;
    constructor(code: AppErrorCode, message: string, details?: Record<string, unknown> | undefined);
    toHttpsError(): HttpsError;
}
export declare function handleError(error: unknown): HttpsError;
export declare function createError(code: AppErrorCode, message: string, details?: Record<string, unknown>): AppError;
//# sourceMappingURL=errors.d.ts.map