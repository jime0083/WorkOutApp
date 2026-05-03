/**
 * AddFriendPage - 友達追加ページ
 */
import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import { useFriends } from '../hooks/useFriends';
import { searchUserByVisibleUserId } from '../services/friend';
import type { User } from '../types/user';
import styles from './AddFriendPage.module.css';

export const AddFriendPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { sendFriendRequest, error: friendError } = useFriends({
    userId: user?.uid || '',
  });

  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  // ユーザー検索
  const handleSearch = useCallback(async () => {
    if (!searchId.trim()) return;

    setIsSearching(true);
    setSearchResult(null);
    setSearchError(null);
    setSendSuccess(false);

    const result = await searchUserByVisibleUserId(searchId.trim());

    if (result) {
      if (result.id === user?.uid) {
        setSearchError(t('friends.cannotAddSelf'));
      } else {
        setSearchResult(result);
      }
    } else {
      setSearchError(t('friends.userNotFound'));
    }

    setIsSearching(false);
  }, [searchId, user?.uid, t]);

  // 友達申請を送信
  const handleSendRequest = useCallback(async () => {
    if (!searchResult) return;

    setIsSending(true);
    const success = await sendFriendRequest(searchResult.visibleUserId);
    setIsSending(false);

    if (success) {
      setSendSuccess(true);
      setSearchResult(null);
    }
  }, [searchResult, sendFriendRequest]);

  // キーダウンハンドラ
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <p className={styles.description}>
          {t('friends.searchHint')}
        </p>

        <div className={styles.searchInputWrapper}>
          <span className={styles.atSign}>@</span>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('placeholder.userId')}
            className={styles.searchInput}
            autoFocus
          />
        </div>

        <button
          className={styles.searchButton}
          onClick={handleSearch}
          disabled={!searchId.trim() || isSearching}
        >
          {isSearching ? t('common.searching') : t('common.search')}
        </button>
      </div>

      {/* 検索結果 */}
      {searchResult && (
        <div className={styles.resultSection}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              {searchResult.profileImageUrl ? (
                <img
                  src={searchResult.profileImageUrl}
                  alt={searchResult.nickname}
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {searchResult.nickname?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.nickname}>{searchResult.nickname}</span>
              <span className={styles.visibleUserId}>
                @{searchResult.visibleUserId}
              </span>
            </div>
          </div>

          <button
            className={styles.sendButton}
            onClick={handleSendRequest}
            disabled={isSending}
          >
            {isSending ? t('common.sending') : t('friends.sendRequest')}
          </button>
        </div>
      )}

      {/* エラー表示 */}
      {(searchError || friendError) && (
        <div className={styles.errorMessage}>
          {searchError || friendError}
        </div>
      )}

      {/* 成功メッセージ */}
      {sendSuccess && (
        <div className={styles.successMessage}>
          {t('friends.requestSent')}
        </div>
      )}

      {/* 自分のID表示 */}
      {user && (
        <div className={styles.myIdSection}>
          <p className={styles.myIdLabel}>{t('friends.yourId')}</p>
          <p className={styles.myId}>@{user.email?.split('@')[0] || 'unknown'}</p>
          <p className={styles.myIdHint}>
            {t('friends.shareIdHint')}
          </p>
        </div>
      )}
    </div>
  );
};
