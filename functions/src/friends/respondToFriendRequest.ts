/**
 * respondToFriendRequest - 友達申請応答
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { requireAuth, requireString } from '../utils/validators';

const db = getFirestore();

interface RespondToFriendRequestData {
  friendshipId: string;
  action: 'accept' | 'reject';
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

    // 入力検証
    requireString(request.data.friendshipId, 'friendshipId');
    const friendshipId = request.data.friendshipId;
    const action = request.data.action;

    if (action !== 'accept' && action !== 'reject') {
      throw new HttpsError('invalid-argument', 'actionは"accept"または"reject"である必要があります');
    }

    try {
      const friendshipRef = db.collection('friendships').doc(friendshipId);
      const friendshipDoc = await friendshipRef.get();

      if (!friendshipDoc.exists) {
        return {
          success: false,
          error: '友達申請が見つかりません',
        };
      }

      const friendshipData = friendshipDoc.data()!;

      // 自分が受信者であることを確認
      if (friendshipData.receiverId !== userId) {
        return {
          success: false,
          error: 'この友達申請に応答する権限がありません',
        };
      }

      // ステータスがpendingであることを確認
      if (friendshipData.status !== 'pending') {
        return {
          success: false,
          error: 'この友達申請は既に処理されています',
        };
      }

      if (action === 'accept') {
        // 友達申請を承認
        await friendshipRef.update({
          status: 'accepted',
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        // 友達申請を拒否（ドキュメントを削除）
        await friendshipRef.delete();
      }

      return {
        success: true,
      };
    } catch (error) {
      console.error('Failed to respond to friend request:', error);
      throw new HttpsError('internal', '友達申請の応答に失敗しました');
    }
  }
);
