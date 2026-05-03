/**
 * 新規登録ページ
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../components';
import { registerUser } from '../../services/auth';
import styles from './RegisterPage.module.css';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
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
      newErrors.realEmail = t('validation.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(realEmail)) {
      newErrors.realEmail = t('validation.emailInvalid');
    }

    // 本命パスワード
    if (!realPassword) {
      newErrors.realPassword = t('validation.passwordRequired');
    } else if (realPassword.length < 8) {
      newErrors.realPassword = t('validation.passwordMinLength');
    }

    // パスワード確認
    if (realPassword !== realPasswordConfirm) {
      newErrors.realPasswordConfirm = t('validation.passwordMismatch');
    }

    // ダミーメール
    if (!dummyEmail.trim()) {
      newErrors.dummyEmail = t('validation.dummyEmailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dummyEmail)) {
      newErrors.dummyEmail = t('validation.emailInvalid');
    } else if (dummyEmail === realEmail) {
      newErrors.dummyEmail = t('validation.dummyEmailSameAsReal');
    }

    // ダミーパスワード
    if (!dummyPassword) {
      newErrors.dummyPassword = t('validation.dummyPasswordRequired');
    } else if (dummyPassword.length < 8) {
      newErrors.dummyPassword = t('validation.passwordMinLength');
    } else if (dummyPassword === realPassword) {
      newErrors.dummyPassword = t('validation.dummyPasswordSameAsReal');
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
          state: { message: t('auth.accountCreated') },
        });
      } else {
        setGeneralError(result.error || t('auth.registerFailed'));
      }
    } catch (error) {
      setGeneralError(t('auth.registerError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.registerTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* 本命アカウント */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('auth.realAccount')}</h2>
            <p className={styles.sectionDescription}>
              {t('auth.realAccountDesc')}
            </p>

            <Input
              label={t('auth.email')}
              type="email"
              value={realEmail}
              onChange={(e) => setRealEmail(e.target.value)}
              placeholder={t('placeholder.email')}
              error={errors.realEmail}
              fullWidth
            />

            <Input
              label={t('auth.password')}
              type="password"
              value={realPassword}
              onChange={(e) => setRealPassword(e.target.value)}
              placeholder={t('placeholder.passwordMinLength')}
              error={errors.realPassword}
              fullWidth
            />

            <Input
              label={t('auth.passwordConfirm')}
              type="password"
              value={realPasswordConfirm}
              onChange={(e) => setRealPasswordConfirm(e.target.value)}
              placeholder={t('placeholder.passwordConfirm')}
              error={errors.realPasswordConfirm}
              fullWidth
            />
          </div>

          {/* ダミーアカウント */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('auth.dummyAccount')}</h2>
            <p className={styles.sectionDescription}>
              {t('auth.dummyAccountDesc')}
            </p>

            <Input
              label={t('auth.dummyEmail')}
              type="email"
              value={dummyEmail}
              onChange={(e) => setDummyEmail(e.target.value)}
              placeholder={t('placeholder.dummyEmail')}
              error={errors.dummyEmail}
              fullWidth
            />

            <Input
              label={t('auth.dummyPassword')}
              type="password"
              value={dummyPassword}
              onChange={(e) => setDummyPassword(e.target.value)}
              placeholder={t('placeholder.dummyPassword')}
              error={errors.dummyPassword}
              fullWidth
            />
          </div>

          {/* プロフィール */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{t('auth.profile')}</h2>

            <Input
              label={t('auth.nickname')}
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('auth.enterNickname')}
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
            {t('auth.registerButton')}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {t('auth.hasAccount')}{' '}
            <button
              type="button"
              className={styles.link}
              onClick={() => navigate('/login')}
            >
              {t('auth.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
