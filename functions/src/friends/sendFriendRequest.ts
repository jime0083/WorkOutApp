/**
 * sendFriendRequest - 友達申請送信
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { requireAuth, requireString } from '../utils/validators';

const db = getFirestore();

interface SendFriendRequestData {
  targetVisibleUserId: string;
}

interface SendFriendRequestResult {
  success: boolean;
  friendshipId?: string;
  error?: string;
}

export const sendFriendRequest = onCall<SendFriendRequestData>(
  { region: 'asia-northeast1' },
  async (request): Promise<SendFriendRequestResult> => {
    // 認証チェック
    const userId = requireAuth(request.auth);

    // 入力検証
    requireString(request.data.targetVisibleUserId, 'targetVisibleUserId');
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
          error: 'ユーザーが見つかりません',
        };
      }

      const targetUser = usersSnapshot.docs[0];
      const targetUserId = targetUser.id;

      // 自分自身への申請をチェック
      if (targetUserId === userId) {
        return {
          success: false,
          error: '自分自身に友達申請はできません',
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
              error: 'すでに友達です',
            };
          }
          if (data.status === 'pending') {
            return {
              success: false,
              error: '友達申請は既に送信されています',
            };
          }
          if (data.status === 'blocked') {
            // ブロックされている場合
            if (data.blockedBy === targetUserId) {
              return {
                success: false,
                error: 'このユーザーに友達申請を送ることができません',
              };
            }
            // 自分がブロックしている場合は、ブロック解除が必要
            return {
              success: false,
              error: 'ブロックを解除してから友達申請を送ってください',
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
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      const docRef = await db.collection('friendships').add(friendshipData);

      return {
        success: true,
        friendshipId: docRef.id,
      };
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw new HttpsError('internal', '友達申請の送信に失敗しました');
    }
  }
);
