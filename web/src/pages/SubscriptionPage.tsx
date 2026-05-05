/**
 * SubscriptionPage - 課金管理ページ
 * Webアプリではプラン情報と機能一覧を表示
 * 購入・管理はiOSアプリから行う
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSubscription } from '../hooks/useSubscription';
import { Loading } from '../components/Loading';
import styles from './SubscriptionPage.module.css';

// プレミアム機能一覧
const PREMIUM_FEATURES = [
  { key: 'unlimitedMessages', icon: '💬' },
  { key: 'imageVideo', icon: '📷' },
  { key: 'messageDelete', icon: '🗑️' },
  { key: 'panicButton', icon: '🚨' },
];

export const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation();
  const { isPremium, planType, expiryDate, isLoading, error } = useSubscription();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" />
      </div>
    );
  }

  const formatExpiryDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getPlanLabel = (): string => {
    if (!isPremium) return t('subscription.freePlan');
    if (planType === 'monthly') return t('subscription.monthly');
    if (planType === 'yearly') return t('subscription.yearly');
    return t('subscription.premiumPlan');
  };

  return (
    <div className={styles.container}>
      {/* エラー表示 */}
      {error && <div className={styles.error}>{error}</div>}

      {/* 現在のプラン */}
      <section className={styles.currentPlanSection}>
        <h2 className={styles.sectionTitle}>{t('subscription.currentPlan')}</h2>
        <div className={styles.planStatus}>
          <span
            className={`${styles.planBadge} ${
              isPremium ? styles.premiumBadge : styles.freeBadge
            }`}
          >
            {getPlanLabel()}
          </span>
        </div>
        {isPremium && expiryDate && (
          <p className={styles.expiryInfo}>
            {t('subscription.expiryDate', { date: formatExpiryDate(expiryDate) })}
          </p>
        )}
      </section>

      {/* プレミアム機能一覧 */}
      <section className={styles.featuresSection}>
        <h2 className={styles.sectionTitle}>{t('subscription.features')}</h2>
        <ul className={styles.featuresList}>
          {PREMIUM_FEATURES.map((feature) => (
            <li key={feature.key} className={styles.featureItem}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <div className={styles.featureInfo}>
                <h3 className={styles.featureName}>
                  {t(`subscription.${feature.key}`)}
                </h3>
              </div>
              {isPremium ? (
                <span className={styles.featureCheck}>✓</span>
              ) : (
                <span className={styles.featureLocked}>🔒</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* プラン選択（情報表示のみ） */}
      {!isPremium && (
        <section className={styles.plansSection}>
          <h2 className={styles.sectionTitle}>{t('subscription.selectPlan')}</h2>
          <div className={styles.planCards}>
            <div className={styles.planCard}>
              <div className={styles.planCardHeader}>
                <h3 className={styles.planName}>{t('subscription.monthly')}</h3>
                <span className={styles.planPrice}>
                  {t('subscription.monthlyPrice')}
                </span>
              </div>
            </div>
            <div className={styles.planCard}>
              <div className={styles.planCardHeader}>
                <h3 className={styles.planName}>{t('subscription.yearly')}</h3>
                <span className={styles.planPrice}>
                  {t('subscription.yearlyPrice')}
                </span>
              </div>
              <span className={styles.planDiscount}>
                {t('subscription.yearlyDiscount')}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* 管理情報 */}
      <section className={styles.manageSection}>
        <h2 className={styles.sectionTitle}>{t('subscription.manageSubscription')}</h2>
        <p className={styles.manageNote}>{t('subscription.manageNote')}</p>
        <p className={styles.iosNote}>{t('subscription.iosOnly')}</p>
      </section>
    </div>
  );
};
