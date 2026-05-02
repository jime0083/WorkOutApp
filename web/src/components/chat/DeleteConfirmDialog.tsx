/**
 * DeleteConfirmDialog - メッセージ削除確認ダイアログ
 */
import React from 'react';
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
  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>メッセージを削除</h3>
        <p className={styles.message}>
          このメッセージを削除しますか？
          <br />
          削除すると相手の画面でも「削除されました」と表示されます。
        </p>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isDeleting}
          >
            キャンセル
          </button>
          <button
            className={styles.deleteButton}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? '削除中...' : '削除'}
          </button>
        </div>
      </div>
    </div>
  );
};
