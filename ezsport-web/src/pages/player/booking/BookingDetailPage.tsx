import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Badge, Button, Modal, Spinner } from 'react-bootstrap';
import { bookingService, type Booking } from '../../../services/booking.service';

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
  PENDING:    { label: 'Chờ xác nhận', variant: 'warning' },
  CONFIRMED:  { label: 'Đã xác nhận',  variant: 'success' },
  CHECKED_IN: { label: 'Đã check-in',  variant: 'info' },
  COMPLETED:  { label: 'Hoàn thành',   variant: 'secondary' },
  CANCELLED:  { label: 'Đã huỷ',       variant: 'danger' },
};

const BookingDetailPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInError, setCheckInError] = useState('');

  const handlePlayerCheckIn = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị GPS để check-in.");
      return;
    }
    setCheckingIn(true);
    setCheckInError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const updated = await bookingService.checkInBooking(booking!._id, latitude, longitude);
          setBooking(updated);
          alert("🎉 Check-in thành công! Bạn đã nhận được 50 điểm tích luỹ.");
        } catch (err: any) {
          const errMsg = err.response?.data?.message || err.message || "Check-in thất bại.";
          setCheckInError(errMsg);
          alert(errMsg);
        } finally {
          setCheckingIn(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        const errMsg = "Không thể lấy vị trí hiện tại của bạn. Vui lòng cấp quyền truy cập GPS.";
        setCheckInError(errMsg);
        alert(errMsg);
        setCheckingIn(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!bookingId) return;
    bookingService
      .getBookingById(bookingId)
      .then(setBooking)
      .catch(() => setError('Không tìm thấy đơn đặt sân.'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleCancel = async () => {
    if (!bookingId) return;
    setCancelling(true);
    try {
      await bookingService.cancelBooking(bookingId);
      setBooking((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
      setShowCancelModal(false);
    } catch {
      setError('Huỷ đặt sân thất bại. Vui lòng thử lại.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner variant="success" /></div>;
  if (error || !booking) return <Container className="py-5 text-center"><p className="text-danger">{error || 'Không tìm thấy đơn.'}</p></Container>;

  const status = STATUS_MAP[booking.status] ?? { label: booking.status, variant: 'secondary' };
  const canCancel = ['PENDING', 'CONFIRMED'].includes(booking.status);
  const date = new Date(booking.bookingDate).toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <Container className="py-4" style={{ maxWidth: '640px' }}>
      <button
        onClick={() => navigate('/my-bookings')}
        className="btn btn-link text-success fw-semibold p-0 mb-3 d-flex align-items-center gap-1 border-0 shadow-none"
        style={{ textDecoration: 'none' }}
      >
        <span className="material-symbols-outlined fs-5">arrow_back</span>
        Lịch sử đặt sân
      </button>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0">Chi tiết đặt sân</h5>
        <Badge bg={status.variant}>{status.label}</Badge>
      </div>

      {/* QR */}
      <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4 text-center">
          <div
            className="d-flex align-items-center justify-content-center mx-auto mb-3 rounded-3"
            style={{ width: '160px', height: '160px', background: '#f9fafb', border: '2px dashed #e5e7eb' }}
          >
            <div>
              <span className="material-symbols-outlined d-block mb-1" style={{ fontSize: '48px', color: '#9ca3af' }}>qr_code_2</span>
              <p className="text-muted mb-0" style={{ fontSize: '11px' }}>QR check-in</p>
            </div>
          </div>
          <p className="fw-bold mb-0" style={{ fontSize: '18px', color: '#16a34a', letterSpacing: '2px' }}>
            #{booking._id.slice(-8).toUpperCase()}
          </p>

          {booking.status === 'CONFIRMED' && (
            <div className="mt-3 pt-3 border-top">
              <Button
                variant="success"
                className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2"
                style={{ borderRadius: '12px', padding: '12px' }}
                onClick={handlePlayerCheckIn}
                disabled={checkingIn}
              >
                {checkingIn ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-1" />
                    Đang xác thực vị trí...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">where_to_vote</span>
                    Tự check-in nhận điểm (200m)
                  </>
                )}
              </Button>
              {checkInError && (
                <p className="text-danger small mt-2 mb-0 fw-semibold">
                  {checkInError}
                </p>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Info */}
      <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">Thông tin sân</h6>
          <InfoRow label="Địa điểm" value={(booking.courtId as any)?.venue?.name || 'Sân EZSport'} />
          <InfoRow label="Sân" value={(booking.courtId as any)?.name || 'Sân 1'} />
          {(booking.courtId as any)?.venue?.location && (
            <InfoRow label="Địa chỉ" value={(booking.courtId as any)?.venue?.location} />
          )}
          <InfoRow label="Môn" value={booking.sport} />
          <InfoRow label="Ngày" value={date} />
          <InfoRow label="Giờ" value={`${booking.startTime} – ${booking.endTime} (${booking.duration}h)`} />
          {booking.comboId && (
            <InfoRow label="Hình thức" value={booking.comboType === 'month' ? 'Combo 1 tháng (4 buổi)' : 'Combo 1 tuần (2 buổi)'} color="#dc2626" bold />
          )}
          {booking.notes && (
            <InfoRow label="Ghi chú" value={booking.notes} />
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">Người đặt</h6>
          <InfoRow label="Họ tên" value={booking.bookerName} />
          <InfoRow label="SĐT" value={booking.bookerPhone} />
          {booking.bookerEmail && <InfoRow label="Email" value={booking.bookerEmail} />}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
        <Card.Body className="p-4">
          <h6 className="fw-bold mb-3">Thanh toán</h6>
          <InfoRow label="Giá sân" value={`${booking.basePrice.toLocaleString('vi-VN')}đ`} />
          {booking.serviceFee && <InfoRow label="Phí dịch vụ" value={`${booking.serviceFee.toLocaleString('vi-VN')}đ`} />}
          {booking.discount && booking.discount > 0 && <InfoRow label="Giảm giá" value={`-${booking.discount.toLocaleString('vi-VN')}đ`} color="#16a34a" />}
          <hr />
          <InfoRow label="Tổng cộng" value={`${booking.totalPrice.toLocaleString('vi-VN')}đ`} bold color="#16a34a" />
        </Card.Body>
      </Card>

      {canCancel && (
        <Button
          variant="outline-danger"
          className="w-100 fw-semibold"
          style={{ borderRadius: '12px', padding: '12px' }}
          onClick={() => setShowCancelModal(true)}
        >
          Huỷ đặt sân
        </Button>
      )}

      {/* Cancel modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Body className="p-4 text-center">
          <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '48px', color: '#ef4444' }}>warning</span>
          <h6 className="fw-bold mb-2">Xác nhận huỷ đặt sân?</h6>
          <p className="text-muted mb-4" style={{ fontSize: '14px' }}>
            Hành động này không thể hoàn tác. Phí hoàn tiền tuỳ theo chính sách của sân.
          </p>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" className="flex-fill" onClick={() => setShowCancelModal(false)}>
              Giữ lại
            </Button>
            <Button variant="danger" className="flex-fill" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? <Spinner size="sm" /> : 'Huỷ đặt sân'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

const InfoRow: React.FC<{ label: string; value: string; bold?: boolean; color?: string }> = ({ label, value, bold, color }) => (
  <div className="d-flex justify-content-between mb-2" style={{ fontSize: '14px' }}>
    <span className="text-muted">{label}</span>
    <span style={{ fontWeight: bold ? 700 : 500, color: color || '#111827' }}>{value}</span>
  </div>
);

export default BookingDetailPage;
