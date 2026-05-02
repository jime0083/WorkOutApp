/**
 * ダミーアカウント設定
 * ユーザー登録後にダミーメール/パスワードを設定
 */
import { onCall } from 'firebase-functions/v2/https';
import { db, auth } from '../utils/firebase';
import {
  requireString,
  requireAuth,
  validateEmail,
  validatePassword,
} from '../utils/validators';
import { AppError, AppErrorCode, handleError } from '../utils/errors';
import { successResponse } from '../utils/response';

interface SetupDummyAccountInput {
  dummyEmail: string;
  dummyPassword: string;
  nickname?: string;
}

/**
 * ダミーアカウント設定のCallable Function
 * 新規登録後にクライアントから呼び出す
 */
export const setupDummyAccount = onCall(async (request) => {
  try {
    // 認証チェック
    const userId = requireAuth(request.auth);

    // 入力バリデーション
    const data = request.data as SetupDummyAccountInput;
    requireString(data.dummyEmail, 'dummyEmail');
    requireString(data.dummyPassword, 'dummyPassword');

    // メールアドレス形式チェック
    if (!validateEmail(data.dummyEmail)) {
      throw new AppError(
        AppErrorCode.INVALID_ARGUMENT,
        'Invalid email format for dummyEmail'
      );
    }

    // パスワード強度チェック
    const passwordValidation = validatePassword(data.dummyPassword);
    if (!passwordValidation.valid) {
      throw new AppError(
        AppErrorCode.INVALID_ARGUMENT,
        passwordValidation.message || 'Invalid password'
      );
    }

    // ユーザードキュメントが存在するか確認
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new AppError(AppErrorCode.USER_NOT_FOUND, 'User not found');
    }

    // ダミーメールが既に使用されていないかチェック
    const existingDummyUser = await db
      .collection('users')
      .where('dummyEmail', '==', data.dummyEmail)
      .limit(1)
      .get();

    if (!existingDummyUser.empty) {
      throw new AppError(
        AppErrorCode.EMAIL_ALREADY_EXISTS,
        'This email is already in use as a dummy email'
      );
    }

    // ダミーアカウントをFirebase Authに作成
    let dummyAuthUser;
    try {
      dummyAuthUser = await auth.createUser({
        email: data.dummyEmail,
        password: data.dummyPassword,
      });
    } catch (authError) {
      const error = authError as { code?: string };
      if (error.code === 'auth/email-already-exists') {
        throw new AppError(
          AppErrorCode.EMAIL_ALREADY_EXISTS,
          'This email is already registered'
        );
      }
      throw authError;
    }

    // ユーザードキュメントを更新
    const updateData: Record<string, unknown> = {
      dummyEmail: data.dummyEmail,
      updatedAt: new Date(),
    };

    if (data.nickname) {
      updateData.nickname = data.nickname;
    }

    await db.collection('users').doc(userId).update(updateData);

    // ダミーユーザーのカスタムクレームを設定
    await auth.setCustomUserClaims(dummyAuthUser.uid, {
      linkedUserId: userId,
      isDummyAccount: true,
    });

    console.log(`Dummy account setup completed for user: ${userId}`);

    return successResponse({
      message: 'Dummy account setup completed',
      dummyUserId: dummyAuthUser.uid,
    });
  } catch (error) {
    throw handleError(error);
  }
});

/**
 * ダミーアカウントでログインした場合に本来のユーザーIDを取得
 */
export const resolveRealUserId = onCall(async (request) => {
  try {
    // 認証チェック
    const userId = requireAuth(request.auth);

    // カスタムクレームをチェック
    const user = await auth.getUser(userId);
    const claims = user.customClaims || {};

    if (claims.isDummyAccount && claims.linkedUserId) {
      // ダミーアカウントの場合、本来のユーザーIDを返す
      return successResponse({
        isDummyAccount: true,
        realUserId: claims.linkedUserId as string,
      });
    }

    // 本来のアカウントの場合
    return successResponse({
      isDummyAccount: false,
      realUserId: userId,
    });
  } catch (error) {
    throw handleError(error);
  }
});
