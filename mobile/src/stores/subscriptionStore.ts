/**
 * subscriptionStore - サブスクリプション選択状態管理
 * AsyncStorageでプラン選択完了状態を永続化
 * Firestoreからのサブスクリプション状態もチェック
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSubscriptionStatus } from '../services/subscription';
import { getAuth } from 'firebase/auth';

const SUBSCRIPTION_SELECTED_KEY = '@subscription_selected';

interface SubscriptionState {
  // 状態
  hasSelectedPlan: boolean;
  isLoading: boolean;
  isPremium: boolean;

  // アクション
  initialize: () => Promise<void>;
  completePlanSelection: () => Promise<void>;
  resetPlanSelection: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  // 初期状態
  hasSelectedPlan: false,
  isLoading: true,
  isPremium: false,

  // AsyncStorageとFirestoreから状態を読み込む
  initialize: async () => {
    try {
      // まずAsyncStorageをチェック
      const value = await AsyncStorage.getItem(SUBSCRIPTION_SELECTED_KEY);
      const hasSelectedFromStorage = value === 'true';

      // Firestoreからサブスクリプション状態をチェック
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const status = await getSubscriptionStatus(user.uid);
        console.log('[SubscriptionStore] User subscription status:', status);

        if (status.isPremium) {
          // アクティブなサブスクリプションがある場合、プラン選択済みとする
          console.log('[SubscriptionStore] User has active subscription, skipping subscription screen');
          await AsyncStorage.setItem(SUBSCRIPTION_SELECTED_KEY, 'true');
          set({
            hasSelectedPlan: true,
            isPremium: true,
            isLoading: false,
          });
          return;
        }
      }

      set({
        hasSelectedPlan: hasSelectedFromStorage,
        isPremium: false,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load subscription state:', error);
      set({ isLoading: false });
    }
  },

  // プラン選択完了
  completePlanSelection: async () => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_SELECTED_KEY, 'true');
      set({ hasSelectedPlan: true });
    } catch (error) {
      console.error('Failed to save subscription state:', error);
    }
  },

  // プラン選択リセット（デバッグ用）
  resetPlanSelection: async () => {
    try {
      await AsyncStorage.removeItem(SUBSCRIPTION_SELECTED_KEY);
      set({ hasSelectedPlan: false });
    } catch (error) {
      console.error('Failed to reset subscription state:', error);
    }
  },
}));
