/**
 * メッセージ作成時トリガー
 * - 会話の最終メッセージを更新
 * - 未読カウントを更新
 * - プッシュ通知を送信
 */
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { db } from '../utils/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { sendNewMessageNotification } from './sendPushNotification';

interface MessageData {
  senderId: string;
  type: 'text' | 'image' | 'video';
  content: string;
  thumbnailUrl: string | null;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: FirebaseFirestore.Timestamp;
}

interface ConversationData {
  participantIds: string[];
  unreadCount: Record<string, number>;
}

export const onMessageCreate = onDocumentCreated(
  'conversations/{conversationId}/messages/{messageId}',
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      console.log('No data associated with the event');
      return;
    }

    const messageData = snapshot.data() as MessageData;
    const conversationId = event.params.conversationId;

    try {
      // 会話ドキュメントを取得
      const conversationRef = db.collection('conversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();

      if (!conversationDoc.exists) {
        console.error(`Conversation not found: ${conversationId}`);
        return;
      }

      const conversationData = conversationDoc.data() as ConversationData;
      const receiverId = conversationData.participantIds.find(
        (id) => id !== messageData.senderId
      );

      if (!receiverId) {
        console.error('Receiver not found');
        return;
      }

      // 最終メッセージの内容を決定
      let lastMessageContent = messageData.content;
      if (messageData.type === 'image') {
        lastMessageContent = '📷 画像';
      } else if (messageData.type === 'video') {
        lastMessageContent = '🎥 動画';
      }

      // 会話ドキュメントを更新
      const updateData: Record<string, unknown> = {
        lastMessage: {
          content: lastMessageContent,
          senderId: messageData.senderId,
          createdAt: messageData.createdAt,
          type: messageData.type,
        },
        updatedAt: FieldValue.serverTimestamp(),
        [`unreadCount.${receiverId}`]: FieldValue.increment(1),
      };

      await conversationRef.update(updateData);

      console.log(`Updated conversation ${conversationId} with new message`);

      // プッシュ通知を送信
      await sendNewMessageNotification(
        receiverId,
        messageData.senderId,
        lastMessageContent,
        conversationId
      );
    } catch (error) {
      console.error('Error processing message creation:', error);
      throw error;
    }
  }
);
