"use strict";
/**
 * サブスクリプション関連ヘルパー
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREE_PLAN_MESSAGE_LIMIT = void 0;
exports.isPremiumUser = isPremiumUser;
exports.canSendMessage = canSendMessage;
exports.incrementMessageCount = incrementMessageCount;
exports.canSendMedia = canSendMedia;
exports.canDeleteMessage = canDeleteMessage;
exports.canUsePanicButton = canUsePanicButton;
const firebase_1 = require("./firebase");
// 無料プランのメッセージ上限
exports.FREE_PLAN_MESSAGE_LIMIT = 10;
// プレミアムユーザーかチェック
async function isPremiumUser(userId) {
    const userDoc = await firebase_1.db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return false;
    }
    const userData = userDoc.data();
    return userData.subscriptionStatus === 'premium';
}
// メッセージ送信可能かチェック（無料ユーザーの場合は上限チェック）
async function canSendMessage(userId) {
    const userDoc = await firebase_1.db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
        return { allowed: false, isPremium: false };
    }
    const userData = userDoc.data();
    // プレミアムユーザーは無制限
    if (userData.subscriptionStatus === 'premium') {
        return { allowed: true, isPremium: true };
    }
    // 無料ユーザーは上限チェック
    const remaining = exports.FREE_PLAN_MESSAGE_LIMIT - userData.monthlyMessageCount;
    return {
        allowed: remaining > 0,
        remaining: Math.max(0, remaining),
        isPremium: false,
    };
}
// メッセージカウントをインクリメント
async function incrementMessageCount(userId) {
    const userRef = firebase_1.db.collection('users').doc(userId);
    const result = await firebase_1.db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        const userData = userDoc.data();
        const newCount = userData.monthlyMessageCount + 1;
        transaction.update(userRef, {
            monthlyMessageCount: newCount,
            updatedAt: new Date(),
        });
        return newCount;
    });
    return result;
}
// 画像/動画送信可能かチェック（プレミアムのみ）
async function canSendMedia(userId) {
    return isPremiumUser(userId);
}
// メッセージ削除可能かチェック（プレミアムのみ）
async function canDeleteMessage(userId) {
    return isPremiumUser(userId);
}
// パニックボタン使用可能かチェック（プレミアムのみ）
async function canUsePanicButton(userId) {
    return isPremiumUser(userId);
}
//# sourceMappingURL=subscription.js.map