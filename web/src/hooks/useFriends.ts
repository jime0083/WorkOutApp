/**
 * useFriends - 友達関連フック
 */
import { useState, useEffect, useCallback } from 'react';
import type { FriendWithProfile, FriendRequest } from '../types/friendship';
import {
  subscribeToFriends,
  subscribeToFriendRequests,
  subscribeToSentFriendRequests,
  subscribeToBlockedUsers,
  sendFriendRequest as sendRequest,
  respondToFriendRequest as respondToRequest,
  blockUser as blockUserApi,
} from '../services/friend';

interface UseFriendsOptions {
  userId: string;
}

interface UseFriendsReturn {
  // 友達一覧
  friends: FriendWithProfile[];
  friendsLoading: boolean;

  // 受信した友達申請
  receivedRequests: FriendRequest[];
  receivedRequestsLoading: boolean;

  // 送信した友達申請
  sentRequests: FriendRequest[];
  sentRequestsLoading: boolean;

  // ブロックユーザー
  blockedUsers: FriendWithProfile[];
  blockedUsersLoading: boolean;

  // 未読申請数
  pendingRequestCount: number;

  // アクション
  sendFriendRequest: (targetVisibleUserId: string) => Promise<boolean>;
  acceptFriendRequest: (friendshipId: string) => Promise<boolean>;
  rejectFriendRequest: (friendshipId: string) => Promise<boolean>;
  blockUser: (targetUserId: string) => Promise<boolean>;
  unblockUser: (targetUserId: string) => Promise<boolean>;

  // エラー
  error: string | null;
}

export function useFriends({ userId }: UseFriendsOptions): UseFriendsReturn {
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [receivedRequestsLoading, setReceivedRequestsLoading] = useState(true);

  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [sentRequestsLoading, setSentRequestsLoading] = useState(true);

  const [blockedUsers, setBlockedUsers] = useState<FriendWithProfile[]>([]);
  const [blockedUsersLoading, setBlockedUsersLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // 友達一覧を購読
  useEffect(() => {
    if (!userId) {
      setFriends([]);
      setFriendsLoading(false);
      return;
    }

    setFriendsLoading(true);
    const unsubscribe = subscribeToFriends(userId, (newFriends) => {
      setFriends(newFriends);
      setFriendsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // 受信した友達申請を購読
  useEffect(() => {
    if (!userId) {
      setReceivedRequests([]);
      setReceivedRequestsLoading(false);
      return;
    }

    setReceivedRequestsLoading(true);
    const unsubscribe = subscribeToFriendRequests(userId, (newRequests) => {
      setReceivedRequests(newRequests);
      setReceivedRequestsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // 送信した友達申請を購読
  useEffect(() => {
    if (!userId) {
      setSentRequests([]);
      setSentRequestsLoading(false);
      return;
    }

    setSentRequestsLoading(true);
    const unsubscribe = subscribeToSentFriendRequests(userId, (newRequests) => {
      setSentRequests(newRequests);
      setSentRequestsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // ブロックユーザーを購読
  useEffect(() => {
    if (!userId) {
      setBlockedUsers([]);
      setBlockedUsersLoading(false);
      return;
    }

    setBlockedUsersLoading(true);
    const unsubscribe = subscribeToBlockedUsers(userId, (newBlocked) => {
      setBlockedUsers(newBlocked);
      setBlockedUsersLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // 友達申請を送信
  const sendFriendRequest = useCallback(
    async (targetVisibleUserId: string): Promise<boolean> => {
      setError(null);
      const result = await sendRequest(targetVisibleUserId);
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result.success;
    },
    []
  );

  // 友達申請を承認
  const acceptFriendRequest = useCallback(
    async (friendshipId: string): Promise<boolean> => {
      setError(null);
      const result = await respondToRequest(friendshipId, 'accept');
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result.success;
    },
    []
  );

  // 友達申請を拒否
  const rejectFriendRequest = useCallback(
    async (friendshipId: string): Promise<boolean> => {
      setError(null);
      const result = await respondToRequest(friendshipId, 'reject');
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result.success;
    },
    []
  );

  // ユーザーをブロック
  const blockUser = useCallback(
    async (targetUserId: string): Promise<boolean> => {
      setError(null);
      const result = await blockUserApi(targetUserId, 'block');
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result.success;
    },
    []
  );

  // ユーザーのブロックを解除
  const unblockUser = useCallback(
    async (targetUserId: string): Promise<boolean> => {
      setError(null);
      const result = await blockUserApi(targetUserId, 'unblock');
      if (!result.success && result.error) {
        setError(result.error);
      }
      return result.success;
    },
    []
  );

  return {
    friends,
    friendsLoading,
    receivedRequests,
    receivedRequestsLoading,
    sentRequests,
    sentRequestsLoading,
    blockedUsers,
    blockedUsersLoading,
    pendingRequestCount: receivedRequests.length,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    blockUser,
    unblockUser,
    error,
  };
}
