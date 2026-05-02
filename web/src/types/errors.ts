/**
 * エラーコード定義
 */

// 認証エラー
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'auth/invalid-credentials',
  USER_NOT_FOUND: 'auth/user-not-found',
  EMAIL_ALREADY_EXISTS: 'auth/email-already-exists',
  WEAK_PASSWORD: 'auth/weak-password',
  SESSION_EXPIRED: 'auth/session-expired',
  UNAUTHORIZED: 'auth/unauthorized',
} as const;

export type AuthErrorCode = (typeof AUTH_ERRORS)[keyof typeof AUTH_ERRORS];

// メッセージエラー
export const MESSAGE_ERRORS = {
  MESSAGE_LIMIT_EXCEEDED: 'message/limit-exceeded',
  CONVERSATION_NOT_FOUND: 'message/conversation-not-found',
  SEND_FAILED: 'message/send-failed',
  DELETE_NOT_ALLOWED: 'message/delete-not-allowed',
  INVALID_CONTENT_TYPE: 'message/invalid-content-type',
  FILE_TOO_LARGE: 'message/file-too-large',
} as const;

export type MessageErrorCode =
  (typeof MESSAGE_ERRORS)[keyof typeof MESSAGE_ERRORS];

// 友達関連エラー
export const FRIENDSHIP_ERRORS = {
  USER_NOT_FOUND: 'friendship/user-not-found',
  ALREADY_FRIENDS: 'friendship/already-friends',
  REQUEST_ALREADY_SENT: 'friendship/request-already-sent',
  REQUEST_NOT_FOUND: 'friendship/request-not-found',
  CANNOT_ADD_SELF: 'friendship/cannot-add-self',
  USER_BLOCKED: 'friendship/user-blocked',
} as const;

export type FriendshipErrorCode =
  (typeof FRIENDSHIP_ERRORS)[keyof typeof FRIENDSHIP_ERRORS];

// サブスクリプションエラー
export const SUBSCRIPTION_ERRORS = {
  PURCHASE_FAILED: 'subscription/purchase-failed',
  INVALID_RECEIPT: 'subscription/invalid-receipt',
  ALREADY_SUBSCRIBED: 'subscription/already-subscribed',
  SUBSCRIPTION_EXPIRED: 'subscription/expired',
  RESTORE_FAILED: 'subscription/restore-failed',
} as const;

export type SubscriptionErrorCode =
  (typeof SUBSCRIPTION_ERRORS)[keyof typeof SUBSCRIPTION_ERRORS];

// ストレージエラー
export const STORAGE_ERRORS = {
  UPLOAD_FAILED: 'storage/upload-failed',
  FILE_NOT_FOUND: 'storage/file-not-found',
  PERMISSION_DENIED: 'storage/permission-denied',
  QUOTA_EXCEEDED: 'storage/quota-exceeded',
} as const;

export type StorageErrorCode =
  (typeof STORAGE_ERRORS)[keyof typeof STORAGE_ERRORS];

// 全エラーコード
export type AppErrorCode =
  | AuthErrorCode
  | MessageErrorCode
  | FriendshipErrorCode
  | SubscriptionErrorCode
  | StorageErrorCode;

// アプリケーションエラー
export interface AppError {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// エラーメッセージマッピング（日本語）
export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  // 認証
  [AUTH_ERRORS.INVALID_CREDENTIALS]: 'メールアドレスまたはパスワードが正しくありません',
  [AUTH_ERRORS.USER_NOT_FOUND]: 'ユーザーが見つかりません',
  [AUTH_ERRORS.EMAIL_ALREADY_EXISTS]: 'このメールアドレスは既に登録されています',
  [AUTH_ERRORS.WEAK_PASSWORD]: 'パスワードは8文字以上で設定してください',
  [AUTH_ERRORS.SESSION_EXPIRED]: 'セッションが期限切れです。再度ログインしてください',
  [AUTH_ERRORS.UNAUTHORIZED]: 'この操作を行う権限がありません',

  // メッセージ
  [MESSAGE_ERRORS.MESSAGE_LIMIT_EXCEEDED]:
    '今月のメッセージ送信上限に達しました',
  [MESSAGE_ERRORS.CONVERSATION_NOT_FOUND]: '会話が見つかりません',
  [MESSAGE_ERRORS.SEND_FAILED]: 'メッセージの送信に失敗しました',
  [MESSAGE_ERRORS.DELETE_NOT_ALLOWED]:
    'メッセージの削除はプレミアム機能です',
  [MESSAGE_ERRORS.INVALID_CONTENT_TYPE]: 'サポートされていないファイル形式です',
  [MESSAGE_ERRORS.FILE_TOO_LARGE]: 'ファイルサイズが大きすぎます',

  // 友達
  [FRIENDSHIP_ERRORS.USER_NOT_FOUND]: 'ユーザーが見つかりません',
  [FRIENDSHIP_ERRORS.ALREADY_FRIENDS]: '既に友達です',
  [FRIENDSHIP_ERRORS.REQUEST_ALREADY_SENT]: '既に友達申請を送信済みです',
  [FRIENDSHIP_ERRORS.REQUEST_NOT_FOUND]: '友達申請が見つかりません',
  [FRIENDSHIP_ERRORS.CANNOT_ADD_SELF]: '自分自身を友達に追加することはできません',
  [FRIENDSHIP_ERRORS.USER_BLOCKED]: 'このユーザーはブロックされています',

  // サブスクリプション
  [SUBSCRIPTION_ERRORS.PURCHASE_FAILED]: '購入処理に失敗しました',
  [SUBSCRIPTION_ERRORS.INVALID_RECEIPT]: 'レシートの検証に失敗しました',
  [SUBSCRIPTION_ERRORS.ALREADY_SUBSCRIBED]: '既にサブスクリプション加入済みです',
  [SUBSCRIPTION_ERRORS.SUBSCRIPTION_EXPIRED]: 'サブスクリプションの有効期限が切れています',
  [SUBSCRIPTION_ERRORS.RESTORE_FAILED]: '購入の復元に失敗しました',

  // ストレージ
  [STORAGE_ERRORS.UPLOAD_FAILED]: 'ファイルのアップロードに失敗しました',
  [STORAGE_ERRORS.FILE_NOT_FOUND]: 'ファイルが見つかりません',
  [STORAGE_ERRORS.PERMISSION_DENIED]: 'アクセス権限がありません',
  [STORAGE_ERRORS.QUOTA_EXCEEDED]: 'ストレージ容量が不足しています',
};
