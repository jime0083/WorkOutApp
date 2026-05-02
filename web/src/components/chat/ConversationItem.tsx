/**
 * ConversationItem - 会話リストアイテム
 */
import React from 'react';
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
  const unreadCount = conversation.unreadCount[currentUserId] || 0;
  const lastMessage = conversation.lastMessage;

  // 最後のメッセージのプレビューを生成
  const getMessagePreview = (): string => {
    if (!lastMessage) return 'メッセージがありません';

    switch (lastMessage.type) {
      case 'text':
        return lastMessage.content;
      case 'image':
        return '📷 画像';
      case 'video':
        return '🎥 動画';
      default:
        return lastMessage.content || '';
    }
  };

  // 最終更新日時を取得
  const getLastMessageTime = (): Date => {
    if (!lastMessage) return new Date();
    // Firestore Timestamp か Date かをチェック
    const createdAt = lastMessage.createdAt;
    if (createdAt && typeof (createdAt as { toDate?: () => Date }).toDate === 'function') {
      return (createdAt as { toDate: () => Date }).toDate();
    }
    return createdAt instanceof Date ? createdAt : new Date(createdAt);
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
            {conversation.partnerProfile?.nickname || '不明なユーザー'}
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
