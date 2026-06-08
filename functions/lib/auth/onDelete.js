"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserDelete = void 0;
/**
 * ユーザー削除時トリガー
 * Firebase Authでユーザーが削除された時に関連データを削除
 */
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("../utils/firebase");
/**
 * ユーザー削除時のトリガー
 */
exports.onUserDelete = functions.auth.user().onDelete(async (user) => {
    console.log(`Deleting user data for: ${user.uid}`);
    const batch = firebase_1.db.batch();
    try {
        // 1. ユーザードキュメントを削除
        const userRef = firebase_1.db.collection('users').doc(user.uid);
        batch.delete(userRef);
        // 2. 友達関係を削除（requesterまたはreceiver）
        const friendshipsAsRequester = await firebase_1.db
            .collection('friendships')
            .where('requesterId', '==', user.uid)
            .get();
        const friendshipsAsReceiver = await firebase_1.db
            .collection('friendships')
            .where('receiverId', '==', user.uid)
            .get();
        friendshipsAsRequester.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        friendshipsAsReceiver.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        // 3. 会話を取得（参加者として）
        const conversations = await firebase_1.db
            .collection('conversations')
            .where('participantIds', 'array-contains', user.uid)
            .get();
        // 会話とそのメッセージを削除
        for (const conversationDoc of conversations.docs) {
            // メッセージサブコレクションを削除
            const messages = await conversationDoc.ref.collection('messages').get();
            messages.docs.forEach((messageDoc) => {
                batch.delete(messageDoc.ref);
            });
            // 会話ドキュメントを削除
            batch.delete(conversationDoc.ref);
        }
        // 4. サブスクリプション情報を削除
        const subscriptionRef = firebase_1.db.collection('subscriptions').doc(user.uid);
        batch.delete(subscriptionRef);
        // バッチコミット
        await batch.commit();
        // 5. Storageからプロフィール画像を削除
        try {
            const bucket = firebase_1.storage.bucket();
            const [files] = await bucket.getFiles({
                prefix: `profiles/${user.uid}/`,
            });
            await Promise.all(files.map((file) => file.delete()));
        }
        catch (storageError) {
            // Storageファイルが存在しない場合はエラーを無視
            console.log('No profile images to delete or error:', storageError);
        }
        console.log(`User data deleted successfully: ${user.uid}`);
        return { success: true, userId: user.uid };
    }
    catch (error) {
        console.error('Error deleting user data:', error);
        throw error;
    }
});
//# sourceMappingURL=onDelete.js.map