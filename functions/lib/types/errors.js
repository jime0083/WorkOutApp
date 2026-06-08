"use strict";
/**
 * エラーコード定義
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = exports.STORAGE_ERRORS = exports.SUBSCRIPTION_ERRORS = exports.FRIENDSHIP_ERRORS = exports.MESSAGE_ERRORS = exports.AUTH_ERRORS = void 0;
// 認証エラー
exports.AUTH_ERRORS = {
    INVALID_CREDENTIALS: 'auth/invalid-credentials',
    USER_NOT_FOUND: 'auth/user-not-found',
    EMAIL_ALREADY_EXISTS: 'auth/email-already-exists',
    WEAK_PASSWORD: 'auth/weak-password',
    SESSION_EXPIRED: 'auth/session-expired',
    UNAUTHORIZED: 'auth/unauthorized',
};
// メッセージエラー
exports.MESSAGE_ERRORS = {
    MESSAGE_LIMIT_EXCEEDED: 'message/limit-exceeded',
    CONVERSATION_NOT_FOUND: 'message/conversation-not-found',
    SEND_FAILED: 'message/send-failed',
    DELETE_NOT_ALLOWED: 'message/delete-not-allowed',
    INVALID_CONTENT_TYPE: 'message/invalid-content-type',
    FILE_TOO_LARGE: 'message/file-too-large',
};
// 友達関連エラー
exports.FRIENDSHIP_ERRORS = {
    USER_NOT_FOUND: 'friendship/user-not-found',
    ALREADY_FRIENDS: 'friendship/already-friends',
    REQUEST_ALREADY_SENT: 'friendship/request-already-sent',
    REQUEST_NOT_FOUND: 'friendship/request-not-found',
    CANNOT_ADD_SELF: 'friendship/cannot-add-self',
    USER_BLOCKED: 'friendship/user-blocked',
};
// サブスクリプションエラー
exports.SUBSCRIPTION_ERRORS = {
    PURCHASE_FAILED: 'subscription/purchase-failed',
    INVALID_RECEIPT: 'subscription/invalid-receipt',
    ALREADY_SUBSCRIBED: 'subscription/already-subscribed',
    SUBSCRIPTION_EXPIRED: 'subscription/expired',
    RESTORE_FAILED: 'subscription/restore-failed',
};
// ストレージエラー
exports.STORAGE_ERRORS = {
    UPLOAD_FAILED: 'storage/upload-failed',
    FILE_NOT_FOUND: 'storage/file-not-found',
    PERMISSION_DENIED: 'storage/permission-denied',
    QUOTA_EXCEEDED: 'storage/quota-exceeded',
};
// エラーメッセージマッピング（日本語）
exports.ERROR_MESSAGES = {
    // 認証
    [exports.AUTH_ERRORS.INVALID_CREDENTIALS]: 'メールアドレスまたはパスワードが正しくありません',
    [exports.AUTH_ERRORS.USER_NOT_FOUND]: 'ユーザーが見つかりません',
    [exports.AUTH_ERRORS.EMAIL_ALREADY_EXISTS]: 'このメールアドレスは既に登録されています',
    [exports.AUTH_ERRORS.WEAK_PASSWORD]: 'パスワードは8文字以上で設定してください',
    [exports.AUTH_ERRORS.SESSION_EXPIRED]: 'セッションが期限切れです。再度ログインしてください',
    [exports.AUTH_ERRORS.UNAUTHORIZED]: 'この操作を行う権限がありません',
    // メッセージ
    [exports.MESSAGE_ERRORS.MESSAGE_LIMIT_EXCEEDED]: '今月のメッセージ送信上限に達しました',
    [exports.MESSAGE_ERRORS.CONVERSATION_NOT_FOUND]: '会話が見つかりません',
    [exports.MESSAGE_ERRORS.SEND_FAILED]: 'メッセージの送信に失敗しました',
    [exports.MESSAGE_ERRORS.DELETE_NOT_ALLOWED]: 'メッセージの削除はプレミアム機能です',
    [exports.MESSAGE_ERRORS.INVALID_CONTENT_TYPE]: 'サポートされていないファイル形式です',
    [exports.MESSAGE_ERRORS.FILE_TOO_LARGE]: 'ファイルサイズが大きすぎます',
    // 友達
    [exports.FRIENDSHIP_ERRORS.USER_NOT_FOUND]: 'ユーザーが見つかりません',
    [exports.FRIENDSHIP_ERRORS.ALREADY_FRIENDS]: '既に友達です',
    [exports.FRIENDSHIP_ERRORS.REQUEST_ALREADY_SENT]: '既に友達申請を送信済みです',
    [exports.FRIENDSHIP_ERRORS.REQUEST_NOT_FOUND]: '友達申請が見つかりません',
    [exports.FRIENDSHIP_ERRORS.CANNOT_ADD_SELF]: '自分自身を友達に追加することはできません',
    [exports.FRIENDSHIP_ERRORS.USER_BLOCKED]: 'このユーザーはブロックされています',
    // サブスクリプション
    [exports.SUBSCRIPTION_ERRORS.PURCHASE_FAILED]: '購入処理に失敗しました',
    [exports.SUBSCRIPTION_ERRORS.INVALID_RECEIPT]: 'レシートの検証に失敗しました',
    [exports.SUBSCRIPTION_ERRORS.ALREADY_SUBSCRIBED]: '既にサブスクリプション加入済みです',
    [exports.SUBSCRIPTION_ERRORS.SUBSCRIPTION_EXPIRED]: 'サブスクリプションの有効期限が切れています',
    [exports.SUBSCRIPTION_ERRORS.RESTORE_FAILED]: '購入の復元に失敗しました',
    // ストレージ
    [exports.STORAGE_ERRORS.UPLOAD_FAILED]: 'ファイルのアップロードに失敗しました',
    [exports.STORAGE_ERRORS.FILE_NOT_FOUND]: 'ファイルが見つかりません',
    [exports.STORAGE_ERRORS.PERMISSION_DENIED]: 'アクセス権限がありません',
    [exports.STORAGE_ERRORS.QUOTA_EXCEEDED]: 'ストレージ容量が不足しています',
};
//# sourceMappingURL=errors.js.map