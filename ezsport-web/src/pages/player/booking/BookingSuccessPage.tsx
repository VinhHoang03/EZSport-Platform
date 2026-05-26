import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../../store/bookingStore';

const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { draft, clearBooking } = useBookingStore();

  // Clear store after showing success
  useEffect(() => {
    return () => {
      clearBooking();
    };
  }, []);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Container className="py-5 d-flex flex-column align-items-center" style={{ maxWidth: '560px' }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: '#16a34a', display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '24px',
        }}
      >
        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}>check</span>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center w-100"
      >
        <h2 className="fw-bold mb-1" style={{ fontSize: '26px' }}>Đặt sân thành công!</h2>
        <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
          Xác nhận đã được gửi đến email của bạn.
        </p>

        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <Card.Body className="p-4 text-start">
            {/* Booking code */}
            <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3" style={{ background: '#f0fdf4' }}>
              <div>
                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Mã đặt sân</p>
                <p className="fw-bold mb-0" style={{ fontSize: '16px', color: '#16a34a' }}>
                  #{bookingId?.slice(-8).toUpperCase() || 'N/A'}
                </p>
              </div>
              <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '28px' }}>confirmation_number</span>
            </div>

            {/* QR placeholder */}
            <div
              className="d-flex align-items-center justify-content-center mb-3 rounded-3"
              style={{ height: '160px', background: '#f9fafb', border: '2px dashed #e5e7eb' }}
            >
              <div className="text-center">
                <span className="material-symbols-outlined d-block mb-1" style={{ fontSize: '40px', color: '#9ca3af' }}>qr_code_2</span>
                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>QR check-in sẽ hiển thị ở đây</p>
              </div>
            </div>

            {/* Details */}
            {draft?.slot && (
              <div style={{ fontSize: '13px' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Sân</span>
                  <span className="fw-semibold">{draft.courtName}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Môn</span>
                  <span className="fw-semibold">{draft.sport}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Ngày</span>
                  <span className="fw-semibold">{formatDate(draft.slot.date)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Giờ</span>
                  <span className="fw-semibold">{draft.slot.startTime} – {draft.slot.endTime}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tổng thanh toán</span>
                  <span className="fw-bold" style={{ color: '#16a34a' }}>{draft.totalPrice.toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        <div className="d-flex gap-2">
          <Button
            variant="outline-success"
            className="flex-fill fw-semibold"
            style={{ borderRadius: '12px', padding: '12px' }}
            onClick={() => navigate('/my-bookings')}
          >
            Lịch sử đặt sân
          </Button>
          <Button
            variant="success"
            className="flex-fill fw-semibold"
            style={{ borderRadius: '12px', padding: '12px' }}
            onClick={() => navigate('/venues')}
          >
            Đặt sân khác
          </Button>
        </div>
      </motion.div>
    </Container>
  );
};

export default BookingSuccessPage;
