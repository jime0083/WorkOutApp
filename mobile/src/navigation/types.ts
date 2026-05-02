/**
 * ナビゲーション型定義
 */

// ルートスタックの画面パラメータ
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// 認証スタックの画面パラメータ
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// ダミーメインタブの画面パラメータ
export type DummyTabParamList = {
  Home: undefined;
  Stats: undefined;
  Settings: undefined;
};

// 本命メインスタックの画面パラメータ（将来用）
export type MainStackParamList = {
  Conversations: undefined;
  ChatRoom: { conversationId: string };
  Friends: undefined;
  AddFriend: undefined;
  FriendRequests: undefined;
  Profile: undefined;
  Subscription: undefined;
  AccountSettings: undefined;
};
