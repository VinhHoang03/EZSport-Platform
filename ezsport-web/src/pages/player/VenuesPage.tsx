import React from 'react';
import { useNavigate } from 'react-router-dom';
import CourtList from '../../components/player/CourtList';

// Temporary wrapper — will be refactored to full page later
const VenuesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <CourtList
      courts={[]}
      layout="horizontal"
      currentLocationName=""
      onDetailClick={(id) => navigate(`/venues/${id}`)}
      onBookingClick={(id) => navigate(`/venues/${id}/checkout`)}
      onDirectionsClick={() => {}}
    />
  );
};

export default VenuesPage;
