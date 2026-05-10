/**
 * メッセージサービス
 * メッセージ関連の操作
 */
import { httpsCallable } from 'firebase/functions';
import { getFunctionsInstance } from './firebase';
import i18n from '../i18n';

interface DeleteAllMessagesResult {
  success: boolean;
  error?: string;
  deletedData?: {
    messages: number;
    conversations: number;
    friendships: number;
    files: number;
  };
}

/**
 * 全メッセージを削除（プレミアムユーザー限定）
 */
export async function deleteAllMessages(): Promise<DeleteAllMessagesResult> {
  try {
    const functions = getFunctionsInstance();
    const deleteAllMessagesFunc = httpsCallable<{ lang: string }, DeleteAllMessagesResult>(
      functions,
      'deleteAllMessages'
    );
    const result = await deleteAllMessagesFunc({
      lang: i18n.language,
    });
    return result.data;
  } catch (error) {
    console.error('Failed to delete all messages:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 緊急全データ削除（プレミアムユーザー限定）
 */
export async function panicDelete(confirmationCode: string): Promise<DeleteAllMessagesResult> {
  try {
    const functions = getFunctionsInstance();
    const panicDeleteFunc = httpsCallable<{ confirmationCode: string; lang: string }, DeleteAllMessagesResult>(
      functions,
      'panicDelete'
    );
    const result = await panicDeleteFunc({
      confirmationCode,
      lang: i18n.language,
    });
    return result.data;
  } catch (error) {
    console.error('Failed to panic delete:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
