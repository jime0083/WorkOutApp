/**
 * onboardingStore - オンボーディング状態管理
 * AsyncStorageでオンボーディング完了状態を永続化
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

interface OnboardingState {
  // 状態
  isOnboardingComplete: boolean;
  isLoading: boolean;

  // アクション
  initialize: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  // 初期状態
  isOnboardingComplete: false,
  isLoading: true,

  // AsyncStorageから状態を読み込む
  initialize: async () => {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      set({
        isOnboardingComplete: value === 'true',
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
      set({ isLoading: false });
    }
  },

  // オンボーディング完了
  completeOnboarding: async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      set({ isOnboardingComplete: true });
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  },

  // オンボーディングリセット（デバッグ用）
  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      set({ isOnboardingComplete: false });
    } catch (error) {
      console.error('Failed to reset onboarding state:', error);
    }
  },
}));
