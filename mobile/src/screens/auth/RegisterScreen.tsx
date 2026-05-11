/**
 * 新規登録画面
 * Design: Wellness Serenity
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Input } from '../../components';
import { registerUser } from '../../services/auth';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { AuthStackParamList } from '../../navigation/types';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// 後方互換性のためのPropsインターフェース（オプショナル）
export interface RegisterScreenProps {
  onNavigateToLogin?: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // アカウント1（メインアカウント）情報
  const [account1Email, setAccount1Email] = useState('');
  const [account1Password, setAccount1Password] = useState('');
  const [account1PasswordConfirm, setAccount1PasswordConfirm] = useState('');

  // アカウント2（サブアカウント）情報
  const [account2Email, setAccount2Email] = useState('');
  const [account2Password, setAccount2Password] = useState('');
  const [account2PasswordConfirm, setAccount2PasswordConfirm] = useState('');

  // ニックネーム
  const [nickname, setNickname] = useState('');

  // エラー状態
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // アカウント1メール
    if (!account1Email.trim()) {
      newErrors.account1Email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account1Email)) {
      newErrors.account1Email = t('validation.emailInvalid');
    }

    // アカウント1パスワード
    if (!account1Password) {
      newErrors.account1Password = t('validation.passwordRequired');
    } else if (account1Password.length < 8) {
      newErrors.account1Password = t('validation.passwordMinLength');
    }

    // アカウント1パスワード確認
    if (account1Password !== account1PasswordConfirm) {
      newErrors.account1PasswordConfirm = t('validation.passwordMismatch');
    }

    // アカウント2メール
    if (!account2Email.trim()) {
      newErrors.account2Email = t('validation.account2EmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account2Email)) {
      newErrors.account2Email = t('validation.emailInvalid');
    } else if (account2Email === account1Email) {
      newErrors.account2Email = t('validation.account2EmailSameAsAccount1');
    }

    // アカウント2パスワード
    if (!account2Password) {
      newErrors.account2Password = t('validation.account2PasswordRequired');
    } else if (account2Password.length < 8) {
      newErrors.account2Password = t('validation.passwordMinLength');
    } else if (account2Password === account1Password) {
      newErrors.account2Password = t('validation.account2PasswordSameAsAccount1');
    }

    // アカウント2パスワード確認
    if (account2Password !== account2PasswordConfirm) {
      newErrors.account2PasswordConfirm = t('validation.account2PasswordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        realEmail: account1Email,
        realPassword: account1Password,
        dummyEmail: account2Email,
        dummyPassword: account2Password,
        nickname: nickname || undefined,
      });

      if (result.success) {
        const handleSuccess = () => {
          if (onRegisterSuccess) {
            onRegisterSuccess();
          } else {
            navigation.navigate('Login');
          }
        };
        Alert.alert(
          t('common.success'),
          t('auth.accountCreated'),
          [{ text: 'OK', onPress: handleSuccess }]
        );
      } else {
        Alert.alert(t('auth.registerFailed'), result.error || t('common.error'));
      }
    } catch {
      Alert.alert(t('common.error'), t('auth.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🔐</Text>
          </View>
          <Text style={styles.title}>{t('auth.registerTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
        </View>

        {/* アカウント1（メインアカウント） */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: colors.primaryMuted }]}>
              <Text style={[styles.sectionBadgeText, { color: colors.primaryDark }]}>1</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{t('auth.account1')}</Text>
              <Text style={styles.sectionDescription}>
                {t('auth.account1Desc')}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.email')}
              value={account1Email}
              onChangeText={setAccount1Email}
              placeholder={t('placeholder.email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.account1Email}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.password')}
              value={account1Password}
              onChangeText={setAccount1Password}
              placeholder={t('placeholder.passwordMinLength')}
              secureTextEntry
              error={errors.account1Password}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.passwordConfirm')}
              value={account1PasswordConfirm}
              onChangeText={setAccount1PasswordConfirm}
              placeholder={t('placeholder.passwordConfirm')}
              secureTextEntry
              error={errors.account1PasswordConfirm}
            />
          </View>
        </View>

        {/* アカウント2（サブアカウント） */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.sectionBadgeText, { color: '#B45309' }]}>2</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{t('auth.account2')}</Text>
              <Text style={styles.sectionDescription}>
                {t('auth.account2Desc')}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.account2Email')}
              value={account2Email}
              onChangeText={setAccount2Email}
              placeholder={t('placeholder.account2Email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.account2Email}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.account2Password')}
              value={account2Password}
              onChangeText={setAccount2Password}
              placeholder={t('placeholder.account2Password')}
              secureTextEntry
              error={errors.account2Password}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.account2PasswordConfirm')}
              value={account2PasswordConfirm}
              onChangeText={setAccount2PasswordConfirm}
              placeholder={t('placeholder.passwordConfirm')}
              secureTextEntry
              error={errors.account2PasswordConfirm}
            />
          </View>
        </View>

        {/* プロフィール */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.sectionBadgeText, { color: '#1D4ED8' }]}>👤</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{t('auth.profile')}</Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.nickname')}
              value={nickname}
              onChangeText={setNickname}
              placeholder={t('auth.enterNickname')}
              maxLength={20}
            />
          </View>
        </View>

        {/* 登録ボタン */}
        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.registerButtonText}>
            {isLoading ? t('common.loading') : t('auth.registerButton')}
          </Text>
        </TouchableOpacity>

        {/* ログインリンク */}
        <TouchableOpacity
          onPress={() => {
            if (onNavigateToLogin) {
              onNavigateToLogin();
            } else {
              navigation.navigate('Login');
            }
          }}
          style={styles.loginLink}
        >
          <Text style={styles.loginLinkText}>
            {t('auth.hasAccount')}
            <Text style={styles.loginLinkTextBold}> {t('auth.login')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  logoIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  sectionBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sectionBadgeText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold as '700',
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
  loginLink: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loginLinkText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  loginLinkTextBold: {
    color: colors.primary,
    fontWeight: typography.weights.semibold as '600',
  },
});

export default RegisterScreen;
