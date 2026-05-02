/**
 * 入力バリデーションヘルパー
 */

import { AppError, AppErrorCode } from './errors';

// 必須フィールドチェック
export function requireString(
  value: unknown,
  fieldName: string
): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new AppError(
      AppErrorCode.INVALID_ARGUMENT,
      `${fieldName} is required and must be a non-empty string`
    );
  }
}

// オプショナル文字列チェック
export function optionalString(
  value: unknown,
  fieldName: string
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== 'string') {
    throw new AppError(
      AppErrorCode.INVALID_ARGUMENT,
      `${fieldName} must be a string`
    );
  }
  return value;
}

// 数値チェック
export function requireNumber(
  value: unknown,
  fieldName: string
): asserts value is number {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new AppError(
      AppErrorCode.INVALID_ARGUMENT,
      `${fieldName} is required and must be a number`
    );
  }
}

// ブール値チェック
export function requireBoolean(
  value: unknown,
  fieldName: string
): asserts value is boolean {
  if (typeof value !== 'boolean') {
    throw new AppError(
      AppErrorCode.INVALID_ARGUMENT,
      `${fieldName} is required and must be a boolean`
    );
  }
}

// 配列チェック
export function requireArray<T>(
  value: unknown,
  fieldName: string
): asserts value is T[] {
  if (!Array.isArray(value)) {
    throw new AppError(
      AppErrorCode.INVALID_ARGUMENT,
      `${fieldName} is required and must be an array`
    );
  }
}

// メールアドレス形式チェック
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ユーザーID形式チェック（visibleUserId: 英数字とアンダースコアのみ）
export function validateVisibleUserId(userId: string): boolean {
  const userIdRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return userIdRegex.test(userId);
}

// パスワード強度チェック
export function validatePassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  return { valid: true };
}

// ニックネームチェック
export function validateNickname(nickname: string): {
  valid: boolean;
  message?: string;
} {
  if (nickname.length < 1 || nickname.length > 20) {
    return {
      valid: false,
      message: 'Nickname must be between 1 and 20 characters',
    };
  }
  return { valid: true };
}

// 認証コンテキストチェック
export function requireAuth(auth: { uid: string } | undefined): string {
  if (!auth?.uid) {
    throw new AppError(
      AppErrorCode.UNAUTHORIZED,
      'Authentication required'
    );
  }
  return auth.uid;
}
