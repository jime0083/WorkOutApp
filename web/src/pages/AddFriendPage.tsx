/**
 * AddFriendPage - 友達追加ページ
 */
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useFriends } from '../hooks/useFriends';
import { searchUserByVisibleUserId } from '../services/friend';
import type { User } from '../types/user';
import styles from './AddFriendPage.module.css';

export const AddFriendPage: React.FC = () => {
  const navigate = useNavigate();
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
        setSearchError('自分自身を友達に追加することはできません');
      } else {
        setSearchResult(result);
      }
    } else {
      setSearchError('ユーザーが見つかりません');
    }

    setIsSearching(false);
  }, [searchId, user?.uid]);

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
          友だちのIDを入力して検索してください
        </p>

        <div className={styles.searchInputWrapper}>
          <span className={styles.atSign}>@</span>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ユーザーID"
            className={styles.searchInput}
            autoFocus
          />
        </div>

        <button
          className={styles.searchButton}
          onClick={handleSearch}
          disabled={!searchId.trim() || isSearching}
        >
          {isSearching ? '検索中...' : '検索'}
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
            {isSending ? '送信中...' : '友達申請を���る'}
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
          友達申請を送信しました
        </div>
      )}

      {/* 自分のID表示 */}
      {user && (
        <div className={styles.myIdSection}>
          <p className={styles.myIdLabel}>あなたのID</p>
          <p className={styles.myId}>@{user.email?.split('@')[0] || 'unknown'}</p>
          <p className={styles.myIdHint}>
            友だちにこのIDを教えて���追加してもらいましょう
          </p>
        </div>
      )}
    </div>
  );
};
