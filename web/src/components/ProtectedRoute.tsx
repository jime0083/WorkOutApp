/**
 * 認証が必要なルートのガード
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { CenteredLoading } from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const { user, isLoading, isInitialized } = useAuthStore();

  // 初期化中はローディング表示
  if (!isInitialized || isLoading) {
    return <CenteredLoading text="読み込み中..." />;
  }

  // 未認証の場合はログインページへリダイレクト
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
