import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfilePage } from '../../components/player/ProfilePage';
import { ROUTES } from '../../constants';

const ProfilePageWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ProfilePage
      onGoHome={() => navigate(ROUTES.MAP)}
      onFindVenues={() => navigate(ROUTES.MAP)}
      onLogoClick={() => navigate(ROUTES.LANDING)}
    />
  );
};
export default ProfilePageWrapper;
