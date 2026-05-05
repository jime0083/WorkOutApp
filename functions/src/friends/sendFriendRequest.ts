/**
 * sendFriendRequest - 友達申請送信
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { requireAuth, requireString } from '../utils/validators';
import { getMessage } from '../i18n/messages';
import { sendFriendRequestNotification } from '../messaging/sendPushNotification';

const db = getFirestore();

interface SendFriendRequestData {
  targetVisibleUserId: string;
  lang?: string;
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

    // 言語設定を取得
    const lang = request.data.lang;

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
          error: getMessage(lang, 'friends', 'userNotFound'),
        };
      }

      const targetUser = usersSnapshot.docs[0];
      const targetUserId = targetUser.id;

      // 自分自身への申請をチェック
      if (targetUserId === userId) {
        return {
          success: false,
          error: getMessage(lang, 'friends', 'cannotAddSelf'),
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
              error: getMessage(lang, 'friends', 'alreadyFriends'),
            };
          }
          if (data.status === 'pending') {
            return {
              success: false,
              error: getMessage(lang, 'friends', 'requestAlreadySent'),
            };
          }
          if (data.status === 'blocked') {
            // ブロックされている場合
            if (data.blockedBy === targetUserId) {
              return {
                success: false,
                error: getMessage(lang, 'friends', 'cannotSendRequest'),
              };
            }
            // 自分がブロックしている場合は、ブロック解除が必要
            return {
              success: false,
              error: getMessage(lang, 'friends', 'unblockFirst'),
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

      // プッシュ通知を送信
      await sendFriendRequestNotification(targetUserId, userId, docRef.id);

      return {
        success: true,
        friendshipId: docRef.id,
      };
    } catch (error) {
      console.error('Failed to send friend request:', error);
      throw new HttpsError('internal', getMessage(lang, 'friends', 'sendFailed'));
    }
  }
);
