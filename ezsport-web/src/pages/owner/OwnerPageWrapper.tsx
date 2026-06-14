import React from 'react';
import { useNavigate } from 'react-router-dom';
import OwnerPage from './OwnerPage';
import { ROUTES } from '../../constants';

const OwnerPageWrapper: React.FC = () => {
  const navigate = useNavigate();

  return (
    <OwnerPage onGoHome={() => navigate(ROUTES.LANDING)} />
  );
};

export default OwnerPageWrapper;
