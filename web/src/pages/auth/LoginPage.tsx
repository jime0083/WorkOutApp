/**
 * ログインページ
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../../components';
import { useAuthStore } from '../../stores/authStore';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login, isLoading, error, clearError } = useAuthStore();

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError(t('validation.emailRequired'));
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError(t('validation.emailInvalid'));
      isValid = false;
    }

    if (!password) {
      setPasswordError(t('validation.passwordRequired'));
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      // ログイン成功時はチャット一覧へ
      navigate('/chat');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{t('auth.loginTitle')}</h1>
          <p className={styles.subtitle}>{t('auth.loginSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label={t('auth.email')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('placeholder.email')}
            error={emailError}
            fullWidth
          />

          <Input
            label={t('auth.password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('placeholder.password')}
            error={passwordError}
            fullWidth
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button
            type="submit"
            loading={isLoading}
            fullWidth
            className={styles.submitButton}
          >
            {t('auth.login')}
          </Button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            {t('auth.noAccount')}{' '}
            <button
              type="button"
              className={styles.link}
              onClick={() => navigate('/register')}
            >
              {t('auth.register')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
