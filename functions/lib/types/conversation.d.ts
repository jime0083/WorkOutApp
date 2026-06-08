/**
 * 会話関連の型定義
 */
import type { MessageType } from './message';
export interface LastMessage {
    content: string;
    senderId: string;
    type: MessageType;
    createdAt: Date;
}
export interface UnreadCount {
    [userId: string]: number;
}
export interface Conversation {
    id: string;
    participantIds: string[];
    lastMessage: LastMessage | null;
    unreadCount: UnreadCount;
    createdAt: Date;
    updatedAt: Date;
}
export interface ConversationWithProfile extends Conversation {
    partnerProfile: {
        visibleUserId: string;
        nickname: string;
        profileImageUrl: string | null;
    };
    myUnreadCount: number;
}
//# sourceMappingURL=conversation.d.ts.map