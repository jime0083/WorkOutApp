/**
 * Firebase 初期化設定（Firebase JS SDK）
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';

// Firebase設定
const firebaseConfig = {
  apiKey: 'AIzaSyBSVoJYRvGiGCwR4qT7WZX2JMZA8DRXNxc',
  authDomain: 'workoutapp-72355.firebaseapp.com',
  projectId: 'workoutapp-72355',
  storageBucket: 'workoutapp-72355.appspot.com',
  messagingSenderId: '1055988089508',
  appId: '1:1055988089508:ios:a1b2c3d4e5f6g7h8',
};

// プロジェクト情報
export const FIREBASE_PROJECT_ID = 'workoutapp-72355';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let functions: Functions | null = null;

/**
 * Firebase初期化
 */
export const initializeFirebase = (): FirebaseApp => {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  return app;
};

/**
 * Firebase Auth インスタンス取得
 */
export const getAuthInstance = (): Auth => {
  if (!auth) {
    const firebaseApp = app || initializeFirebase();
    auth = getAuth(firebaseApp);
  }
  return auth;
};

/**
 * Firestore インスタンス取得
 */
export const getFirestoreInstance = (): Firestore => {
  if (!firestore) {
    const firebaseApp = app || initializeFirebase();
    firestore = getFirestore(firebaseApp);
  }
  return firestore;
};

/**
 * Cloud Functions インスタンス取得
 */
export const getFunctionsInstance = (): Functions => {
  if (!functions) {
    const firebaseApp = app || initializeFirebase();
    functions = getFunctions(firebaseApp, 'asia-northeast1');
  }
  return functions;
};
