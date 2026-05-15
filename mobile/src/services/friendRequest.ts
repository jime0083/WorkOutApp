/**
 * 友達リクエストサービス
 * 招待コードによる友達追加機能
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getFirestoreInstance } from './firebase';

// 友達リクエストのステータス
export type FriendRequestStatus = 'pending' | 'accepted' | 'blocked';

// 友達リクエスト
export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUserNickname: string;
  fromUserProfileImage: string | null;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

// 会話の型
export interface Conversation {
  id: string;
  participantIds: string[];
  status: 'pending' | 'active' | 'blocked';
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 招待コードからユーザーを検索
 */
export async function findUserByInviteCode(inviteCode: string): Promise<{
  userId: string;
  nickname: string;
  profileImageUrl: string | null;
} | null> {
  const db = getFirestoreInstance();
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('inviteCode', '==', inviteCode.toUpperCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  return {
    userId: userDoc.id,
    nickname: userData.nickname || 'Unknown',
    profileImageUrl: userData.profileImageUrl || null,
  };
}

/**
 * 友達リクエストを送信（会話を作成）
 */
export async function sendFriendRequest(
  fromUserId: string,
  toUserId: string,
  fromUserNickname: string,
  fromUserProfileImage: string | null
): Promise<{ success: boolean; conversationId?: string; error?: string }> {
  const db = getFirestoreInstance();

  // 自分自身には送れない
  if (fromUserId === toUserId) {
    return { success: false, error: 'cannot_add_self' };
  }

  // 既存の会話をチェック
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participantIds', 'array-contains', fromUserId)
  );
  const snapshot = await getDocs(q);

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    if (data.participantIds.includes(toUserId)) {
      // 既に会話が存在する
      return { success: false, error: 'already_exists' };
    }
  }

  // 新しい会話を作成（pending状態）
  const conversationId = `${fromUserId}_${toUserId}`;
  const conversationRef = doc(db, 'conversations', conversationId);

  await setDoc(conversationRef, {
    participantIds: [fromUserId, toUserId],
    status: 'pending',
    requestFromUserId: fromUserId,
    requestFromNickname: fromUserNickname,
    requestFromProfileImage: fromUserProfileImage,
    lastMessage: '',
    lastMessageAt: serverTimestamp(),
    unreadCount: { [fromUserId]: 0, [toUserId]: 1 },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { success: true, conversationId };
}

/**
 * 友達リクエストを承認
 */
export async function acceptFriendRequest(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  const db = getFirestoreInstance();
  const conversationRef = doc(db, 'conversations', conversationId);

  try {
    await updateDoc(conversationRef, {
      status: 'active',
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error accepting friend request:', error);
    return { success: false, error: 'update_failed' };
  }
}

/**
 * 友達リクエストをブロック
 */
export async function blockFriendRequest(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  const db = getFirestoreInstance();
  const conversationRef = doc(db, 'conversations', conversationId);

  try {
    await updateDoc(conversationRef, {
      status: 'blocked',
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error('Error blocking friend request:', error);
    return { success: false, error: 'update_failed' };
  }
}

/**
 * 会話を削除
 */
export async function deleteConversation(
  conversationId: string
): Promise<{ success: boolean; error?: string }> {
  const db = getFirestoreInstance();
  const conversationRef = doc(db, 'conversations', conversationId);

  try {
    await deleteDoc(conversationRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return { success: false, error: 'delete_failed' };
  }
}

/**
 * ユーザーの会話一覧をリアルタイムで監視
 */
export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const db = getFirestoreInstance();
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participantIds', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        participantIds: data.participantIds,
        status: data.status || 'active',
        lastMessage: data.lastMessage || '',
        lastMessageAt: data.lastMessageAt?.toDate() || new Date(),
        unreadCount: data.unreadCount || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });

    // 最新のメッセージ順でソート
    conversations.sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
    );

    callback(conversations);
  });
}

/**
 * 自分の招待コードを取得
 */
export async function getMyInviteCode(userId: string): Promise<string | null> {
  const db = getFirestoreInstance();
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    return null;
  }

  return userDoc.data().inviteCode || null;
}
