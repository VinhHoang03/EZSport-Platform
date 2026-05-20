import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navigation from '../components/shared/Navigation';
import { ROUTES } from '../constants';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation
        onLogoClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
        onPageChange={(page) => {
          if (page === 'landing') navigate(ROUTES.LANDING);
        }}
      />
      <main className="flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
