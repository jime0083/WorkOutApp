/**
 * AccountDeletePage - アカウント削除ページ
 * パニックボタン（プレミアム機能）と通常アカウント削除
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { signOut } from 'firebase/auth';
import { functions, auth } from '../services/firebase';
import { useSubscription } from '../hooks/useSubscription';
import { Loading } from '../components/Loading';
import styles from './AccountDeletePage.module.css';

// 確認コード（Cloud Functionsと同じ）
const CONFIRMATION_CODE = 'DELETE_ALL_DATA';

type DeleteType = 'panic' | 'normal' | null;

interface DeleteResult {
  success: boolean;
  error?: string;
  deletedData?: {
    messages: number;
    conversations: number;
    friendships: number;
    files: number;
  };
}

export const AccountDeletePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { isPremium, isLoading: subscriptionLoading } = useSubscription();

  const [showConfirm, setShowConfirm] = useState<DeleteType>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePanicDelete = async () => {
    if (confirmInput !== CONFIRMATION_CODE) {
      setError(t('accountDelete.invalidCode'));
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const panicDelete = httpsCallable<
        { confirmationCode: string; lang?: string },
        DeleteResult
      >(functions, 'panicDelete');

      const result = await panicDelete({
        confirmationCode: CONFIRMATION_CODE,
        lang: i18n.language,
      });

      if (result.data.success) {
        setSuccess(t('accountDelete.panicSuccess'));
        await signOut(auth);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.data.error || t('accountDelete.panicFailed'));
      }
    } catch (err) {
      setError(t('accountDelete.panicFailed'));
    } finally {
      setIsDeleting(false);
      setShowConfirm(null);
      setConfirmInput('');
    }
  };

  const handleNormalDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const deleteAccount = httpsCallable<
        { lang?: string },
        { success: boolean; error?: string }
      >(functions, 'deleteAccount');

      const result = await deleteAccount({
        lang: i18n.language,
      });

      if (result.data.success) {
        setSuccess(t('accountDelete.normalSuccess'));
        await signOut(auth);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.data.error || t('accountDelete.normalFailed'));
      }
    } catch (err) {
      setError(t('accountDelete.normalFailed'));
    } finally {
      setIsDeleting(false);
      setShowConfirm(null);
    }
  };

  const handleConfirmSubmit = () => {
    if (showConfirm === 'panic') {
      handlePanicDelete();
    } else if (showConfirm === 'normal') {
      handleNormalDelete();
    }
  };

  const handleCloseConfirm = () => {
    setShowConfirm(null);
    setConfirmInput('');
    setError(null);
  };

  if (subscriptionLoading) {
    return (
      <div className={styles.container}>
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 成功メッセージ */}
      {success && <div className={styles.success}>{success}</div>}

      {/* エラーメッセージ */}
      {error && !showConfirm && <div className={styles.error}>{error}</div>}

      {/* パニックボタンセクション（プレミアム限定） */}
      <section className={`${styles.section} ${styles.panicSection}`}>
        <h2 className={`${styles.sectionTitle} ${styles.panicTitle}`}>
          <span className={styles.panicIcon}>!</span>
          {t('accountDelete.panicTitle')}
        </h2>
        <p className={styles.sectionDescription}>
          {t('accountDelete.panicDescription')}
        </p>

        {isPremium && (
          <span className={styles.premiumBadge}>
            {t('accountDelete.premiumOnly')}
          </span>
        )}

        <div className={styles.warningBox}>
          <p className={styles.warningTitle}>{t('accountDelete.warningTitle')}</p>
          <ul className={styles.warningList}>
            <li>{t('accountDelete.warningItem1')}</li>
            <li>{t('accountDelete.warningItem2')}</li>
            <li>{t('accountDelete.warningItem3')}</li>
            <li>{t('accountDelete.warningItem4')}</li>
          </ul>
        </div>

        <button
          className={styles.panicButton}
          onClick={() => setShowConfirm('panic')}
          disabled={!isPremium || isDeleting}
        >
          {isPremium
            ? t('accountDelete.panicButton')
            : t('accountDelete.premiumRequired')}
        </button>
      </section>

      {/* 通常削除セクション */}
      <section className={`${styles.section} ${styles.deleteSection}`}>
        <h2 className={styles.sectionTitle}>{t('accountDelete.normalTitle')}</h2>
        <p className={styles.sectionDescription}>
          {t('accountDelete.normalDescription')}
        </p>

        <button
          className={styles.deleteButton}
          onClick={() => setShowConfirm('normal')}
          disabled={isDeleting}
        >
          {t('accountDelete.normalButton')}
        </button>
      </section>

      {/* 確認ダイアログ */}
      {showConfirm && (
        <div className={styles.confirmOverlay} onClick={handleCloseConfirm}>
          <div
            className={styles.confirmDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.confirmTitle}>
              {showConfirm === 'panic'
                ? t('accountDelete.panicConfirmTitle')
                : t('accountDelete.normalConfirmTitle')}
            </h3>
            <p className={styles.confirmMessage}>
              {showConfirm === 'panic'
                ? t('accountDelete.panicConfirmMessage')
                : t('accountDelete.normalConfirmMessage')}
            </p>

            {/* パニック削除の場合は確認コード入力 */}
            {showConfirm === 'panic' && (
              <input
                type="text"
                className={styles.confirmInput}
                placeholder={t('accountDelete.enterCode', {
                  code: CONFIRMATION_CODE,
                })}
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                disabled={isDeleting}
              />
            )}

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.confirmActions}>
              <button
                className={styles.confirmCancel}
                onClick={handleCloseConfirm}
                disabled={isDeleting}
              >
                {t('common.cancel')}
              </button>
              <button
                className={styles.confirmSubmit}
                onClick={handleConfirmSubmit}
                disabled={
                  isDeleting ||
                  (showConfirm === 'panic' && confirmInput !== CONFIRMATION_CODE)
                }
              >
                {isDeleting ? <Loading size="sm" /> : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
