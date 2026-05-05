/**
 * resetMonthlyMessageCount - 月次メッセージ数リセット（毎月1日実行）
 *
 * 無料ユーザーの月間メッセージカウントをリセットする
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

export const resetMonthlyMessageCount = onSchedule(
  {
    // 毎月1日 午前0時（JST）に実行
    schedule: '0 0 1 * *',
    timeZone: 'Asia/Tokyo',
    region: 'asia-northeast1',
  },
  async () => {
    const now = new Date();

    try {
      // 無料ユーザーを検索
      const freeUsersSnapshot = await db
        .collection('users')
        .where('subscriptionStatus', '==', 'free')
        .get();

      if (freeUsersSnapshot.empty) {
        console.log('No free users found');
        return;
      }

      console.log(`Found ${freeUsersSnapshot.size} free users to reset`);

      // バッチ更新（500件制限を考慮して分割）
      const chunkSize = 450;
      const docs = freeUsersSnapshot.docs;
      let updatedCount = 0;

      for (let i = 0; i < docs.length; i += chunkSize) {
        const chunk = docs.slice(i, i + chunkSize);
        const batch = db.batch();

        for (const doc of chunk) {
          batch.update(doc.ref, {
            monthlyMessageCount: 0,
            messageCountResetDate: now,
            updatedAt: FieldValue.serverTimestamp(),
          });
          updatedCount++;
        }

        await batch.commit();
      }

      console.log(`Reset message count for ${updatedCount} users`);
    } catch (error) {
      console.error('Failed to reset monthly message count:', error);
      throw error;
    }
  }
);
