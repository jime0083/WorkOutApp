/**
 * MessageInput - メッセージ入力コンポーネント
 */
import React, { useState, useRef, useCallback } from 'react';
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
        alert(`ファイルサイズが大きすぎます。${maxSizeLabel}以下のファイルを選択してください。`);
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
            今月のメッセージ上限に達しました。プレミアム会員にアップグレードして無制限で送信できます。
          </div>
        )}

        {canSend && !isPremium && remainingMessages <= 3 && (
          <div className={styles.limitInfo}>
            残り {remainingMessages} メッセージ（今月）
          </div>
        )}

        <div className={styles.inputArea}>
          <button
            type="button"
            className={styles.mediaButton}
            onClick={handleMediaClick}
            disabled={!canSend || isSending}
            aria-label="メディアを添付"
          >
            📷
          </button>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={canSend ? 'メッセージを入力...' : 'メッセージ上限に達しました'}
            className={styles.textInput}
            disabled={!canSend || isSending}
            rows={1}
          />

          <button
            type="button"
            className={styles.sendButton}
            onClick={handleSendText}
            disabled={!text.trim() || !canSend || isSending}
            aria-label="送信"
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
          feature="画像・動画の送信"
          onClose={() => setShowPremiumModal(false)}
        />
      )}
    </>
  );
};
