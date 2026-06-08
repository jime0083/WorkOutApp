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
exports.onUserCreate = void 0;
/**
 * ユーザー作成時トリガー
 * Firebase Authでユーザーが作成された時にFirestoreにユーザードキュメントを作成
 */
const functions = __importStar(require("firebase-functions"));
const firebase_1 = require("../utils/firebase");
// ランダムなvisibleUserIdを生成
function generateVisibleUserId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
// 一意のvisibleUserIdを取得
async function getUniqueVisibleUserId() {
    let visibleUserId;
    let exists = true;
    while (exists) {
        visibleUserId = generateVisibleUserId();
        const snapshot = await firebase_1.db
            .collection('users')
            .where('visibleUserId', '==', visibleUserId)
            .limit(1)
            .get();
        exists = !snapshot.empty;
    }
    return visibleUserId;
}
/**
 * ユーザー作成時のトリガー
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    console.log(`Creating user document for: ${user.uid}`);
    try {
        // 一意のvisibleUserIdを生成
        const visibleUserId = await getUniqueVisibleUserId();
        // 現在の日時
        const now = new Date();
        // 月次メッセージカウントリセット日（登録日の翌月同日）
        const resetDate = new Date(now);
        resetDate.setMonth(resetDate.getMonth() + 1);
        // ユーザードキュメントを作成
        const userData = {
            id: user.uid,
            realEmail: user.email || '',
            dummyEmail: '', // 後でCloud Functionsの別処理で設定
            visibleUserId,
            nickname: `User_${visibleUserId}`,
            profileImageUrl: null,
            subscriptionStatus: 'free',
            subscriptionPlan: null,
            subscriptionExpiry: null,
            monthlyMessageCount: 0,
            messageCountResetDate: resetDate,
            fcmToken: null,
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
        };
        await firebase_1.db.collection('users').doc(user.uid).set(userData);
        console.log(`User document created successfully: ${user.uid}`);
        return { success: true, userId: user.uid };
    }
    catch (error) {
        console.error('Error creating user document:', error);
        throw error;
    }
});
//# sourceMappingURL=onCreate.js.map