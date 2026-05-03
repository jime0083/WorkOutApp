/**
 * MessageSearch - メッセージ検索コンポーネント
 */
import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Message } from '../../types/message';
import { formatDateSeparator } from '../../utils/date';
import styles from './MessageSearch.module.css';

interface MessageSearchProps {
  onSearch: (query: string) => Promise<Message[]>;
  onSelectMessage: (message: Message) => void;
  onClose: () => void;
}

export const MessageSearch: React.FC<MessageSearchProps> = ({
  onSearch,
  onSelectMessage,
  onClose,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 検索実行
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchResults = await onSearch(query.trim());
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch]);

  // キーダウンハンドラ
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [handleSearch, onClose]
  );

  // 検索結果をクリック
  const handleResultClick = useCallback(
    (message: Message) => {
      onSelectMessage(message);
      onClose();
    },
    [onSelectMessage, onClose]
  );

  // メッセージ日時をフォーマット
  const formatMessageDate = (dateValue: Date | unknown): string => {
    let date: Date;
    if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      // Firestore Timestamp の場合
      const timestamp = dateValue as { toDate?: () => Date };
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else {
        date = new Date();
      }
    }
    return formatDateSeparator(date);
  };

  // ハイライト付きテキストを生成
  const highlightText = (text: string, searchQuery: string): React.ReactNode => {
    if (!searchQuery) return text;

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <mark key={index} className={styles.highlight}>
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={onClose} aria-label={t('common.back')}>
          ←
        </button>
        <div className={styles.searchInputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.searchMessages')}
            className={styles.searchInput}
            autoFocus
          />
          {query && (
            <button
              className={styles.clearButton}
              onClick={() => setQuery('')}
              aria-label={t('chat.clear')}
            >
              ✕
            </button>
          )}
        </div>
        <button
          className={styles.searchButton}
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
        >
          {t('common.search')}
        </button>
      </div>

      <div className={styles.results}>
        {isSearching && (
          <div className={styles.loading}>{t('common.searching')}</div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className={styles.noResults}>
            {t('chat.noSearchResults', { query })}
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <ul className={styles.resultList}>
            {results.map((message) => (
              <li
                key={message.id}
                className={styles.resultItem}
                onClick={() => handleResultClick(message)}
              >
                <div className={styles.resultContent}>
                  {highlightText(message.content, query)}
                </div>
                <div className={styles.resultDate}>
                  {formatMessageDate(message.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        )}

        {!isSearching && !hasSearched && (
          <div className={styles.hint}>
            {t('chat.searchHint')}
          </div>
        )}
      </div>
    </div>
  );
};
