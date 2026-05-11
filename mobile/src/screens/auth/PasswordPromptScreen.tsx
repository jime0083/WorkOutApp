/**
 * PasswordPromptScreen - パスワード入力画面
 * 設定画面/メッセージ画面へのアクセス時に認証を行う
 * Design: Wellness Serenity
 */
import React, { useState, useCallback } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Input } from '../../components';
import { verifyUserCredentials } from '../../services/auth';
import { deleteAllMessages } from '../../services/messages';
import { useAccessStore } from '../../stores/accessStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';
import { isPremiumUser } from '../../types/user';
import '../../i18n';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;
type PasswordPromptRouteProp = RouteProp<MainStackParamList, 'PasswordPrompt'>;

export const PasswordPromptScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PasswordPromptRouteProp>();
  const { purpose } = route.params;
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { setSettingsAuth, setMessagesAuth, determineAction } = useAccessStore();
  const { userDocument } = useAuthStore();

  const validateForm = useCallback((): boolean => {
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
  }, [email, password, t]);

  const handleVerify = useCallback(async () => {
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await verifyUserCredentials(email, password);

      if (result.success && result.authType) {
        if (purpose === 'settings') {
          setSettingsAuth(result.authType);
          navigation.replace('Settings');
        } else if (purpose === 'messages') {
          setMessagesAuth(result.authType);

          // プレミアム状態を確認
          const isPremium = isPremiumUser(userDocument);
          const action = determineAction(isPremium);

          switch (action) {
            case 'showRealMessages':
              navigation.replace('Messages');
              break;
            case 'showDummyMessages':
              navigation.replace('DummyMessages');
              break;
            case 'deleteAllMessages':
              // 削除確認ダイアログを表示
              Alert.alert(
                t('settings.panicButton'),
                t('settings.panicButtonDesc'),
                [
                  {
                    text: t('common.cancel'),
                    style: 'cancel',
                    onPress: () => navigation.goBack(),
                  },
                  {
                    text: t('common.confirm'),
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const deleteResult = await deleteAllMessages();
                        if (deleteResult.success) {
                          Alert.alert(t('common.success'));
                        } else {
                          Alert.alert(t('common.error'), deleteResult.error);
                        }
                      } catch (deleteError) {
                        Alert.alert(t('common.error'));
                      }
                      navigation.replace('DummyTabs');
                    },
                  },
                ]
              );
              break;
            case 'showPremiumRequired':
              Alert.alert(
                t('premium.required'),
                t('subscription.panicButton'),
                [
                  { text: t('common.close'), onPress: () => navigation.goBack() },
                  {
                    text: t('premium.upgrade'),
                    onPress: () => navigation.navigate('Subscription'),
                  },
                ]
              );
              break;
          }
        }
      } else {
        setError(result.error || t('common.error'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }, [
    email,
    password,
    purpose,
    validateForm,
    setSettingsAuth,
    setMessagesAuth,
    determineAction,
    userDocument,
    navigation,
    t,
  ]);

  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const getTitle = () => {
    return purpose === 'settings'
      ? t('common.settings')
      : t('nav.talk');
  };

  const getIcon = () => {
    return purpose === 'settings' ? '⚙️' : '💬';
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
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <View style={styles.closeButtonCircle}>
            <Text style={styles.closeButtonText}>×</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{getIcon()}</Text>
          </View>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>
            {t('auth.loginSubtitle')}
          </Text>
        </View>

        <View style={styles.formCard}>
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
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={handleVerify}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? t('common.loading') : t('auth.login')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
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
    paddingHorizontal: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: 0,
    padding: spacing.sm,
  },
  closeButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 22,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium as '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  icon: {
    fontSize: 40,
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
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    ...shadows.md,
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
  verifyButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.sm,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
  cancelButton: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  cancelButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium as '500',
    color: colors.text.secondary,
  },
});

export default PasswordPromptScreen;
