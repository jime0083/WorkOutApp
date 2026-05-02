/**
 * Layout - メインレイアウトコンポーネント
 * ヘッダー + コンテンツ + ボトムナビの構造
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

// ボトムナビを非表示にするパス
const HIDE_BOTTOM_NAV_PATHS = ['/chat/'];

// ヘッダーを非表示にするパス
const HIDE_HEADER_PATHS = ['/chat/'];

// 戻るボタンを表示するパス
const SHOW_BACK_BUTTON_PATHS = [
  '/friends/add',
  '/friends/requests',
  '/subscription',
  '/settings',
  '/chat/',
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  // ボトムナビを表示するかどうか
  const showBottomNav = !HIDE_BOTTOM_NAV_PATHS.some((p) => path.startsWith(p));

  // ヘッダーを表示するかどうか
  const showHeader = !HIDE_HEADER_PATHS.some((p) => path.startsWith(p));

  // 戻るボタンを表示するかどうか
  const showBackButton = SHOW_BACK_BUTTON_PATHS.some((p) => path.startsWith(p));

  return (
    <div className={styles.layout}>
      {showHeader && <Header showBackButton={showBackButton} />}

      <main
        className={`${styles.main} ${!showBottomNav ? styles.noBottomNav : ''} ${
          !showHeader ? styles.noHeader : ''
        }`}
      >
        {children}
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
};
