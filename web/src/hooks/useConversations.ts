/**
 * useConversations - 会話一覧フック
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ConversationWithProfile } from '../types/conversation';
import {
  subscribeToConversations,
  getOrCreateConversation,
  resetUnreadCount,
} from '../services/message';

interface UseConversationsOptions {
  userId: string;
}

interface UseConversationsReturn {
  conversations: ConversationWithProfile[];
  isLoading: boolean;
  error: string | null;
  totalUnreadCount: number;
  getOrCreate: (partnerId: string) => Promise<string>;
  resetUnread: (conversationId: string) => Promise<boolean>;
  getConversation: (conversationId: string) => ConversationWithProfile | undefined;
}

export function useConversations({
  userId,
}: UseConversationsOptions): UseConversationsReturn {
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // リアルタイム購読
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToConversations(userId, (newConversations) => {
      setConversations(newConversations);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // 合計未読数を計算
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0);
    }, 0);
  }, [conversations, userId]);

  // 会話を作成または取得
  const getOrCreate = useCallback(
    async (partnerId: string): Promise<string> => {
      try {
        return await getOrCreateConversation(userId, partnerId);
      } catch (err) {
        console.error('Failed to get or create conversation:', err);
        setError('会話の作成に失敗しました');
        throw err;
      }
    },
    [userId]
  );

  // 未読カウントをリセット
  const resetUnread = useCallback(
    async (conversationId: string): Promise<boolean> => {
      return resetUnreadCount(conversationId, userId);
    },
    [userId]
  );

  // 特定の会話を取得
  const getConversation = useCallback(
    (conversationId: string): ConversationWithProfile | undefined => {
      return conversations.find((c) => c.id === conversationId);
    },
    [conversations]
  );

  return {
    conversations,
    isLoading,
    error,
    totalUnreadCount,
    getOrCreate,
    resetUnread,
    getConversation,
  };
}
