/**
 * FriendRequestItem - 友達申請アイテムコンポーネント
 */
import React, { useState } from 'react';
import type { FriendRequest } from '../../types/friendship';
import { formatRelativeTime } from '../../utils/date';
import styles from './FriendRequestItem.module.css';

interface FriendRequestItemProps {
  request: FriendRequest;
  type: 'received' | 'sent';
  onAccept?: () => Promise<boolean>;
  onReject?: () => Promise<boolean>;
}

export const FriendRequestItem: React.FC<FriendRequestItemProps> = ({
  request,
  type,
  onAccept,
  onReject,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    if (!onAccept || isProcessing) return;
    setIsProcessing(true);
    await onAccept();
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!onReject || isProcessing) return;
    setIsProcessing(true);
    await onReject();
    setIsProcessing(false);
  };

  return (
    <li className={styles.item}>
      <div className={styles.avatar}>
        {request.requesterProfile.profileImageUrl ? (
          <img
            src={request.requesterProfile.profileImageUrl}
            alt={request.requesterProfile.nickname}
            className={styles.avatarImage}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {request.requesterProfile.nickname?.charAt(0) || '?'}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <span className={styles.nickname}>
          {request.requesterProfile.nickname}
        </span>
        <span className={styles.visibleUserId}>
          @{request.requesterProfile.visibleUserId}
        </span>
        <span className={styles.time}>
          {formatRelativeTime(request.createdAt)}
        </span>
      </div>

      {type === 'received' && (
        <div className={styles.actions}>
          <button
            className={styles.acceptButton}
            onClick={handleAccept}
            disabled={isProcessing}
          >
            承認
          </button>
          <button
            className={styles.rejectButton}
            onClick={handleReject}
            disabled={isProcessing}
          >
            拒否
          </button>
        </div>
      )}

      {type === 'sent' && (
        <div className={styles.status}>
          <span className={styles.pendingLabel}>承認待ち</span>
        </div>
      )}
    </li>
  );
};
