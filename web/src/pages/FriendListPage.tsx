/**
 * FriendListPage - 友達一覧ページ
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useFriends } from '../hooks/useFriends';
import { FriendItem } from '../components/friends/FriendItem';
import { Loading } from '../components/Loading';
import styles from './FriendListPage.module.css';

export const FriendListPage: React.FC = () => {
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
        <Loading size="large" />
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
          友だちを追加
        </button>
        <button
          className={styles.requestsButton}
          onClick={() => navigate('/friends/requests')}
        >
          友達申請
          {pendingRequestCount > 0 && (
            <span className={styles.badge}>{pendingRequestCount}</span>
          )}
        </button>
      </div>

      {/* 友達一覧 */}
      {friends.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>👥</div>
          <h2 className={styles.emptyTitle}>友だちがいません</h2>
          <p className={styles.emptyText}>
            IDを検索して友だちを追加しましょう
          </p>
          <button
            className={styles.addFriendButton}
            onClick={() => navigate('/friends/add')}
          >
            友だちを追加
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
