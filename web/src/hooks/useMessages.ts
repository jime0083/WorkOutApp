/**
 * useMessages - メッセージ関連フック
 */
import { useState, useEffect, useCallback } from 'react';
import type { Message } from '../types/message';
import {
  subscribeToMessages,
  loadMoreMessages,
  sendTextMessage,
  sendImageMessage,
  sendVideoMessage,
  deleteMessage,
  markMessageAsRead,
  searchMessages,
} from '../services/message';

interface UseMessagesOptions {
  conversationId: string;
  currentUserId: string;
}

interface UseMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  sendText: (content: string) => Promise<boolean>;
  sendImage: (file: File) => Promise<boolean>;
  sendVideo: (file: File, thumbnail?: Blob) => Promise<boolean>;
  deleteMsg: (messageId: string) => Promise<boolean>;
  markAsRead: (messageId: string) => Promise<boolean>;
  search: (query: string) => Promise<Message[]>;
}

export function useMessages({
  conversationId,
  currentUserId,
}: UseMessagesOptions): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // リアルタイム購読
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
      setIsLoading(false);
      setHasMore(newMessages.length >= 30);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // 過去のメッセージを読み込む
  const loadMore = useCallback(async () => {
    if (!hasMore || messages.length === 0) return;

    try {
      const oldestMessage = messages[0];
      const olderMessages = await loadMoreMessages(conversationId, oldestMessage);

      if (olderMessages.length === 0) {
        setHasMore(false);
        return;
      }

      setMessages((prev) => [...olderMessages, ...prev]);
      setHasMore(olderMessages.length >= 30);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    }
  }, [conversationId, messages, hasMore]);

  // テキストメッセージを送信
  const sendText = useCallback(
    async (content: string): Promise<boolean> => {
      if (!content.trim()) return false;

      const result = await sendTextMessage(conversationId, currentUserId, content);
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result.success;
    },
    [conversationId, currentUserId]
  );

  // 画像メッセージを送信
  const sendImage = useCallback(
    async (file: File): Promise<boolean> => {
      const result = await sendImageMessage(conversationId, currentUserId, file);
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result.success;
    },
    [conversationId, currentUserId]
  );

  // 動画メッセージを送信
  const sendVideo = useCallback(
    async (file: File, thumbnail?: Blob): Promise<boolean> => {
      const result = await sendVideoMessage(
        conversationId,
        currentUserId,
        file,
        thumbnail
      );
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result.success;
    },
    [conversationId, currentUserId]
  );

  // メッセージを削除
  const deleteMsg = useCallback(
    async (messageId: string): Promise<boolean> => {
      return deleteMessage(conversationId, messageId);
    },
    [conversationId]
  );

  // メッセージを既読にする
  const markAsRead = useCallback(
    async (messageId: string): Promise<boolean> => {
      return markMessageAsRead(conversationId, messageId);
    },
    [conversationId]
  );

  // メッセージを検索
  const search = useCallback(
    async (query: string): Promise<Message[]> => {
      return searchMessages(conversationId, query);
    },
    [conversationId]
  );

  return {
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
    search,
  };
}
