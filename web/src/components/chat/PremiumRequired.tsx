/**
 * PremiumRequired - プレミアム機能制限コンポーネント
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './PremiumRequired.module.css';

interface PremiumRequiredProps {
  feature: string;
  onClose: () => void;
}

export const PremiumRequired: React.FC<PremiumRequiredProps> = ({
  feature,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.icon}>👑</div>
        <h3 className={styles.title}>{t('chat.premiumTitle')}</h3>
        <p className={styles.description}>
          {t('chat.premiumDescription', { feature })}
          <br />
          {t('chat.premiumUpgradeHint')}
        </p>

        <div className={styles.features}>
          <div className={styles.featureItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>{t('chat.imageVideoFeature')}</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>{t('chat.unlimitedMessages')}</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>{t('chat.deleteFeature')}</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.closeButton} onClick={onClose}>
            {t('common.close')}
          </button>
          <button className={styles.upgradeButton} onClick={handleUpgrade}>
            {t('chat.upgrade')}
          </button>
        </div>
      </div>
    </div>
  );
};
