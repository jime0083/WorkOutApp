/**
 * SubscriptionScreen - 課金プラン選択画面
 * ログイン後に表示され、プレミアムプランまたは無料プランを選択
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';
import {
  initializeIAP,
  getSubscriptionProducts,
  purchaseSubscription,
} from '../../services/subscription';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface SubscriptionPlan {
  id: string;
  title: string;
  price: string;
  period: string;
  description: string;
  isRecommended?: boolean;
}

export const SubscriptionScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      await initializeIAP();
      const products = await getSubscriptionProducts();

      if (products && products.length > 0) {
        const loadedPlans = products.map((product) => ({
          id: product.productId || '',
          title: product.productId?.includes('yearly')
            ? t('subscription.yearlyPlan')
            : t('subscription.monthlyPlan'),
          price: product.price || '',
          period: product.productId?.includes('yearly')
            ? t('subscription.perYear')
            : t('subscription.perMonth'),
          description: product.productId?.includes('yearly')
            ? t('subscription.yearlyDescription')
            : t('subscription.monthlyDescription'),
          isRecommended: product.productId?.includes('yearly'),
        }));
        setPlans(loadedPlans);
      } else {
        // フォールバック: プロダクトが取得できない場合のデフォルト表示
        setPlans([
          {
            id: 'monthly',
            title: t('subscription.monthlyPlan'),
            price: '¥500',
            period: t('subscription.perMonth'),
            description: t('subscription.monthlyDescription'),
          },
          {
            id: 'yearly',
            title: t('subscription.yearlyPlan'),
            price: '¥5,000',
            period: t('subscription.perYear'),
            description: t('subscription.yearlyDescription'),
            isRecommended: true,
          },
        ]);
      }
    } catch (error) {
      // エラー時もデフォルト表示
      setPlans([
        {
          id: 'monthly',
          title: t('subscription.monthlyPlan'),
          price: '¥500',
          period: t('subscription.perMonth'),
          description: t('subscription.monthlyDescription'),
        },
        {
          id: 'yearly',
          title: t('subscription.yearlyPlan'),
          price: '¥5,000',
          period: t('subscription.perYear'),
          description: t('subscription.yearlyDescription'),
          isRecommended: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (planId: string) => {
    setIsPurchasing(true);
    try {
      const productId = planId.includes('yearly')
        ? 'com.workoutapp.subscription.yearly'
        : 'com.workoutapp.subscription.monthly';

      // 購入リクエストを開始（結果はpurchaseUpdatedListenerで受け取る）
      await purchaseSubscription(productId);

      // 購入プロセス開始を通知（実際の成功/失敗はリスナーで処理）
      Alert.alert(
        t('subscription.purchaseStartedTitle') || t('common.processing'),
        t('subscription.purchaseStartedMessage') || t('subscription.purchaseSuccessMessage'),
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        t('subscription.purchaseErrorTitle'),
        t('subscription.purchaseErrorMessage')
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleSkip = () => {
    // 無料プランで続行
    navigation.replace('DummyTabs');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('subscription.title')}</Text>
          <Text style={styles.subtitle}>{t('subscription.subtitle')}</Text>
        </View>

        {/* 機能リスト */}
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>{t('subscription.premiumFeatures')}</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{t('subscription.feature1')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{t('subscription.feature2')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{t('subscription.feature3')}</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <Text style={styles.featureText}>{t('subscription.feature4')}</Text>
          </View>
        </View>

        {/* プランカード */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                plan.isRecommended && styles.recommendedCard,
              ]}
              onPress={() => handlePurchase(plan.id)}
              disabled={isPurchasing}
            >
              {plan.isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>
                    {t('subscription.recommended')}
                  </Text>
                </View>
              )}
              <Text style={styles.planTitle}>{plan.title}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.planPrice}>{plan.price}</Text>
                <Text style={styles.planPeriod}>{plan.period}</Text>
              </View>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 無料で続行ボタン */}
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={isPurchasing}
        >
          <Text style={styles.skipButtonText}>
            {t('subscription.continueWithFree')}
          </Text>
        </TouchableOpacity>

        {/* 注意事項 */}
        <Text style={styles.disclaimer}>{t('subscription.disclaimer')}</Text>
      </ScrollView>

      {isPurchasing && (
        <View style={styles.purchasingOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.purchasingText}>{t('subscription.processing')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    color: colors.gray[600],
    textAlign: 'center',
  },
  featuresContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  featuresTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
    marginRight: spacing.sm,
  },
  featureText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  plansContainer: {
    marginBottom: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  recommendedCard: {
    borderColor: colors.primary,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recommendedText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold as 'bold',
  },
  planTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  planPrice: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold as 'bold',
    color: colors.primary,
  },
  planPeriod: {
    fontSize: typography.sizes.sm,
    color: colors.gray[500],
    marginLeft: spacing.xs,
  },
  planDescription: {
    fontSize: typography.sizes.sm,
    color: colors.gray[600],
  },
  skipButton: {
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    color: colors.gray[500],
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: typography.sizes.xs,
    color: colors.gray[400],
    textAlign: 'center',
    lineHeight: 16,
  },
  purchasingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  purchasingText: {
    color: colors.white,
    fontSize: typography.sizes.md,
    marginTop: spacing.md,
  },
});
