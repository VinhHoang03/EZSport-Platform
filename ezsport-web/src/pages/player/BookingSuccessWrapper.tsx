import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingSuccessPage } from '../../components/player/BookingSuccessPage';
import { ROUTES } from '../../constants';

const BookingSuccessWrapper: React.FC = () => {
  const navigate = useNavigate();
  return (
    <BookingSuccessPage
      onGoHome={() => navigate(ROUTES.MAP)}
      onViewMyBookings={() => navigate(ROUTES.PROFILE)}
    />
  );
};
export default BookingSuccessWrapper;
