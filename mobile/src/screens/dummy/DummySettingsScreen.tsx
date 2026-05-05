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
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';
import { dailyGoals } from '../../data/dummyData';
import '../../i18n';

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
  const { t, i18n } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [healthKitEnabled, setHealthKitEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const locale = i18n.language === 'ja' ? 'ja-JP' : 'en-US';
  const stepsUnit = i18n.language === 'ja' ? '歩' : 'steps';
  const perDayUnit = i18n.language === 'ja' ? '分/日' : 'min/day';

  const showComingSoon = () => {
    Alert.alert(t('dummy.notice'), t('dummy.comingSoon'));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <Text style={styles.title}>{t('dummy.settings')}</Text>

        {/* プロフィールセクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dummy.profile')}</Text>
          <View style={styles.card}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>U</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{t('dummy.user')}</Text>
                <Text style={styles.profileEmail}>user@example.com</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={showComingSoon}
            >
              <Text style={styles.editButtonText}>{t('dummy.edit')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 目標設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dummy.goalSettings')}</Text>
          <View style={styles.card}>
            <SettingItem
              title={t('dummy.dailyStepsGoal')}
              subtitle={`${dailyGoals.steps.toLocaleString(locale)} ${stepsUnit}`}
              onPress={showComingSoon}
            />
            <View style={styles.divider} />
            <SettingItem
              title={t('dummy.caloriesBurnGoal')}
              subtitle={`${dailyGoals.calories} kcal`}
              onPress={showComingSoon}
            />
            <View style={styles.divider} />
            <SettingItem
              title={t('dummy.exerciseGoal')}
              subtitle={`${dailyGoals.exerciseMinutes} ${perDayUnit}`}
              onPress={showComingSoon}
            />
          </View>
        </View>

        {/* 通知設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dummy.notifications')}</Text>
          <View style={styles.card}>
            <SettingItem
              title={t('dummy.pushNotifications')}
              subtitle={t('dummy.goalAndReminder')}
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
              title={t('dummy.reminder')}
              subtitle={t('dummy.dailyExerciseReminder')}
              onPress={showComingSoon}
            />
          </View>
        </View>

        {/* データ連携 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dummy.dataIntegration')}</Text>
          <View style={styles.card}>
            <SettingItem
              title={t('dummy.healthKitIntegration')}
              subtitle={t('dummy.healthKitDescription')}
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
              title={t('dummy.location')}
              subtitle={t('dummy.locationDescription')}
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
          <Text style={styles.sectionTitle}>{t('dummy.appInfo')}</Text>
          <View style={styles.card}>
            <SettingItem
              title={t('dummy.version')}
              subtitle="1.0.0"
              showArrow={false}
            />
            <View style={styles.divider} />
            <SettingItem
              title={t('dummy.termsOfService')}
              onPress={showComingSoon}
            />
            <View style={styles.divider} />
            <SettingItem
              title={t('dummy.privacyPolicy')}
              onPress={showComingSoon}
            />
            <View style={styles.divider} />
            <SettingItem
              title={t('dummy.license')}
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
