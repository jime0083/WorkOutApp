/**
 * ProfileEditPage - プロフィール編集ページ
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
} from '../services/user';
import { Loading } from '../components/Loading';
import styles from './ProfileEditPage.module.css';

export const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
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
      setSuccessMessage('プロフィール画像を削除しました');
    } else {
      setError(result.error || 'プロフィール画像の削除に失敗しました');
    }

    setIsUploadingImage(false);
  };

  // 保存
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userDocument?.id) return;
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
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
          setError(uploadResult.error || '画像のアップロードに失敗しました');
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
        setSuccessMessage('プロフィールを更新しました');
      } else {
        setError(updateResult.error || 'プロフィールの更新に失敗しました');
      }
    } catch (err) {
      setError('プロフィールの更新に失敗しました');
    }

    setIsSubmitting(false);
  };

  if (!userDocument) {
    return (
      <div className={styles.loadingContainer}>
        <Loading size="large" />
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
                <Loading size="small" />
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt="プロフィール画像"
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
              画像を変更
            </button>
            {userDocument.profileImageUrl && (
              <button
                type="button"
                className={styles.deleteImageButton}
                onClick={handleDeleteImage}
                disabled={isUploadingImage}
              >
                削除
              </button>
            )}
          </div>
        </div>

        {/* ユーザーID（変更不可） */}
        <div className={styles.field}>
          <label className={styles.label}>ユーザーID</label>
          <div className={styles.staticValue}>
            @{userDocument.visibleUserId}
          </div>
          <p className={styles.hint}>
            ユーザーIDは変更できません
          </p>
        </div>

        {/* ニックネーム */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="nickname">
            ニックネーム
          </label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className={styles.input}
            placeholder="ニックネームを入力"
            maxLength={30}
          />
          <p className={styles.hint}>
            30文字以内
          </p>
        </div>

        {/* 保存ボタン */}
        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting || isUploadingImage}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
};
