/**
 * メッセージ送信上限チェック
 * 無料ユーザーは月10通まで
 */
import { onCall } from 'firebase-functions/v2/https';
import { db } from '../utils/firebase';
import { requireAuth } from '../utils/validators';
import { handleError } from '../utils/errors';
import { successResponse } from '../utils/response';
import {
  FREE_PLAN_MESSAGE_LIMIT,
  isPremiumUser,
} from '../utils/subscription';

interface MessageLimitResult {
  canSend: boolean;
  remaining: number;
  limit: number;
  isPremium: boolean;
  resetDate: Date | null;
}

/**
 * メッセージ送信可否をチェック
 */
export const checkMessageLimit = onCall(async (request): Promise<{ success: boolean; data: MessageLimitResult }> => {
  try {
    const userId = requireAuth(request.auth);

    // ユーザードキュメントを取得
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return successResponse({
        canSend: false,
        remaining: 0,
        limit: FREE_PLAN_MESSAGE_LIMIT,
        isPremium: false,
        resetDate: null,
      });
    }

    const userData = userDoc.data();
    if (!userData) {
      return successResponse({
        canSend: false,
        remaining: 0,
        limit: FREE_PLAN_MESSAGE_LIMIT,
        isPremium: false,
        resetDate: null,
      });
    }

    // プレミアムユーザーは無制限
    const premium = await isPremiumUser(userId);
    if (premium) {
      return successResponse({
        canSend: true,
        remaining: -1, // 無制限
        limit: -1,
        isPremium: true,
        resetDate: null,
      });
    }

    // 無料ユーザーのメッセージ数チェック
    const monthlyMessageCount = userData.monthlyMessageCount || 0;
    const remaining = Math.max(FREE_PLAN_MESSAGE_LIMIT - monthlyMessageCount, 0);
    const canSend = remaining > 0;

    // リセット日（登録日ベース）
    const messageCountResetDate = userData.messageCountResetDate?.toDate() || null;

    return successResponse({
      canSend,
      remaining,
      limit: FREE_PLAN_MESSAGE_LIMIT,
      isPremium: false,
      resetDate: messageCountResetDate,
    });
  } catch (error) {
    throw handleError(error);
  }
});

/**
 * メッセージ送信カウントを増加
 * メッセージ送信成功後に呼び出す
 */
export const incrementMessageCount = onCall(async (request): Promise<{ success: boolean; data: { newCount: number } }> => {
  try {
    const userId = requireAuth(request.auth);

    // プレミアムユーザーはカウント不要
    const premium = await isPremiumUser(userId);
    if (premium) {
      return successResponse({ newCount: -1 });
    }

    // カウントを増加
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const currentCount = userData?.monthlyMessageCount || 0;
    const newCount = currentCount + 1;

    await userRef.update({
      monthlyMessageCount: newCount,
      updatedAt: new Date(),
    });

    return successResponse({ newCount });
  } catch (error) {
    throw handleError(error);
  }
});
