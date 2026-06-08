"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRealUserId = exports.setupDummyAccount = void 0;
/**
 * ダミーアカウント設定
 * ユーザー登録後にダミーメール/パスワードを設定
 */
const https_1 = require("firebase-functions/v2/https");
const firebase_1 = require("../utils/firebase");
const validators_1 = require("../utils/validators");
const errors_1 = require("../utils/errors");
const response_1 = require("../utils/response");
/**
 * ダミーアカウント設定のCallable Function
 * 新規登録後にクライアントから呼び出す
 */
exports.setupDummyAccount = (0, https_1.onCall)(async (request) => {
    try {
        // 認証チェック
        const userId = (0, validators_1.requireAuth)(request.auth);
        // 入力バリデーション
        const data = request.data;
        (0, validators_1.requireString)(data.dummyEmail, 'dummyEmail');
        (0, validators_1.requireString)(data.dummyPassword, 'dummyPassword');
        // メールアドレス形式チェック
        if (!(0, validators_1.validateEmail)(data.dummyEmail)) {
            throw new errors_1.AppError(errors_1.AppErrorCode.INVALID_ARGUMENT, 'Invalid email format for dummyEmail');
        }
        // パスワード強度チェック
        const passwordValidation = (0, validators_1.validatePassword)(data.dummyPassword);
        if (!passwordValidation.valid) {
            throw new errors_1.AppError(errors_1.AppErrorCode.INVALID_ARGUMENT, passwordValidation.message || 'Invalid password');
        }
        // ユーザードキュメントが存在するか確認
        const userDoc = await firebase_1.db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            throw new errors_1.AppError(errors_1.AppErrorCode.USER_NOT_FOUND, 'User not found');
        }
        // ダミーメールが既に使用されていないかチェック
        const existingDummyUser = await firebase_1.db
            .collection('users')
            .where('dummyEmail', '==', data.dummyEmail)
            .limit(1)
            .get();
        if (!existingDummyUser.empty) {
            throw new errors_1.AppError(errors_1.AppErrorCode.EMAIL_ALREADY_EXISTS, 'This email is already in use as a dummy email');
        }
        // ダミーアカウントをFirebase Authに作成
        let dummyAuthUser;
        try {
            dummyAuthUser = await firebase_1.auth.createUser({
                email: data.dummyEmail,
                password: data.dummyPassword,
            });
        }
        catch (authError) {
            const error = authError;
            if (error.code === 'auth/email-already-exists') {
                throw new errors_1.AppError(errors_1.AppErrorCode.EMAIL_ALREADY_EXISTS, 'This email is already registered');
            }
            throw authError;
        }
        // ユーザードキュメントを更新
        const updateData = {
            dummyEmail: data.dummyEmail,
            updatedAt: new Date(),
        };
        if (data.nickname) {
            updateData.nickname = data.nickname;
        }
        await firebase_1.db.collection('users').doc(userId).update(updateData);
        // ダミーユーザーのカスタムクレームを設定
        await firebase_1.auth.setCustomUserClaims(dummyAuthUser.uid, {
            linkedUserId: userId,
            isDummyAccount: true,
        });
        console.log(`Dummy account setup completed for user: ${userId}`);
        return (0, response_1.successResponse)({
            message: 'Dummy account setup completed',
            dummyUserId: dummyAuthUser.uid,
        });
    }
    catch (error) {
        throw (0, errors_1.handleError)(error);
    }
});
/**
 * ダミーアカウントでログインした場合に本来のユーザーIDを取得
 */
exports.resolveRealUserId = (0, https_1.onCall)(async (request) => {
    try {
        // 認証チェック
        const userId = (0, validators_1.requireAuth)(request.auth);
        // カスタムクレームをチェック
        const user = await firebase_1.auth.getUser(userId);
        const claims = user.customClaims || {};
        if (claims.isDummyAccount && claims.linkedUserId) {
            // ダミーアカウントの場合、本来のユーザーIDを返す
            return (0, response_1.successResponse)({
                isDummyAccount: true,
                realUserId: claims.linkedUserId,
            });
        }
        // 本来のアカウントの場合
        return (0, response_1.successResponse)({
            isDummyAccount: false,
            realUserId: userId,
        });
    }
    catch (error) {
        throw (0, errors_1.handleError)(error);
    }
});
//# sourceMappingURL=setupDummy.js.map