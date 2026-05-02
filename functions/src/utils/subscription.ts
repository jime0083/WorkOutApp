/**
 * サブスクリプション関連ヘルパー
 */

import { db } from './firebase';
import type { User } from '../types/user';

// 無料プランのメッセージ上限
export const FREE_PLAN_MESSAGE_LIMIT = 10;

// プレミアムユーザーかチェック
export async function isPremiumUser(userId: string): Promise<boolean> {
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return false;
  }

  const userData = userDoc.data() as User;
  return userData.subscriptionStatus === 'premium';
}

// メッセージ送信可能かチェック（無料ユーザーの場合は上限チェック）
export async function canSendMessage(
  userId: string
): Promise<{ allowed: boolean; remaining?: number; isPremium: boolean }> {
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return { allowed: false, isPremium: false };
  }

  const userData = userDoc.data() as User;

  // プレミアムユーザーは無制限
  if (userData.subscriptionStatus === 'premium') {
    return { allowed: true, isPremium: true };
  }

  // 無料ユーザーは上限チェック
  const remaining = FREE_PLAN_MESSAGE_LIMIT - userData.monthlyMessageCount;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    isPremium: false,
  };
}

// メッセージカウントをインクリメント
export async function incrementMessageCount(userId: string): Promise<number> {
  const userRef = db.collection('users').doc(userId);

  const result = await db.runTransaction(async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data() as User;
    const newCount = userData.monthlyMessageCount + 1;

    transaction.update(userRef, {
      monthlyMessageCount: newCount,
      updatedAt: new Date(),
    });

    return newCount;
  });

  return result;
}

// 画像/動画送信可能かチェック（プレミアムのみ）
export async function canSendMedia(userId: string): Promise<boolean> {
  return isPremiumUser(userId);
}

// メッセージ削除可能かチェック（プレミアムのみ）
export async function canDeleteMessage(userId: string): Promise<boolean> {
  return isPremiumUser(userId);
}

// パニックボタン使用可能かチェック（プレミアムのみ）
export async function canUsePanicButton(userId: string): Promise<boolean> {
  return isPremiumUser(userId);
}
