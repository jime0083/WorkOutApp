/**
 * PremiumRequired - プレミアム機能制限コンポーネント
 */
import React from 'react';
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
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.icon}>👑</div>
        <h3 className={styles.title}>プレミアム機能</h3>
        <p className={styles.description}>
          {feature}はプレミアム会員限定の機能です。
          <br />
          アップグレードして、すべての機能をお楽しみください。
        </p>

        <div className={styles.features}>
          <div className={styles.featureItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>画像・動画の送信</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>メッセージ無制限</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.checkIcon}>✓</span>
            <span>メッセージ削除機能</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.closeButton} onClick={onClose}>
            閉じる
          </button>
          <button className={styles.upgradeButton} onClick={handleUpgrade}>
            アップグレード
          </button>
        </div>
      </div>
    </div>
  );
};
