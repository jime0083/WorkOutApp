/**
 * 設定画面
 * 言語切り替えなどの設定を行う
 */
import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';
import '../../i18n';

interface SettingsScreenProps {
  onBack?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

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
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>{'<'} {t('common.back')}</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>{t('settings.title')}</Text>
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
    fontSize: typography.fontSize.md,
    color: colors.primary,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
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
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
  },
  languageTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  checkmark: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginLeft: spacing.md,
  },
});

export default SettingsScreen;
