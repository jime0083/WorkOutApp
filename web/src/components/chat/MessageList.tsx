/**
 * MessageList - メッセージリストコンポーネント
 */
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Message } from '../../types/message';
import type { UserProfile } from '../../types/user';
import { MessageBubble } from './MessageBubble';
import { DateSeparator } from './DateSeparator';
import { MessageContextMenu } from './MessageContextMenu';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { isSameDay } from '../../utils/date';
import styles from './MessageList.module.css';

// Firestore Timestamp型のガード
const toDate = (dateValue: Date | unknown): Date => {
  if (dateValue instanceof Date) {
    return dateValue;
  }
  // Firestore Timestamp の場合
  const timestamp = dateValue as { toDate?: () => Date };
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return new Date();
};

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<boolean>;
  partnerProfile?: UserProfile;
  isPremium?: boolean;
}

interface ContextMenuState {
  message: Message;
  position: { x: number; y: number };
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  hasMore,
  onLoadMore,
  onDeleteMessage,
  partnerProfile,
  isPremium = false,
}) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isLoadingMore = useRef(false);
  const prevMessagesLength = useRef(messages.length);

  // コンテキストメニュー状態
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  // 削除確認ダイアログ状態
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 新しいメッセージが来たら一番下にスクロール
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      const isNewMessage = messages.length - prevMessagesLength.current <= 2;
      if (isNewMessage) {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // 初期表示時は一番下にスクロール
  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView();
    }
  }, []);

  // スクロールイベントハンドラ
  const handleScroll = useCallback(async () => {
    if (!containerRef.current || isLoadingMore.current || !hasMore) return;

    const { scrollTop } = containerRef.current;
    if (scrollTop < 100) {
      isLoadingMore.current = true;
      await onLoadMore();
      isLoadingMore.current = false;
    }
  }, [hasMore, onLoadMore]);

  // 日付区切りを挿入するかチェック
  const shouldShowDateSeparator = (index: number): boolean => {
    if (index === 0) return true;
    const currentDate = toDate(messages[index].createdAt);
    const prevDate = toDate(messages[index - 1].createdAt);
    return !isSameDay(currentDate, prevDate);
  };

  // コンテキストメニュー表示
  const handleContextMenu = useCallback(
    (message: Message, position: { x: number; y: number }) => {
      setContextMenu({ message, position });
    },
    []
  );

  // コンテキストメニューを閉じる
  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // コピー処理
  const handleCopy = useCallback(() => {
    if (contextMenu && contextMenu.message.type === 'text') {
      navigator.clipboard.writeText(contextMenu.message.content);
    }
    closeContextMenu();
  }, [contextMenu, closeContextMenu]);

  // 削除処理開始
  const handleDeleteRequest = useCallback(() => {
    if (contextMenu) {
      setDeleteTarget(contextMenu.message);
    }
    closeContextMenu();
  }, [contextMenu, closeContextMenu]);

  // 削除確認
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget || !onDeleteMessage) return;

    setIsDeleting(true);
    await onDeleteMessage(deleteTarget.id);
    setIsDeleting(false);
    setDeleteTarget(null);
  }, [deleteTarget, onDeleteMessage]);

  // 削除キャンセル
  const handleDeleteCancel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className={styles.container}
        onScroll={handleScroll}
      >
        {hasMore && (
          <div className={styles.loadMoreIndicator}>
            {t('chat.loadingMore')}
          </div>
        )}

        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            {shouldShowDateSeparator(index) && (
              <DateSeparator date={toDate(message.createdAt)} />
            )}
            <MessageBubble
              message={message}
              isOwn={message.senderId === currentUserId}
              partnerProfile={partnerProfile}
              onContextMenu={handleContextMenu}
            />
          </React.Fragment>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* コンテキストメニュー */}
      {contextMenu && (
        <MessageContextMenu
          isOwn={contextMenu.message.senderId === currentUserId}
          isPremium={isPremium}
          onDelete={handleDeleteRequest}
          onCopy={handleCopy}
          onClose={closeContextMenu}
          position={contextMenu.position}
        />
      )}

      {/* 削除確認ダイアログ */}
      {deleteTarget && (
        <DeleteConfirmDialog
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};
