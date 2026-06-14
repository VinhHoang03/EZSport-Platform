import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckoutPage } from '../../components/player/CheckoutPage';
import { ROUTES } from '../../constants';

const CheckoutPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <CheckoutPage
      venueId={id ?? ''}
      onBackClick={() => navigate(`/venues/${id}`)}
      onSuccessClick={() => navigate(ROUTES.BOOKING_SUCCESS)}
      onLogoClick={() => navigate(ROUTES.LANDING)}
    />
  );
};
export default CheckoutPageWrapper;
