/**
 * ユーザー作成時トリガー
 * Firebase Authでユーザーが作成された時にFirestoreにユーザードキュメントを作成
 */
import * as functions from 'firebase-functions';
import { db } from '../utils/firebase';
import type { User } from '../types/user';

// ランダムなvisibleUserIdを生成
function generateVisibleUserId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 一意のvisibleUserIdを取得
async function getUniqueVisibleUserId(): Promise<string> {
  let visibleUserId: string;
  let exists = true;

  while (exists) {
    visibleUserId = generateVisibleUserId();
    const snapshot = await db
      .collection('users')
      .where('visibleUserId', '==', visibleUserId)
      .limit(1)
      .get();
    exists = !snapshot.empty;
  }

  return visibleUserId!;
}

/**
 * ユーザー作成時のトリガー
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  console.log(`Creating user document for: ${user.uid}`);

  try {
    // 一意のvisibleUserIdを生成
    const visibleUserId = await getUniqueVisibleUserId();

    // 現在の日時
    const now = new Date();

    // 月次メッセージカウントリセット日（登録日の翌月同日）
    const resetDate = new Date(now);
    resetDate.setMonth(resetDate.getMonth() + 1);

    // ユーザードキュメントを作成
    const userData: User = {
      id: user.uid,
      realEmail: user.email || '',
      dummyEmail: '', // 後でCloud Functionsの別処理で設定
      visibleUserId,
      nickname: `User_${visibleUserId}`,
      profileImageUrl: null,
      subscriptionStatus: 'free',
      subscriptionPlan: null,
      subscriptionExpiry: null,
      monthlyMessageCount: 0,
      messageCountResetDate: resetDate,
      fcmToken: null,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };

    await db.collection('users').doc(user.uid).set(userData);

    console.log(`User document created successfully: ${user.uid}`);
    return { success: true, userId: user.uid };
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
});
