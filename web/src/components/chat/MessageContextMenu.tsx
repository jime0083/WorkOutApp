/**
 * MessageContextMenu - メッセージコンテキストメニュー
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MessageContextMenu.module.css';

interface MessageContextMenuProps {
  isOwn: boolean;
  isPremium: boolean;
  onDelete: () => void;
  onCopy: () => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  isOwn,
  isPremium,
  onDelete,
  onCopy,
  onClose,
  position,
}) => {
  const { t } = useTranslation();

  // 画面端からはみ出さないように位置を調整
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 160),
    y: Math.min(position.y, window.innerHeight - 120),
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div
        className={styles.menu}
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
      >
        <button className={styles.menuItem} onClick={onCopy}>
          <span className={styles.icon}>📋</span>
          <span>{t('chat.copy')}</span>
        </button>

        {isOwn && isPremium && (
          <button className={`${styles.menuItem} ${styles.danger}`} onClick={onDelete}>
            <span className={styles.icon}>🗑️</span>
            <span>{t('common.delete')}</span>
          </button>
        )}

        {isOwn && !isPremium && (
          <button className={`${styles.menuItem} ${styles.disabled}`} disabled>
            <span className={styles.icon}>🗑️</span>
            <span>{t('chat.deletePremium')}</span>
          </button>
        )}
      </div>
    </>
  );
};
