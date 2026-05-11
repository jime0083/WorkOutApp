/**
 * 設定画面（認証後）
 * 言語切り替え、メッセージ画面へのアクセス
 * Design: Wellness Serenity
 */
import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const changeLanguage = useCallback((lng: string) => {
    i18n.changeLanguage(lng);
  }, [i18n]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleOpenMessages = useCallback(() => {
    navigation.navigate('PasswordPrompt', { purpose: 'messages' });
  }, [navigation]);

  const currentLanguage = i18n.language;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <View style={styles.backButtonContainer}>
              <Text style={styles.backArrow}>‹</Text>
              <Text style={styles.backButtonText}>{t('common.back')}</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.title}>{t('settings.title')}</Text>
        </View>

        {/* メッセージへのアクセス */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('nav.talk')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleOpenMessages}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryMuted }]}>
                  <Text style={styles.menuItemIcon}>💬</Text>
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={styles.menuItemTitle}>{t('nav.talk')}</Text>
                  <Text style={styles.menuItemSubtitle}>
                    {t('auth.loginSubtitle')}
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 言語設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[
                styles.languageItem,
                currentLanguage === 'ja' && styles.languageItemActive,
              ]}
              onPress={() => changeLanguage('ja')}
              activeOpacity={0.7}
            >
              <View style={styles.languageContent}>
                <Text style={styles.languageFlag}>🇯🇵</Text>
                <Text
                  style={[
                    styles.languageText,
                    currentLanguage === 'ja' && styles.languageTextActive,
                  ]}
                >
                  {t('settings.japanese')}
                </Text>
              </View>
              {currentLanguage === 'ja' && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[
                styles.languageItem,
                currentLanguage === 'en' && styles.languageItemActive,
              ]}
              onPress={() => changeLanguage('en')}
              activeOpacity={0.7}
            >
              <View style={styles.languageContent}>
                <Text style={styles.languageFlag}>🇺🇸</Text>
                <Text
                  style={[
                    styles.languageText,
                    currentLanguage === 'en' && styles.languageTextActive,
                  ]}
                >
                  {t('settings.english')}
                </Text>
              </View>
              {currentLanguage === 'en' && (
                <View style={styles.checkmarkContainer}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* アカウント設定 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Subscription')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={styles.menuItemIcon}>⭐</Text>
                </View>
                <Text style={styles.menuItemTitle}>{t('subscription.title')}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.errorLight }]}>
                  <Text style={styles.menuItemIcon}>🗑️</Text>
                </View>
                <View style={styles.menuItemTextContainer}>
                  <Text style={[styles.menuItemTitle, styles.dangerText]}>
                    {t('settings.deleteAccount')}
                  </Text>
                </View>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* アプリ情報 */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Health Manager</Text>
          <Text style={styles.appVersionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
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
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: colors.primary,
    marginRight: spacing.xs,
    fontWeight: typography.weights.medium as '500',
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.medium as '500',
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: spacing.xl,
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
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    minHeight: 64,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuItemIcon: {
    fontSize: 20,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as '500',
    color: colors.text.primary,
  },
  menuItemSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: typography.sizes['2xl'],
    color: colors.gray[400],
    marginLeft: spacing.sm,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    minHeight: 60,
  },
  languageItemActive: {
    backgroundColor: colors.primaryMuted,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  languageText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  languageTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.semibold as '600',
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    fontSize: typography.sizes.md,
    color: colors.white,
    fontWeight: typography.weights.bold as '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginLeft: spacing.lg,
  },
  dangerItem: {
    // スタイルは必要に応じて追加
  },
  dangerText: {
    color: colors.error,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  appInfoText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.secondary,
  },
  appVersionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
});

export default SettingsScreen;
