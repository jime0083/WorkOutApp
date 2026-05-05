/**
 * ルート定義
 */
import React, { Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute, PublicRoute } from '../components';
import { FullScreenLoading } from '../components/Loading';

// 遅延ロード用ページコンポーネント
const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const ConversationListPage = lazy(() =>
  import('../pages/ConversationListPage').then((m) => ({
    default: m.ConversationListPage,
  }))
);
const ChatRoomPage = lazy(() =>
  import('../pages/ChatRoomPage').then((m) => ({ default: m.ChatRoomPage }))
);
const FriendListPage = lazy(() =>
  import('../pages/FriendListPage').then((m) => ({ default: m.FriendListPage }))
);
const AddFriendPage = lazy(() =>
  import('../pages/AddFriendPage').then((m) => ({ default: m.AddFriendPage }))
);
const FriendRequestPage = lazy(() =>
  import('../pages/FriendRequestPage').then((m) => ({
    default: m.FriendRequestPage,
  }))
);
const ProfileEditPage = lazy(() =>
  import('../pages/ProfileEditPage').then((m) => ({ default: m.ProfileEditPage }))
);
const SubscriptionPage = lazy(() =>
  import('../pages/SubscriptionPage').then((m) => ({ default: m.SubscriptionPage }))
);
const AccountDeletePage = lazy(() =>
  import('../pages/AccountDeletePage').then((m) => ({ default: m.AccountDeletePage }))
);

// Suspenseラッパー
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <Suspense fallback={<FullScreenLoading />}>{children}</Suspense>;

// 認証済みユーザー用レイアウト
const AuthenticatedLayout: React.FC = () => (
  <ProtectedRoute>
    <Layout>
      <SuspenseWrapper>
        <Outlet />
      </SuspenseWrapper>
    </Layout>
  </ProtectedRoute>
);

// 未認証ユーザー用レイアウト
const UnauthenticatedLayout: React.FC = () => (
  <PublicRoute>
    <SuspenseWrapper>
      <Outlet />
    </SuspenseWrapper>
  </PublicRoute>
);

// ルーター定義
const router = createBrowserRouter([
  // 認証ページ（未ログイン用）
  {
    element: <UnauthenticatedLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },

  // メインアプリ（ログイン済み用）
  {
    element: <AuthenticatedLayout />,
    children: [
      {
        path: '/',
        element: <ConversationListPage />,
      },
      {
        path: '/chat/:conversationId',
        element: <ChatRoomPage />,
      },
      {
        path: '/friends',
        element: <FriendListPage />,
      },
      {
        path: '/friends/add',
        element: <AddFriendPage />,
      },
      {
        path: '/friends/requests',
        element: <FriendRequestPage />,
      },
      {
        path: '/profile',
        element: <ProfileEditPage />,
      },
      {
        path: '/subscription',
        element: <SubscriptionPage />,
      },
      {
        path: '/account/delete',
        element: <AccountDeletePage />,
      },
    ],
  },

  // 404 - ホームにリダイレクト
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

// ルータープロバイダー
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
