/**
 * SubscriptionScreen - プラン選択画面
 * ログイン後に表示され、フリー/月額/年額プランを選択
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
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import type { MainStackParamList } from '../../navigation/types';
import {
  initializeIAP,
  getSubscriptionProducts,
  purchaseSubscription,
} from '../../services/subscription';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface PlanFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  id: string;
  type: 'free' | 'monthly' | 'yearly';
  title: string;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  isRecommended?: boolean;
}

export const SubscriptionScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState('¥500');
  const [yearlyPrice, setYearlyPrice] = useState('¥4,800');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      await initializeIAP();
      const products = await getSubscriptionProducts();

      if (products && products.length > 0) {
        products.forEach((product) => {
          if (product.productId?.includes('monthly') && product.price) {
            setMonthlyPrice(product.price);
          } else if (product.productId?.includes('yearly') && product.price) {
            setYearlyPrice(product.price);
          }
        });
      }
    } catch (error) {
      // フォールバック価格を使用
      console.log('Failed to load products, using fallback prices');
    } finally {
      setIsLoading(false);
    }
  };

  const plans: SubscriptionPlan[] = [
    {
      id: 'free',
      type: 'free',
      title: t('subscription.freePlanTitle'),
      price: t('subscription.freePlanPrice'),
      period: '',
      description: t('subscription.freePlanDescription'),
      features: [
        { text: t('subscription.freePlanFeature1'), included: true },
        { text: t('subscription.freePlanFeature2'), included: true },
        { text: t('subscription.feature2'), included: false },
        { text: t('subscription.feature4'), included: false },
      ],
    },
    {
      id: 'monthly',
      type: 'monthly',
      title: t('subscription.monthlyPlan'),
      price: monthlyPrice,
      period: t('subscription.perMonth'),
      description: t('subscription.monthlyDescription'),
      features: [
        { text: t('subscription.feature1'), included: true },
        { text: t('subscription.feature2'), included: true },
        { text: t('subscription.feature3'), included: true },
        { text: t('subscription.feature4'), included: true },
      ],
    },
    {
      id: 'yearly',
      type: 'yearly',
      title: t('subscription.yearlyPlan'),
      price: yearlyPrice,
      period: t('subscription.perYear'),
      description: t('subscription.yearlyDescription'),
      features: [
        { text: t('subscription.feature1'), included: true },
        { text: t('subscription.feature2'), included: true },
        { text: t('subscription.feature3'), included: true },
        { text: t('subscription.feature4'), included: true },
      ],
      isRecommended: true,
    },
  ];

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (plan.type === 'free') {
      // 無料プランで続行
      navigation.replace('DummyTabs');
      return;
    }

    setIsPurchasing(true);
    try {
      const productId = plan.type === 'yearly'
        ? 'com.workoutapp.subscription.yearly'
        : 'com.workoutapp.subscription.monthly';

      // 購入リクエストを開始
      await purchaseSubscription(productId);

      Alert.alert(
        t('subscription.purchaseStartedTitle'),
        t('subscription.purchaseStartedMessage'),
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert(
        t('subscription.purchaseErrorTitle'),
        t('subscription.purchaseErrorMessage')
      );
    } finally {
      setIsPurchasing(false);
    }
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
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('subscription.title')}</Text>
          <Text style={styles.subtitle}>{t('subscription.subtitle')}</Text>
        </View>

        {/* プランカード */}
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                plan.isRecommended && styles.recommendedCard,
                plan.type === 'free' && styles.freeCard,
              ]}
              onPress={() => handleSelectPlan(plan)}
              disabled={isPurchasing}
              activeOpacity={0.8}
            >
              {plan.isRecommended && (
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>
                    {t('subscription.recommended')}
                  </Text>
                </View>
              )}

              {plan.type === 'yearly' && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {t('subscription.yearlyDiscount')}
                  </Text>
                </View>
              )}

              <Text style={[
                styles.planTitle,
                plan.type === 'free' && styles.freePlanTitle,
              ]}>
                {plan.title}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={[
                  styles.planPrice,
                  plan.type === 'free' && styles.freePlanPrice,
                ]}>
                  {plan.price}
                </Text>
                {plan.period && (
                  <Text style={styles.planPeriod}>{plan.period}</Text>
                )}
              </View>

              <Text style={styles.planDescription}>{plan.description}</Text>

              {/* 機能リスト */}
              <View style={styles.featuresContainer}>
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Text style={[
                      styles.featureIcon,
                      !feature.included && styles.featureIconDisabled,
                    ]}>
                      {feature.included ? '✓' : '✗'}
                    </Text>
                    <Text style={[
                      styles.featureText,
                      !feature.included && styles.featureTextDisabled,
                    ]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* 選択ボタン */}
              <View style={[
                styles.selectButton,
                plan.isRecommended && styles.selectButtonRecommended,
                plan.type === 'free' && styles.selectButtonFree,
              ]}>
                <Text style={[
                  styles.selectButtonText,
                  plan.isRecommended && styles.selectButtonTextRecommended,
                  plan.type === 'free' && styles.selectButtonTextFree,
                ]}>
                  {plan.type === 'free'
                    ? t('subscription.continueWithFree')
                    : t('subscription.purchase')
                  }
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

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
    paddingBottom: spacing['2xl'],
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
    color: colors.text.secondary,
    textAlign: 'center',
  },
  plansContainer: {
    marginBottom: spacing.lg,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
    ...shadows.md,
  },
  recommendedCard: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  freeCard: {
    borderColor: colors.gray[300],
    backgroundColor: colors.gray[50],
  },
  recommendedBadge: {
    position: 'absolute',
    top: -14,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  recommendedText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold as 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: -14,
    left: 20,
    backgroundColor: '#EF4444',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  discountText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold as 'bold',
  },
  planTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold as 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  freePlanTitle: {
    color: colors.gray[600],
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  planPrice: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold as 'bold',
    color: colors.primary,
  },
  freePlanPrice: {
    color: colors.gray[500],
  },
  planPeriod: {
    fontSize: typography.sizes.md,
    color: colors.gray[500],
    marginLeft: spacing.xs,
  },
  planDescription: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  featureIcon: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    marginRight: spacing.sm,
    width: 20,
  },
  featureIconDisabled: {
    color: colors.gray[400],
  },
  featureText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    flex: 1,
  },
  featureTextDisabled: {
    color: colors.gray[400],
  },
  selectButton: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  selectButtonRecommended: {
    backgroundColor: colors.primary,
  },
  selectButtonFree: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  selectButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold as '600',
    color: colors.text.primary,
  },
  selectButtonTextRecommended: {
    color: colors.white,
  },
  selectButtonTextFree: {
    color: colors.gray[500],
  },
  disclaimer: {
    fontSize: typography.sizes.xs,
    color: colors.gray[400],
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.md,
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

export default SubscriptionScreen;
