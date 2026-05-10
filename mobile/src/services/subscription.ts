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

// 商品ID
export const PRODUCT_IDS = {
  monthly: 'com.workoutapp.subscription.monthly',
  yearly: 'com.workoutapp.subscription.yearly',
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
    const result = await initConnection();
    console.log('IAP connection initialized:', result);
    return true;
  } catch (error) {
    console.error('Failed to initialize IAP connection:', error);
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
    const products = await fetchProducts({ skus: ALL_PRODUCT_IDS, type: 'subs' });

    if (!products || products.length === 0) {
      return [];
    }

    return products.map((product) => ({
      productId: product.id,
      title: product.title,
      description: product.description,
      price: product.displayPrice,
      currency: product.currency,
      planType: (product.id === PRODUCT_IDS.monthly ? 'monthly' : 'yearly') as 'monthly' | 'yearly',
    }));
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
}

/**
 * 商品を購入
 */
export async function purchaseSubscription(productId: string): Promise<void> {
  try {
    await requestPurchase({
      request: {
        apple: { sku: productId },
      },
      type: 'subs',
    });
    // 購入結果は purchaseUpdatedListener で受け取る
  } catch (error) {
    console.error('Failed to initiate purchase:', error);
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
    const functions = getFunctionsInstance();
    const verifyAppleReceipt = httpsCallable<
      { receiptData: string; lang?: string },
      PurchaseResult
    >(functions, 'verifyAppleReceipt');
    const result = await verifyAppleReceipt({
      receiptData,
      lang,
    });

    return result.data;
  } catch (error) {
    console.error('Failed to verify receipt:', error);
    return {
      success: false,
      error: 'Receipt verification failed',
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
    // iOSレシートデータを取得
    const receiptData = await getReceiptIOS();
    if (!receiptData) {
      return {
        success: false,
        error: 'No receipt data',
      };
    }

    // レシートを検証
    const result = await verifyReceipt(receiptData, lang);

    // 検証成功時はトランザクションを完了
    if (result.success) {
      await completePurchase(purchase);
    }

    return result;
  } catch (error) {
    console.error('Failed to process purchase:', error);
    return {
      success: false,
      error: 'Purchase processing failed',
    };
  }
}

/**
 * 既存の購入を復元
 */
export async function restorePurchases(lang?: string): Promise<PurchaseResult> {
  try {
    const purchases = await getAvailablePurchases();

    if (purchases.length === 0) {
      return {
        success: true,
        subscriptionStatus: 'free',
      };
    }

    // iOSレシートを取得して検証
    const receiptData = await getReceiptIOS();
    if (!receiptData) {
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
