/**
 * PasswordPromptScreen - パスワード入力画面
 * 設定画面/メッセージ画面へのアクセス時に認証を行う
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
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Button, Input } from '../../components';
import { verifyUserCredentials } from '../../services/auth';
import { deleteAllMessages } from '../../services/messages';
import { useAccessStore } from '../../stores/accessStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, spacing, typography } from '../../theme';
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.subtitle}>
            {t('auth.loginSubtitle')}
          </Text>
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
            onPress={handleVerify}
            loading={isLoading}
            fullWidth
            style={styles.verifyButton}
          />

          <Button
            title={t('common.cancel')}
            onPress={handleCancel}
            variant="outline"
            fullWidth
            style={styles.cancelButton}
          />
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
    padding: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.xl,
    right: spacing.md,
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: 28,
    color: colors.text.secondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  form: {
    width: '100%',
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  verifyButton: {
    marginTop: spacing.lg,
  },
  cancelButton: {
    marginTop: spacing.md,
  },
});

export default PasswordPromptScreen;
