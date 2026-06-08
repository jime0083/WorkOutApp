"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.incrementMessageCount = exports.checkMessageLimit = void 0;
/**
 * メッセージ送信上限チェック
 * 無料ユーザーは月10通まで
 */
const https_1 = require("firebase-functions/v2/https");
const firebase_1 = require("../utils/firebase");
const validators_1 = require("../utils/validators");
const errors_1 = require("../utils/errors");
const response_1 = require("../utils/response");
const subscription_1 = require("../utils/subscription");
/**
 * メッセージ送信可否をチェック
 */
exports.checkMessageLimit = (0, https_1.onCall)(async (request) => {
    var _a;
    try {
        const userId = (0, validators_1.requireAuth)(request.auth);
        // ユーザードキュメントを取得
        const userDoc = await firebase_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            return (0, response_1.successResponse)({
                canSend: false,
                remaining: 0,
                limit: subscription_1.FREE_PLAN_MESSAGE_LIMIT,
                isPremium: false,
                resetDate: null,
            });
        }
        const userData = userDoc.data();
        if (!userData) {
            return (0, response_1.successResponse)({
                canSend: false,
                remaining: 0,
                limit: subscription_1.FREE_PLAN_MESSAGE_LIMIT,
                isPremium: false,
                resetDate: null,
            });
        }
        // プレミアムユーザーは無制限
        const premium = await (0, subscription_1.isPremiumUser)(userId);
        if (premium) {
            return (0, response_1.successResponse)({
                canSend: true,
                remaining: -1, // 無制限
                limit: -1,
                isPremium: true,
                resetDate: null,
            });
        }
        // 無料ユーザーのメッセージ数チェック
        const monthlyMessageCount = userData.monthlyMessageCount || 0;
        const remaining = Math.max(subscription_1.FREE_PLAN_MESSAGE_LIMIT - monthlyMessageCount, 0);
        const canSend = remaining > 0;
        // リセット日（登録日ベース）
        const messageCountResetDate = ((_a = userData.messageCountResetDate) === null || _a === void 0 ? void 0 : _a.toDate()) || null;
        return (0, response_1.successResponse)({
            canSend,
            remaining,
            limit: subscription_1.FREE_PLAN_MESSAGE_LIMIT,
            isPremium: false,
            resetDate: messageCountResetDate,
        });
    }
    catch (error) {
        throw (0, errors_1.handleError)(error);
    }
});
/**
 * メッセージ送信カウントを増加
 * メッセージ送信成功後に呼び出す
 */
exports.incrementMessageCount = (0, https_1.onCall)(async (request) => {
    try {
        const userId = (0, validators_1.requireAuth)(request.auth);
        // プレミアムユーザーはカウント不要
        const premium = await (0, subscription_1.isPremiumUser)(userId);
        if (premium) {
            return (0, response_1.successResponse)({ newCount: -1 });
        }
        // カウントを増加
        const userRef = firebase_1.db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        const userData = userDoc.data();
        const currentCount = (userData === null || userData === void 0 ? void 0 : userData.monthlyMessageCount) || 0;
        const newCount = currentCount + 1;
        await userRef.update({
            monthlyMessageCount: newCount,
            updatedAt: new Date(),
        });
        return (0, response_1.successResponse)({ newCount });
    }
    catch (error) {
        throw (0, errors_1.handleError)(error);
    }
});
//# sourceMappingURL=checkMessageLimit.js.map