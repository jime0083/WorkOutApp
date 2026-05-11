/**
 * ナビゲーション型定義
 */

// ルートスタックの画面パラメータ
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
};

// 認証スタックの画面パラメータ
export type AuthStackParamList = {
  FeatureExplanation: undefined;
  Login: undefined;
  Register: undefined;
};

// ダミーメインタブの画面パラメータ
export type DummyTabParamList = {
  Home: undefined;
  Stats: undefined;
  DummySettings: undefined;
};

// メインスタックの画面パラメータ（ダミータブ + 認証が必要な画面）
export type MainStackParamList = {
  DummyTabs: undefined;
  PasswordPrompt: {
    purpose: 'settings' | 'messages';
  };
  Settings: undefined;
  Messages: undefined;
  DummyMessages: undefined;
  Conversation: { conversationId: string; friendId: string };
  Conversations: undefined;
  ChatRoom: { conversationId: string };
  Friends: undefined;
  AddFriend: undefined;
  FriendRequests: undefined;
  Profile: undefined;
  Subscription: undefined;
  AccountSettings: undefined;
};
