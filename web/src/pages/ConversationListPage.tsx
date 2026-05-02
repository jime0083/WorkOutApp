/**
 * ConversationListPage - トーク一覧ページ
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useConversations } from '../hooks/useConversations';
import { ConversationItem } from '../components/chat/ConversationItem';
import { Loading } from '../components/Loading';
import styles from './ConversationListPage.module.css';

export const ConversationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { conversations, isLoading } = useConversations({
    userId: user?.uid || '',
  });

  const handleConversationClick = (conversationId: string) => {
    navigate(`/chat/${conversationId}`);
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>💬</div>
        <h2 className={styles.emptyTitle}>トークがありません</h2>
        <p className={styles.emptyText}>
          友だちを追加して、トークを始めましょう
        </p>
        <button
          className={styles.addFriendButton}
          onClick={() => navigate('/friends/add')}
        >
          友だちを追加
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            currentUserId={user?.uid || ''}
            onClick={() => handleConversationClick(conversation.id)}
          />
        ))}
      </ul>
    </div>
  );
};
