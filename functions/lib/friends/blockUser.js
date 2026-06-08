"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockUser = void 0;
/**
 * blockUser - ユーザーブロック
 */
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const validators_1 = require("../utils/validators");
const messages_1 = require("../i18n/messages");
const db = (0, firestore_1.getFirestore)();
exports.blockUser = (0, https_1.onCall)({ region: 'asia-northeast1' }, async (request) => {
    // 認証チェック
    const userId = (0, validators_1.requireAuth)(request.auth);
    // 言語設定を取得
    const lang = request.data.lang;
    // 入力検証
    (0, validators_1.requireString)(request.data.targetUserId, 'targetUserId');
    const targetUserId = request.data.targetUserId;
    const action = request.data.action;
    if (action !== 'block' && action !== 'unblock') {
        throw new https_1.HttpsError('invalid-argument', (0, messages_1.getMessage)(lang, 'block', 'invalidAction'));
    }
    // 自分自身をブロックできない
    if (targetUserId === userId) {
        return {
            success: false,
            error: (0, messages_1.getMessage)(lang, 'block', 'cannotBlockSelf'),
        };
    }
    try {
        // 対象ユーザーの存在確認
        const targetUserDoc = await db.collection('users').doc(targetUserId).get();
        if (!targetUserDoc.exists) {
            return {
                success: false,
                error: (0, messages_1.getMessage)(lang, 'block', 'userNotFound'),
            };
        }
        // 既存の友達関係を検索
        const friendshipsSnapshot = await db
            .collection('friendships')
            .where('memberIds', 'array-contains', userId)
            .get();
        let existingFriendship = null;
        for (const doc of friendshipsSnapshot.docs) {
            const data = doc.data();
            if (data.memberIds.includes(targetUserId)) {
                existingFriendship = doc;
                break;
            }
        }
        if (action === 'block') {
            if (existingFriendship) {
                const data = existingFriendship.data();
                // 既にブロックされているかチェック
                if (data.status === 'blocked' && data.blockedBy === userId) {
                    return {
                        success: false,
                        error: (0, messages_1.getMessage)(lang, 'block', 'alreadyBlocked'),
                    };
                }
                // 既存の友達関係をブロック状態に更新
                await existingFriendship.ref.update({
                    status: 'blocked',
                    blockedBy: userId,
                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                });
            }
            else {
                // 新しいブロック関係を作成
                await db.collection('friendships').add({
                    requesterId: userId,
                    receiverId: targetUserId,
                    memberIds: [userId, targetUserId],
                    status: 'blocked',
                    blockedBy: userId,
                    createdAt: firestore_1.FieldValue.serverTimestamp(),
                    updatedAt: firestore_1.FieldValue.serverTimestamp(),
                });
            }
            return {
                success: true,
            };
        }
        else {
            // unblock
            if (!existingFriendship) {
                return {
                    success: false,
                    error: (0, messages_1.getMessage)(lang, 'block', 'blockNotFound'),
                };
            }
            const data = existingFriendship.data();
            // ブロック状態であることを確認
            if (data.status !== 'blocked') {
                return {
                    success: false,
                    error: (0, messages_1.getMessage)(lang, 'block', 'notBlocked'),
                };
            }
            // 自分がブロックしたことを確認
            if (data.blockedBy !== userId) {
                return {
                    success: false,
                    error: (0, messages_1.getMessage)(lang, 'block', 'notAuthorized'),
                };
            }
            // ブロック解除（友達関係を削除）
            await existingFriendship.ref.delete();
            return {
                success: true,
            };
        }
    }
    catch (error) {
        console.error('Failed to block/unblock user:', error);
        throw new https_1.HttpsError('internal', (0, messages_1.getMessage)(lang, 'block', 'operationFailed'));
    }
});
//# sourceMappingURL=blockUser.js.map