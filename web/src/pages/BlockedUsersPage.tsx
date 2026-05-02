/**
 * BlockedUsersPage - ブロックユーザー一覧ページ
 */
import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useFriends } from '../hooks/useFriends';
import { Loading } from '../components/Loading';
import styles from './BlockedUsersPage.module.css';

export const BlockedUsersPage: React.FC = () => {
  const { user } = useAuthStore();
  const {
    blockedUsers,
    blockedUsersLoading,
    unblockUser,
    error,
  } = useFriends({
    userId: user?.uid || '',
  });

  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const handleUnblock = async (targetUserId: string) => {
    if (processingId) return;
    setProcessingId(targetUserId);
    await unblockUser(targetUserId);
    setProcessingId(null);
  };

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {blockedUsersLoading ? (
        <div className={styles.loadingContainer}>
          <Loading size="large" />
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>🚫</div>
          <p className={styles.emptyText}>
            ブロックしているユーザーはいません
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {blockedUsers.map((blockedUser) => (
            <li key={blockedUser.friendshipId} className={styles.item}>
              <div className={styles.avatar}>
                {blockedUser.profileImageUrl ? (
                  <img
                    src={blockedUser.profileImageUrl}
                    alt={blockedUser.nickname}
                    className={styles.avatarImage}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {blockedUser.nickname?.charAt(0) || '?'}
                  </div>
                )}
              </div>

              <div className={styles.content}>
                <span className={styles.nickname}>
                  {blockedUser.nickname}
                </span>
                <span className={styles.visibleUserId}>
                  @{blockedUser.visibleUserId}
                </span>
              </div>

              <button
                className={styles.unblockButton}
                onClick={() => handleUnblock(blockedUser.friendId)}
                disabled={processingId === blockedUser.friendId}
              >
                {processingId === blockedUser.friendId ? '解除中...' : 'ブロック解除'}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.infoSection}>
        <p className={styles.infoText}>
          ブロックしたユーザーからはメッセージを受け取れません。
          ブロックを解除すると、再びメッセージのやり取りができるようになります。
        </p>
      </div>
    </div>
  );
};
