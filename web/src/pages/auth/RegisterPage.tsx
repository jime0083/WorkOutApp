/**
 * 新規登録ページ
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components';
import { registerUser } from '../../services/auth';
import styles from './RegisterPage.module.css';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  // 本命アカウント情報
  const [realEmail, setRealEmail] = useState('');
  const [realPassword, setRealPassword] = useState('');
  const [realPasswordConfirm, setRealPasswordConfirm] = useState('');

  // ダミーアカウント情報
  const [dummyEmail, setDummyEmail] = useState('');
  const [dummyPassword, setDummyPassword] = useState('');

  // ニックネーム
  const [nickname, setNickname] = useState('');

  // エラー状態
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 本命メール
    if (!realEmail.trim()) {
      newErrors.realEmail = 'メールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(realEmail)) {
      newErrors.realEmail = 'メールアドレスの形式が正しくありません';
    }

    // 本命パスワード
    if (!realPassword) {
      newErrors.realPassword = 'パスワードを入力してください';
    } else if (realPassword.length < 8) {
      newErrors.realPassword = 'パスワードは8文字以上で入力してください';
    }

    // パスワード確認
    if (realPassword !== realPasswordConfirm) {
      newErrors.realPasswordConfirm = 'パスワードが一致しません';
    }

    // ダミーメール
    if (!dummyEmail.trim()) {
      newErrors.dummyEmail = 'ダミーメールアドレスを入力してください';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dummyEmail)) {
      newErrors.dummyEmail = 'メールアドレスの形式が正しくありません';
    } else if (dummyEmail === realEmail) {
      newErrors.dummyEmail = '本命メールと異なるアドレスを入力してください';
    }

    // ダミーパスワード
    if (!dummyPassword) {
      newErrors.dummyPassword = 'ダミーパスワードを入力してください';
    } else if (dummyPassword.length < 8) {
      newErrors.dummyPassword = 'パスワードは8文字以上で入力してください';
    } else if (dummyPassword === realPassword) {
      newErrors.dummyPassword =
        '本命パスワードと異なるパスワードを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        realEmail,
        realPassword,
        dummyEmail,
        dummyPassword,
        nickname: nickname || undefined,
      });

      if (result.success) {
        // 登録成功時はログインページへ
        navigate('/login', {
          state: { message: 'アカウントが作成されました。ログインしてください。' },
        });
      } else {
        setGeneralError(result.error || '登録に失敗しました');
      }
    } catch (error) {
      setGeneralError('登録中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>新規登録</h1>
          <p className={styles.subtitle}>2つのアカウントを設定します</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 本命アカウント */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>本命アカウント</h2>
            <p className={styles.sectionDescription}>
              メッセージ機能を利用するためのアカウントです
            </p>

            <Input
              label="メールアドレス"
              type="email"
              value={realEmail}
              onChange={(e) => setRealEmail(e.target.value)}
              placeholder="example@email.com"
              error={errors.realEmail}
              fullWidth
            />

            <Input
              label="パスワード"
              type="password"
              value={realPassword}
              onChange={(e) => setRealPassword(e.target.value)}
              placeholder="8文字以上"
              error={errors.realPassword}
              fullWidth
            />

            <Input
              label="パスワード（確認）"
              type="password"
              value={realPasswordConfirm}
              onChange={(e) => setRealPasswordConfirm(e.target.value)}
              placeholder="もう一度入力"
              error={errors.realPasswordConfirm}
              fullWidth
            />
          </div>

          {/* ダミーアカウント */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ダミーアカウント</h2>
            <p className={styles.sectionDescription}>
              ヘルスケアアプリとして表示するためのアカウントです
            </p>

            <Input
              label="ダミーメールアドレス"
              type="email"
              value={dummyEmail}
              onChange={(e) => setDummyEmail(e.target.value)}
              placeholder="dummy@email.com"
              error={errors.dummyEmail}
              fullWidth
            />

            <Input
              label="ダミーパスワード"
              type="password"
              value={dummyPassword}
              onChange={(e) => setDummyPassword(e.target.value)}
              placeholder="8文字以上（本命と異なるもの）"
              error={errors.dummyPassword}
              fullWidth
            />
          </div>

          {/* プロフィール */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>プロフィール（任意）</h2>

            <Input
              label="ニックネーム"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="表示名を入力"
              maxLength={20}
              fullWidth
            />
          </div>

          {generalError && <p className={styles.error}>{generalError}</p>}

          <Button
            type="submit"
            loading={isLoading}
            fullWidth
            className={styles.submitButton}
          >
            登録する
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            既にアカウントをお持ちの方は{' '}
            <button
              type="button"
              className={styles.link}
              onClick={() => navigate('/login')}
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
