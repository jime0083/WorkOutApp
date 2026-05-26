/**
 * MainNavigator - メインナビゲーター
 * ダミータブ + 認証が必要な画面のスタックナビゲーター
 */
import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';
import type { MainStackParamList, DummyTabParamList } from './types';
import {
  DummyHomeScreen,
  DummyStatsScreen,
  DummySettingsScreen,
} from '../screens/dummy';
import { PasswordPromptScreen } from '../screens/auth';
import { SettingsScreen } from '../screens/settings';
import {
  MessagesScreen,
  DummyMessagesScreen,
  ConversationScreen,
} from '../screens/messages';
import { SubscriptionScreen } from '../screens/subscription';
import { NotificationPermissionScreen } from '../screens/notification/NotificationPermissionScreen';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useAuthStore } from '../stores/authStore';
import { subscribeToUnreadCountWithBadge } from '../services/unreadCount';

const Stack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<DummyTabParamList>();

// タブアイコンコンポーネント
interface TabIconProps {
  focused: boolean;
  icon: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon }) => (
  <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
);

// ダミータブナビゲーター
const DummyTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DummyHomeScreen}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🏠" />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={DummyStatsScreen}
        options={{
          tabBarLabel: '統計',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="📊" />
          ),
        }}
      />
      <Tab.Screen
        name="DummySettings"
        component={DummySettingsScreen}
        options={{
          tabBarLabel: '設定',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="⚙️" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const MainNavigator: React.FC = () => {
  const {
    hasSelectedPlan,
    isLoading,
    initialize,
  } = useSubscriptionStore();
  const { user } = useAuthStore();

  // サブスクリプション選択状態を初期化
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 未読件数を監視してアプリアイコンバッジを更新
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUnreadCountWithBadge(user.uid);

    return () => unsubscribe();
  }, [user]);

  // ローディング中は何も表示しない
  if (isLoading) {
    return null;
  }

  // プラン選択済みかどうかで初期画面を決定
  const initialRouteName = hasSelectedPlan ? 'DummyTabs' : 'Subscription';

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="DummyTabs" component={DummyTabNavigator} />
      <Stack.Screen
        name="PasswordPrompt"
        component={PasswordPromptScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="DummyMessages" component={DummyMessagesScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen
        name="NotificationPermission"
        component={NotificationPermissionScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.gray[200],
    borderTopWidth: 1,
    height: 84,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium as '500',
  },
  icon: {
    fontSize: 24,
    opacity: 0.7,
  },
  iconFocused: {
    opacity: 1,
  },
});
