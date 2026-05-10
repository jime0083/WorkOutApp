/**
 * 通知サービス（一時的なスタブ実装）
 *
 * NOTE: Firebase JS SDKはモバイルプッシュ通知をサポートしていません。
 * 将来的にExpo Push Notifications、OneSignal、または
 * react-native-firebase互換性が解決された後に実装を追加してください。
 */
// import { Alert, Platform } from 'react-native'; // 未使用（スタブ実装のため）
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestoreInstance } from './firebase';

// 通知データ型
export interface NotificationData {
  type?: 'new_message' | 'friend_request' | 'friend_accepted';
  conversationId?: string;
  senderId?: string;
  friendshipId?: string;
  accepterId?: string;
  actualSenderName?: string;
  actualMessage?: string;
  actualAccepterName?: string;
}

// 通知コールバック型
export type NotificationCallback = (data: NotificationData) => void;

// コールバック登録（スタブ実装のため未使用だが将来の実装のために保持）
let _onNotificationCallback: NotificationCallback | null = null;

/**
 * 通知権限をリクエスト
 * NOTE: 現在は常にtrueを返す（スタブ）
 */
export async function requestNotificationPermission(): Promise<boolean> {
  console.log('Push notifications are currently disabled (Firebase JS SDK limitation)');
  return true;
}

/**
 * FCMトークンを取得
 * NOTE: 現在はnullを返す（スタブ）
 */
export async function getFCMToken(): Promise<string | null> {
  console.log('FCM token not available (Firebase JS SDK limitation)');
  return null;
}

/**
 * FCMトークンをFirestoreに保存
 * NOTE: 現在は何もしない（スタブ）
 */
export async function saveFCMToken(_userId: string): Promise<void> {
  console.log('FCM token saving skipped (Firebase JS SDK limitation)');
}

/**
 * FCMトークンをクリア（ログアウト時）
 */
export async function clearFCMToken(userId: string): Promise<void> {
  try {
    const db = getFirestoreInstance();
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: null,
      updatedAt: serverTimestamp(),
    });
    console.log('FCM token cleared for user:', userId);
  } catch (error) {
    console.error('Failed to clear FCM token:', error);
  }
}

/**
 * トークンリフレッシュのリスナーを設定
 * NOTE: 現在は何もしない（スタブ）
 */
export function setupTokenRefreshListener(_userId: string): () => void {
  return () => {};
}

/**
 * フォアグラウンド通知のリスナーを設定
 * NOTE: 現在は何もしない（スタブ）
 */
export function setupForegroundNotificationListener(): () => void {
  return () => {};
}

/**
 * バックグラウンド/終了時の通知ハンドラー
 * NOTE: 現在は何もしない（スタブ）
 */
export function setupBackgroundNotificationHandler(): void {
  // スタブ
}

/**
 * 通知タップ時のハンドラー（アプリがバックグラウンドから起動）
 * NOTE: 現在は何もしない（スタブ）
 */
export function setupNotificationOpenedHandler(
  _callback: NotificationCallback
): () => void {
  return () => {};
}

/**
 * 通知コールバックを登録
 */
export function setNotificationCallback(callback: NotificationCallback): void {
  _onNotificationCallback = callback;
}

/**
 * 通知コールバックを解除
 */
export function clearNotificationCallback(): void {
  _onNotificationCallback = null;
}

/**
 * 通知コールバックを取得（スタブ実装のため常にnull）
 */
export function getNotificationCallback(): NotificationCallback | null {
  return _onNotificationCallback;
}

/**
 * 偽装通知からの実際のデータを取得
 */
export function getActualNotificationContent(data: NotificationData): {
  title: string;
  body: string;
} {
  switch (data.type) {
    case 'new_message':
      return {
        title: data.actualSenderName || '友だち',
        body: data.actualMessage || '新しいメッセージ',
      };
    case 'friend_request':
      return {
        title: '友だち申請',
        body: `${data.actualSenderName || 'ユーザー'}さんから友だち申請が届きました`,
      };
    case 'friend_accepted':
      return {
        title: '友だち申請承認',
        body: `${data.actualAccepterName || 'ユーザー'}さんが友だち申請を承認しました`,
      };
    default:
      return {
        title: '通知',
        body: '新しい通知があります',
      };
  }
}

/**
 * 通知サービスを初期化
 * NOTE: 現在はプッシュ通知は無効化されています
 */
export async function initializeNotifications(
  _userId: string,
  _onNotificationTap: NotificationCallback
): Promise<void> {
  console.log('Push notifications are disabled (Firebase JS SDK limitation)');
  console.log('Consider using Expo Push Notifications or OneSignal for push notifications');
}

/**
 * 通知サービスをクリーンアップ（ログアウト時）
 */
export async function cleanupNotifications(userId: string): Promise<void> {
  await clearFCMToken(userId);
  clearNotificationCallback();
}
