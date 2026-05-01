/**
 * Firebase Admin SDK 初期化
 */
import * as admin from 'firebase-admin';

// Firebase Admin 初期化（1回のみ）
if (!admin.apps.length) {
  admin.initializeApp();
}

// Firestore インスタンス
export const db = admin.firestore();

// Auth インスタンス
export const auth = admin.auth();

// Storage インスタンス
export const storage = admin.storage();

// Messaging インスタンス
export const messaging = admin.messaging();

export { admin };
