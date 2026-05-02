/**
 * メッセージ関連の型定義
 */

// メッセージタイプ
export type MessageType = 'text' | 'image' | 'video';

// メッセージ
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;

  // メッセージ内容
  type: MessageType;
  content: string;
  thumbnailUrl: string | null;

  // 状態
  isRead: boolean;
  readAt: Date | null;
  isDeleted: boolean;
  deletedAt: Date | null;

  createdAt: Date;
}

// メッセージ作成時の入力
export interface CreateMessageInput {
  conversationId: string;
  type: MessageType;
  content: string;
  thumbnailUrl?: string | null;
}

// メッセージ送信結果
export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  remainingMessages?: number; // 無料ユーザー向け: 残りメッセージ数
}
