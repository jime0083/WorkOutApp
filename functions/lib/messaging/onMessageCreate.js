"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessageCreate = void 0;
/**
 * メッセージ作成時トリガー
 * - 会話の最終メッセージを更新
 * - 未読カウントを更新
 * - プッシュ通知を送信
 */
const firestore_1 = require("firebase-functions/v2/firestore");
const firebase_1 = require("../utils/firebase");
const firestore_2 = require("firebase-admin/firestore");
const sendPushNotification_1 = require("./sendPushNotification");
exports.onMessageCreate = (0, firestore_1.onDocumentCreated)('conversations/{conversationId}/messages/{messageId}', async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log('No data associated with the event');
        return;
    }
    const messageData = snapshot.data();
    const conversationId = event.params.conversationId;
    try {
        // 会話ドキュメントを取得
        const conversationRef = firebase_1.db.collection('conversations').doc(conversationId);
        const conversationDoc = await conversationRef.get();
        if (!conversationDoc.exists) {
            console.error(`Conversation not found: ${conversationId}`);
            return;
        }
        const conversationData = conversationDoc.data();
        const receiverId = conversationData.participantIds.find((id) => id !== messageData.senderId);
        if (!receiverId) {
            console.error('Receiver not found');
            return;
        }
        // 最終メッセージの内容を決定
        let lastMessageContent = messageData.content;
        if (messageData.type === 'image') {
            lastMessageContent = '📷 画像';
        }
        else if (messageData.type === 'video') {
            lastMessageContent = '🎥 動画';
        }
        // 会話ドキュメントを更新
        const updateData = {
            lastMessage: {
                content: lastMessageContent,
                senderId: messageData.senderId,
                createdAt: messageData.createdAt,
                type: messageData.type,
            },
            updatedAt: firestore_2.FieldValue.serverTimestamp(),
            [`unreadCount.${receiverId}`]: firestore_2.FieldValue.increment(1),
        };
        await conversationRef.update(updateData);
        console.log(`Updated conversation ${conversationId} with new message`);
        // プッシュ通知を送信
        await (0, sendPushNotification_1.sendNewMessageNotification)(receiverId, messageData.senderId, lastMessageContent, conversationId);
    }
    catch (error) {
        console.error('Error processing message creation:', error);
        throw error;
    }
});
//# sourceMappingURL=onMessageCreate.js.map