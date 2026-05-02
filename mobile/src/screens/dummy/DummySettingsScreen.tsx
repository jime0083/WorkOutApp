/**
 * DummySettingsScreen - ダミー設定画面
 * 偽装用の設定画面
 */
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { dailyGoals } from '../../data/dummyData';

interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  title,
  subtitle,
  onPress,
  rightElement,
  showArrow = true,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={styles.settingTextContainer}>
      <Text style={styles.settingTitle}>{title}</Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (showArrow && onPress && (
      <Text style={styles.arrow}>›</Text>
    ))}
  </TouchableOpacity>
);

interface DummySettingsScreenProps {
  navigation?: unknown;
}

export const DummySettingsScreen: React.FC<DummySettingsScreenProps> = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthKitEnabled, setHealthKitEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const showComingSoon = () => {
    Alert.alert('お知らせ', 'この機能は近日公開予定です');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <Text style={styles.title}>設定</Text>

        {/* プロフィールセクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>プロフィール</Text>
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>U</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>ユーザー</Text>
                <Text style={styles.profileEmail}>user@example.com</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={showComingSoon}
            >
              <Text style={styles.editButtonText}>編集</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 目標設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>目標設定</Text>
          <View style={styles.card}>
            <SettingItem
              title="1日の歩数目標"
              subtitle={`${dailyGoals.steps.toLocaleString()} 歩`}
              onPress={showComingSoon}
            />
            <View style={styles.divider} />
            <SettingItem
              title="消費カロリー目標"
              subtitle={`${dailyGoals.calories} kcal`}
              onPress={showComingSoon}
            />
            <View style={styles.divider} />
            <SettingItem
              title="エクササイズ目標"
              subtitle={`${dailyGoals.exerciseMinutes} 分/日`}
              onPress={showComingSoon}
            />
          </View>
        </View>

        {/* 通知設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>通知</Text>
          <View style={styles.card}>
            <SettingItem
              title="プッシュ通知"
              subtitle="目標達成やリマインダー"
              showArrow={false}
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              title="リマインダー"
              subtitle="毎日の運動リマインダー"
              onPress={showComingSoon}
            />
          </View>
        </View>

        {/* データ連携 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>データ連携</Text>
          <View style={styles.card}>
            <SettingItem
              title="ヘルスケア連携"
              subtitle="Apple ヘルスケアとデータを同期"
              showArrow={false}
              rightElement={
                <Switch
                  value={healthKitEnabled}
                  onValueChange={setHealthKitEnabled}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              title="位置情報"
              subtitle="ワークアウトの経路を記録"
              showArrow={false}
              rightElement={
                <Switch
                  value={locationEnabled}
                  onValueChange={setLocationEnabled}
                  trackColor={{ false: colors.gray[300], true: colors.primary }}
                />
              }
            />
          </View>
        </View>

        {/* アプリ情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>アプリ情報</Text>
          <View style={styles.card}>
            <SettingItem
              title="バージョン"
              subtitle="1.0.0"
              showArrow={false}
            />
            <View style={styles.divider} />
            <SettingItem
              title="利用規約"
              onPress={showComingSoon}
            />
            <View style={styles.divider} />
            <SettingItem
              title="プライバシーポリシー"
              onPress={showComingSoon}
            />
            <View style={styles.divider} />
            <SettingItem
              title="ライセンス"
              onPress={showComingSoon}
            />
          </View>
        </View>

        {/* スペーサー */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as '700',
    color: colors.white,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
  },
  profileEmail: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  editButton: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    padding: spacing.md,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
    color: colors.primary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    minHeight: 56,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  settingSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: typography.sizes.xl,
    color: colors.gray[400],
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginLeft: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
