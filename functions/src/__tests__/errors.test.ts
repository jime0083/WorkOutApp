/**
 * errors.ts ユニットテスト
 */
import { HttpsError } from 'firebase-functions/v2/https';
import { AppError, AppErrorCode, handleError, createError } from '../utils/errors';

describe('errors', () => {
  describe('AppError', () => {
    it('正しくインスタンス化される', () => {
      const error = new AppError(AppErrorCode.INVALID_ARGUMENT, 'Test error');
      expect(error.code).toBe(AppErrorCode.INVALID_ARGUMENT);
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('AppError');
    });

    it('詳細情報を含められる', () => {
      const details = { field: 'email', value: 'invalid' };
      const error = new AppError(AppErrorCode.INVALID_ARGUMENT, 'Test', details);
      expect(error.details).toEqual(details);
    });

    it('HttpsErrorに変換できる', () => {
      const error = new AppError(AppErrorCode.UNAUTHORIZED, 'Unauthorized');
      const httpsError = error.toHttpsError();
      expect(httpsError).toBeInstanceOf(HttpsError);
      expect(httpsError.code).toBe('permission-denied');
      expect(httpsError.message).toBe('Unauthorized');
    });

    it('認証エラーは正しいHTTPコードにマッピングされる', () => {
      const error = new AppError(AppErrorCode.USER_NOT_FOUND, 'User not found');
      const httpsError = error.toHttpsError();
      expect(httpsError.code).toBe('not-found');
    });

    it('メッセージエラーは正しいHTTPコードにマッピングされる', () => {
      const error = new AppError(
        AppErrorCode.MESSAGE_LIMIT_EXCEEDED,
        'Limit exceeded'
      );
      const httpsError = error.toHttpsError();
      expect(httpsError.code).toBe('resource-exhausted');
    });

    it('友達エラーは正しいHTTPコードにマッピングされる', () => {
      const error = new AppError(AppErrorCode.ALREADY_FRIENDS, 'Already friends');
      const httpsError = error.toHttpsError();
      expect(httpsError.code).toBe('already-exists');
    });
  });

  describe('handleError', () => {
    it('AppErrorをHttpsErrorに変換する', () => {
      const appError = new AppError(AppErrorCode.INVALID_ARGUMENT, 'Invalid');
      const result = handleError(appError);
      expect(result).toBeInstanceOf(HttpsError);
      expect(result.code).toBe('invalid-argument');
    });

    it('HttpsErrorをそのまま返す', () => {
      const httpsError = new HttpsError('not-found', 'Not found');
      const result = handleError(httpsError);
      expect(result).toBe(httpsError);
    });

    it('通常のErrorをHttpsErrorに変換する', () => {
      const error = new Error('Something went wrong');
      const result = handleError(error);
      expect(result).toBeInstanceOf(HttpsError);
      expect(result.code).toBe('internal');
      expect(result.message).toBe('Something went wrong');
    });

    it('未知のエラーをHttpsErrorに変換する', () => {
      const result = handleError('unknown error');
      expect(result).toBeInstanceOf(HttpsError);
      expect(result.code).toBe('internal');
      expect(result.message).toBe('An unexpected error occurred');
    });

    it('nullをHttpsErrorに変換する', () => {
      const result = handleError(null);
      expect(result).toBeInstanceOf(HttpsError);
      expect(result.code).toBe('internal');
    });
  });

  describe('createError', () => {
    it('AppErrorを作成する', () => {
      const error = createError(AppErrorCode.INTERNAL_ERROR, 'Internal error');
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(AppErrorCode.INTERNAL_ERROR);
      expect(error.message).toBe('Internal error');
    });

    it('詳細情報付きでAppErrorを作成する', () => {
      const details = { userId: '123' };
      const error = createError(
        AppErrorCode.FRIEND_USER_NOT_FOUND,
        'User not found',
        details
      );
      expect(error.details).toEqual(details);
    });
  });

  describe('AppErrorCode', () => {
    it('認証関連のエラーコードが定義されている', () => {
      expect(AppErrorCode.INVALID_CREDENTIALS).toBeDefined();
      expect(AppErrorCode.USER_NOT_FOUND).toBeDefined();
      expect(AppErrorCode.EMAIL_ALREADY_EXISTS).toBeDefined();
      expect(AppErrorCode.UNAUTHORIZED).toBeDefined();
    });

    it('メッセージ関連のエラーコードが定義されている', () => {
      expect(AppErrorCode.MESSAGE_LIMIT_EXCEEDED).toBeDefined();
      expect(AppErrorCode.CONVERSATION_NOT_FOUND).toBeDefined();
      expect(AppErrorCode.SEND_FAILED).toBeDefined();
      expect(AppErrorCode.DELETE_NOT_ALLOWED).toBeDefined();
    });

    it('友達関連のエラーコードが定義されている', () => {
      expect(AppErrorCode.FRIEND_USER_NOT_FOUND).toBeDefined();
      expect(AppErrorCode.ALREADY_FRIENDS).toBeDefined();
      expect(AppErrorCode.REQUEST_ALREADY_SENT).toBeDefined();
      expect(AppErrorCode.REQUEST_NOT_FOUND).toBeDefined();
      expect(AppErrorCode.CANNOT_ADD_SELF).toBeDefined();
      expect(AppErrorCode.USER_BLOCKED).toBeDefined();
    });

    it('サブスクリプション関連のエラーコードが定義されている', () => {
      expect(AppErrorCode.PURCHASE_FAILED).toBeDefined();
      expect(AppErrorCode.INVALID_RECEIPT).toBeDefined();
      expect(AppErrorCode.SUBSCRIPTION_EXPIRED).toBeDefined();
    });
  });
});
