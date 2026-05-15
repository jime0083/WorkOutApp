/**
 * 通知サービス
 *
 * NOTE: Firebase JS SDKはモバイルプッシュ通知をサポートしていません。
 * プッシュ通知は将来的にExpo Push Notifications、OneSignal等で実装予定。
 * 現在はnotifeeを使用してバッジと通知権限のみ対応。
 */
import { Platform } from 'react-native';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
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
 * 通知権限のステータス
 */
export type NotificationPermissionStatus =
  | 'granted'        // 許可済み
  | 'denied'         // 拒否済み
  | 'not_determined' // 未決定
  | 'provisional';   // 仮許可（iOS）

/**
 * 通知権限をリクエスト
 * バッジ表示のために必要
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const settings = await notifee.requestPermission({
      sound: true,
      badge: true,
      alert: true,
    });

    const granted =
      settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

    if (__DEV__) {
      console.log('[Notification] Permission request result:', granted);
    }

    return granted;
  } catch (error) {
    console.error('[Notification] Permission request failed:', error);
    return false;
  }
}

/**
 * 現在の通知権限ステータスを取得
 */
export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  try {
    const settings = await notifee.getNotificationSettings();

    switch (settings.authorizationStatus) {
      case AuthorizationStatus.AUTHORIZED:
        return 'granted';
      case AuthorizationStatus.DENIED:
        return 'denied';
      case AuthorizationStatus.PROVISIONAL:
        return 'provisional';
      case AuthorizationStatus.NOT_DETERMINED:
      default:
        return 'not_determined';
    }
  } catch (error) {
    console.error('[Notification] Failed to get permission status:', error);
    return 'not_determined';
  }
}

/**
 * 通知権限が許可されているか確認
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const status = await getNotificationPermissionStatus();
  return status === 'granted' || status === 'provisional';
}

/**
 * アプリアイコンバッジを設定
 * @param count バッジに表示する件数（0で非表示）
 */
export async function setAppBadgeCount(count: number): Promise<void> {
  try {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      if (__DEV__) {
        console.log('[Notification] No permission for badge');
      }
      return;
    }

    await notifee.setBadgeCount(count);

    if (__DEV__) {
      console.log(`[Notification] Badge count set to: ${count}`);
    }
  } catch (error) {
    console.error('[Notification] Failed to set badge count:', error);
  }
}

/**
 * アプリアイコンバッジをクリア
 */
export async function clearAppBadge(): Promise<void> {
  await setAppBadgeCount(0);
}

/**
 * 通知チャンネルを作成（Android用）
 */
export async function createNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: 4, // HIGH
    });
  } catch (error) {
    console.error('[Notification] Failed to create channel:', error);
  }
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
 * NOTE: プッシュ通知は無効化されていますが、バッジ機能は有効です
 */
export async function initializeNotifications(
  _userId: string,
  _onNotificationTap: NotificationCallback
): Promise<void> {
  // 通知チャンネルを作成（Android）
  await createNotificationChannel();

  console.log('Push notifications are disabled (Firebase JS SDK limitation)');
  console.log('Badge functionality is enabled via notifee');
}

/**
 * 通知サービスをクリーンアップ（ログアウト時）
 */
export async function cleanupNotifications(userId: string): Promise<void> {
  await clearFCMToken(userId);
  clearNotificationCallback();
}
