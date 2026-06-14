import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingPage as LandingPageComponent } from '../../components/shared/LandingPage';
import { ROUTES } from '../../constants';
import { venueService } from '../../services/venue.service';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<any[]>([]);

  useEffect(() => {
    venueService.getVenues({ active: 'true' })
      .then(data => {
        setVenues(data);
      })
      .catch(err => console.error('[LandingPage] Failed to fetch venues:', err));
  }, []);

  return (
    <LandingPageComponent
      onExplore={() => navigate(ROUTES.MAP)}
      onLogin={() => navigate(ROUTES.LOGIN)}
      onRegisterVenue={() => navigate(ROUTES.REGISTER)}
      venues={venues}
    />
  );
};

export default LandingPage;
