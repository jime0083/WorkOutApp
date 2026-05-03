/**
 * Firebase 初期化設定
 */
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFunctions } from 'firebase/functions';

// Firebase設定
const firebaseConfig = {
  apiKey: 'AIzaSyCZrxTiHGqQVp9HBJwYCXqXZ55n89im6SY',
  authDomain: 'workoutapp-72355.firebaseapp.com',
  projectId: 'workoutapp-72355',
  storageBucket: 'workoutapp-72355.firebasestorage.app',
  messagingSenderId: '1029420388528',
  appId: '1:1029420388528:web:f5c2b7de8c067c21a96b75',
  measurementId: 'G-TQKL16TV3D',
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// 各サービスのインスタンス
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'asia-northeast1');

// Analytics（ブラウザでのみ有効）
export const initAnalytics = async () => {
  if (await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};

export { app };
