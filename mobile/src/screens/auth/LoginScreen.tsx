/**
 * ログイン画面
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input } from '../../components';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';
import type { AuthStackParamList, RootStackParamList } from '../../navigation/types';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList & RootStackParamList>;

// 後方互換性のためのPropsインターフェース（オプショナル）
export interface LoginScreenProps {
  onNavigateToRegister?: () => void;
  onLoginSuccess?: (isDummyMode: boolean) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onLoginSuccess,
}) => {
  const { t } = useTranslation();
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
      } else {
        // デフォルトのナビゲーション動作
        // 認証成功後はRootNavigatorが自動的にDummyTabsに遷移する
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('dummy.title')}</Text>
          <Text style={styles.subtitle}>{t('dummy.appSubtitle')}</Text>
        </View>

        <View style={styles.form}>
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

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            placeholder={t('placeholder.password')}
            secureTextEntry
            error={passwordError}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title={t('auth.login')}
            onPress={handleLogin}
            loading={isLoading}
            fullWidth
            style={styles.loginButton}
          />

          <TouchableOpacity
            onPress={handleNavigateToRegister}
            style={styles.registerLink}
          >
            <Text style={styles.registerLinkText}>
              {t('auth.noAccount')}
              <Text style={styles.registerLinkTextBold}>{t('auth.register')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  loginButton: {
    marginTop: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  registerLink: {
    marginTop: spacing.lg,
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
