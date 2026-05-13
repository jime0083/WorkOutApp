/**
 * 新規登録画面
 * Design: Wellness Serenity
 * 仕様: email(1つ) + password1 + password2 + nickname
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

  // メールアドレス（単一）
  const [email, setEmail] = useState('');

  // パスワード1（本物のメッセージ用）
  const [password1, setPassword1] = useState('');
  const [password1Confirm, setPassword1Confirm] = useState('');

  // パスワード2（ダミーメッセージ用）
  const [password2, setPassword2] = useState('');
  const [password2Confirm, setPassword2Confirm] = useState('');

  // ニックネーム
  const [nickname, setNickname] = useState('');

  // エラー状態
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // メールアドレス
    if (!email.trim()) {
      newErrors.email = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('validation.emailInvalid');
    }

    // パスワード1
    if (!password1) {
      newErrors.password1 = t('validation.passwordRequired');
    } else if (password1.length < 8) {
      newErrors.password1 = t('validation.passwordMinLength');
    }

    // パスワード1確認
    if (password1 !== password1Confirm) {
      newErrors.password1Confirm = t('validation.passwordMismatch');
    }

    // パスワード2
    if (!password2) {
      newErrors.password2 = t('validation.password2Required');
    } else if (password2.length < 8) {
      newErrors.password2 = t('validation.passwordMinLength');
    } else if (password2 === password1) {
      newErrors.password2 = t('validation.password2SameAsPassword1');
    }

    // パスワード2確認
    if (password2 !== password2Confirm) {
      newErrors.password2Confirm = t('validation.password2Mismatch');
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
        email: email,
        password1: password1,
        password2: password2,
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
        // デバッグ用: エラー詳細を表示
        Alert.alert(
          t('auth.registerFailed'),
          `Error: ${result.error || t('common.error')}\n\nEmail: ${email}`,
        );
      }
    } catch (err) {
      // デバッグ用: 例外の詳細を表示
      const errorMsg = err instanceof Error ? err.message : String(err);
      Alert.alert(t('common.error'), `Exception: ${errorMsg}`);
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
          <Text style={styles.subtitle}>{t('auth.registerSubtitleNew')}</Text>
        </View>

        {/* メールアドレス */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: colors.primaryMuted }]}>
              <Text style={[styles.sectionBadgeText, { color: colors.primaryDark }]}>📧</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{t('auth.email')}</Text>
              <Text style={styles.sectionDescription}>
                {t('auth.emailDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              placeholder={t('placeholder.email')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />
          </View>
        </View>

        {/* パスワード1（メインパスワード） */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: colors.primaryMuted }]}>
              <Text style={[styles.sectionBadgeText, { color: colors.primaryDark }]}>1</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{t('auth.password1')}</Text>
              <Text style={styles.sectionDescription}>
                {t('auth.password1Desc')}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.password')}
              value={password1}
              onChangeText={setPassword1}
              placeholder={t('placeholder.passwordMinLength')}
              secureTextEntry
              error={errors.password1}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.passwordConfirm')}
              value={password1Confirm}
              onChangeText={setPassword1Confirm}
              placeholder={t('placeholder.passwordConfirm')}
              secureTextEntry
              error={errors.password1Confirm}
            />
          </View>
        </View>

        {/* パスワード2（ダミーパスワード） */}
        <View style={styles.formCard}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.sectionBadgeText, { color: '#B45309' }]}>2</Text>
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{t('auth.password2')}</Text>
              <Text style={styles.sectionDescription}>
                {t('auth.password2Desc')}
              </Text>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.password')}
              value={password2}
              onChangeText={setPassword2}
              placeholder={t('placeholder.password2')}
              secureTextEntry
              error={errors.password2}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.passwordConfirm')}
              value={password2Confirm}
              onChangeText={setPassword2Confirm}
              placeholder={t('placeholder.passwordConfirm')}
              secureTextEntry
              error={errors.password2Confirm}
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
