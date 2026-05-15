/**
 * 未読件数取得サービス
 * 会話の未読件数を取得し、アプリアイコンバッジを更新する
 */
import {
  collection,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { Platform, Linking } from 'react-native';
import { getFirestoreInstance } from './firebase';
import { setAppBadgeCount } from './notification';

/**
 * ユーザーの未読メッセージ合計件数をリアルタイムで監視
 * @param userId ユーザーID
 * @param callback 未読件数が更新された時に呼ばれるコールバック
 * @returns 監視を解除するための関数
 */
export function subscribeToUnreadCount(
  userId: string,
  callback: (count: number) => void
): () => void {
  const db = getFirestoreInstance();
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('participantIds', 'array-contains', userId)
  );

  return onSnapshot(q, (snapshot) => {
    let totalUnread = 0;

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const unreadCount = data.unreadCount || {};
      // 自分の未読件数を加算
      totalUnread += unreadCount[userId] || 0;
    });

    callback(totalUnread);
  });
}

/**
 * 未読件数を監視し、アプリアイコンバッジも自動更新する
 * @param userId ユーザーID
 * @param callback 未読件数が更新された時に呼ばれるコールバック（オプション）
 * @returns 監視を解除するための関数
 */
export function subscribeToUnreadCountWithBadge(
  userId: string,
  callback?: (count: number) => void
): () => void {
  return subscribeToUnreadCount(userId, async (count) => {
    // アプリアイコンバッジを更新
    await setAppBadgeCount(count);

    // コールバックがあれば呼び出す
    if (callback) {
      callback(count);
    }
  });
}

/**
 * App Store のサブスクリプション管理ページを開く
 */
export async function openSubscriptionManagement(): Promise<void> {
  const url = Platform.select({
    ios: 'https://apps.apple.com/account/subscriptions',
    android: 'https://play.google.com/store/account/subscriptions',
    default: 'https://apps.apple.com/account/subscriptions',
  });

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    console.error('Cannot open subscription management URL');
  }
}
