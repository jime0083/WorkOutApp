/**
 * MediaPreview - メディアプレビューコンポーネント
 * 送信前の画像・動画プレビューとキャンセル機能
 */
import React, { useState, useCallback } from 'react';
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
            {isVideo ? '動画を送信' : '画像を送信'}
          </h3>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            disabled={isSending}
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className={styles.previewArea}>
          {isImage && (
            <img
              src={previewUrl}
              alt="プレビュー"
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
            キャンセル
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isSending}
          >
            {isSending ? '送信中...' : '送信'}
          </button>
        </div>
      </div>
    </div>
  );
};
