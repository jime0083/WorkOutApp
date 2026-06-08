/**
 * メッセージ関連の型定義
 */
export type MessageType = 'text' | 'image' | 'video';
export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    type: MessageType;
    content: string;
    thumbnailUrl: string | null;
    isRead: boolean;
    readAt: Date | null;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
}
export interface CreateMessageInput {
    conversationId: string;
    type: MessageType;
    content: string;
    thumbnailUrl?: string | null;
}
export interface SendMessageResult {
    success: boolean;
    messageId?: string;
    error?: string;
    remainingMessages?: number;
}
//# sourceMappingURL=message.d.ts.map