/**
 * AuthNavigator - 認証画面用スタックナビゲーター
 * FeatureExplanation（仕様説明）→ Register/Login の流れ
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';
import { LoginScreen, RegisterScreen, FeatureExplanationScreen } from '../screens/auth';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="FeatureExplanation"
    >
      <Stack.Screen name="FeatureExplanation" component={FeatureExplanationScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};
