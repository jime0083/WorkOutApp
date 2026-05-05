/**
 * checkSubscriptionExpiry - 定期課金状態チェック（毎日実行）
 *
 * 有効期限切れのサブスクリプションをチェックし、
 * ユーザーのステータスを free に更新する
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

export const checkSubscriptionExpiry = onSchedule(
  {
    // 毎日午前3時（JST）に実行
    schedule: '0 3 * * *',
    timeZone: 'Asia/Tokyo',
    region: 'asia-northeast1',
  },
  async () => {
    const now = new Date();

    try {
      // 有効期限切れのサブスクリプションを検索
      const expiredSubscriptionsSnapshot = await db
        .collection('subscriptions')
        .where('isActive', '==', true)
        .where('expiryDate', '<=', now)
        .get();

      if (expiredSubscriptionsSnapshot.empty) {
        console.log('No expired subscriptions found');
        return;
      }

      console.log(`Found ${expiredSubscriptionsSnapshot.size} expired subscriptions`);

      // バッチ更新
      const batch = db.batch();
      const userUpdates: string[] = [];

      for (const doc of expiredSubscriptionsSnapshot.docs) {
        const subscriptionData = doc.data();
        const userId = subscriptionData.userId;

        // サブスクリプションを非アクティブに
        batch.update(doc.ref, {
          isActive: false,
          updatedAt: FieldValue.serverTimestamp(),
        });

        userUpdates.push(userId);
      }

      await batch.commit();

      // ユーザーのステータスを更新（バッチの500件制限を考慮して分割）
      const chunkSize = 450;
      for (let i = 0; i < userUpdates.length; i += chunkSize) {
        const chunk = userUpdates.slice(i, i + chunkSize);
        const userBatch = db.batch();

        for (const userId of chunk) {
          const userRef = db.collection('users').doc(userId);
          userBatch.update(userRef, {
            subscriptionStatus: 'free',
            subscriptionPlan: null,
            subscriptionExpiry: null,
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        await userBatch.commit();
      }

      console.log(`Updated ${userUpdates.length} users to free status`);
    } catch (error) {
      console.error('Failed to check subscription expiry:', error);
      throw error;
    }
  }
);
