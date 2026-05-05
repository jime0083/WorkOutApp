/**
 * 通知サービス（React Native / FCM）
 * プッシュ通知の管理と偽装通知の処理
 */
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';
import { Alert, Platform } from 'react-native';

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

// コールバック登録
let onNotificationCallback: NotificationCallback | null = null;

/**
 * 通知権限をリクエスト
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Notification permission granted');
    } else {
      console.log('Notification permission denied');
    }

    return enabled;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * FCMトークンを取得
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    // APNsトークンを先に取得（iOS必須）
    if (Platform.OS === 'ios') {
      const apnsToken = await messaging().getAPNSToken();
      if (!apnsToken) {
        console.log('APNs token not available yet');
        return null;
      }
    }

    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Failed to get FCM token:', error);
    return null;
  }
}

/**
 * FCMトークンをFirestoreに保存
 */
export async function saveFCMToken(userId: string): Promise<void> {
  try {
    const token = await getFCMToken();
    if (!token) {
      console.log('No FCM token to save');
      return;
    }

    await firestore().collection('users').doc(userId).update({
      fcmToken: token,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    console.log('FCM token saved for user:', userId);
  } catch (error) {
    console.error('Failed to save FCM token:', error);
  }
}

/**
 * FCMトークンをクリア（ログアウト時）
 */
export async function clearFCMToken(userId: string): Promise<void> {
  try {
    await firestore().collection('users').doc(userId).update({
      fcmToken: null,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    await messaging().deleteToken();
    console.log('FCM token cleared for user:', userId);
  } catch (error) {
    console.error('Failed to clear FCM token:', error);
  }
}

/**
 * トークンリフレッシュのリスナーを設定
 */
export function setupTokenRefreshListener(userId: string): () => void {
  return messaging().onTokenRefresh(async (token) => {
    console.log('FCM Token refreshed:', token);
    await firestore().collection('users').doc(userId).update({
      fcmToken: token,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  });
}

/**
 * フォアグラウンド通知のリスナーを設定
 */
export function setupForegroundNotificationListener(): () => void {
  return messaging().onMessage(async (remoteMessage) => {
    console.log('Foreground notification received:', remoteMessage);

    // 偽装通知を表示（アプリがフォアグラウンドの場合）
    const data = remoteMessage.data as NotificationData;
    handleNotificationReceived(data);
  });
}

/**
 * バックグラウンド/終了時の通知ハンドラー
 */
export function setupBackgroundNotificationHandler(): void {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background notification received:', remoteMessage);
    // バックグラウンドでの処理（必要に応じて）
  });
}

/**
 * 通知タップ時のハンドラー（アプリがバックグラウンドから起動）
 */
export function setupNotificationOpenedHandler(
  callback: NotificationCallback
): () => void {
  // アプリがバックグラウンドにある時に通知をタップした場合
  const unsubscribe = messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened app:', remoteMessage);
    const data = remoteMessage.data as NotificationData;
    callback(data);
  });

  // アプリが完全に終了している時に通知をタップした場合
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log('App opened from quit state:', remoteMessage);
        const data = remoteMessage.data as NotificationData;
        callback(data);
      }
    });

  return unsubscribe;
}

/**
 * 通知受信時の処理
 */
function handleNotificationReceived(data: NotificationData): void {
  if (onNotificationCallback) {
    onNotificationCallback(data);
  }
}

/**
 * 通知コールバックを登録
 */
export function setNotificationCallback(callback: NotificationCallback): void {
  onNotificationCallback = callback;
}

/**
 * 通知コールバックを解除
 */
export function clearNotificationCallback(): void {
  onNotificationCallback = null;
}

/**
 * 偽装通知からの実際のデータを取得
 * アプリ内で通知の実際の内容を表示するために使用
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
 */
export async function initializeNotifications(
  userId: string,
  onNotificationTap: NotificationCallback
): Promise<void> {
  // 権限をリクエスト
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('Notification permission not granted');
    return;
  }

  // FCMトークンを保存
  await saveFCMToken(userId);

  // リスナーを設定
  setupTokenRefreshListener(userId);
  setupForegroundNotificationListener();
  setupBackgroundNotificationHandler();
  setupNotificationOpenedHandler(onNotificationTap);

  console.log('Notification service initialized');
}

/**
 * 通知サービスをクリーンアップ（ログアウト時）
 */
export async function cleanupNotifications(userId: string): Promise<void> {
  await clearFCMToken(userId);
  clearNotificationCallback();
}
