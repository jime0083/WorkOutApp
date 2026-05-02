/**
 * MessageSearch - メッセージ検索コンポーネント
 */
import React, { useState, useCallback, useRef } from 'react';
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
  const formatMessageDate = (dateValue: Date | { toDate: () => Date }): string => {
    const date =
      dateValue && typeof (dateValue as { toDate?: () => Date }).toDate === 'function'
        ? (dateValue as { toDate: () => Date }).toDate()
        : dateValue instanceof Date
        ? dateValue
        : new Date(dateValue);
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
        <button className={styles.backButton} onClick={onClose} aria-label="戻る">
          ←
        </button>
        <div className={styles.searchInputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを検索..."
            className={styles.searchInput}
            autoFocus
          />
          {query && (
            <button
              className={styles.clearButton}
              onClick={() => setQuery('')}
              aria-label="クリア"
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
          検索
        </button>
      </div>

      <div className={styles.results}>
        {isSearching && (
          <div className={styles.loading}>検索中...</div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className={styles.noResults}>
            「{query}」に一致するメッセージはありません
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
            キーワードを入力して検索してください
          </div>
        )}
      </div>
    </div>
  );
};
