/**
 * 共通ローディングコンポーネント
 */

import React from 'react';
import styles from './Loading.module.css';

type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingProps {
  size?: LoadingSize;
  text?: string;
  className?: string;
}

interface FullScreenLoadingProps {
  visible?: boolean;
  text?: string;
}

// インラインローディング
export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <span className={styles.text}>{text}</span>}
    </div>
  );
};

// フルスクリーンローディング
export const FullScreenLoading: React.FC<FullScreenLoadingProps> = ({
  visible = true,
  text,
}) => {
  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.loadingBox}>
        <div className={`${styles.spinner} ${styles.lg}`} />
        {text && <span className={styles.overlayText}>{text}</span>}
      </div>
    </div>
  );
};

// センター配置ローディング
export const CenteredLoading: React.FC<LoadingProps> = ({
  size = 'lg',
  text,
}) => {
  return (
    <div className={styles.centered}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <span className={styles.centeredText}>{text}</span>}
    </div>
  );
};

export default Loading;
