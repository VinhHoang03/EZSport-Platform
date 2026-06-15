import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navigation from '../components/shared/Navigation';
import { ROUTES } from '../constants';

const PlayerLayout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="player-layout d-flex flex-column">
      <Navigation
        onLogoClick={() => navigate(ROUTES.LANDING)}
        onLoginClick={() => navigate(ROUTES.LOGIN)}
        onRegisterOwnerClick={() => navigate(ROUTES.REGISTER)}
        onPageChange={(page) => {
          const map: Record<string, string> = {
            venues: ROUTES.VENUES,
            app: ROUTES.MAP,
            playmates: ROUTES.PLAYMATES,
            profile: ROUTES.PROFILE,
            landing: ROUTES.LANDING,
          };
          if (map[page]) navigate(map[page]);
        }}
      />
      <main className="player-main flex-grow-1">
        <Outlet />
      </main>
    </div>
  );
};

export default PlayerLayout;
