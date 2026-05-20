import React from 'react';
import { Outlet } from 'react-router-dom';

// Minimal wrapper — auth pages handle their own layout/styling
const AuthLayout: React.FC = () => {
  return <Outlet />;
};

export default AuthLayout;
