/**
 * RootNavigator - アプリのルートナビゲーター
 * オンボーディング → 認証 → メイン の流れを管理
 */
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/authStore';
import { useOnboardingStore } from '../stores/onboardingStore';
import type { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingScreen } from '../screens/onboarding';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { user, isLoading: authLoading } = useAuthStore();
  const {
    isOnboardingComplete,
    isLoading: onboardingLoading,
    initialize,
  } = useOnboardingStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // ローディング中は何も表示しない
  if (authLoading || onboardingLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isOnboardingComplete ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : user ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};
