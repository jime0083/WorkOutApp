/**
 * サブスクリプションサービス（React Native / StoreKit 2）
 * react-native-iap v15 を使用した In-App Purchase 処理
 */
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  getAvailablePurchases,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getReceiptIOS,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getFunctionsInstance, getFirestoreInstance } from './firebase';
import type { PlanType } from '../types/subscription';

// 商品ID（App Store Connectと一致させること）
export const PRODUCT_IDS = {
  monthly: 'com.okiroya.workoutapp.subscription.monthly',
  yearly: 'com.okiroya.workoutapp.subscription.yearly',
};

// 全商品ID配列
const ALL_PRODUCT_IDS = [PRODUCT_IDS.monthly, PRODUCT_IDS.yearly];

// 購入結果型
export interface PurchaseResult {
  success: boolean;
  subscriptionStatus?: 'premium' | 'free';
  planType?: PlanType;
  expiryDate?: string;
  error?: string;
}

// 商品情報型
export interface ProductInfo {
  productId: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  planType: PlanType;
}

// 購入更新コールバック型
type PurchaseUpdateCallback = (purchase: Purchase) => void;
type PurchaseErrorCallback = (error: PurchaseError) => void;

// リスナーの購読解除関数
let purchaseUpdateSubscription: { remove: () => void } | null = null;
let purchaseErrorSubscription: { remove: () => void } | null = null;

/**
 * IAP接続を初期化
 */
export async function initializeIAP(): Promise<boolean> {
  try {
    console.log('[IAP] Initializing connection...');
    const result = await initConnection();
    console.log('[IAP] Connection initialized:', result);
    return true;
  } catch (error: any) {
    console.error('[IAP] Failed to initialize connection:', error);
    console.error('[IAP] Init error details:', JSON.stringify(error, null, 2));
    return false;
  }
}

/**
 * IAP接続を終了
 */
export async function terminateIAP(): Promise<void> {
  try {
    // リスナーを解除
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
    await endConnection();
  } catch (error) {
    console.error('Failed to terminate IAP connection:', error);
  }
}

/**
 * 購入更新リスナーを設定
 */
export function setupPurchaseListeners(
  onPurchaseUpdate: PurchaseUpdateCallback,
  onPurchaseError: PurchaseErrorCallback
): void {
  // 既存のリスナーがあれば解除
  if (purchaseUpdateSubscription) {
    purchaseUpdateSubscription.remove();
  }
  if (purchaseErrorSubscription) {
    purchaseErrorSubscription.remove();
  }

  // 新しいリスナーを設定
  purchaseUpdateSubscription = purchaseUpdatedListener(onPurchaseUpdate);
  purchaseErrorSubscription = purchaseErrorListener(onPurchaseError);
}

/**
 * 商品情報を取得
 */
export async function getSubscriptionProducts(): Promise<ProductInfo[]> {
  try {
    console.log('[IAP Service] Fetching products with SKUs:', ALL_PRODUCT_IDS);
    const products = await fetchProducts({ skus: ALL_PRODUCT_IDS, type: 'subs' });
    console.log('[IAP Service] Raw products from store:', JSON.stringify(products, null, 2));

    if (!products || products.length === 0) {
      console.warn('[IAP Service] No products returned from store');
      return [];
    }

    const mappedProducts = products.map((product) => ({
      productId: product.id,
      title: product.title,
      description: product.description,
      price: product.displayPrice,
      currency: product.currency,
      planType: (product.id === PRODUCT_IDS.monthly ? 'monthly' : 'yearly') as 'monthly' | 'yearly',
    }));
    console.log('[IAP Service] Mapped products:', JSON.stringify(mappedProducts, null, 2));
    return mappedProducts;
  } catch (error) {
    console.error('[IAP Service] Failed to fetch products:', error);
    throw error;
  }
}

/**
 * 商品を購入
 */
