/**
 * MessageBubble - メッセージバブルコンポーネント
 */
import React, { useState, useCallback } from 'react';
import type { Message } from '../../types/message';
import type { UserProfile } from '../../types/user';
import { formatMessageTime } from '../../utils/date';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  partnerProfile?: UserProfile;
  onContextMenu?: (message: Message, position: { x: number; y: number }) => void;
}

// Firestore Timestamp型のガード
const toDate = (dateValue: Date | { toDate: () => Date }): Date => {
  if (dateValue && typeof (dateValue as { toDate?: () => Date }).toDate === 'function') {
    return (dateValue as { toDate: () => Date }).toDate();
  }
  return dateValue instanceof Date ? dateValue : new Date(dateValue);
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  partnerProfile,
  onContextMenu,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const messageTime = formatMessageTime(toDate(message.createdAt));

  // コンテキストメニュー表示
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (onContextMenu && !message.isDeleted) {
        onContextMenu(message, { x: e.clientX, y: e.clientY });
      }
    },
    [message, onContextMenu]
  );

  // 長押し対応（モバイル）
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const timeout = setTimeout(() => {
        if (onContextMenu && !message.isDeleted) {
          onContextMenu(message, { x: touch.clientX, y: touch.clientY });
        }
      }, 500);

      const handleTouchEnd = () => {
        clearTimeout(timeout);
        document.removeEventListener('touchend', handleTouchEnd);
      };

      document.addEventListener('touchend', handleTouchEnd);
    },
    [message, onContextMenu]
  );

  // 削除されたメッセージ
  if (message.isDeleted) {
    return (
      <div className={`${styles.container} ${isOwn ? styles.own : styles.other}`}>
        <div className={`${styles.bubble} ${styles.deleted}`}>
          <span className={styles.deletedText}>
            メッセージが削除されました
          </span>
        </div>
      </div>
    );
  }

  // テキストメッセージ
  const renderTextContent = () => (
    <div
      className={`${styles.bubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
    >
      <p className={styles.text}>{message.content}</p>
      <span className={styles.time}>
        {messageTime}
        {isOwn && message.isRead && (
          <span className={styles.readStatus}>既読</span>
        )}
      </span>
    </div>
  );

  // 画像メッセージ（content にURLが入る）
  const renderImageContent = () => (
    <>
      <div
        className={`${styles.mediaBubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}
        onClick={() => setShowFullImage(true)}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
      >
        {!imageLoaded && <div className={styles.imagePlaceholder} />}
        <img
          src={message.content}
          alt="送信画像"
          className={`${styles.image} ${imageLoaded ? styles.loaded : ''}`}
          onLoad={() => setImageLoaded(true)}
        />
        <span className={styles.mediaTime}>
          {messageTime}
          {isOwn && message.isRead && (
            <span className={styles.readStatus}>既読</span>
          )}
        </span>
      </div>

      {showFullImage && (
        <div className={styles.fullImageOverlay} onClick={() => setShowFullImage(false)}>
          <img
            src={message.content}
            alt="送信画像"
            className={styles.fullImage}
          />
        </div>
      )}
    </>
  );

  // 動画メッセージ（content にURLが入る）
  const renderVideoContent = () => (
    <div
      className={`${styles.mediaBubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
    >
      <video
        src={message.content}
        poster={message.thumbnailUrl || undefined}
        controls
        className={styles.video}
      />
      <span className={styles.mediaTime}>
        {messageTime}
        {isOwn && message.isRead && (
          <span className={styles.readStatus}>既読</span>
        )}
      </span>
    </div>
  );

  return (
    <div className={`${styles.container} ${isOwn ? styles.own : styles.other}`}>
      {!isOwn && (
        <div className={styles.avatar}>
          {partnerProfile?.profileImageUrl ? (
            <img
              src={partnerProfile.profileImageUrl}
              alt={partnerProfile.nickname}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {partnerProfile?.nickname?.charAt(0) || '?'}
            </div>
          )}
        </div>
      )}

      <div className={styles.content}>
        {message.type === 'text' && renderTextContent()}
        {message.type === 'image' && renderImageContent()}
        {message.type === 'video' && renderVideoContent()}
      </div>
    </div>
  );
};
