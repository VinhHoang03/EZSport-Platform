import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CourtDetail } from '../../components/player/CourtDetail';
import { ROUTES } from '../../constants';

const CourtDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <CourtDetail
      courtId={Number(id) || 1}
      onBackClick={() => navigate(ROUTES.VENUES)}
      onConfirmBooking={() => navigate(`/venues/${id}/checkout`)}
      onLogoClick={() => navigate(ROUTES.LANDING)}
    />
  );
};

export default CourtDetailPage;
