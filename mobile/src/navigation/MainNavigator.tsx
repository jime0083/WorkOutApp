/**
 * MainNavigator - ダミー画面用タブナビゲーター
 * フィットネスアプリ風の偽装ナビゲーション
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';
import type { DummyTabParamList } from './types';
import {
  DummyHomeScreen,
  DummyStatsScreen,
  DummySettingsScreen,
} from '../screens/dummy';

const Tab = createBottomTabNavigator<DummyTabParamList>();

// タブアイコンコンポーネント
interface TabIconProps {
  focused: boolean;
  icon: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon }) => (
  <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
);

export const MainNavigator: React.FC = () => {
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
        name="Settings"
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
