/**
 * useMessageLimit - メッセージ送信上限フック
 */
import { useState, useEffect, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../services/firebase';

interface MessageLimitData {
  canSend: boolean;
  remaining: number;
  limit: number;
  isPremium: boolean;
  resetDate: Date | null;
}

interface UseMessageLimitReturn {
  canSend: boolean;
  remaining: number;
  limit: number;
  isPremium: boolean;
  resetDate: Date | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useMessageLimit(): UseMessageLimitReturn {
  const [data, setData] = useState<MessageLimitData>({
    canSend: true,
    remaining: 10,
    limit: 10,
    isPremium: false,
    resetDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLimit = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const checkLimitFn = httpsCallable<void, { success: boolean; data: MessageLimitData }>(
        functions,
        'checkMessageLimit'
      );
      const result = await checkLimitFn();

      if (result.data.success) {
        setData({
          ...result.data.data,
          resetDate: result.data.data.resetDate
            ? new Date(result.data.data.resetDate)
            : null,
        });
      }
    } catch (err) {
      console.error('Failed to check message limit:', err);
      setError('メッセージ上限の確認に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLimit();
  }, [fetchLimit]);

  return {
    canSend: data.canSend,
    remaining: data.remaining,
    limit: data.limit,
    isPremium: data.isPremium,
    resetDate: data.resetDate,
    isLoading,
    error,
    refresh: fetchLimit,
  };
}
