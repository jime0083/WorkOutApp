"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToFriendRequest = void 0;
/**
 * respondToFriendRequest - 友達申請応答
 */
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const validators_1 = require("../utils/validators");
const messages_1 = require("../i18n/messages");
const sendPushNotification_1 = require("../messaging/sendPushNotification");
const db = (0, firestore_1.getFirestore)();
exports.respondToFriendRequest = (0, https_1.onCall)({ region: 'asia-northeast1' }, async (request) => {
    // 認証チェック
    const userId = (0, validators_1.requireAuth)(request.auth);
    // 言語設定を取得
    const lang = request.data.lang;
    // 入力検証
    (0, validators_1.requireString)(request.data.friendshipId, 'friendshipId');
    const friendshipId = request.data.friendshipId;
    const action = request.data.action;
    if (action !== 'accept' && action !== 'reject') {
        throw new https_1.HttpsError('invalid-argument', (0, messages_1.getMessage)(lang, 'friends', 'invalidAction'));
    }
    try {
        const friendshipRef = db.collection('friendships').doc(friendshipId);
        const friendshipDoc = await friendshipRef.get();
        if (!friendshipDoc.exists) {
            return {
                success: false,
                error: (0, messages_1.getMessage)(lang, 'friends', 'requestNotFound'),
            };
        }
        const friendshipData = friendshipDoc.data();
        // 自分が受信者であることを確認
        if (friendshipData.receiverId !== userId) {
            return {
                success: false,
                error: (0, messages_1.getMessage)(lang, 'friends', 'notAuthorized'),
            };
        }
        // ステータスがpendingであることを確認
        if (friendshipData.status !== 'pending') {
            return {
                success: false,
                error: (0, messages_1.getMessage)(lang, 'friends', 'alreadyProcessed'),
            };
        }
        if (action === 'accept') {
            // 友達申請を承認
            await friendshipRef.update({
                status: 'accepted',
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            // 申請者に承認通知を送信
            await (0, sendPushNotification_1.sendFriendAcceptedNotification)(friendshipData.requesterId, userId, friendshipId);
        }
        else {
            // 友達申請を拒否（ドキュメントを削除）
            await friendshipRef.delete();
        }
        return {
            success: true,
        };
    }
    catch (error) {
        console.error('Failed to respond to friend request:', error);
        throw new https_1.HttpsError('internal', (0, messages_1.getMessage)(lang, 'friends', 'respondFailed'));
    }
});
//# sourceMappingURL=respondToFriendRequest.js.map