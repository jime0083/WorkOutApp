/**
 * blockUser - ユーザーブロック
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { requireAuth, requireString } from '../utils/validators';

const db = getFirestore();

interface BlockUserData {
  targetUserId: string;
  action: 'block' | 'unblock';
}

interface BlockUserResult {
  success: boolean;
  error?: string;
}

export const blockUser = onCall<BlockUserData>(
  { region: 'asia-northeast1' },
  async (request): Promise<BlockUserResult> => {
    // 認証チェック
    const userId = requireAuth(request.auth);

    // 入力検証
    requireString(request.data.targetUserId, 'targetUserId');
    const targetUserId = request.data.targetUserId;
    const action = request.data.action;

    if (action !== 'block' && action !== 'unblock') {
      throw new HttpsError('invalid-argument', 'actionは"block"または"unblock"である必要があります');
    }

    // 自分自身をブロックできない
    if (targetUserId === userId) {
      return {
        success: false,
        error: '自分自身をブロックすることはできません',
      };
    }

    try {
      // 対象ユーザーの存在確認
      const targetUserDoc = await db.collection('users').doc(targetUserId).get();
      if (!targetUserDoc.exists) {
        return {
          success: false,
          error: 'ユーザーが見つかりません',
        };
      }

      // 既存の友達関係を検索
      const friendshipsSnapshot = await db
        .collection('friendships')
        .where('memberIds', 'array-contains', userId)
        .get();

      let existingFriendship: FirebaseFirestore.QueryDocumentSnapshot | null = null;
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
              error: 'このユーザーは既にブロックされています',
            };
          }

          // 既存の友達関係をブロック状態に更新
          await existingFriendship.ref.update({
            status: 'blocked',
            blockedBy: userId,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } else {
          // 新しいブロック関係を作成
          await db.collection('friendships').add({
            requesterId: userId,
            receiverId: targetUserId,
            memberIds: [userId, targetUserId],
            status: 'blocked',
            blockedBy: userId,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        return {
          success: true,
        };
      } else {
        // unblock
        if (!existingFriendship) {
          return {
            success: false,
            error: 'ブロック関係が見つかりません',
          };
        }

        const data = existingFriendship.data();

        // ブロック状態であることを確認
        if (data.status !== 'blocked') {
          return {
            success: false,
            error: 'このユーザーはブロックされていません',
          };
        }

        // 自分がブロックしたことを確認
        if (data.blockedBy !== userId) {
          return {
            success: false,
            error: 'このブロックを解除する権限がありません',
          };
        }

        // ブロック解除（友達関係を削除）
        await existingFriendship.ref.delete();

        return {
          success: true,
        };
      }
    } catch (error) {
      console.error('Failed to block/unblock user:', error);
      throw new HttpsError('internal', 'ブロック操作に失敗しました');
    }
  }
);
