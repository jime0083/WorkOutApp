/**
 * FriendListPage - 友達一覧ページ
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useFriends } from '../hooks/useFriends';
import { FriendItem } from '../components/friends/FriendItem';
import { Loading } from '../components/Loading';
import styles from './FriendListPage.module.css';

export const FriendListPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    friends,
    friendsLoading,
    pendingRequestCount,
  } = useFriends({
    userId: user?.uid || '',
  });

  if (friendsLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* アクションバー */}
      <div className={styles.actionBar}>
        <button
          className={styles.addButton}
          onClick={() => navigate('/friends/add')}
        >
          {t('friends.addFriend')}
        </button>
        <button
          className={styles.requestsButton}
          onClick={() => navigate('/friends/requests')}
        >
          {t('friends.friendRequests')}
          {pendingRequestCount > 0 && (
            <span className={styles.badge}>{pendingRequestCount}</span>
          )}
        </button>
      </div>

      {/* 友達一覧 */}
      {friends.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>👥</div>
          <h2 className={styles.emptyTitle}>{t('friends.empty')}</h2>
          <p className={styles.emptyText}>
            {t('friends.emptyHint')}
          </p>
          <button
            className={styles.addFriendButton}
            onClick={() => navigate('/friends/add')}
          >
            {t('friends.addFriend')}
          </button>
        </div>
      ) : (
        <ul className={styles.list}>
          {friends.map((friend) => (
            <FriendItem
              key={friend.friendshipId}
              friend={friend}
              onClick={() => {
                // 友達とのトークを開始
                navigate(`/chat/new?partnerId=${friend.friendId}`);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
};
