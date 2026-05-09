/**
 * accessStore - 認証アクセス状態管理
 * 設定画面/メッセージ画面へのアクセス認証状態を管理
 */
import { create } from 'zustand';

export type AuthType = 'real' | 'dummy' | null;
export type ActionType =
  | 'showRealMessages'
  | 'showDummyMessages'
  | 'deleteAllMessages'
  | 'showPremiumRequired';

interface AccessState {
  // 認証状態
  settingsAuth: AuthType;
  messagesAuth: AuthType;

  // アクション
  setSettingsAuth: (auth: AuthType) => void;
  setMessagesAuth: (auth: AuthType) => void;
  resetAuth: () => void;
  determineAction: (isPremium: boolean) => ActionType;
}

export const useAccessStore = create<AccessState>((set, get) => ({
  // 初期状態
  settingsAuth: null,
  messagesAuth: null,

  // 設定画面認証を設定
  setSettingsAuth: (auth: AuthType) => {
    set({ settingsAuth: auth });
  },

  // メッセージ画面認証を設定
  setMessagesAuth: (auth: AuthType) => {
    set({ messagesAuth: auth });
  },

  // 認証状態をリセット
  resetAuth: () => {
    set({ settingsAuth: null, messagesAuth: null });
  },

  // 認証パターンに基づいてアクションを決定
  determineAction: (isPremium: boolean): ActionType => {
    const { settingsAuth, messagesAuth } = get();

    // 両方で本物のアドレス/パスワード → 本物のメッセージ画面
    if (settingsAuth === 'real' && messagesAuth === 'real') {
      return 'showRealMessages';
    }

    // 両方でダミーのアドレス/パスワード → ダミーのメッセージ画面
    if (settingsAuth === 'dummy' && messagesAuth === 'dummy') {
      return 'showDummyMessages';
    }

    // 設定で本物、メッセージでダミー → 全メッセージ削除（サブスク限定）
    if (settingsAuth === 'real' && messagesAuth === 'dummy') {
      if (isPremium) {
        return 'deleteAllMessages';
      }
      return 'showPremiumRequired';
    }

    // その他のパターン → ダミーのメッセージ画面
    return 'showDummyMessages';
  },
}));
