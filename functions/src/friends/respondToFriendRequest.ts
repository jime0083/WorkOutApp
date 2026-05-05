/**
 * respondToFriendRequest - 友達申請応答
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { requireAuth, requireString } from '../utils/validators';
import { getMessage } from '../i18n/messages';
import { sendFriendAcceptedNotification } from '../messaging/sendPushNotification';

const db = getFirestore();

interface RespondToFriendRequestData {
  friendshipId: string;
  action: 'accept' | 'reject';
  lang?: string;
}

interface RespondToFriendRequestResult {
  success: boolean;
  error?: string;
}

export const respondToFriendRequest = onCall<RespondToFriendRequestData>(
  { region: 'asia-northeast1' },
  async (request): Promise<RespondToFriendRequestResult> => {
    // 認証チェック
    const userId = requireAuth(request.auth);

    // 言語設定を取得
    const lang = request.data.lang;

    // 入力検証
    requireString(request.data.friendshipId, 'friendshipId');
    const friendshipId = request.data.friendshipId;
    const action = request.data.action;

    if (action !== 'accept' && action !== 'reject') {
      throw new HttpsError('invalid-argument', getMessage(lang, 'friends', 'invalidAction'));
    }

    try {
      const friendshipRef = db.collection('friendships').doc(friendshipId);
      const friendshipDoc = await friendshipRef.get();

      if (!friendshipDoc.exists) {
        return {
          success: false,
          error: getMessage(lang, 'friends', 'requestNotFound'),
        };
      }

      const friendshipData = friendshipDoc.data()!;

      // 自分が受信者であることを確認
      if (friendshipData.receiverId !== userId) {
        return {
          success: false,
          error: getMessage(lang, 'friends', 'notAuthorized'),
        };
      }

      // ステータスがpendingであることを確認
      if (friendshipData.status !== 'pending') {
        return {
          success: false,
          error: getMessage(lang, 'friends', 'alreadyProcessed'),
        };
      }

      if (action === 'accept') {
        // 友達申請を承認
        await friendshipRef.update({
          status: 'accepted',
          updatedAt: FieldValue.serverTimestamp(),
        });

        // 申請者に承認通知を送信
        await sendFriendAcceptedNotification(
          friendshipData.requesterId,
          userId,
          friendshipId
        );
      } else {
        // 友達申請を拒否（ドキュメントを削除）
        await friendshipRef.delete();
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to respond to friend request:', error);
      throw new HttpsError('internal', getMessage(lang, 'friends', 'respondFailed'));
    }
  }
);
