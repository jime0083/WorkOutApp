/**
 * ConversationListPage - トーク一覧ページ
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useConversations } from '../hooks/useConversations';
import { ConversationItem } from '../components/chat/ConversationItem';
import { Loading } from '../components/Loading';
import styles from './ConversationListPage.module.css';

export const ConversationListPage: React.FC = () => {
  const { t } = useTranslation();
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
        <Loading size="lg" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>💬</div>
        <h2 className={styles.emptyTitle}>{t('conversation.empty')}</h2>
        <p className={styles.emptyText}>
          {t('conversation.emptyHint')}
        </p>
        <button
          className={styles.addFriendButton}
          onClick={() => navigate('/friends/add')}
        >
          {t('conversation.addFriend')}
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
