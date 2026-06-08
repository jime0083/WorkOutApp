/**
 * ユーザー削除時トリガー
 * Firebase Authでユーザーが削除された時に関連データを削除
 */
import * as functions from 'firebase-functions';
/**
 * ユーザー削除時のトリガー
 */
export declare const onUserDelete: functions.CloudFunction<import("firebase-admin/auth").UserRecord>;
//# sourceMappingURL=onDelete.d.ts.map