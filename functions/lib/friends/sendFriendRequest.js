"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFriendRequest = void 0;
/**
 * sendFriendRequest - 友達申請送信
 */
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const validators_1 = require("../utils/validators");
const messages_1 = require("../i18n/messages");
const sendPushNotification_1 = require("../messaging/sendPushNotification");
const db = (0, firestore_1.getFirestore)();
exports.sendFriendRequest = (0, https_1.onCall)({ region: 'asia-northeast1' }, async (request) => {
    // 認証チェック
    const userId = (0, validators_1.requireAuth)(request.auth);
    // 言語設定を取得
    const lang = request.data.lang;
    // 入力検証
    (0, validators_1.requireString)(request.data.targetVisibleUserId, 'targetVisibleUserId');
    const targetVisibleUserId = request.data.targetVisibleUserId;
    try {
        // 対象ユーザーを検索（visibleUserIdで検索）
        const usersSnapshot = await db
            .collection('users')
            .where('visibleUserId', '==', targetVisibleUserId)
            .limit(1)
            .get();
        if (usersSnapshot.empty) {
            return {
                success: false,
                error: (0, messages_1.getMessage)(lang, 'friends', 'userNotFound'),
            };
        }
        const targetUser = usersSnapshot.docs[0];
        const targetUserId = targetUser.id;
        // 自分自身への申請をチェック
        if (targetUserId === userId) {
            return {
                success: false,
                error: (0, messages_1.getMessage)(lang, 'friends', 'cannotAddSelf'),
            };
        }
        // 既存の友達関係をチェック
        const existingFriendship = await db
            .collection('friendships')
            .where('memberIds', 'array-contains', userId)
            .get();
        for (const doc of existingFriendship.docs) {
            const data = doc.data();
            if (data.memberIds.includes(targetUserId)) {
                if (data.status === 'accepted') {
                    return {
                        success: false,
                        error: (0, messages_1.getMessage)(lang, 'friends', 'alreadyFriends'),
                    };
                }
                if (data.status === 'pending') {
                    return {
                        success: false,
                        error: (0, messages_1.getMessage)(lang, 'friends', 'requestAlreadySent'),
                    };
                }
                if (data.status === 'blocked') {
                    // ブロックされている場合
                    if (data.blockedBy === targetUserId) {
                        return {
                            success: false,
                            error: (0, messages_1.getMessage)(lang, 'friends', 'cannotSendRequest'),
                        };
                    }
                    // 自分がブロックしている場合は、ブロック解除が必要
                    return {
                        success: false,
                        error: (0, messages_1.getMessage)(lang, 'friends', 'unblockFirst'),
                    };
                }
            }
        }
        // 友達申請を作成
        const friendshipData = {
            requesterId: userId,
            receiverId: targetUserId,
            memberIds: [userId, targetUserId],
            status: 'pending',
            blockedBy: null,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        };
        const docRef = await db.collection('friendships').add(friendshipData);
        // プッシュ通知を送信
        await (0, sendPushNotification_1.sendFriendRequestNotification)(targetUserId, userId, docRef.id);
        return {
            success: true,
            friendshipId: docRef.id,
        };
    }
    catch (error) {
        console.error('Failed to send friend request:', error);
        throw new https_1.HttpsError('internal', (0, messages_1.getMessage)(lang, 'friends', 'sendFailed'));
    }
});
//# sourceMappingURL=sendFriendRequest.js.map