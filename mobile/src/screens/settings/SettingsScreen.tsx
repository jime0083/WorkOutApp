/**
 * 設定画面（認証後）
 * 言語切り替え、メッセージ画面へのアクセス
 */
import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>{'<'} {t('common.back')}</Text>
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
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemIcon}>💬</Text>
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
            >
              <Text
                style={[
                  styles.languageText,
                  currentLanguage === 'ja' && styles.languageTextActive,
                ]}
              >
                {t('settings.japanese')}
              </Text>
              {currentLanguage === 'ja' && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[
                styles.languageItem,
                currentLanguage === 'en' && styles.languageItemActive,
              ]}
              onPress={() => changeLanguage('en')}
            >
              <Text
                style={[
                  styles.languageText,
                  currentLanguage === 'en' && styles.languageTextActive,
                ]}
              >
                {t('settings.english')}
              </Text>
              {currentLanguage === 'en' && (
                <Text style={styles.checkmark}>✓</Text>
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
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemIcon}>⭐</Text>
                <Text style={styles.menuItemTitle}>{t('subscription.title')}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
            >
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemIcon}>🗑️</Text>
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
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: 56,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: spacing.md,
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  menuItemSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  arrow: {
    fontSize: typography.sizes.xl,
    color: colors.gray[400],
    marginLeft: spacing.sm,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    minHeight: 56,
  },
  languageItemActive: {
    backgroundColor: colors.primaryLight,
  },
  languageText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  languageTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.semibold as '600',
  },
  checkmark: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
    fontWeight: typography.weights.bold as '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginLeft: spacing.md,
  },
  dangerItem: {
    // スタイルは必要に応じて追加
  },
  dangerText: {
    color: colors.error,
  },
});

export default SettingsScreen;
