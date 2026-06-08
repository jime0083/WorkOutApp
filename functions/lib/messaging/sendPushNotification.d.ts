export type NotificationType = 'new_message' | 'friend_request' | 'friend_accepted';
export interface NotificationData {
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, string>;
}
/**
 * 単一ユーザーにプッシュ通知を送信
 */
export declare function sendPushNotification(userId: string, notification: NotificationData): Promise<boolean>;
/**
 * 新着メッセージ通知を送信
 */
export declare function sendNewMessageNotification(receiverId: string, senderId: string, messageContent: string, conversationId: string): Promise<boolean>;
/**
 * 友達申請通知を送信
 */
export declare function sendFriendRequestNotification(receiverId: string, senderId: string, friendshipId: string): Promise<boolean>;
/**
 * 友達申請承認通知を送信
 */
export declare function sendFriendAcceptedNotification(requesterId: string, accepterId: string, friendshipId: string): Promise<boolean>;
//# sourceMappingURL=sendPushNotification.d.ts.map