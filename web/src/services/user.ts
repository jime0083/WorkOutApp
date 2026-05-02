/**
 * ユーザーサービス（プロフィール管理）
 */
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';
import type { UpdateUserInput } from '../types/user';

/**
 * プロフィールを更新
 */
export async function updateUserProfile(
  userId: string,
  input: UpdateUserInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...input,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to update profile:', error);
    return {
      success: false,
      error: 'プロフィールの更新に失敗しました',
    };
  }
}

/**
 * プロフィール画像をアップロード
 */
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // ファイルサイズチェック（5MB制限）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: '画像サイズは5MB以下にしてください',
      };
    }

    // 画像ファイルかチェック
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '画像ファイルのみアップロードできます',
      };
    }

    // ファイル名を生成
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `profile_${Date.now()}.${extension}`;
    const storageRef = ref(storage, `profiles/${userId}/${fileName}`);

    // アップロード
    await uploadBytes(storageRef, file, {
      contentType: file.type,
    });

    // ダウンロードURLを取得
    const url = await getDownloadURL(storageRef);

    // ユーザードキュメントを更新
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      profileImageUrl: url,
      updatedAt: serverTimestamp(),
    });

    return { success: true, url };
  } catch (error) {
    console.error('Failed to upload profile image:', error);
    return {
      success: false,
      error: 'プロフィール画像のアップロードに失敗しました',
    };
  }
}

/**
 * プロフィール画像を削除
 */
export async function deleteProfileImage(
  userId: string,
  currentImageUrl: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    // 現在の画像を削除（URLからパスを抽出）
    if (currentImageUrl) {
      try {
        // Firebase Storage URLからパスを抽出
        const url = new URL(currentImageUrl);
        const path = decodeURIComponent(
          url.pathname.split('/o/')[1]?.split('?')[0] || ''
        );
        if (path) {
          const oldRef = ref(storage, path);
          await deleteObject(oldRef);
        }
      } catch {
        // 画像が既に削除されている場合は無視
      }
    }

    // ユーザードキュメントを更新
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      profileImageUrl: null,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to delete profile image:', error);
    return {
      success: false,
      error: 'プロフィール画像の削除に失敗しました',
    };
  }
}
