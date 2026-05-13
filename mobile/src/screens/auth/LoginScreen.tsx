/**
 * ログイン画面
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
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

export interface LoginScreenProps {
  onNavigateToRegister?: () => void;
  onLoginSuccess?: (isDummyMode: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, isLoading, error, clearError } = useAuthStore();

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError(t('validation.emailRequired'));
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t('validation.emailInvalid'));
      isValid = false;
    }

    if (!password) {
      setPasswordError(t('validation.passwordRequired'));
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    clearError();

    if (!validateForm()) {
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess(result.isDummyLogin);
      }
    } else {
      Alert.alert(t('auth.registerFailed'), result.error || t('common.error'));
    }
  };

  const handleNavigateToRegister = () => {
    if (onNavigateToRegister) {
      onNavigateToRegister();
    } else {
      navigation.navigate('Register');
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
          { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ヘッダー: アプリアイコンとタイトル */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>❤️</Text>
          </View>
          <Text style={styles.title}>{t('dummy.title')}</Text>
          <Text style={styles.subtitle}>{t('dummy.appSubtitle')}</Text>
        </View>

        {/* ログインフォーム */}
        <View style={styles.formCard}>
          <View style={styles.noteContainer}>
            <Text style={styles.loginNote}>{t('auth.loginNotePassword1')}</Text>
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
              error={emailError}
            />
          </View>

          <View style={styles.inputContainer}>
            <Input
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              placeholder={t('placeholder.password')}
              secureTextEntry
              error={passwordError}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? t('common.loading') : t('auth.login')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 登録リンク */}
        <TouchableOpacity
          onPress={handleNavigateToRegister}
          style={styles.registerLink}
        >
          <Text style={styles.registerLinkText}>
            {t('auth.noAccount')}
            <Text style={styles.registerLinkTextBold}> {t('auth.register')}</Text>
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
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: typography.sizes['4xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    ...shadows.md,
  },
  noteContainer: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  loginNote: {
    fontSize: typography.sizes.sm,
    color: colors.primaryDark,
    textAlign: 'center',
    fontWeight: typography.weights.medium as '500',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: spacing['2xl'],
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  registerLinkTextBold: {
    color: colors.primary,
    fontWeight: typography.weights.semibold as '600',
  },
});

export default LoginScreen;
