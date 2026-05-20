import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDashboard } from '../../components/admin/AdminDashboard';
import { ROUTES } from '../../constants';

const AdminDashboardWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <AdminDashboard onGoHome={() => navigate(ROUTES.LANDING)} />;
};
export default AdminDashboardWrapper;
