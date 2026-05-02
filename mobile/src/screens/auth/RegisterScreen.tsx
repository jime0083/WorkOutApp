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
import { Button, Input, Card } from '../../components';
import { registerUser } from '../../services/auth';
import { colors, spacing, typography } from '../../theme';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
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
      newErrors.realEmail = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(realEmail)) {
      newErrors.realEmail = 'メールアドレスの形式が正しくありません';
    }

    // 本命パスワード
    if (!realPassword) {
      newErrors.realPassword = 'パスワードを入力してください';
    } else if (realPassword.length < 8) {
      newErrors.realPassword = 'パスワードは8文字以上で入力してください';
    }

    // パスワード確認
    if (realPassword !== realPasswordConfirm) {
      newErrors.realPasswordConfirm = 'パスワードが一致しません';
    }

    // ダミーメール
    if (!dummyEmail.trim()) {
      newErrors.dummyEmail = 'ダミーメールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dummyEmail)) {
      newErrors.dummyEmail = 'メールアドレスの形式が正しくありません';
    } else if (dummyEmail === realEmail) {
      newErrors.dummyEmail = '本命メールと異なるアドレスを入力してください';
    }

    // ダミーパスワード
    if (!dummyPassword) {
      newErrors.dummyPassword = 'ダミーパスワードを入力してください';
    } else if (dummyPassword.length < 8) {
      newErrors.dummyPassword = 'パスワードは8文字以上で入力してください';
    } else if (dummyPassword === realPassword) {
      newErrors.dummyPassword = '本命パスワードと異なるパスワードを入力してください';
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
        Alert.alert(
          '登録完了',
          'アカウントが作成されました。ログインしてください。',
          [{ text: 'OK', onPress: onRegisterSuccess }]
        );
      } else {
        Alert.alert('登録失敗', result.error || '登録に失敗しました');
      }
    } catch (error) {
      Alert.alert('エラー', '登録中にエラーが発生しました');
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
          <Text style={styles.title}>新規登録</Text>
          <Text style={styles.subtitle}>2つのアカウントを設定します</Text>
        </View>

        {/* 本命アカウント */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>本命アカウント</Text>
          <Text style={styles.sectionDescription}>
            メッセージ機能を利用するためのアカウントです
          </Text>

          <Input
            label="メールアドレス"
            value={realEmail}
            onChangeText={setRealEmail}
            placeholder="example@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.realEmail}
          />

          <Input
            label="パスワード"
            value={realPassword}
            onChangeText={setRealPassword}
            placeholder="8文字以上"
            secureTextEntry
            error={errors.realPassword}
          />

          <Input
            label="パスワード（確認）"
            value={realPasswordConfirm}
            onChangeText={setRealPasswordConfirm}
            placeholder="もう一度入力"
            secureTextEntry
            error={errors.realPasswordConfirm}
          />
        </Card>

        {/* ダミーアカウント */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>ダミーアカウント</Text>
          <Text style={styles.sectionDescription}>
            ヘルスケアアプリとして表示するためのアカウントです
          </Text>

          <Input
            label="ダミーメールアドレス"
            value={dummyEmail}
            onChangeText={setDummyEmail}
            placeholder="dummy@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.dummyEmail}
          />

          <Input
            label="ダミーパスワード"
            value={dummyPassword}
            onChangeText={setDummyPassword}
            placeholder="8文字以上（本命と異なるもの）"
            secureTextEntry
            error={errors.dummyPassword}
          />
        </Card>

        {/* プロフィール */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>プロフィール（任意）</Text>

          <Input
            label="ニックネーム"
            value={nickname}
            onChangeText={setNickname}
            placeholder="表示名を入力"
            maxLength={20}
          />
        </Card>

        <Button
          title="登録する"
          onPress={handleRegister}
          loading={isLoading}
          fullWidth
          style={styles.registerButton}
        />

        <TouchableOpacity
          onPress={onNavigateToLogin}
          style={styles.loginLink}
        >
          <Text style={styles.loginLinkText}>
            既にアカウントをお持ちの方は
            <Text style={styles.loginLinkTextBold}>ログイン</Text>
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
