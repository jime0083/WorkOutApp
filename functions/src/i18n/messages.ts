/**
 * Cloud Functions 国際化メッセージ
 * エラーメッセージと通知メッセージの多言語対応
 */

type Language = 'ja' | 'en';

interface Messages {
  // 認証関連
  auth: {
    userNotFound: string;
    unauthorized: string;
  };
  // 友達関連
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
  // ブロック関連
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
  // メッセージ関連
  message: {
    limitReached: string;
    sendFailed: string;
    userNotFound: string;
  };
  // 課金関連
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
  // 通知関連
  notification: {
    newFriendRequest: string;
    friendRequestAccepted: string;
    newMessage: string;
    messageFromFormat: string;
  };
  // 共通
  common: {
    internalError: string;
  };
}

const ja: Messages = {
  auth: {
    userNotFound: 'ユーザーが見つかりません',
    unauthorized: '認証が必要です',
  },
  friends: {
    userNotFound: 'ユーザーが見つかりません',
    cannotAddSelf: '自分自身に友達申請はできません',
    alreadyFriends: 'すでに友達です',
    requestAlreadySent: '友達申請は既に送信されています',
    cannotSendRequest: 'このユーザーに友達申請を送ることができません',
    unblockFirst: 'ブロックを解除してから友達申請を送ってください',
    requestNotFound: '友達申請が見つかりません',
    notAuthorized: 'この友達申請に応答する権限がありません',
    alreadyProcessed: 'この友達申請は既に処理されています',
    sendFailed: '友達申請の送信に失敗しました',
    respondFailed: '友達申請の応答に失敗しました',
    invalidAction: 'actionは"accept"または"reject"である必要があります',
  },
  block: {
    cannotBlockSelf: '自分自身をブロックすることはできません',
    userNotFound: 'ユーザーが見つかりません',
    alreadyBlocked: 'このユーザーは既にブロックされています',
    notBlocked: 'このユーザーはブロックされていません',
    blockNotFound: 'ブロック関係が見つかりません',
    notAuthorized: 'このブロックを解除する権限がありません',
    operationFailed: 'ブロック操作に失敗しました',
    invalidAction: 'actionは"block"または"unblock"である必要があります',
  },
  message: {
    limitReached: '今月のメッセージ上限に達しました',
    sendFailed: 'メッセージの送信に失敗しました',
    userNotFound: 'ユーザーが見つかりません',
  },
  subscription: {
    invalidReceiptData: 'レシートデータが無効です',
    receiptVerificationFailed: 'レシートの検証に失敗しました',
    invalidPlanType: 'プランタイプが無効です',
    alreadySubscribed: '既にサブスクリプションに登録済みです',
    subscriptionUpdated: 'サブスクリプションが更新されました',
    subscriptionCreated: 'サブスクリプションが作成されました',
    subscriptionExpired: 'サブスクリプションの有効期限が切れています',
    verificationError: 'レシート検証中にエラーが発生しました',
    userNotFound: 'ユーザーが見つかりません',
  },
  notification: {
    newFriendRequest: '新しい友達申請があります',
    friendRequestAccepted: '友達申請が承認されました',
    newMessage: '新着メッセージがあります',
    messageFromFormat: '{{name}}からのメッセージ',
  },
  common: {
    internalError: '内部エラーが発生しました',
  },
};

const en: Messages = {
  auth: {
    userNotFound: 'User not found',
    unauthorized: 'Authentication required',
  },
  friends: {
    userNotFound: 'User not found',
    cannotAddSelf: 'You cannot send a friend request to yourself',
    alreadyFriends: 'Already friends',
    requestAlreadySent: 'Friend request already sent',
    cannotSendRequest: 'Cannot send friend request to this user',
    unblockFirst: 'Please unblock the user before sending a friend request',
    requestNotFound: 'Friend request not found',
    notAuthorized: 'You are not authorized to respond to this friend request',
    alreadyProcessed: 'This friend request has already been processed',
    sendFailed: 'Failed to send friend request',
    respondFailed: 'Failed to respond to friend request',
    invalidAction: 'action must be "accept" or "reject"',
  },
  block: {
    cannotBlockSelf: 'You cannot block yourself',
    userNotFound: 'User not found',
    alreadyBlocked: 'This user is already blocked',
    notBlocked: 'This user is not blocked',
    blockNotFound: 'Block relationship not found',
    notAuthorized: 'You are not authorized to unblock this user',
    operationFailed: 'Block operation failed',
    invalidAction: 'action must be "block" or "unblock"',
  },
  message: {
    limitReached: 'You have reached your monthly message limit',
    sendFailed: 'Failed to send message',
    userNotFound: 'User not found',
  },
  subscription: {
    invalidReceiptData: 'Invalid receipt data',
    receiptVerificationFailed: 'Receipt verification failed',
    invalidPlanType: 'Invalid plan type',
    alreadySubscribed: 'Already subscribed',
    subscriptionUpdated: 'Subscription updated',
    subscriptionCreated: 'Subscription created',
    subscriptionExpired: 'Subscription has expired',
    verificationError: 'Error occurred during receipt verification',
    userNotFound: 'User not found',
  },
  notification: {
    newFriendRequest: 'New friend request',
    friendRequestAccepted: 'Friend request accepted',
    newMessage: 'New message',
    messageFromFormat: 'Message from {{name}}',
  },
  common: {
    internalError: 'An internal error occurred',
  },
};

const messages: Record<Language, Messages> = { ja, en };

/**
 * 言語に応じたメッセージを取得
 */
export function getMessage(
  lang: string | undefined,
  category: keyof Messages,
  key: string
): string {
  const language: Language = lang === 'en' ? 'en' : 'ja';
  const categoryMessages = messages[language][category];
  return (categoryMessages as Record<string, string>)[key] || key;
}

/**
 * テンプレート文字列を置換
 */
export function formatMessage(
  message: string,
  params: Record<string, string | number>
): string {
  return message.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return String(params[key] ?? `{{${key}}}`);
  });
}

/**
 * サポートされている言語かどうかをチェック
 */
export function isValidLanguage(lang: string): lang is Language {
  return lang === 'ja' || lang === 'en';
}

/**
 * デフォルト言語
 */
export const DEFAULT_LANGUAGE: Language = 'ja';

export type { Language, Messages };
