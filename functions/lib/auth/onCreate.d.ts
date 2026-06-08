/**
 * ユーザー作成時トリガー
 * Firebase Authでユーザーが作成された時にFirestoreにユーザードキュメントを作成
 */
import * as functions from 'firebase-functions';
/**
 * ユーザー作成時のトリガー
 */
export declare const onUserCreate: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
//# sourceMappingURL=onCreate.d.ts.map