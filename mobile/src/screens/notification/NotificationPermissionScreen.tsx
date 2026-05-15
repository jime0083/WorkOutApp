/**
 * 通知権限リクエスト画面
 * アプリアイコンバッジ表示に必要な通知権限をリクエスト
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { requestNotificationPermission } from '../../services/notification';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const NotificationPermissionScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  const handleAllow = async () => {
    setIsLoading(true);
    try {
      await requestNotificationPermission();
      navigation.goBack();
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeny = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* アイコン */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>

        {/* タイトル */}
        <Text style={styles.title}>{t('notification.permissionTitle')}</Text>

        {/* 説明 */}
        <Text style={styles.description}>
          {t('notification.permissionMessage')}
        </Text>

        {/* 機能説明 */}
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureText}>
              アプリアイコンに未読件数を表示
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔄</Text>
            <Text style={styles.featureText}>
              新着アップデートをリアルタイムで通知
            </Text>
          </View>
        </View>

        {/* ボタン */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.allowButton}
            onPress={handleAllow}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.allowButtonText}>
                {t('notification.permissionAllow')}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.denyButton}
            onPress={handleDeny}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.denyButtonText}>
              {t('notification.permissionDeny')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    ...shadows.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as 'bold',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  featureList: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    ...shadows.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
  allowButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  allowButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.white,
  },
  denyButton: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  denyButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium as '500',
    color: colors.text.secondary,
  },
});

export default NotificationPermissionScreen;
