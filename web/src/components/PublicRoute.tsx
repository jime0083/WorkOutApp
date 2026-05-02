/**
 * 未認証ユーザー専用ルートのガード
 * 認証済みの場合はメインページへリダイレクト
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { CenteredLoading } from './Loading';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, isLoading, isInitialized } = useAuthStore();

  // 初期化中はローディング表示
  if (!isInitialized || isLoading) {
    return <CenteredLoading text="読み込み中..." />;
  }

  // 認証済みの場合は元のページまたはチャット一覧へリダイレクト
  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname || '/chat';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
