/**
 * Firebase設定テンプレート
 *
 * このファイルはテンプレートです。実際の設定値は firebase.config.local.ts に記載してください。
 *
 * セットアップ手順:
 * 1. このファイルをコピーして firebase.config.local.ts を作成
 * 2. GoogleService-Info.plist の値を firebase.config.local.ts に設定
 * 3. firebase.config.local.ts は .gitignore に含まれているためコミットされません
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// テンプレート設定（実際の値は firebase.config.local.ts に記載）
export const firebaseConfig: FirebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// プロジェクトID
export const FIREBASE_PROJECT_ID = 'YOUR_PROJECT_ID';
