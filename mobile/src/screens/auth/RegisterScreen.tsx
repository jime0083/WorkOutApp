/**
 * 新規登録画面
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
import { Button, Input, Card } from '../../components';
import { registerUser } from '../../services/auth';
import { colors, spacing, typography } from '../../theme';
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

  // 本命アカウント情報
  const [realEmail, setRealEmail] = useState('');
  const [realPassword, setRealPassword] = useState('');
  const [realPasswordConfirm, setRealPasswordConfirm] = useState('');

  // ダミーアカウント情報
  const [dummyEmail, setDummyEmail] = useState('');
  const [dummyPassword, setDummyPassword] = useState('');

  // ニックネーム
  const [nickname, setNickname] = useState('');

  // エラー状態
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 本命メール
    if (!realEmail.trim()) {
      newErrors.realEmail = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(realEmail)) {
      newErrors.realEmail = t('validation.emailInvalid');
    }

    // 本命パスワード
    if (!realPassword) {
      newErrors.realPassword = t('validation.passwordRequired');
    } else if (realPassword.length < 8) {
      newErrors.realPassword = t('validation.passwordMinLength');
    }

    // パスワード確認
    if (realPassword !== realPasswordConfirm) {
      newErrors.realPasswordConfirm = t('validation.passwordMismatch');
    }

    // ダミーメール
    if (!dummyEmail.trim()) {
      newErrors.dummyEmail = t('validation.dummyEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dummyEmail)) {
      newErrors.dummyEmail = t('validation.emailInvalid');
    } else if (dummyEmail === realEmail) {
      newErrors.dummyEmail = t('validation.dummyEmailSameAsReal');
    }

    // ダミーパスワード
    if (!dummyPassword) {
      newErrors.dummyPassword = t('validation.dummyPasswordRequired');
    } else if (dummyPassword.length < 8) {
      newErrors.dummyPassword = t('validation.passwordMinLength');
    } else if (dummyPassword === realPassword) {
      newErrors.dummyPassword = t('validation.dummyPasswordSameAsReal');
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
        realEmail,
        realPassword,
        dummyEmail,
        dummyPassword,
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.registerTitle')}</Text>
          <Text style={styles.subtitle}>{t('auth.registerSubtitle')}</Text>
        </View>

        {/* 本命アカウント */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('auth.realAccount')}</Text>
          <Text style={styles.sectionDescription}>
            {t('auth.realAccountDesc')}
          </Text>

          <Input
            label={t('auth.email')}
            value={realEmail}
            onChangeText={setRealEmail}
            placeholder={t('placeholder.email')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.realEmail}
          />

          <Input
            label={t('auth.password')}
            value={realPassword}
            onChangeText={setRealPassword}
            placeholder={t('placeholder.passwordMinLength')}
            secureTextEntry
            error={errors.realPassword}
          />

          <Input
            label={t('auth.passwordConfirm')}
            value={realPasswordConfirm}
            onChangeText={setRealPasswordConfirm}
            placeholder={t('placeholder.passwordConfirm')}
            secureTextEntry
            error={errors.realPasswordConfirm}
          />
        </Card>

        {/* ダミーアカウント */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('auth.dummyAccount')}</Text>
          <Text style={styles.sectionDescription}>
            {t('auth.dummyAccountDesc')}
          </Text>

          <Input
            label={t('auth.dummyEmail')}
            value={dummyEmail}
            onChangeText={setDummyEmail}
            placeholder={t('placeholder.dummyEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.dummyEmail}
          />

          <Input
            label={t('auth.dummyPassword')}
            value={dummyPassword}
            onChangeText={setDummyPassword}
            placeholder={t('placeholder.dummyPassword')}
            secureTextEntry
            error={errors.dummyPassword}
          />
        </Card>

        {/* プロフィール */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t('auth.profile')}</Text>

          <Input
            label={t('auth.nickname')}
            value={nickname}
            onChangeText={setNickname}
            placeholder={t('auth.enterNickname')}
            maxLength={20}
          />
        </Card>

        <Button
          title={t('auth.registerButton')}
          onPress={handleRegister}
          loading={isLoading}
          fullWidth
          style={styles.registerButton}
        />

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
            <Text style={styles.loginLinkTextBold}>{t('auth.login')}</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  registerButton: {
    marginTop: spacing.lg,
  },
  loginLink: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  loginLinkTextBold: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default RegisterScreen;
