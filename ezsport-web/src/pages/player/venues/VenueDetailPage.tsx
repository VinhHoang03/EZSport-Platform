import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VenueDetail } from '../../../components/player/VenueDetail';
import { ROUTES } from '../../../constants';

const VenueDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <VenueDetail
      venueId={id ?? ''}
      onBackClick={() => navigate(ROUTES.VENUES)}
      onLogoClick={() => navigate(ROUTES.LANDING)}
    />
  );
};

export default VenueDetailPage;
