import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { useBookingStore } from '../../../store/bookingStore';
import { bookingService } from '../../../services/booking.service';
import { useAuth } from '../../../context/AuthContext';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Thẻ ngân hàng', icon: 'credit_card' },
  { id: 'momo', label: 'MoMo', icon: 'account_balance_wallet' },
  { id: 'zalopay', label: 'ZaloPay', icon: 'account_balance_wallet' },
  { id: 'bank', label: 'Chuyển khoản', icon: 'account_balance' },
] as const;

const BookingConfirmPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft, setDraft, setConfirmedBookingId } = useBookingStore();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill booker info from auth user
  const [bookerName, setBookerName] = useState(draft?.bookerName || user?.fullName || '');
  const [bookerPhone, setBookerPhone] = useState(draft?.bookerPhone || user?.phone || '');
  const [bookerEmail, setBookerEmail] = useState(draft?.bookerEmail || user?.email || '');
  const [notes, setNotes] = useState(draft?.notes || '');
  const [paymentMethod, setPaymentMethod] = useState<typeof PAYMENT_METHODS[number]['id']>(
    draft?.paymentMethod || 'card'
  );

  if (!draft || !draft.slot) {
    return (
      <Container className="py-5 text-center">
        <p className="text-muted">Không có thông tin đặt sân. <a href={`/booking/${id}`}>Quay lại chọn slot</a></p>
      </Container>
    );
  }

  const { slot, courtName, courtAddress, courtImage, sport, basePrice, serviceFee, discount, pointsUsed } = draft;
  const total = basePrice + serviceFee - discount - pointsUsed;

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleConfirm = async () => {
    if (!bookerName || !bookerPhone) {
      setError('Vui lòng điền đầy đủ họ tên và số điện thoại.');
      return;
    }
    setError('');
    setLoading(true);

    setDraft({ bookerName, bookerPhone, bookerEmail, notes, paymentMethod, totalPrice: total });

    try {
      const booking = await bookingService.createBooking({
        courtId: draft.courtId,
        bookingDate: new Date(slot.date),
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: slot.duration,
        sport,
        basePrice,
        serviceFee,
        discount,
        pointsUsed,
        totalPrice: total,
        paymentMethod,
        bookerName,
        bookerPhone,
        bookerEmail,
        notes,
      });
      setConfirmedBookingId(booking._id);
      navigate(`/booking/success/${booking._id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đặt sân thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: '720px' }}>
      <button
        onClick={() => navigate(`/booking/${id}`)}
        className="btn btn-link text-success fw-semibold p-0 mb-3 d-flex align-items-center gap-1 border-0 shadow-none"
        style={{ textDecoration: 'none' }}
      >
        <span className="material-symbols-outlined fs-5">arrow_back</span>
        Quay lại chọn slot
      </button>

      {/* Booking summary */}
      <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">Thông tin đặt sân</h6>
          <Row className="g-0">
            {courtImage && (
              <Col xs={3} className="me-3">
                <img src={courtImage} alt={courtName} style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', height: '80px' }} />
              </Col>
            )}
            <Col>
              <p className="fw-semibold mb-1" style={{ fontSize: '15px' }}>{courtName}</p>
              <p className="text-muted mb-1" style={{ fontSize: '12px' }}>{courtAddress}</p>
              <p className="mb-1" style={{ fontSize: '13px' }}>
                <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '14px', color: '#16a34a' }}>sports</span>
                {sport}
              </p>
              <p className="mb-0" style={{ fontSize: '13px' }}>
                <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '14px', color: '#16a34a' }}>schedule</span>
                {formatDate(slot.date)} · {slot.startTime} – {slot.endTime} ({slot.duration}h)
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Booker info */}
      <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">Thông tin người đặt</h6>
          <Row className="g-3">
            <Col xs={12} md={6}>
              <Form.Label style={{ fontSize: '13px', fontWeight: 600 }}>Họ tên *</Form.Label>
              <Form.Control
                value={bookerName}
                onChange={(e) => setBookerName(e.target.value)}
                placeholder="Nguyễn Văn A"
                style={{ borderRadius: '10px', fontSize: '14px' }}
              />
            </Col>
            <Col xs={12} md={6}>
              <Form.Label style={{ fontSize: '13px', fontWeight: 600 }}>Số điện thoại *</Form.Label>
              <Form.Control
                value={bookerPhone}
                onChange={(e) => setBookerPhone(e.target.value)}
                placeholder="090 xxx xxxx"
                style={{ borderRadius: '10px', fontSize: '14px' }}
              />
            </Col>
            <Col xs={12}>
              <Form.Label style={{ fontSize: '13px', fontWeight: 600 }}>Email</Form.Label>
              <Form.Control
                value={bookerEmail}
                onChange={(e) => setBookerEmail(e.target.value)}
                placeholder="email@example.com"
                style={{ borderRadius: '10px', fontSize: '14px' }}
              />
            </Col>
            <Col xs={12}>
              <Form.Label style={{ fontSize: '13px', fontWeight: 600 }}>Ghi chú</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Yêu cầu đặc biệt..."
                style={{ borderRadius: '10px', fontSize: '14px' }}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Payment method */}
      <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">Phương thức thanh toán</h6>
          <div className="d-flex gap-2 flex-wrap">
            {PAYMENT_METHODS.map((pm) => (
              <button
                key={pm.id}
                onClick={() => setPaymentMethod(pm.id)}
                style={{
                  border: paymentMethod === pm.id ? '2px solid #16a34a' : '1.5px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '10px 18px',
                  background: paymentMethod === pm.id ? '#f0fdf4' : '#fff',
                  color: paymentMethod === pm.id ? '#16a34a' : '#374151',
                  fontWeight: paymentMethod === pm.id ? 700 : 400,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{pm.icon}</span>
                {pm.label}
              </button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Price breakdown */}
      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">Chi tiết thanh toán</h6>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
            <span className="text-muted">Giá sân</span>
            <span>{basePrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
            <span className="text-muted">Phí dịch vụ</span>
            <span>{serviceFee.toLocaleString('vi-VN')}đ</span>
          </div>
          {discount > 0 && (
            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px', color: '#16a34a' }}>
              <span>Giảm giá</span>
              <span>-{discount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          {pointsUsed > 0 && (
            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px', color: '#16a34a' }}>
              <span>Điểm thưởng</span>
              <span>-{pointsUsed.toLocaleString('vi-VN')}đ</span>
            </div>
          )}
          <hr />
          <div className="d-flex justify-content-between fw-bold" style={{ fontSize: '16px' }}>
            <span>Tổng cộng</span>
            <span style={{ color: '#16a34a' }}>{total.toLocaleString('vi-VN')}đ</span>
          </div>
        </Card.Body>
      </Card>

      {error && <p className="text-danger text-center mb-3" style={{ fontSize: '14px' }}>{error}</p>}

      <Button
        variant="success"
        className="w-100 fw-bold"
        style={{ borderRadius: '12px', padding: '14px', fontSize: '16px' }}
        onClick={handleConfirm}
        disabled={loading}
      >
        {loading ? <Spinner size="sm" className="me-2" /> : null}
        Xác nhận & Thanh toán
      </Button>
    </Container>
  );
};

export default BookingConfirmPage;
