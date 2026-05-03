/**
 * ConversationItem - 会話リストアイテム
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ConversationWithProfile } from '../../types/conversation';
import { formatRelativeTime } from '../../utils/date';
import styles from './ConversationItem.module.css';

interface ConversationItemProps {
  conversation: ConversationWithProfile;
  currentUserId: string;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  onClick,
}) => {
  const { t } = useTranslation();
  const unreadCount = conversation.unreadCount[currentUserId] || 0;
  const lastMessage = conversation.lastMessage;

  // 最後のメッセージのプレビューを生成
  const getMessagePreview = (): string => {
    if (!lastMessage) return t('chat.noMessages');

    switch (lastMessage.type) {
      case 'text':
        return lastMessage.content;
      case 'image':
        return t('chat.imageMessage');
      case 'video':
        return t('chat.videoMessage');
      default:
        return lastMessage.content || '';
    }
  };

  // 最終更新日時を取得
  const getLastMessageTime = (): Date => {
    if (!lastMessage) return new Date();
    // Firestore Timestamp か Date かをチェック
    const createdAt = lastMessage.createdAt;
    if (createdAt instanceof Date) {
      return createdAt;
    }
    // Firestore Timestamp の場合
    const timestamp = createdAt as unknown as { toDate?: () => Date };
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    return new Date();
  };

  return (
    <li className={styles.item} onClick={onClick}>
      <div className={styles.avatar}>
        {conversation.partnerProfile?.profileImageUrl ? (
          <img
            src={conversation.partnerProfile.profileImageUrl}
            alt={conversation.partnerProfile.nickname}
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {conversation.partnerProfile?.nickname?.charAt(0) || '?'}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>
            {conversation.partnerProfile?.nickname || t('chat.unknownUser')}
          </span>
          {lastMessage && (
            <span className={styles.time}>
              {formatRelativeTime(getLastMessageTime())}
            </span>
          )}
        </div>

        <div className={styles.footer}>
          <span
            className={`${styles.preview} ${unreadCount > 0 ? styles.unread : ''}`}
          >
            {getMessagePreview()}
          </span>
          {unreadCount > 0 && (
            <span className={styles.badge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};
