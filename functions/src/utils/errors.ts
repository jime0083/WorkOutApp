/**
 * Cloud Functions エラーハンドリング
 */

import { HttpsError, FunctionsErrorCode } from 'firebase-functions/v2/https';

// アプリケーションエラーコード
export const AppErrorCode = {
  // 認証エラー
  INVALID_CREDENTIALS: 'auth/invalid-credentials',
  USER_NOT_FOUND: 'auth/user-not-found',
  EMAIL_ALREADY_EXISTS: 'auth/email-already-exists',
  UNAUTHORIZED: 'auth/unauthorized',

  // メッセージエラー
  MESSAGE_LIMIT_EXCEEDED: 'message/limit-exceeded',
  CONVERSATION_NOT_FOUND: 'message/conversation-not-found',
  SEND_FAILED: 'message/send-failed',
  DELETE_NOT_ALLOWED: 'message/delete-not-allowed',

  // 友達エラー
  FRIEND_USER_NOT_FOUND: 'friendship/user-not-found',
  ALREADY_FRIENDS: 'friendship/already-friends',
  REQUEST_ALREADY_SENT: 'friendship/request-already-sent',
  REQUEST_NOT_FOUND: 'friendship/request-not-found',
  CANNOT_ADD_SELF: 'friendship/cannot-add-self',
  USER_BLOCKED: 'friendship/user-blocked',

  // サブスクリプションエラー
  PURCHASE_FAILED: 'subscription/purchase-failed',
  INVALID_RECEIPT: 'subscription/invalid-receipt',
  SUBSCRIPTION_EXPIRED: 'subscription/expired',

  // 一般エラー
  INTERNAL_ERROR: 'internal/error',
  INVALID_ARGUMENT: 'invalid/argument',
} as const;

export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode];

// エラーコードからHTTPエラーコードへのマッピング
const errorCodeMapping: Record<string, FunctionsErrorCode> = {
  'auth/invalid-credentials': 'unauthenticated',
  'auth/user-not-found': 'not-found',
  'auth/email-already-exists': 'already-exists',
  'auth/unauthorized': 'permission-denied',
  'message/limit-exceeded': 'resource-exhausted',
  'message/conversation-not-found': 'not-found',
  'message/send-failed': 'internal',
  'message/delete-not-allowed': 'permission-denied',
  'friendship/user-not-found': 'not-found',
  'friendship/already-friends': 'already-exists',
  'friendship/request-already-sent': 'already-exists',
  'friendship/request-not-found': 'not-found',
  'friendship/cannot-add-self': 'invalid-argument',
  'friendship/user-blocked': 'permission-denied',
  'subscription/purchase-failed': 'internal',
  'subscription/invalid-receipt': 'invalid-argument',
  'subscription/expired': 'permission-denied',
  'internal/error': 'internal',
  'invalid/argument': 'invalid-argument',
};

// カスタムエラークラス
export class AppError extends Error {
  constructor(
    public code: AppErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }

  // HttpsError に変換
  toHttpsError(): HttpsError {
    const functionsErrorCode = errorCodeMapping[this.code] || 'internal';
    return new HttpsError(functionsErrorCode, this.message, {
      code: this.code,
      ...this.details,
    });
  }
}

// エラーハンドラー - 任意のエラーをHttpsErrorに変換
export function handleError(error: unknown): HttpsError {
  console.error('Error occurred:', error);

  if (error instanceof AppError) {
    return error.toHttpsError();
  }

  if (error instanceof HttpsError) {
    return error;
  }

  if (error instanceof Error) {
    return new HttpsError('internal', error.message);
  }

  return new HttpsError('internal', 'An unexpected error occurred');
}

// エラー作成ヘルパー
export function createError(
  code: AppErrorCode,
  message: string,
  details?: Record<string, unknown>
): AppError {
  return new AppError(code, message, details);
}
