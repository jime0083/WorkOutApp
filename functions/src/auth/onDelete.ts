/**
 * ユーザー削除時トリガー
 * Firebase Authでユーザーが削除された時に関連データを削除
 */
import * as functions from 'firebase-functions';
import { db, storage } from '../utils/firebase';

/**
 * ユーザー削除時のトリガー
 */
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  console.log(`Deleting user data for: ${user.uid}`);

  const batch = db.batch();

  try {
    // 1. ユーザードキュメントを削除
    const userRef = db.collection('users').doc(user.uid);
    batch.delete(userRef);

    // 2. 友達関係を削除（requesterまたはreceiver）
    const friendshipsAsRequester = await db
      .collection('friendships')
      .where('requesterId', '==', user.uid)
      .get();

    const friendshipsAsReceiver = await db
      .collection('friendships')
      .where('receiverId', '==', user.uid)
      .get();

    friendshipsAsRequester.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    friendshipsAsReceiver.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 3. 会話を取得（参加者として）
    const conversations = await db
      .collection('conversations')
      .where('participantIds', 'array-contains', user.uid)
      .get();

    // 会話とそのメッセージを削除
    for (const conversationDoc of conversations.docs) {
      // メッセージサブコレクションを削除
      const messages = await conversationDoc.ref.collection('messages').get();
      messages.docs.forEach((messageDoc) => {
        batch.delete(messageDoc.ref);
      });

      // 会話ドキュメントを削除
      batch.delete(conversationDoc.ref);
    }

    // 4. サブスクリプション情報を削除
    const subscriptionRef = db.collection('subscriptions').doc(user.uid);
    batch.delete(subscriptionRef);

    // バッチコミット
    await batch.commit();

    // 5. Storageからプロフィール画像を削除
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles({
        prefix: `profiles/${user.uid}/`,
      });

      await Promise.all(files.map((file) => file.delete()));
    } catch (storageError) {
      // Storageファイルが存在しない場合はエラーを無視
      console.log('No profile images to delete or error:', storageError);
    }

    console.log(`User data deleted successfully: ${user.uid}`);
    return { success: true, userId: user.uid };
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
});
