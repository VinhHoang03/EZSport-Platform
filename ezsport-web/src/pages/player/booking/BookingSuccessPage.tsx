import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Container, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useBookingStore } from '../../../store/bookingStore';
import { bookingService } from '../../../services/booking.service';

const BookingSuccessPage: React.FC = () => {
  const { bookingId: paramBookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { draft, clearBooking } = useBookingStore();

  // Extract booking/order identifiers from query params (MoMo uses orderId, PayOS uses orderCode)
  const queryOrderCode = searchParams.get('orderCode');
  const queryBookingId = searchParams.get('orderId');
  let bookingId = paramBookingId || queryOrderCode || queryBookingId;
  if (bookingId && bookingId.length > 24 && !/^\d+$/.test(bookingId)) {
    bookingId = bookingId.substring(0, 24);
  }

  const [dbBooking, setDbBooking] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(!!bookingId);

  // Clear store after showing success
  useEffect(() => {
    return () => {
      clearBooking();
    };
  }, []);

  // Fetch real-time booking status from DB
  useEffect(() => {
    if (bookingId) {
      setLoading(true);
      const queryParams = window.location.search;
      bookingService.getBookingById(bookingId, queryParams)
        .then((data) => {
          console.log('[BookingSuccessPage] Fetched booking details:', data);
          setDbBooking(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('[BookingSuccessPage] Failed to fetch booking:', err);
          setLoading(false);
        });
    }
  }, [bookingId]);

  const formatDate = (d: string | Date) => {
    const date = new Date(d);
    return date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Helper to translate booking status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge bg="success" className="px-2.5 py-1 text-uppercase fw-bold border-0">Đã xác nhận</Badge>;
      case 'PENDING':
        return <Badge bg="warning" className="px-2.5 py-1 text-uppercase fw-bold text-dark border-0">Chờ thanh toán</Badge>;
      case 'CANCELLED':
        return <Badge bg="danger" className="px-2.5 py-1 text-uppercase fw-bold border-0">Đã hủy</Badge>;
      case 'COMPLETED':
        return <Badge bg="primary" className="px-2.5 py-1 text-uppercase fw-bold border-0">Hoàn thành</Badge>;
      default:
        return <Badge bg="secondary" className="px-2.5 py-1 text-uppercase fw-bold border-0">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="h-100 w-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="success" className="mb-2" />
          <p className="text-muted small">Đang đồng bộ trạng thái đặt sân...</p>
        </div>
      </div>
    );
  }

  const courtName = dbBooking?.courtId?.name || draft?.courtName || 'Sân EZSport';
  const sport = dbBooking?.sport || draft?.sport || 'CẦU LÔNG';
  const bookingDate = dbBooking?.bookingDate || draft?.slot?.date;
  const timeRange = dbBooking ? `${dbBooking.startTime} – ${dbBooking.endTime}` : (draft?.slot ? `${draft.slot.startTime} – ${draft.slot.endTime}` : '');
  const totalPrice = dbBooking?.totalPrice ?? draft?.totalPrice ?? 0;
  const currentStatus = dbBooking?.status || 'PENDING';
  const isPayOS = dbBooking?.paymentMethod === 'payos' || dbBooking?.paymentMethod === 'momo';
  const isPendingPayOS = currentStatus === 'PENDING' && isPayOS;

  return (
    <div className="booking-success-page h-100 w-100 overflow-auto bg-light">
      <Container className="py-5 d-flex flex-column align-items-center" style={{ maxWidth: '560px' }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: currentStatus === 'CANCELLED' 
            ? '#ef4444' 
            : (isPendingPayOS ? '#f59e0b' : '#16a34a'), 
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: '24px',
        }}
      >
        <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '36px', fontWeight: 700 }}>
          {currentStatus === 'CANCELLED' 
            ? 'close' 
            : (isPendingPayOS ? 'pending' : 'check')}
        </span>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center w-100"
      >
        <h2 className="fw-bold mb-1" style={{ fontSize: '26px' }}>
          {currentStatus === 'CANCELLED' 
            ? 'Đặt sân thất bại!' 
            : (isPendingPayOS ? 'Chờ thanh toán qua PayOS...' : 'Đặt sân thành công!')}
        </h2>
        <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
          {currentStatus === 'CANCELLED' 
            ? 'Thanh toán của bạn đã bị hủy hoặc gặp lỗi.' 
            : (isPendingPayOS 
                ? 'Đơn đặt sân chưa được thanh toán thành công qua PayOS.' 
                : 'Xác nhận và mã check-in đã được đồng bộ hóa thành công.')}
        </p>


        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <Card.Body className="p-4 text-start">
            {/* Booking code */}
            <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3" style={{ background: currentStatus === 'CANCELLED' ? '#fef2f2' : '#f0fdf4' }}>
              <div>
                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Mã đặt sân</p>
                <p className="fw-bold mb-0" style={{ fontSize: '16px', color: currentStatus === 'CANCELLED' ? '#ef4444' : '#16a34a' }}>
                  #{bookingId?.slice(-8).toUpperCase() || 'N/A'}
                </p>
              </div>
              <div className="text-end">
                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Trạng thái</p>
                <div className="mt-0.5">{getStatusBadge(currentStatus)}</div>
              </div>
            </div>

            {/* QR check-in display */}
            {currentStatus !== 'CANCELLED' && (
              <div
                className="d-flex align-items-center justify-content-center mb-3 rounded-3"
                style={{ height: '160px', background: '#f9fafb', border: '2px dashed #e5e7eb' }}
              >
                <div className="text-center">
                  <span className="material-symbols-outlined d-block mb-1" style={{ fontSize: '40px', color: isPendingPayOS ? '#f59e0b' : '#9ca3af' }}>
                    {isPendingPayOS ? 'hourglass_empty' : 'qr_code_2'}
                  </span>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                    {isPendingPayOS ? 'QR check-in: Chờ thanh toán hoàn tất' : 'QR check-in: Sẵn sàng sử dụng'}
                  </p>
                </div>
              </div>
            )}


            {/* Details */}
            {bookingDate && (
              <div style={{ fontSize: '13px' }}>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Sân</span>
                  <span className="fw-semibold">{courtName}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Môn</span>
                  <span className="fw-semibold text-uppercase">{sport}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Ngày</span>
                  <span className="fw-semibold">{formatDate(bookingDate)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Giờ</span>
                  <span className="fw-semibold">{timeRange}</span>
                </div>
                {dbBooking?.comboId && (
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Hình thức</span>
                    <span className="fw-semibold text-danger">
                      {dbBooking.comboType === 'month' ? 'Combo 1 tháng (4 buổi)' : 'Combo 1 tuần (2 buổi)'}
                    </span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Tổng thanh toán</span>
                  <span className="fw-bold" style={{ color: currentStatus === 'CANCELLED' ? '#ef4444' : '#16a34a' }}>{totalPrice.toLocaleString('vi-VN')}đ</span>
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
            onClick={() => navigate('/map')}
          >
            Đặt sân khác
          </Button>
        </div>
      </motion.div>
      </Container>
    </div>
  );
};

export default BookingSuccessPage;
