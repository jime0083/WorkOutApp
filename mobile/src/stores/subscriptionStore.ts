/**
 * subscriptionStore - サブスクリプション選択状態管理
 * AsyncStorageでプラン選択完了状態を永続化
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUBSCRIPTION_SELECTED_KEY = '@subscription_selected';

interface SubscriptionState {
  // 状態
  hasSelectedPlan: boolean;
  isLoading: boolean;

  // アクション
  initialize: () => Promise<void>;
  completePlanSelection: () => Promise<void>;
  resetPlanSelection: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  // 初期状態
  hasSelectedPlan: false,
  isLoading: true,

  // AsyncStorageから状態を読み込む
  initialize: async () => {
    try {
      const value = await AsyncStorage.getItem(SUBSCRIPTION_SELECTED_KEY);
      set({
        hasSelectedPlan: value === 'true',
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
