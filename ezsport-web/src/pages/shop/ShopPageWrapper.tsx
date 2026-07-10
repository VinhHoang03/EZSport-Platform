import React from 'react';
import { useNavigate } from 'react-router-dom';
import ShopPage from './ShopPage';
import { ROUTES } from '../../constants';

const ShopPageWrapper: React.FC = () => {
  const navigate = useNavigate();

  return (
    <ShopPage onGoHome={() => navigate(ROUTES.LANDING)} />
  );
};

export default ShopPageWrapper;
