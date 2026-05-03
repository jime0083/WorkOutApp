/**
 * DeleteConfirmDialog - メッセージ削除確認ダイアログ
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './DeleteConfirmDialog.module.css';

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>{t('chat.deleteMessage')}</h3>
        <p className={styles.message}>
          {t('chat.deleteConfirmMessage')}
          <br />
          {t('chat.deleteDescription')}
        </p>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isDeleting}
          >
            {t('common.cancel')}
          </button>
          <button
            className={styles.deleteButton}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t('chat.deleting') : t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
};