export async function purchaseSubscription(productId: string): Promise<void> {
  try {
    console.log('[IAP Service] Initiating purchase for:', productId);
    console.log('[IAP Service] Purchase request params:', JSON.stringify({
      request: {
        apple: { sku: productId },
      },
      type: 'subs',
    }, null, 2));

    await requestPurchase({
      request: {
        apple: { sku: productId },
      },
      type: 'subs',
    });
    console.log('[IAP Service] Purchase request completed (waiting for listener)');
    // 購入結果は purchaseUpdatedListener で受け取る
  } catch (error) {
    console.error('[IAP Service] Failed to initiate purchase:', error);
    console.error('[IAP Service] Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * レシートを検証（Cloud Functionsに送信）
 */
export async function verifyReceipt(
  receiptData: string,
  lang?: string
): Promise<PurchaseResult> {
  try {
    console.log('[IAP] verifyReceipt called, receipt length:', receiptData?.length);
    const functions = getFunctionsInstance();
    console.log('[IAP] Firebase Functions instance obtained');

    const verifyAppleReceipt = httpsCallable<
      { receiptData: string; lang?: string },
      PurchaseResult
    >(functions, 'verifyAppleReceipt');

    console.log('[IAP] Calling verifyAppleReceipt Firebase Function...');
    const result = await verifyAppleReceipt({
      receiptData,
      lang,
    });
    console.log('[IAP] Firebase Function returned:', JSON.stringify(result.data, null, 2));

    return result.data;
  } catch (error: any) {
    console.error('[IAP] Failed to verify receipt:', error);
    console.error('[IAP] Verify error details:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: `Receipt verification failed: ${error?.message || error?.code || String(error)}`,
    };
  }
}

/**
 * 購入トランザクションを完了
 */
export async function completePurchase(purchase: Purchase): Promise<void> {
  try {
    await finishTransaction({
      purchase,
      isConsumable: false,
    });
  } catch (error) {
    console.error('Failed to finish transaction:', error);
    throw error;
  }
}

/**
 * 購入を処理（購入更新時に呼び出す）
 */
export async function processPurchase(
  purchase: Purchase,
  lang?: string
): Promise<PurchaseResult> {
  try {
    console.log('[IAP] processPurchase called with purchase:', JSON.stringify(purchase, null, 2));

    // App Store レシートを取得（リトライ付き）
    // Note: StoreKit 2 でも verifyReceipt API は App Store レシートを必要とする
    let receiptData: string | null = null;
    const maxRetries = 3;
    const retryDelay = 1000; // 1秒

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[IAP] Getting iOS receipt (attempt ${attempt}/${maxRetries})...`);
        receiptData = await getReceiptIOS();
        if (receiptData) {
          console.log('[IAP] Receipt data obtained, length:', receiptData.length);
          break;
        }
      } catch (receiptError: any) {
        console.warn(`[IAP] getReceiptIOS() attempt ${attempt} failed:`, receiptError?.message || receiptError);
        if (attempt < maxRetries) {
          console.log(`[IAP] Waiting ${retryDelay}ms before retry...`);
          await new Promise<void>(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    if (!receiptData) {
      console.error('[IAP] Failed to get receipt data after all retries');
      return {
        success: false,
        error: 'Failed to get receipt data. Please try again.',
      };
    }

    // レシートを検証
    console.log('[IAP] Calling verifyReceipt with Firebase Function...');
    const result = await verifyReceipt(receiptData, lang);
    console.log('[IAP] verifyReceipt result:', JSON.stringify(result, null, 2));

    // 検証成功時はトランザクションを完了
    if (result.success) {
      console.log('[IAP] Completing purchase transaction...');
      await completePurchase(purchase);
      console.log('[IAP] Purchase transaction completed');
    }

    return result;
  } catch (error: any) {
    console.error('[IAP] Failed to process purchase:', error);
    console.error('[IAP] Error details:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: `Purchase processing failed: ${error?.message || String(error)}`,
    };
  }
}

/**
 * 既存の購入を復元
 */
export async function restorePurchases(lang?: string): Promise<PurchaseResult> {
  try {
    const purchases = await getAvailablePurchases();
    console.log('[IAP] Available purchases:', purchases.length);

    if (purchases.length === 0) {
      return {
        success: true,
        subscriptionStatus: 'free',
      };
    }

    // 未完了のトランザクションを完了する
    for (const purchase of purchases) {
      console.log('[IAP] Finishing pending transaction:', purchase.productId);
      try {
        await finishTransaction({
          purchase,
          isConsumable: false,
        });
      } catch (finishError) {
        console.warn('[IAP] Failed to finish transaction:', finishError);
      }
    }

    // App Store レシートを取得（リトライ付き）
    let receiptData: string | null = null;
    const maxRetries = 3;
    const retryDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[IAP] Getting iOS receipt for restore (attempt ${attempt}/${maxRetries})...`);
        receiptData = await getReceiptIOS();
        if (receiptData) {
          console.log('[IAP] Receipt data obtained for restore');
          break;
        }
      } catch (receiptError: any) {
        console.warn(`[IAP] getReceiptIOS() attempt ${attempt} failed:`, receiptError?.message);
        if (attempt < maxRetries) {
          await new Promise<void>(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    if (!receiptData) {
      console.log('[IAP] No receipt data available for restore');
      return {
        success: true,
        subscriptionStatus: 'free',
      };
    }

    // レシートを検証
    return await verifyReceipt(receiptData, lang);
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    return {
      success: false,
      error: 'Restore failed',
    };
  }
}

/**
 * 未完了の購入を確認して処理する
 * アプリ起動時に呼び出すことで、duplicate-purchaseエラーを防ぐ
 */
export async function checkAndProcessPendingPurchases(
  lang?: string
): Promise<PurchaseResult | null> {
  try {
    console.log('[IAP] Checking for pending purchases...');
    const purchases = await getAvailablePurchases();
    console.log('[IAP] Found pending purchases:', purchases.length);

    if (purchases.length === 0) {
      return null; // 未完了の購入なし
    }

    // 未完了のトランザクションを処理
    for (const purchase of purchases) {
      console.log('[IAP] Processing pending purchase:', purchase.productId);
      try {
        await finishTransaction({
          purchase,
          isConsumable: false,
        });
        console.log('[IAP] Finished pending transaction:', purchase.productId);
      } catch (finishError) {
        console.warn('[IAP] Failed to finish pending transaction:', finishError);
      }
    }

    // App Store レシートを取得（リトライ付き）
    let receiptData: string | null = null;
    const maxRetries = 3;
    const retryDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[IAP] Getting iOS receipt for pending (attempt ${attempt}/${maxRetries})...`);
        receiptData = await getReceiptIOS();
        if (receiptData) {
          console.log('[IAP] Receipt data obtained for pending purchases');
          break;
        }
      } catch (receiptError: any) {
        console.warn(`[IAP] getReceiptIOS() attempt ${attempt} failed:`, receiptError?.message);
        if (attempt < maxRetries) {
          await new Promise<void>(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    // レシートを検証してサブスクリプション状態を更新
    if (receiptData) {
      return await verifyReceipt(receiptData, lang);
    }

    return {
      success: true,
      subscriptionStatus: 'free',
    };
  } catch (error) {
    console.error('[IAP] Failed to check pending purchases:', error);
    return null;
  }
}

/**
 * ユーザーのサブスクリプション状態を取得
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<{
  isPremium: boolean;
  planType: PlanType | null;
  expiryDate: Date | null;
}> {
  try {
    const db = getFirestoreInstance();
    const userDoc = await getDoc(doc(db, 'users', userId));

    if (!userDoc.exists()) {
      return {
        isPremium: false,
        planType: null,
        expiryDate: null,
      };
    }

    const userData = userDoc.data();
    return {
      isPremium: userData?.subscriptionStatus === 'premium',
      planType: userData?.subscriptionPlan || null,
      expiryDate: userData?.subscriptionExpiry?.toDate() || null,
    };
  } catch (error) {
    console.error('Failed to get subscription status:', error);
    return {
      isPremium: false,
      planType: null,
      expiryDate: null,
    };
  }
}

/**
 * サブスクリプション状態をリアルタイムで監視
 */
export function subscribeToSubscriptionStatus(
  userId: string,
  callback: (status: {
    isPremium: boolean;
    planType: PlanType | null;
    expiryDate: Date | null;
  }) => void
): () => void {
  const db = getFirestoreInstance();
  return onSnapshot(doc(db, 'users', userId), (snapshot) => {
    if (!snapshot.exists()) {
      callback({
        isPremium: false,
        planType: null,
        expiryDate: null,
      });
      return;
    }

    const userData = snapshot.data();
    callback({
      isPremium: userData?.subscriptionStatus === 'premium',
      planType: userData?.subscriptionPlan || null,
      expiryDate: userData?.subscriptionExpiry?.toDate() || null,
    });
  });
}
