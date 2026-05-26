import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner } from 'react-bootstrap';
import { useBookingStore } from '../../../store/bookingStore';
import { courtService, type Court } from '../../../services/venue.service';
import SlotPicker from '../../../components/player/SlotPicker';

interface BookingPageProps {
  courtId?: string;
}

const BookingPage: React.FC<BookingPageProps> = ({ courtId: propCourtId }) => {
  const { id } = useParams<{ id: string }>();
  const courtId = propCourtId || id;
  const navigate = useNavigate();
  const { draft, initDraft, setDraft } = useBookingStore();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(!!courtId);

  useEffect(() => {
    if (!courtId) {
      return;
    }

    courtService
      .getCourtById(courtId)
      .then((data) => {
        setCourt(data);
        if (!draft || draft.courtId !== courtId) {
          initDraft(courtId, data.name, data.location, data.image ?? undefined);
        }
      })
      .catch(() => {
        // fallback: still init draft with id so flow doesn't break
        if (!draft || draft.courtId !== courtId) {
          initDraft(courtId, 'Sân thể thao', '', undefined);
        }
      })
      .finally(() => setLoading(false));
  }, [courtId, draft, initDraft]);

  const handleSlotSelect = (slot: {
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    basePrice: number;
  }) => {
    setDraft({
      slot: { date: slot.date, startTime: slot.startTime, endTime: slot.endTime, duration: slot.duration },
      basePrice: slot.basePrice,
      serviceFee: 15000,
      totalPrice: slot.basePrice + 15000,
    });
    navigate(`/booking/${courtId}/confirm`);
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <Spinner variant="success" />
      </div>
    );
  }

  const sports = court?.sportTypes?.length ? court.sportTypes : [];

  return (
    <Container className="py-4" style={{ maxWidth: '720px' }}>
      {/* Court summary */}
      <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Row className="g-0">
          <Col xs={4}>
            <img
              src={court?.image || '/images/pickleball.png'}
              alt={court?.name}
              style={{ width: '100%', height: '120px', objectFit: 'cover' }}
            />
          </Col>
          <Col xs={8} className="p-3">
            <h6 className="fw-bold mb-1" style={{ fontSize: '15px' }}>{court?.name || 'Sân thể thao'}</h6>
            <p className="text-muted mb-2" style={{ fontSize: '12px' }}>
              <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '14px' }}>location_on</span>
              {court?.location || ''}
            </p>
            <div className="d-flex gap-1 flex-wrap">
              {sports.map((s) => (
                <Badge key={s} bg="success" style={{ fontSize: '11px', fontWeight: 500 }}>{s}</Badge>
              ))}
            </div>
          </Col>
        </Row>
      </Card>

      {/* Sport selector */}
      {sports.length > 1 && (
        <div className="mb-4">
          <p className="fw-semibold mb-2" style={{ fontSize: '14px', color: '#374151' }}>Môn thể thao</p>
          <div className="d-flex gap-2">
            {sports.map((s) => (
              <button
                key={s}
                onClick={() => setDraft({ sport: s })}
                style={{
                  border: draft?.sport === s ? '2px solid #16a34a' : '1.5px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '8px 18px',
                  background: draft?.sport === s ? '#f0fdf4' : '#fff',
                  color: draft?.sport === s ? '#16a34a' : '#374151',
                  fontWeight: draft?.sport === s ? 700 : 400,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slot picker */}
      <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
        <SlotPicker
          courtId={id!}
          onSlotSelect={handleSlotSelect}
          selectedDate={draft?.slot?.date}
          selectedStartTime={draft?.slot?.startTime}
        />
      </Card>
    </Container>
  );
};

export default BookingPage;
