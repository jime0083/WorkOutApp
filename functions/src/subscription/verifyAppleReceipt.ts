/**
 * verifyAppleReceipt - Apple In-App Purchase レシート検証
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { requireAuth, requireString } from '../utils/validators';
import { getMessage } from '../i18n/messages';
import type { PlanType } from '../types/subscription';

const db = getFirestore();

// Apple レシート検証エンドポイント
const APPLE_PRODUCTION_URL = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_SANDBOX_URL = 'https://sandbox.itunes.apple.com/verifyReceipt';

// App Store Connect で設定した商品ID
const PRODUCT_IDS: Record<string, PlanType> = {
  'com.okiroya.workoutapp.subscription.monthly': 'monthly',
  'com.okiroya.workoutapp.subscription.yearly': 'yearly',
};

interface VerifyReceiptData {
  receiptData: string;
  lang?: string;
}

interface VerifyReceiptResult {
  success: boolean;
  subscriptionStatus?: 'premium' | 'free';
  planType?: PlanType;
  expiryDate?: string;
  error?: string;
}

interface AppleReceiptResponse {
  status: number;
  latest_receipt_info?: AppleReceiptInfo[];
  pending_renewal_info?: ApplePendingRenewalInfo[];
  receipt?: {
    in_app: AppleReceiptInfo[];
  };
}

interface AppleReceiptInfo {
  product_id: string;
  original_transaction_id: string;
  expires_date_ms: string;
  purchase_date_ms: string;
  is_trial_period: string;
  is_in_intro_offer_period: string;
}

interface ApplePendingRenewalInfo {
  auto_renew_product_id: string;
  auto_renew_status: string;
}

/**
 * Apple サーバーにレシートを送信して検証
 */
async function verifyWithApple(
  receiptData: string,
  useSandbox: boolean
): Promise<AppleReceiptResponse> {
  const url = useSandbox ? APPLE_SANDBOX_URL : APPLE_PRODUCTION_URL;

  // App Store Connect の Shared Secret（環境変数から取得）
  const sharedSecret = process.env.APPLE_SHARED_SECRET;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      'receipt-data': receiptData,
      'password': sharedSecret,
      'exclude-old-transactions': true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Apple verification failed: ${response.status}`);
  }

  return response.json() as Promise<AppleReceiptResponse>;
}

/**
 * 最新のサブスクリプション情報を取得
 */
function getLatestSubscription(receipts: AppleReceiptInfo[]): AppleReceiptInfo | null {
  if (!receipts || receipts.length === 0) {
    return null;
  }

  // 有効期限が最も遅いものを取得
  return receipts
    .filter(receipt => PRODUCT_IDS[receipt.product_id])
    .sort((a, b) => parseInt(b.expires_date_ms) - parseInt(a.expires_date_ms))[0] || null;
}

export const verifyAppleReceipt = onCall<VerifyReceiptData>(
  { region: 'asia-northeast1' },
  async (request): Promise<VerifyReceiptResult> => {
    // 認証チェック
    const userId = requireAuth(request.auth);

    // 言語設定を取得
    const lang = request.data.lang;

    // 入力検証
    requireString(request.data.receiptData, 'receiptData');
    const receiptData = request.data.receiptData;

    try {
      // まず本番環境で検証
      let appleResponse = await verifyWithApple(receiptData, false);

      // ステータス 21007 はサンドボックスレシート
      if (appleResponse.status === 21007) {
        appleResponse = await verifyWithApple(receiptData, true);
      }

      // ステータスコードチェック
      if (appleResponse.status !== 0) {
        console.error('Apple receipt verification failed:', appleResponse.status);
        return {
          success: false,
          error: getMessage(lang, 'subscription', 'receiptVerificationFailed'),
        };
      }

      // 最新のサブスクリプション情報を取得
      const latestReceipts = appleResponse.latest_receipt_info ||
                            appleResponse.receipt?.in_app || [];
      const latestSubscription = getLatestSubscription(latestReceipts);

      if (!latestSubscription) {
        // サブスクリプションなし
        await db.collection('users').doc(userId).update({
          subscriptionStatus: 'free',
          subscriptionPlan: null,
          subscriptionExpiry: null,
          updatedAt: FieldValue.serverTimestamp(),
        });

        return {
          success: true,
          subscriptionStatus: 'free',
        };
      }

      // 有効期限チェック
      const expiryDate = new Date(parseInt(latestSubscription.expires_date_ms));
      const now = new Date();
      const isActive = expiryDate > now;
      const planType = PRODUCT_IDS[latestSubscription.product_id];

      // サブスクリプションデータを保存/更新
      const subscriptionRef = db.collection('subscriptions').doc(userId);
      const subscriptionDoc = await subscriptionRef.get();

      const subscriptionData = {
        userId,
        planType,
        startDate: new Date(parseInt(latestSubscription.purchase_date_ms)),
        expiryDate,
        isActive,
        originalTransactionId: latestSubscription.original_transaction_id,
        latestReceiptData: receiptData,
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (subscriptionDoc.exists) {
        await subscriptionRef.update(subscriptionData);
      } else {
        await subscriptionRef.set({
          ...subscriptionData,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      // ユーザーのサブスクリプション状態を更新
      await db.collection('users').doc(userId).update({
        subscriptionStatus: isActive ? 'premium' : 'free',
        subscriptionPlan: isActive ? planType : null,
        subscriptionExpiry: isActive ? expiryDate : null,
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        subscriptionStatus: isActive ? 'premium' : 'free',
        planType: isActive ? planType : undefined,
        expiryDate: isActive ? expiryDate.toISOString() : undefined,
      };
    } catch (error) {
      console.error('Failed to verify Apple receipt:', error);
      throw new HttpsError('internal', getMessage(lang, 'subscription', 'verificationError'));
    }
  }
);
