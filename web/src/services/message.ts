/**
 * メッセージサービス
 */
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  getDocs,
  getDoc,
  startAfter,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from './firebase';
import type { Message, SendMessageResult } from '../types/message';
import type { ConversationWithProfile } from '../types/conversation';
import type { User } from '../types/user';

// ページサイズ
const PAGE_SIZE = 30;

/**
 * 会話一覧を取得（リアルタイム）
 */
export function subscribeToConversations(
  userId: string,
  callback: (conversations: ConversationWithProfile[]) => void
): () => void {
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, async (snapshot) => {
    const conversations: ConversationWithProfile[] = [];

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const otherUserId = data.participantIds.find((id: string) => id !== userId);

      // 相手のプロフィールを取得
      let partnerProfile: User | null = null;
      if (otherUserId) {
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        if (userDoc.exists()) {
          partnerProfile = userDoc.data() as User;
        }
      }

      conversations.push({
        id: docSnapshot.id,
        participantIds: data.participantIds,
        lastMessage: data.lastMessage
          ? {
              content: data.lastMessage.content,
              senderId: data.lastMessage.senderId,
              createdAt: data.lastMessage.createdAt?.toDate() || new Date(),
              type: data.lastMessage.type,
            }
          : null,
        unreadCount: data.unreadCount || {},
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        partnerProfile: partnerProfile
          ? {
              visibleUserId: partnerProfile.visibleUserId,
              nickname: partnerProfile.nickname,
              profileImageUrl: partnerProfile.profileImageUrl,
            }
          : {
              visibleUserId: '',
              nickname: '不明なユーザー',
              profileImageUrl: null,
            },
        myUnreadCount: data.unreadCount?.[userId] || 0,
      });
    }

    callback(conversations);
  });
}

/**
 * メッセージ一覧を取得（リアルタイム）
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy('createdAt', 'desc'),
    limit(PAGE_SIZE)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        conversationId,
        senderId: data.senderId,
        type: data.type,
        content: data.content,
        thumbnailUrl: data.thumbnailUrl || null,
        isRead: data.isRead || false,
        readAt: data.readAt?.toDate() || null,
        isDeleted: data.isDeleted || false,
        deletedAt: data.deletedAt?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });

    // 時系列順に並べ替え（新しい順から古い順を逆にする）
    callback(messages.reverse());
  });
}

/**
 * 過去のメッセージを読み込む
 */
export async function loadMoreMessages(
  conversationId: string,
  lastMessage: Message
): Promise<Message[]> {
  const lastDoc = await getDoc(
    doc(db, `conversations/${conversationId}/messages`, lastMessage.id)
  );

  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    orderBy('createdAt', 'desc'),
    startAfter(lastDoc),
    limit(PAGE_SIZE)
  );

  const snapshot = await getDocs(q);
  const messages: Message[] = snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return {
      id: docSnapshot.id,
      conversationId,
      senderId: data.senderId,
      type: data.type,
      content: data.content,
      thumbnailUrl: data.thumbnailUrl || null,
      isRead: data.isRead || false,
      readAt: data.readAt?.toDate() || null,
      isDeleted: data.isDeleted || false,
      deletedAt: data.deletedAt?.toDate() || null,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  });

  return messages.reverse();
}

/**
 * テキストメッセージを送信
 */
export async function sendTextMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<SendMessageResult> {
  try {
    const messageData = {
      senderId,
      type: 'text',
      content,
      thumbnailUrl: null,
      isRead: false,
      readAt: null,
      isDeleted: false,
      deletedAt: null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, `conversations/${conversationId}/messages`),
      messageData
    );

    // メッセージカウントを増加（無料ユーザーの場合）
    try {
      const incrementFn = httpsCallable(functions, 'incrementMessageCount');
      await incrementFn();
    } catch (error) {
      console.warn('Failed to increment message count:', error);
    }

    return {
      success: true,
      messageId: docRef.id,
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    return {
      success: false,
      error: 'メッセージの送信に失敗しました',
    };
  }
}

/**
 * 画像メッセージを送信
 */
