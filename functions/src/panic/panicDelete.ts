/**
 * panicDelete - 緊急全データ削除（パニックボタン）
 *
 * プレミアムユーザー限定機能
 * ユーザーの全データを即座に削除する
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth } from 'firebase-admin/auth';
import { requireAuth } from '../utils/validators';
import { isPremiumUser } from '../utils/subscription';

const db = getFirestore();
const storage = getStorage();
const auth = getAuth();

interface PanicDeleteData {
  confirmationCode: string;
  lang?: string;
}

interface PanicDeleteResult {
  success: boolean;
  error?: string;
  deletedData?: {
    messages: number;
    conversations: number;
    friendships: number;
    files: number;
  };
}

// 確認コード（セキュリティのため）
const CONFIRMATION_CODE = 'DELETE_ALL_DATA';

export const panicDelete = onCall<PanicDeleteData>(
  { region: 'asia-northeast1' },
  async (request): Promise<PanicDeleteResult> => {
    // 認証チェック
    const userId = requireAuth(request.auth);

    // 言語設定を取得
    const lang = request.data.lang;

    // 確認コードチェック
    if (request.data.confirmationCode !== CONFIRMATION_CODE) {
      throw new HttpsError(
        'invalid-argument',
        lang === 'en'
          ? 'Invalid confirmation code'
          : '確認コードが正しくありません'
      );
    }

    // プレミアムユーザーチェック
    const isPremium = await isPremiumUser(userId);
    if (!isPremium) {
      return {
        success: false,
        error:
          lang === 'en'
            ? 'This feature requires a premium subscription'
            : 'この機能はプレミアム会員限定です',
      };
    }

    try {
      let deletedMessages = 0;
      let deletedConversations = 0;
      let deletedFriendships = 0;
      let deletedFiles = 0;

      // 1. ユーザーが参加している会話を取得して削除
      const conversationsSnapshot = await db
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .get();

      for (const conversationDoc of conversationsSnapshot.docs) {
        // 会話内のメッセージを削除
        const messagesSnapshot = await conversationDoc.ref
          .collection('messages')
          .get();

        const messageBatch = db.batch();
        for (const messageDoc of messagesSnapshot.docs) {
          messageBatch.delete(messageDoc.ref);
          deletedMessages++;
        }
        await messageBatch.commit();

        // 会話を削除
        await conversationDoc.ref.delete();
        deletedConversations++;
      }

      // 2. 友達関係を削除
      const friendshipsSnapshot = await db
        .collection('friendships')
        .where('memberIds', 'array-contains', userId)
        .get();

      const friendshipBatch = db.batch();
      for (const doc of friendshipsSnapshot.docs) {
        friendshipBatch.delete(doc.ref);
        deletedFriendships++;
      }
      await friendshipBatch.commit();

      // 3. サブスクリプションデータを削除
      const subscriptionRef = db.collection('subscriptions').doc(userId);
      const subscriptionDoc = await subscriptionRef.get();
      if (subscriptionDoc.exists) {
        await subscriptionRef.delete();
      }

      // 4. Storage内のユーザーファイルを削除
      try {
        const bucket = storage.bucket();
        const [files] = await bucket.getFiles({
          prefix: `users/${userId}/`,
        });

        for (const file of files) {
          await file.delete();
          deletedFiles++;
        }
      } catch (storageError) {
        console.error('Failed to delete storage files:', storageError);
        // ストレージエラーは無視して続行
      }

      // 5. ユーザードキュメントを削除
      await db.collection('users').doc(userId).delete();

      // 6. Firebase Authenticationのユーザーを削除
      try {
        await auth.deleteUser(userId);
      } catch (authError) {
        console.error('Failed to delete auth user:', authError);
        // 認証ユーザーの削除に失敗しても、データは削除済み
      }

      console.log(`Panic delete completed for user: ${userId}`);

      return {
        success: true,
        deletedData: {
          messages: deletedMessages,
          conversations: deletedConversations,
          friendships: deletedFriendships,
          files: deletedFiles,
        },
      };
    } catch (error) {
      console.error('Failed to execute panic delete:', error);
      throw new HttpsError(
        'internal',
        lang === 'en'
          ? 'Failed to delete data'
          : 'データの削除に失敗しました'
      );
    }
  }
);

/**
 * 通常のアカウント削除（プレミアム不要）
 */
export const deleteAccount = onCall<{ lang?: string }>(
  { region: 'asia-northeast1' },
  async (request): Promise<{ success: boolean; error?: string }> => {
    // 認証チェック
    const userId = requireAuth(request.auth);
    const lang = request.data.lang;

    try {
      // 1. ユーザーが参加している会話のメッセージを「削除済み」に更新
      // （相手にはメッセージが残る）
      const conversationsSnapshot = await db
        .collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .get();

      for (const conversationDoc of conversationsSnapshot.docs) {
        const messagesSnapshot = await conversationDoc.ref
          .collection('messages')
          .where('senderId', '==', userId)
          .get();

        const batch = db.batch();
        for (const messageDoc of messagesSnapshot.docs) {
          batch.update(messageDoc.ref, {
            isDeleted: true,
            content: '',
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
        await batch.commit();

        // 参加者リストから自分を削除
        const conversationData = conversationDoc.data();
        const newParticipants = conversationData.participantIds.filter(
          (id: string) => id !== userId
        );

        if (newParticipants.length === 0) {
          // 参加者がいなくなったら会話を削除
          await conversationDoc.ref.delete();
        } else {
          await conversationDoc.ref.update({
            participantIds: newParticipants,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }

      // 2. 友達関係を削除
      const friendshipsSnapshot = await db
        .collection('friendships')
        .where('memberIds', 'array-contains', userId)
        .get();

      const friendshipBatch = db.batch();
      for (const doc of friendshipsSnapshot.docs) {
        friendshipBatch.delete(doc.ref);
      }
      await friendshipBatch.commit();

      // 3. サブスクリプションデータを削除
      const subscriptionRef = db.collection('subscriptions').doc(userId);
      await subscriptionRef.delete();

      // 4. ユーザードキュメントを削除
      await db.collection('users').doc(userId).delete();

      // 5. Firebase Authenticationのユーザーを削除
      await auth.deleteUser(userId);

      console.log(`Account deleted for user: ${userId}`);

      return { success: true };
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw new HttpsError(
        'internal',
        lang === 'en'
          ? 'Failed to delete account'
          : 'アカウントの削除に失敗しました'
      );
    }
  }
);
