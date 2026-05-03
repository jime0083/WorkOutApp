/**
 * ProfileEditPage - プロフィール編集ページ
 */
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import {
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
} from '../services/user';
import { Loading, LanguageSwitcher } from '../components';
import styles from './ProfileEditPage.module.css';

export const ProfileEditPage: React.FC = () => {
  const { t } = useTranslation();
  const { userDocument, refreshUserDocument } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nickname, setNickname] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 初期値を設定
  useEffect(() => {
    if (userDocument) {
      setNickname(userDocument.nickname || '');
      setPreviewUrl(userDocument.profileImageUrl);
    }
  }, [userDocument]);

  // 画像選択
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setSelectedFile(file);
  };

  // 画像削除
  const handleDeleteImage = async () => {
    if (!userDocument?.id) return;

    setIsUploadingImage(true);
    setError(null);

    const result = await deleteProfileImage(
      userDocument.id,
      userDocument.profileImageUrl
    );

    if (result.success) {
      setPreviewUrl(null);
      setSelectedFile(null);
      await refreshUserDocument();
      setSuccessMessage(t('profile.imageDeleted'));
    } else {
      setError(result.error || t('profile.imageDeleteFailed'));
    }

    setIsUploadingImage(false);
  };

  // 保存
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userDocument?.id) return;
    if (!nickname.trim()) {
      setError(t('validation.nicknameRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // 新しい画像がある場合はアップロード
      if (selectedFile) {
        setIsUploadingImage(true);
        const uploadResult = await uploadProfileImage(
          userDocument.id,
          selectedFile
        );
        setIsUploadingImage(false);

        if (!uploadResult.success) {
          setError(uploadResult.error || t('profile.imageUploadFailed'));
          setIsSubmitting(false);
          return;
        }

        setSelectedFile(null);
      }

      // ニックネームを更新
      const updateResult = await updateUserProfile(userDocument.id, {
        nickname: nickname.trim(),
      });

      if (updateResult.success) {
        await refreshUserDocument();
        setSuccessMessage(t('profile.updateSuccess'));
      } else {
        setError(updateResult.error || t('profile.updateFailed'));
      }
    } catch (err) {
      setError(t('profile.updateFailed'));
    }

    setIsSubmitting(false);
  };

  if (!userDocument) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* エラー・成功メッセージ */}
        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {/* プロフィール画像 */}
        <div className={styles.imageSection}>
          <div
            className={styles.avatarWrapper}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploadingImage ? (
              <div className={styles.avatarLoading}>
                <Loading size="sm" />
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={t('profile.profileImage')}
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {nickname?.charAt(0) || '?'}
              </div>
            )}
            <div className={styles.avatarOverlay}>
              <span className={styles.cameraIcon}>📷</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className={styles.fileInput}
          />
          <div className={styles.imageActions}>
            <button
              type="button"
              className={styles.changeImageButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
            >
              {t('profile.changeImage')}
            </button>
            {userDocument.profileImageUrl && (
              <button
                type="button"
                className={styles.deleteImageButton}
                onClick={handleDeleteImage}
                disabled={isUploadingImage}
              >
                {t('common.delete')}
              </button>
            )}
          </div>
        </div>

        {/* ユーザーID（変更不可） */}
        <div className={styles.field}>
          <label className={styles.label}>{t('profile.userId')}</label>
          <div className={styles.staticValue}>
            @{userDocument.visibleUserId}
          </div>
          <p className={styles.hint}>
            {t('profile.userIdCannotChange')}
          </p>
        </div>

        {/* ニックネーム */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="nickname">
            {t('auth.nickname')}
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={styles.input}
            placeholder={t('placeholder.nickname')}
            maxLength={30}
          />
          <p className={styles.hint}>
            {t('profile.maxLength', { length: 30 })}
          </p>
        </div>

        {/* 言語設定 */}
        <div className={styles.field}>
          <LanguageSwitcher />
        </div>

        {/* 保存ボタン */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || isUploadingImage}
        >
          {isSubmitting ? t('common.saving') : t('common.save')}
        </button>
      </form>
    </div>
  );
};