export async function sendImageMessage(
  conversationId: string,
  senderId: string,
  file: File
): Promise<SendMessageResult> {
  try {
    // 画像をStorageにアップロード
    const fileName = `${Date.now()}_${file.name}`;
    const storageRef = ref(storage, `messages/${conversationId}/images/${fileName}`);
    await uploadBytes(storageRef, file);
    const imageUrl = await getDownloadURL(storageRef);

    const messageData = {
      senderId,
      type: 'image',
      content: imageUrl,
      thumbnailUrl: null,
      isRead: false,
      readAt: null,
      isDeleted: false,
      deletedAt: null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, `conversations/${conversationId}/messages`),
      messageData
    );

    return {
      success: true,
      messageId: docRef.id,
    };
  } catch (error) {
    console.error('Failed to send image:', error);
    return {
      success: false,
      error: '画像の送信に失敗しました',
    };
  }
}

/**
 * 動画メッセージを送信
 */
export async function sendVideoMessage(
  conversationId: string,
  senderId: string,
  file: File,
  thumbnailBlob?: Blob
): Promise<SendMessageResult> {
  try {
    const fileName = `${Date.now()}_${file.name}`;

    // 動画をアップロード
    const videoRef = ref(storage, `messages/${conversationId}/videos/${fileName}`);
    await uploadBytes(videoRef, file);
    const videoUrl = await getDownloadURL(videoRef);

    // サムネイルをアップロード（あれば）
    let thumbnailUrl = null;
    if (thumbnailBlob) {
      const thumbRef = ref(
        storage,
        `messages/${conversationId}/thumbnails/${fileName}.jpg`
      );
      await uploadBytes(thumbRef, thumbnailBlob);
      thumbnailUrl = await getDownloadURL(thumbRef);
    }

    const messageData = {
      senderId,
      type: 'video',
      content: videoUrl,
      thumbnailUrl,
      isRead: false,
      readAt: null,
      isDeleted: false,
      deletedAt: null,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, `conversations/${conversationId}/messages`),
      messageData
    );

    return {
      success: true,
      messageId: docRef.id,
    };
  } catch (error) {
    console.error('Failed to send video:', error);
    return {
      success: false,
      error: '動画の送信に失敗しました',
    };
  }
}

/**
 * メッセージを削除（論理削除）
 */
export async function deleteMessage(
  conversationId: string,
  messageId: string
): Promise<boolean> {
  try {
    await updateDoc(doc(db, `conversations/${conversationId}/messages`, messageId), {
      isDeleted: true,
      deletedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to delete message:', error);
    return false;
  }
}

/**
 * メッセージを既読にする
 */
export async function markMessageAsRead(
  conversationId: string,
  messageId: string
): Promise<boolean> {
  try {
    await updateDoc(doc(db, `conversations/${conversationId}/messages`, messageId), {
      isRead: true,
      readAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Failed to mark message as read:', error);
    return false;
  }
}

/**
 * 会話の未読カウントをリセット
 */
export async function resetUnreadCount(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`unreadCount.${userId}`]: 0,
    });
    return true;
  } catch (error) {
    console.error('Failed to reset unread count:', error);
    return false;
  }
}

/**
 * 会話を作成または取得
 */
export async function getOrCreateConversation(
  userId: string,
  partnerId: string
): Promise<string> {
  // 既存の会話を検索
  const q = query(
    collection(db, 'conversations'),
    where('participantIds', 'array-contains', userId)
  );

  const snapshot = await getDocs(q);
  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    if (data.participantIds.includes(partnerId)) {
      return docSnapshot.id;
    }
  }

  // 新規会話を作成
  const conversationData = {
    participantIds: [userId, partnerId],
    lastMessage: null,
    unreadCount: {
      [userId]: 0,
      [partnerId]: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'conversations'), conversationData);
  return docRef.id;
}

/**
 * メッセージを検索
 */
export async function searchMessages(
  conversationId: string,
  searchQuery: string
): Promise<Message[]> {
  // Firestoreは全文検索に対応していないため、
  // クライアントサイドでフィルタリング
  // 本番環境ではAlgoliaなどの検索サービスを使用することを推奨

  const q = query(
    collection(db, `conversations/${conversationId}/messages`),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc'),
    limit(100)
  );

  const snapshot = await getDocs(q);
  const messages: Message[] = [];

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    if (
      data.type === 'text' &&
      data.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      messages.push({
        id: docSnapshot.id,
        conversationId,
        senderId: data.senderId,
        type: data.type,
        content: data.content,
        thumbnailUrl: data.thumbnailUrl || null,
        isRead: data.isRead || false,
        readAt: data.readAt?.toDate() || null,
        isDeleted: data.isDeleted || false,
        deletedAt: data.deletedAt?.toDate() || null,
        createdAt: data.createdAt?.toDate() || new Date(),
      });
    }
  });

  return messages;
}
