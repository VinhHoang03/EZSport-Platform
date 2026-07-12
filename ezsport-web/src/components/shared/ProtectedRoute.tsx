import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    // Redirect to correct home based on role
    if (user.role === 'admin') return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    if (user.role === 'owner') return <Navigate to={ROUTES.OWNER_PAGE} replace />;
    if (user.role === 'shop') return <Navigate to={ROUTES.SHOP_DASHBOARD} replace />;
    if (user.role === 'coach') return <Navigate to={ROUTES.COACH_DASHBOARD} replace />;
    return <Navigate to={ROUTES.MAP} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
