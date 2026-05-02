/**
 * FriendItem - 友達リストアイテムコンポーネント
 */
import React from 'react';
import type { FriendWithProfile } from '../../types/friendship';
import styles from './FriendItem.module.css';

interface FriendItemProps {
  friend: FriendWithProfile;
  onClick: () => void;
}

export const FriendItem: React.FC<FriendItemProps> = ({
  friend,
  onClick,
}) => {
  return (
    <li className={styles.item} onClick={onClick}>
      <div className={styles.avatar}>
        {friend.profileImageUrl ? (
          <img
            src={friend.profileImageUrl}
            alt={friend.nickname}
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {friend.nickname?.charAt(0) || '?'}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <span className={styles.nickname}>{friend.nickname}</span>
        <span className={styles.visibleUserId}>@{friend.visibleUserId}</span>
      </div>

      <div className={styles.action}>
        <span className={styles.arrow}>›</span>
      </div>
    </li>
  );
};
