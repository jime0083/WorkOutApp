/**
 * sendPushNotification - FCM プッシュ通知送信
 */
import { getMessaging } from 'firebase-admin/messaging';
import { db } from '../utils/firebase';

const messaging = getMessaging();

// 通知タイプ
export type NotificationType =
  | 'new_message'
  | 'friend_request'
  | 'friend_accepted';

// 通知データ
export interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

// ユーザーの言語設定とFCMトークンを取得
async function getUserNotificationInfo(
  userId: string
): Promise<{ fcmToken: string | null; lang: string }> {
  const userDoc = await db.collection('users').doc(userId).get();

  if (!userDoc.exists) {
    return { fcmToken: null, lang: 'ja' };
  }

  const userData = userDoc.data();
  return {
    fcmToken: userData?.fcmToken || null,
    lang: userData?.language || 'ja',
  };
}

/**
 * 単一ユーザーにプッシュ通知を送信
 */
export async function sendPushNotification(
  userId: string,
  notification: NotificationData
): Promise<boolean> {
  try {
    const { fcmToken } = await getUserNotificationInfo(userId);

    if (!fcmToken) {
      console.log(`No FCM token for user: ${userId}`);
      return false;
    }

    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
      apns: {
        payload: {
          aps: {
            alert: {
              title: notification.title,
              body: notification.body,
            },
            sound: 'default',
            badge: 1,
          },
        },
      },
    };

    await messaging.send(message);
    console.log(`Push notification sent to user: ${userId}`);
    return true;
  } catch (error) {
    console.error(`Failed to send push notification to user: ${userId}`, error);

    // トークンが無効な場合は削除
    const errorCode = (error as { code?: string }).code;
    if (
      errorCode === 'messaging/invalid-registration-token' ||
      errorCode === 'messaging/registration-token-not-registered'
    ) {
      await db.collection('users').doc(userId).update({
        fcmToken: null,
      });
      console.log(`Removed invalid FCM token for user: ${userId}`);
    }

    return false;
  }
}

/**
 * 新着メッセージ通知を送信
 */
export async function sendNewMessageNotification(
  receiverId: string,
  senderId: string,
  messageContent: string,
  conversationId: string
): Promise<boolean> {
  try {
    // 送信者の情報を取得
    const senderDoc = await db.collection('users').doc(senderId).get();
    const senderName = senderDoc.exists
      ? senderDoc.data()?.nickname || '友だち'
      : '友だち';

    // 受信者の言語設定を取得
    const { lang } = await getUserNotificationInfo(receiverId);

    // 偽装通知: 「アップデートしてください」
    // Health Manager アプリとして通知を偽装
    const disguisedTitle = 'Health Manager';
    const disguisedBody =
      lang === 'en'
        ? 'Please update to the latest version.'
        : 'アップデートしてください';

    return await sendPushNotification(receiverId, {
      type: 'new_message',
      title: disguisedTitle,
      body: disguisedBody,
      data: {
        conversationId,
        senderId,
        // 実際のメッセージ情報（アプリ内で復元用）
        actualSenderName: senderName,
        actualMessage: messageContent.substring(0, 100),
      },
    });
  } catch (error) {
    console.error('Failed to send new message notification:', error);
    return false;
  }
}

/**
 * 友達申請通知を送信
 */
export async function sendFriendRequestNotification(
  receiverId: string,
  senderId: string,
  friendshipId: string
): Promise<boolean> {
  try {
    // 送信者の情報を取得
    const senderDoc = await db.collection('users').doc(senderId).get();
    const senderName = senderDoc.exists
      ? senderDoc.data()?.nickname || 'ユーザー'
      : 'ユーザー';

    // 受信者の言語設定を取得
    const { lang } = await getUserNotificationInfo(receiverId);

    // 偽装通知
    const disguisedTitle = lang === 'en' ? 'Health Tip' : '健康のヒント';
    const disguisedBody =
      lang === 'en'
        ? 'Check your daily activity goal.'
        : '今日のアクティビティ目標を確認しましょう。';

    return await sendPushNotification(receiverId, {
      type: 'friend_request',
      title: disguisedTitle,
      body: disguisedBody,
      data: {
        friendshipId,
        senderId,
        actualSenderName: senderName,
      },
    });
  } catch (error) {
    console.error('Failed to send friend request notification:', error);
    return false;
  }
}

/**
 * 友達申請承認通知を送信
 */
export async function sendFriendAcceptedNotification(
  requesterId: string,
  accepterId: string,
  friendshipId: string
): Promise<boolean> {
  try {
    // 承認者の情報を取得
    const accepterDoc = await db.collection('users').doc(accepterId).get();
    const accepterName = accepterDoc.exists
      ? accepterDoc.data()?.nickname || 'ユーザー'
      : 'ユーザー';

    // 申請者の言語設定を取得
    const { lang } = await getUserNotificationInfo(requesterId);

    // 偽装通知
    const disguisedTitle = lang === 'en' ? 'Goal Achieved!' : '目標達成！';
    const disguisedBody =
      lang === 'en'
        ? 'You reached your daily step goal.'
        : '今日の歩数目標を達成しました。';

    return await sendPushNotification(requesterId, {
      type: 'friend_accepted',
      title: disguisedTitle,
      body: disguisedBody,
      data: {
        friendshipId,
        accepterId,
        actualAccepterName: accepterName,
      },
    });
  } catch (error) {
    console.error('Failed to send friend accepted notification:', error);
    return false;
  }
}
