"use strict";
/**
 * 入力バリデーションヘルパー
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireString = requireString;
exports.optionalString = optionalString;
exports.requireNumber = requireNumber;
exports.requireBoolean = requireBoolean;
exports.requireArray = requireArray;
exports.validateEmail = validateEmail;
exports.validateVisibleUserId = validateVisibleUserId;
exports.validatePassword = validatePassword;
exports.validateNickname = validateNickname;
exports.requireAuth = requireAuth;
const errors_1 = require("./errors");
// 必須フィールドチェック
function requireString(value, fieldName) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new errors_1.AppError(errors_1.AppErrorCode.INVALID_ARGUMENT, `${fieldName} is required and must be a non-empty string`);
    }
}
// オプショナル文字列チェック
function optionalString(value, fieldName) {
    if (value === undefined || value === null) {
        return undefined;
    }
    if (typeof value !== 'string') {
        throw new errors_1.AppError(errors_1.AppErrorCode.INVALID_ARGUMENT, `${fieldName} must be a string`);
    }
    return value;
}
// 数値チェック
function requireNumber(value, fieldName) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new errors_1.AppError(errors_1.AppErrorCode.INVALID_ARGUMENT, `${fieldName} is required and must be a number`);
    }
}
// ブール値チェック
function requireBoolean(value, fieldName) {
    if (typeof value !== 'boolean') {
        throw new errors_1.AppError(errors_1.AppErrorCode.INVALID_ARGUMENT, `${fieldName} is required and must be a boolean`);
    }
}
// 配列チェック
function requireArray(value, fieldName) {
    if (!Array.isArray(value)) {
        throw new errors_1.AppError(errors_1.AppErrorCode.INVALID_ARGUMENT, `${fieldName} is required and must be an array`);
    }
}
// メールアドレス形式チェック
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// ユーザーID形式チェック（visibleUserId: 英数字とアンダースコアのみ）
function validateVisibleUserId(userId) {
    const userIdRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return userIdRegex.test(userId);
}
// パスワード強度チェック
function validatePassword(password) {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    return { valid: true };
}
// ニックネームチェック
function validateNickname(nickname) {
    if (nickname.length < 1 || nickname.length > 20) {
        return {
            valid: false,
            message: 'Nickname must be between 1 and 20 characters',
        };
    }
    return { valid: true };
}
// 認証コンテキストチェック
function requireAuth(auth) {
    if (!(auth === null || auth === void 0 ? void 0 : auth.uid)) {
        throw new errors_1.AppError(errors_1.AppErrorCode.UNAUTHORIZED, 'Authentication required');
    }
    return auth.uid;
}
//# sourceMappingURL=validators.js.map