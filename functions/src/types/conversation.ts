/**
 * 会話関連の型定義
 */

import type { MessageType } from './message';

// 最新メッセージ情報（一覧表示用）
export interface LastMessage {
  content: string;
  senderId: string;
  type: MessageType;
  createdAt: Date;
}

// 未読数
export interface UnreadCount {
  [userId: string]: number;
}

// 会話
export interface Conversation {
  id: string;
  participantIds: string[];

  // 最新メッセージ情報
  lastMessage: LastMessage | null;

  // 未読数
  unreadCount: UnreadCount;

  createdAt: Date;
  updatedAt: Date;
}

// 会話一覧表示用（相手のプロフィール情報を含む）
export interface ConversationWithProfile extends Conversation {
  partnerProfile: {
    visibleUserId: string;
    nickname: string;
    profileImageUrl: string | null;
  };
  myUnreadCount: number;
}
