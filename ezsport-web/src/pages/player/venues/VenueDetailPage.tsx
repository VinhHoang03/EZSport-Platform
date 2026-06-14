import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { VenueDetail } from '../../../components/player/VenueDetail';
import { ROUTES } from '../../../constants';
import { useBookingStore } from '../../../store/bookingStore';

const VenueDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { initDraft, setDraft } = useBookingStore();

  return (
    <VenueDetail
      venueId={id ?? ''}
      onBackClick={() => navigate(ROUTES.VENUES)}
      onConfirmBooking={(bookingDetails) => {
        // bookingDetails: { venueId, slot, courtId, courtName, courtAddress, courtImage, sport, basePrice, ... }
        const slot = bookingDetails?.slot;
        const courtId = (bookingDetails as any)?.courtId ?? String(id);
        const courtName = (bookingDetails as any)?.courtName ?? '';
        const courtAddress = (bookingDetails as any)?.courtAddress ?? '';
        const courtImage = (bookingDetails as any)?.courtImage;
        const sport = (bookingDetails as any)?.sport ?? '';
        const basePrice = (bookingDetails as any)?.basePrice ?? 0;

        initDraft(courtId, courtName, courtAddress, courtImage);
        setDraft({
          sport,
          slot: slot ?? null,
          basePrice,
          serviceFee: 15000,
          discount: 30000,
          pointsUsed: 50000,
        });

        navigate(`/venues/${id}/checkout`);
      }}
      onLogoClick={() => navigate(ROUTES.LANDING)}
    />
  );
};

export default VenueDetailPage;
