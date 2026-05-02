/**
 * Header - ヘッダーコンポーネント
 * LINE風のヘッダー
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  onBackClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  rightElement,
  onBackClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ページタイトルの自動決定
  const getPageTitle = (): string => {
    if (title) return title;

    const path = location.pathname;
    if (path === '/') return 'トーク';
    if (path === '/friends') return '友だち';
    if (path === '/friends/add') return '友だち追加';
    if (path === '/friends/requests') return '友だちリクエスト';
    if (path === '/profile') return 'プロフィール';
    if (path === '/subscription') return 'プレミアム';
    if (path === '/settings') return '設定';
    if (path.startsWith('/chat/')) return '';

    return '';
  };

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  const pageTitle = getPageTitle();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBackButton && (
          <button
            className={styles.backButton}
            onClick={handleBack}
            aria-label="戻る"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.center}>
        {pageTitle && <h1 className={styles.title}>{pageTitle}</h1>}
      </div>

      <div className={styles.right}>{rightElement}</div>
    </header>
  );
};
