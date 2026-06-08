/**
 * AuthPage — backward-compat wrapper dùng trong App.tsx (legacy flow).
 * Logic thực sự đã được tách sang:
 *   - pages/public/LoginPage.tsx
 *   - pages/public/RegisterPage.tsx
 *   - components/auth/AuthLayout.tsx
 */
import React from 'react';
import LoginPage from '../../pages/public/LoginPage';
import RegisterPage from '../../pages/public/RegisterPage';

interface AuthPageProps {
  onBackToLanding?: () => void;
  onSuccess?: (role?: string) => void;
  initialMode?: 'login' | 'register';
  initialAccountType?: 'player' | 'owner' | 'shop';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  if (initialMode === 'register') return <RegisterPage />;
  return <LoginPage />;
};
