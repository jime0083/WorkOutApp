/**
 * validators.ts ユニットテスト
 */
import {
  requireString,
  optionalString,
  requireNumber,
  requireBoolean,
  requireArray,
  validateEmail,
  validateVisibleUserId,
  validatePassword,
  validateNickname,
  requireAuth,
} from '../utils/validators';
import { AppError, AppErrorCode } from '../utils/errors';

describe('validators', () => {
  describe('requireString', () => {
    it('有効な文字列で例外を投げない', () => {
      expect(() => requireString('hello', 'field')).not.toThrow();
    });

    it('空文字列で例外を投げる', () => {
      expect(() => requireString('', 'field')).toThrow(AppError);
    });

    it('空白のみの文字列で例外を投げる', () => {
      expect(() => requireString('   ', 'field')).toThrow(AppError);
    });

    it('nullで例外を投げる', () => {
      expect(() => requireString(null, 'field')).toThrow(AppError);
    });

    it('undefinedで例外を投げる', () => {
      expect(() => requireString(undefined, 'field')).toThrow(AppError);
    });

    it('数値で例外を投げる', () => {
      expect(() => requireString(123, 'field')).toThrow(AppError);
    });
  });

  describe('optionalString', () => {
    it('有効な文字列を返す', () => {
      expect(optionalString('hello', 'field')).toBe('hello');
    });

    it('undefinedでundefinedを返す', () => {
      expect(optionalString(undefined, 'field')).toBeUndefined();
    });

    it('nullでundefinedを返す', () => {
      expect(optionalString(null, 'field')).toBeUndefined();
    });

    it('数値で例外を投げる', () => {
      expect(() => optionalString(123, 'field')).toThrow(AppError);
    });
  });

  describe('requireNumber', () => {
    it('有効な数値で例外を投げない', () => {
      expect(() => requireNumber(42, 'field')).not.toThrow();
    });

    it('ゼロで例外を投げない', () => {
      expect(() => requireNumber(0, 'field')).not.toThrow();
    });

    it('負の数で例外を投げない', () => {
      expect(() => requireNumber(-10, 'field')).not.toThrow();
    });

    it('NaNで例外を投げる', () => {
      expect(() => requireNumber(NaN, 'field')).toThrow(AppError);
    });

    it('文字列で例外を投げる', () => {
      expect(() => requireNumber('42', 'field')).toThrow(AppError);
    });
  });

  describe('requireBoolean', () => {
    it('trueで例外を投げない', () => {
      expect(() => requireBoolean(true, 'field')).not.toThrow();
    });

    it('falseで例外を投げない', () => {
      expect(() => requireBoolean(false, 'field')).not.toThrow();
    });

    it('文字列で例外を投げる', () => {
      expect(() => requireBoolean('true', 'field')).toThrow(AppError);
    });

    it('数値で例外を投げる', () => {
      expect(() => requireBoolean(1, 'field')).toThrow(AppError);
    });
  });

  describe('requireArray', () => {
    it('配列で例外を投げない', () => {
      expect(() => requireArray([1, 2, 3], 'field')).not.toThrow();
    });

    it('空配列で例外を投げない', () => {
      expect(() => requireArray([], 'field')).not.toThrow();
    });

    it('オブジェクトで例外を投げる', () => {
      expect(() => requireArray({}, 'field')).toThrow(AppError);
    });

    it('文字列で例外を投げる', () => {
      expect(() => requireArray('array', 'field')).toThrow(AppError);
    });
  });

  describe('validateEmail', () => {
    it('有効なメールアドレスでtrueを返す', () => {
      expect(validateEmail('test@example.com')).toBe(true);
    });

    it('サブドメイン付きでtrueを返す', () => {
      expect(validateEmail('test@mail.example.com')).toBe(true);
    });

    it('@なしでfalseを返す', () => {
      expect(validateEmail('testexample.com')).toBe(false);
    });

    it('ドメインなしでfalseを返す', () => {
      expect(validateEmail('test@')).toBe(false);
    });

    it('空文字でfalseを返す', () => {
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validateVisibleUserId', () => {
    it('有効なユーザーIDでtrueを返す', () => {
      expect(validateVisibleUserId('user123')).toBe(true);
    });

    it('アンダースコア付きでtrueを返す', () => {
      expect(validateVisibleUserId('user_name')).toBe(true);
    });

    it('2文字でfalseを返す（最小3文字）', () => {
      expect(validateVisibleUserId('ab')).toBe(false);
    });

    it('21文字でfalseを返す（最大20文字）', () => {
      expect(validateVisibleUserId('a'.repeat(21))).toBe(false);
    });

    it('特殊文字でfalseを返す', () => {
      expect(validateVisibleUserId('user@name')).toBe(false);
    });

    it('空白でfalseを返す', () => {
      expect(validateVisibleUserId('user name')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('8文字以上で有効', () => {
      const result = validatePassword('password123');
      expect(result.valid).toBe(true);
    });

    it('8文字で有効', () => {
      const result = validatePassword('12345678');
      expect(result.valid).toBe(true);
    });

    it('7文字で無効', () => {
      const result = validatePassword('1234567');
      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('空文字で無効', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateNickname', () => {
    it('1文字で有効', () => {
      const result = validateNickname('a');
      expect(result.valid).toBe(true);
    });

    it('20文字で有効', () => {
      const result = validateNickname('a'.repeat(20));
      expect(result.valid).toBe(true);
    });

    it('空文字で無効', () => {
      const result = validateNickname('');
      expect(result.valid).toBe(false);
      expect(result.message).toBeDefined();
    });

    it('21文字で無効', () => {
      const result = validateNickname('a'.repeat(21));
      expect(result.valid).toBe(false);
    });
  });

  describe('requireAuth', () => {
    it('有効なuidでuidを返す', () => {
      const result = requireAuth({ uid: 'user123' });
      expect(result).toBe('user123');
    });

    it('undefinedで例外を投げる', () => {
      expect(() => requireAuth(undefined)).toThrow(AppError);
    });

    it('空のuidで例外を投げる', () => {
      expect(() => requireAuth({ uid: '' })).toThrow(AppError);
    });
  });
});
