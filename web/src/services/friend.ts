/**
 * 友達サービス
 */
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import type { FriendWithProfile, FriendRequest, FriendRequestResult } from '../types/friendship';
import type { User } from '../types/user';

/**
 * 友達一覧を取得（リアルタイム）
 */
export function subscribeToFriends(
  userId: string,
  callback: (friends: FriendWithProfile[]) => void
): () => void {
  const q = query(
    collection(db, 'friendships'),
    where('memberIds', 'array-contains', userId),
    where('status', '==', 'accepted'),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const friends: FriendWithProfile[] = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const friendId = data.memberIds.find((id: string) => id !== userId);

      if (friendId) {
        // 友達のプロフィールを取得
        const userDoc = await getDoc(doc(db, 'users', friendId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          friends.push({
            friendshipId: docSnapshot.id,
            friendId,
            visibleUserId: userData.visibleUserId,
            nickname: userData.nickname,
            profileImageUrl: userData.profileImageUrl,
            isBlocked: false,
            blockedByMe: false,
          });
        }
      }
    }

    callback(friends);
  });
}

/**
 * 受信した友達申請一覧を取得（リアルタイム）
 */
export function subscribeToFriendRequests(
  userId: string,
  callback: (requests: FriendRequest[]) => void
): () => void {
  const q = query(
    collection(db, 'friendships'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const requests: FriendRequest[] = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();

      // 申請者のプロフィールを取得
      const userDoc = await getDoc(doc(db, 'users', data.requesterId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        requests.push({
          friendshipId: docSnapshot.id,
          requesterId: data.requesterId,
          requesterProfile: {
            visibleUserId: userData.visibleUserId,
            nickname: userData.nickname,
            profileImageUrl: userData.profileImageUrl,
          },
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      }
    }

    callback(requests);
  });
}

/**
 * 送信した友達申請一覧を取得（リアルタイム）
 */
export function subscribeToSentFriendRequests(
  userId: string,
  callback: (requests: FriendRequest[]) => void
): () => void {
  const q = query(
    collection(db, 'friendships'),
    where('requesterId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const requests: FriendRequest[] = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();

      // 受信者のプロフィールを取得
      const userDoc = await getDoc(doc(db, 'users', data.receiverId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        requests.push({
          friendshipId: docSnapshot.id,
          requesterId: data.receiverId, // この場合は受信者のID
          requesterProfile: {
            visibleUserId: userData.visibleUserId,
            nickname: userData.nickname,
            profileImageUrl: userData.profileImageUrl,
          },
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      }
    }

    callback(requests);
  });
}

/**
 * ブロック一覧を取得（リアルタイム）
 */
export function subscribeToBlockedUsers(
  userId: string,
  callback: (blocked: FriendWithProfile[]) => void
): () => void {
  const q = query(
    collection(db, 'friendships'),
    where('memberIds', 'array-contains', userId),
    where('status', '==', 'blocked'),
    where('blockedBy', '==', userId)
  );

  return onSnapshot(q, async (snapshot) => {
    const blocked: FriendWithProfile[] = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const blockedUserId = data.memberIds.find((id: string) => id !== userId);

      if (blockedUserId) {
        const userDoc = await getDoc(doc(db, 'users', blockedUserId));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          blocked.push({
            friendshipId: docSnapshot.id,
            friendId: blockedUserId,
            visibleUserId: userData.visibleUserId,
            nickname: userData.nickname,
            profileImageUrl: userData.profileImageUrl,
            isBlocked: true,
            blockedByMe: true,
          });
        }
      }
    }

    callback(blocked);
  });
}

/**
 * 友達申請を送信
 */
export async function sendFriendRequest(
  targetVisibleUserId: string
): Promise<FriendRequestResult> {
  try {
    const sendRequestFn = httpsCallable<
      { targetVisibleUserId: string },
      FriendRequestResult
    >(functions, 'sendFriendRequest');

    const result = await sendRequestFn({ targetVisibleUserId });
    return result.data;
  } catch (error) {
    console.error('Failed to send friend request:', error);
    return {
      success: false,
      error: '友達申請の送信に失敗しました',
    };
  }
}

/**
 * 友達申請に応答
 */
export async function respondToFriendRequest(
  friendshipId: string,
  action: 'accept' | 'reject'
): Promise<{ success: boolean; error?: string }> {
  try {
    const respondFn = httpsCallable<
      { friendshipId: string; action: 'accept' | 'reject' },
      { success: boolean; error?: string }
    >(functions, 'respondToFriendRequest');

    const result = await respondFn({ friendshipId, action });
    return result.data;
  } catch (error) {
    console.error('Failed to respond to friend request:', error);
    return {
      success: false,
      error: '友達申請の応答に失敗しました',
    };
  }
}

/**
 * ユーザーをブロック/ブロック解除
 */
export async function blockUser(
  targetUserId: string,
  action: 'block' | 'unblock'
): Promise<{ success: boolean; error?: string }> {
  try {
    const blockFn = httpsCallable<
      { targetUserId: string; action: 'block' | 'unblock' },
      { success: boolean; error?: string }
    >(functions, 'blockUser');

    const result = await blockFn({ targetUserId, action });
    return result.data;
  } catch (error) {
    console.error('Failed to block/unblock user:', error);
    return {
      success: false,
      error: 'ブロック操作に失敗しました',
    };
  }
}

/**
 * ユーザーをvisibleUserIdで検索
 */
export async function searchUserByVisibleUserId(
  visibleUserId: string
): Promise<User | null> {
  try {
    const q = query(
      collection(db, 'users'),
      where('visibleUserId', '==', visibleUserId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as User;
  } catch (error) {
    console.error('Failed to search user:', error);
    return null;
  }
}
