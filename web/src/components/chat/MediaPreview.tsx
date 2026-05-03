/**
 * MediaPreview - メディアプレビューコンポーネント
 * 送信前の画像・動画プレビューとキャンセル機能
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './MediaPreview.module.css';

interface MediaPreviewProps {
  file: File;
  onConfirm: () => void;
  onCancel: () => void;
  isSending: boolean;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({
  file,
  onConfirm,
  onCancel,
  isSending,
}) => {
  const { t } = useTranslation();
  const [previewUrl] = useState(() => URL.createObjectURL(file));
  const isVideo = file.type.startsWith('video/');
  const isImage = file.type.startsWith('image/');

  // ファイルサイズのフォーマット
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // コンポーネントがアンマウントされたらURLを解放
  React.useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {isVideo ? t('chat.sendVideo') : t('chat.sendImage')}
          </h3>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            disabled={isSending}
            aria-label={t('common.close')}
          >
            ✕
          </button>
        </div>

        <div className={styles.previewArea}>
          {isImage && (
            <img
              src={previewUrl}
              alt={t('chat.preview')}
              className={styles.previewImage}
            />
          )}
          {isVideo && (
            <video
              src={previewUrl}
              controls
              className={styles.previewVideo}
            />
          )}
        </div>

        <div className={styles.fileInfo}>
          <span className={styles.fileName}>{file.name}</span>
          <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={isSending}
          >
            {t('common.cancel')}
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isSending}
          >
            {isSending ? t('common.sending') : t('common.send')}
          </button>
        </div>
      </div>
    </div>
  );
};
