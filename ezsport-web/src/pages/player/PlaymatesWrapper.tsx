import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaymatesPage } from '../../components/player/PlaymatesPage';
import { ROUTES } from '../../constants';

const PlaymatesWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <PlaymatesPage
      onLogoClick={() => navigate(ROUTES.LANDING)}
      onPageChange={(page) => {
        const map: Record<string, string> = {
          venues: ROUTES.VENUES,
          app: ROUTES.MAP,
          profile: ROUTES.PROFILE,
        };
        if (map[page]) navigate(map[page]);
      }}
    />
  );
};
export default PlaymatesWrapper;
