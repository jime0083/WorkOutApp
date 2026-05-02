/**
 * ChatRoomPage - チャットルームページ
 */
import React, { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMessages } from '../hooks/useMessages';
import { useConversations } from '../hooks/useConversations';
import { useMessageLimit } from '../hooks/useMessageLimit';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { Loading } from '../components/Loading';
import styles from './ChatRoomPage.module.css';

export const ChatRoomPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuthStore();
  const currentUserId = user?.uid || '';

  const {
    messages,
    isLoading,
    error,
    hasMore,
    loadMore,
    sendText,
    sendImage,
    sendVideo,
    deleteMsg,
    markAsRead,
  } = useMessages({
    conversationId: conversationId || '',
    currentUserId,
  });

  const { resetUnread, getConversation } = useConversations({
    userId: currentUserId,
  });

  const {
    canSend,
    remaining,
    isPremium,
    refresh: refreshLimit,
  } = useMessageLimit();

  const conversation = getConversation(conversationId || '');

  // 未読をリセットし、相手からのメッセージを既読にする
  useEffect(() => {
    if (conversationId) {
      resetUnread(conversationId);

      // 相手からの未読メッセージを既読にする
      const unreadFromPartner = messages.filter(
        (m) => m.senderId !== currentUserId && !m.isRead && !m.isDeleted
      );
      unreadFromPartner.forEach((m) => {
        markAsRead(m.id);
      });
    }
  }, [conversationId, resetUnread, messages, currentUserId, markAsRead]);

  // テキストメッセージ送信
  const handleSendText = useCallback(
    async (content: string) => {
      const success = await sendText(content);
      if (success) {
        await refreshLimit();
      }
      return success;
    },
    [sendText, refreshLimit]
  );

  // 画像送信
  const handleSendImage = useCallback(
    async (file: File) => {
      const success = await sendImage(file);
      if (success) {
        await refreshLimit();
      }
      return success;
    },
    [sendImage, refreshLimit]
  );

  // 動画送信
  const handleSendVideo = useCallback(
    async (file: File, thumbnail?: Blob) => {
      const success = await sendVideo(file, thumbnail);
      if (success) {
        await refreshLimit();
      }
      return success;
    },
    [sendVideo, refreshLimit]
  );

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onDeleteMessage={deleteMsg}
        partnerProfile={conversation?.partnerProfile}
        isPremium={isPremium}
      />

      <MessageInput
        onSendText={handleSendText}
        onSendImage={handleSendImage}
        onSendVideo={handleSendVideo}
        canSend={canSend}
        isPremium={isPremium}
        remainingMessages={remaining}
      />
    </div>
  );
};
