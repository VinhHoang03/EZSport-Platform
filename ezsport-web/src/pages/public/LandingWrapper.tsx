import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage } from '../../components/shared/LandingPage';
import { ROUTES } from '../../constants';

const LandingWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <LandingPage
      onExplore={() => navigate(ROUTES.MAP)}
      onLogin={() => navigate(ROUTES.LOGIN)}
      onRegisterVenue={() => navigate(ROUTES.REGISTER)}
    />
  );
};

export default LandingWrapper;
