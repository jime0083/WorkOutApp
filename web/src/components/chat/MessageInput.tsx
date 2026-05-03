/**
 * MessageInput - メッセージ入力コンポーネント
 */
import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MediaPreview } from './MediaPreview';
import { PremiumRequired } from './PremiumRequired';
import styles from './MessageInput.module.css';

interface MessageInputProps {
  onSendText: (content: string) => Promise<boolean>;
  onSendImage: (file: File) => Promise<boolean>;
  onSendVideo: (file: File, thumbnail?: Blob) => Promise<boolean>;
  canSend: boolean;
  isPremium: boolean;
  remainingMessages: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendText,
  onSendImage,
  onSendVideo,
  canSend,
  isPremium,
  remainingMessages,
}) => {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // テキスト送信
  const handleSendText = useCallback(async () => {
    if (!text.trim() || isSending || !canSend) return;

    setIsSending(true);
    const success = await onSendText(text.trim());
    if (success) {
      setText('');
    }
    setIsSending(false);
  }, [text, isSending, canSend, onSendText]);

  // キーダウンハンドラ
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendText();
      }
    },
    [handleSendText]
  );

  // ファイル選択
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // ファイルサイズチェック
      const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const maxSizeLabel = file.type.startsWith('video/') ? '100MB' : '10MB';
        alert(t('chat.fileTooLarge', { maxSize: maxSizeLabel }));
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setSelectedFile(file);

      // 入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    []
  );

  // メディア送信確定
  const handleMediaConfirm = useCallback(async () => {
    if (!selectedFile || !canSend) return;

    setIsSending(true);

    if (selectedFile.type.startsWith('image/')) {
      await onSendImage(selectedFile);
    } else if (selectedFile.type.startsWith('video/')) {
      await onSendVideo(selectedFile);
    }

    setIsSending(false);
    setSelectedFile(null);
  }, [selectedFile, canSend, onSendImage, onSendVideo]);

  // メディア送信キャンセル
  const handleMediaCancel = useCallback(() => {
    setSelectedFile(null);
  }, []);

  // メディア送信ボタンクリック
  const handleMediaClick = useCallback(() => {
    if (!isPremium) {
      setShowPremiumModal(true);
      return;
    }
    fileInputRef.current?.click();
  }, [isPremium]);

  return (
    <>
      <div className={styles.container}>
        {!canSend && (
          <div className={styles.limitWarning}>
            {t('chat.messageLimit')}
          </div>
        )}

        {canSend && !isPremium && remainingMessages <= 3 && (
          <div className={styles.limitInfo}>
            {t('chat.remainingMessages', { count: remainingMessages })}
          </div>
        )}

        <div className={styles.inputArea}>
          <button
            type="button"
            className={styles.mediaButton}
            onClick={handleMediaClick}
            disabled={!canSend || isSending}
            aria-label={t('message.attachMedia')}
          >
            📷
          </button>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={canSend ? t('placeholder.message') : t('placeholder.messageLimitReached')}
            className={styles.textInput}
            disabled={!canSend || isSending}
            rows={1}
          />

          <button
            type="button"
            className={styles.sendButton}
            onClick={handleSendText}
            disabled={!text.trim() || !canSend || isSending}
            aria-label={t('common.send')}
          >
            ➤
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileSelect}
            className={styles.hiddenFileInput}
          />
        </div>
      </div>

      {/* メディアプレビュー */}
      {selectedFile && (
        <MediaPreview
          file={selectedFile}
          onConfirm={handleMediaConfirm}
          onCancel={handleMediaCancel}
          isSending={isSending}
        />
      )}

      {/* プレミアム機能案内 */}
      {showPremiumModal && (
        <PremiumRequired
          feature={t('chat.imageVideoFeature')}
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </>
  );
};
