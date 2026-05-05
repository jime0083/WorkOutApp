/**
 * useSubscription - サブスクリプション管理フック
 */
import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import type { PlanType } from '../types/subscription';

interface SubscriptionStatus {
  isPremium: boolean;
  planType: PlanType | null;
  expiryDate: Date | null;
  isLoading: boolean;
  error: string | null;
}

interface UseSubscriptionReturn extends SubscriptionStatus {
  refresh: () => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isPremium: false,
    planType: null,
    expiryDate: null,
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(() => {
    setStatus((prev) => ({ ...prev, isLoading: true }));
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setStatus({
        isPremium: false,
        planType: null,
        expiryDate: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setStatus({
            isPremium: false,
            planType: null,
            expiryDate: null,
            isLoading: false,
            error: null,
          });
          return;
        }

        const userData = snapshot.data();
        setStatus({
          isPremium: userData.subscriptionStatus === 'premium',
          planType: userData.subscriptionPlan || null,
          expiryDate: userData.subscriptionExpiry?.toDate() || null,
          isLoading: false,
          error: null,
        });
      },
      (error) => {
        console.error('Failed to get subscription status:', error);
        setStatus((prev) => ({
          ...prev,
          isLoading: false,
          error: 'サブスクリプション状態の取得に失敗しました',
        }));
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    ...status,
    refresh,
  };
}

/**
 * プレミアム機能かどうかをチェックするユーティリティ
 */
export function usePremiumFeature(): {
  isPremium: boolean;
  isLoading: boolean;
  showUpgradePrompt: () => void;
} {
  const { isPremium, isLoading } = useSubscription();
  const [showPrompt, setShowPrompt] = useState(false);

  const showUpgradePrompt = useCallback(() => {
    if (!isPremium) {
      setShowPrompt(true);
      // 実際のアプリではモーダルやページ遷移を行う
      window.location.href = '/subscription';
    }
  }, [isPremium]);

  return {
    isPremium,
    isLoading,
    showUpgradePrompt,
  };
}
