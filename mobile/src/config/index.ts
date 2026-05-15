/**
 * 設定エクスポート
 *
 * firebase.config.local.ts が存在する場合はそちらを使用
 * 存在しない場合はテンプレート（firebase.config.ts）を使用
 */

// ローカル設定ファイルからエクスポート
// 開発者は firebase.config.local.ts を作成する必要があります
export { firebaseConfig, FIREBASE_PROJECT_ID } from './firebase.config.local';
