/**
 * 認証状態管理ストア
 */
import { create } from 'zustand';
import { User as FirebaseUser } from 'firebase/auth';
import {
  loginWithEmail,
  logout as authLogout,
  onAuthStateChanged,
  getUserDocument,
  LoginResult,
} from '../services/auth';
import type { User } from '../types/user';

interface AuthState {
  // 状態
  user: FirebaseUser | null;
  userDocument: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isDummyMode: boolean;
  error: string | null;

  // アクション
  initialize: () => () => void;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  setDummyMode: (isDummy: boolean) => void;
  clearError: () => void;
  refreshUserDocument: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // 初期状態
  user: null,
  userDocument: null,
  isLoading: false,
  isInitialized: false,
  isDummyMode: false,
  error: null,

  // 認証状態の監視を開始
  initialize: () => {
    set({ isLoading: true });

    const unsubscribe = onAuthStateChanged(async (user) => {
      if (user) {
        // ユーザードキュメントを取得
        const userDoc = await getUserDocument(user.uid);
        set({
          user,
          userDocument: userDoc,
          isLoading: false,
          isInitialized: true,
        });
      } else {
        set({
          user: null,
          userDocument: null,
          isDummyMode: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    });

    return unsubscribe;
  },

  // ログイン
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const result = await loginWithEmail(email, password);

      if (result.success && result.user) {
        const userDoc = await getUserDocument(result.user.uid);
        set({
          user: result.user,
          userDocument: userDoc,
          isDummyMode: result.isDummyLogin,
          isLoading: false,
        });
      } else {
        set({
          error: result.error || 'Login failed',
          isLoading: false,
        });
      }

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      set({ error: errorMessage, isLoading: false });
      return {
        success: false,
        error: errorMessage,
        isDummyLogin: false,
      };
    }
  },

  // ログアウト
  logout: async () => {
    set({ isLoading: true });
    try {
      await authLogout();
      set({
        user: null,
        userDocument: null,
        isDummyMode: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // ダミーモード設定
  setDummyMode: (isDummy: boolean) => {
    set({ isDummyMode: isDummy });
  },

  // エラークリア
  clearError: () => {
    set({ error: null });
  },

  // ユーザードキュメントを再取得
  refreshUserDocument: async () => {
    const { user } = get();
    if (user) {
      const userDoc = await getUserDocument(user.uid);
      set({ userDocument: userDoc });
    }
  },
}));
