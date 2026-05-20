import React from 'react';
import { useNavigate } from 'react-router-dom';
import { OwnerDashboard } from '../../components/owner/OwnerDashboard';
import { ROUTES } from '../../constants';

const OwnerDashboardWrapper: React.FC = () => {
  const navigate = useNavigate();
  return <OwnerDashboard onGoHome={() => navigate(ROUTES.LANDING)} />;
};
export default OwnerDashboardWrapper;
