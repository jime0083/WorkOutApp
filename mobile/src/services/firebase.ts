/**
 * Firebase 初期化設定（React Native用）
 */
import { initializeApp } from '@react-native-firebase/app';

// Firebase設定（GoogleService-Info.plistから自動読み込み）
// React Native Firebaseは GoogleService-Info.plist を自動的に読み込むため
// 明示的な設定は不要

// 各サービスのインポート（必要に応じて追加）
// import auth from '@react-native-firebase/auth';
// import firestore from '@react-native-firebase/firestore';
// import storage from '@react-native-firebase/storage';
// import messaging from '@react-native-firebase/messaging';

// プロジェクト情報（参照用）
export const FIREBASE_PROJECT_ID = 'workoutapp-72355';

// Firebase初期化確認
export const initializeFirebase = () => {
  // React Native Firebaseは自動初期化されるため、
  // この関数は確認用として使用
  return true;
};
