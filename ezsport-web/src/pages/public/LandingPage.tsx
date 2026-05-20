import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage as LandingPageComponent } from '../../components/shared/LandingPage';
import { ROUTES } from '../../constants';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <LandingPageComponent
      onExplore={() => navigate(ROUTES.MAP)}
      onLogin={() => navigate(ROUTES.LOGIN)}
      onRegisterVenue={() => navigate(ROUTES.REGISTER)}
    />
  );
};

export default LandingPage;
