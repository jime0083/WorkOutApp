/**
 * FriendRequestPage - 友達申請一覧ページ
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useFriends } from '../hooks/useFriends';
import { FriendRequestItem } from '../components/friends/FriendRequestItem';
import { Loading } from '../components/Loading';
import styles from './FriendRequestPage.module.css';

type TabType = 'received' | 'sent';

export const FriendRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('received');

  const {
    receivedRequests,
    receivedRequestsLoading,
    sentRequests,
    sentRequestsLoading,
    acceptFriendRequest,
    rejectFriendRequest,
    error,
  } = useFriends({
    userId: user?.uid || '',
  });

  const isLoading = activeTab === 'received' ? receivedRequestsLoading : sentRequestsLoading;
  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  return (
    <div className={styles.container}>
      {/* タブ */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'received' ? styles.active : ''}`}
          onClick={() => setActiveTab('received')}
        >
          {t('friendRequest.received')}
          {receivedRequests.length > 0 && (
            <span className={styles.count}>{receivedRequests.length}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'sent' ? styles.active : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          {t('friendRequest.sent')}
          {sentRequests.length > 0 && (
            <span className={styles.count}>{sentRequests.length}</span>
          )}
        </button>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* コンテンツ */}
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Loading size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>
            {activeTab === 'received' ? '📬' : '📤'}
          </div>
          <p className={styles.emptyText}>
            {activeTab === 'received'
              ? t('friendRequest.noReceived')
              : t('friendRequest.noSent')}
          </p>
        </div>
      ) : (
        <ul className={styles.list}>
          {requests.map((request) => (
            <FriendRequestItem
              key={request.friendshipId}
              request={request}
              type={activeTab}
              onAccept={
                activeTab === 'received'
                  ? () => acceptFriendRequest(request.friendshipId)
                  : undefined
              }
              onReject={
                activeTab === 'received'
                  ? () => rejectFriendRequest(request.friendshipId)
                  : undefined
              }
            />
          ))}
        </ul>
      )}
    </div>
  );
};
