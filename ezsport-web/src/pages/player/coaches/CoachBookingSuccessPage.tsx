import { useEffect, useState } from 'react';
import { Badge, Button, Card, Container, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { coachService, type CoachBooking } from '../../../services/coach.service';

const STATUS: Record<CoachBooking['status'], { label: string; variant: string; message: string }> = {
  PENDING_PAYMENT: { label: 'Chờ thanh toán', variant: 'warning', message: 'Hệ thống chưa ghi nhận thanh toán.' },
  PENDING_COACH_CONFIRMATION: { label: 'Chờ Coach xác nhận', variant: 'info', message: 'Thanh toán thành công. Coach sẽ sớm xác nhận lịch tập.' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'success', message: 'Lịch tập đã được Coach xác nhận.' },
  COMPLETED: { label: 'Hoàn thành', variant: 'secondary', message: 'Buổi tập đã hoàn thành.' },
  REJECTED: { label: 'Coach từ chối', variant: 'danger', message: 'Coach đã từ chối lịch tập này.' },
  CANCELLED_BY_PLAYER: { label: 'Bạn đã hủy', variant: 'danger', message: 'Lịch tập đã được hủy.' },
  CANCELLED_BY_COACH: { label: 'Coach đã hủy', variant: 'danger', message: 'Coach đã hủy lịch tập.' },
  EXPIRED: { label: 'Thanh toán hết hạn', variant: 'secondary', message: 'Giao dịch đã hết hạn hoặc không thành công.' },
  NO_SHOW: { label: 'Vắng mặt', variant: 'secondary', message: 'Buổi tập được ghi nhận vắng mặt.' },
};

const formatDateTime = (value: string) => new Date(value).toLocaleString('vi-VN', {
  weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
});

const CoachBookingSuccessPage = () => {
  const { bookingId = '' } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<CoachBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!bookingId) return;
    coachService.syncPayment(bookingId)
      .then(setBooking)
      .catch(async () => {
        try { setBooking(await coachService.playerBooking(bookingId)); }
        catch { setError('Không thể tải chi tiết lịch Coach.'); }
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (loading) return <div className="min-vh-100 d-flex align-items-center justify-content-center"><Spinner variant="success" /></div>;
  if (!booking) return <Container className="py-5 text-center"><p className="text-danger">{error}</p><Button variant="outline-success" onClick={() => navigate('/coaches')}>Về danh sách Coach</Button></Container>;

  const status = STATUS[booking.status];
  const coachName = booking.coachId?.fullName || 'Coach EZSport';
  const paymentLabel = booking.paymentStatus === 'PAID'
    ? 'Đã thanh toán'
    : ['CANCELLED_BY_PLAYER', 'CANCELLED_BY_COACH'].includes(booking.status)
      ? 'Đã hủy'
      : booking.status === 'EXPIRED'
        ? 'Hết hạn thanh toán'
        : 'Chưa thanh toán';

  return <Container className="py-5" style={{ maxWidth: 680 }}>
    <Card className="border-0 shadow-sm" style={{ borderRadius: 18 }}>
      <Card.Body className="p-4 p-md-5">
        <div className="text-center mb-4">
          <span className="material-symbols-outlined text-success" style={{ fontSize: 56 }}>event_available</span>
          <h3 className="fw-bold mt-2">Chi tiết lịch Coach</h3>
          <Badge bg={status.variant}>{status.label}</Badge>
          <p className="text-muted mt-2 mb-0">{status.message}</p>
        </div>

        <div className="border rounded-4 p-3">
          <Detail label="Mã lịch" value={`#${booking._id.slice(-8).toUpperCase()}`} />
          <Detail label="Coach" value={coachName} />
          <Detail label="Môn thể thao" value={booking.sport} />
          <Detail label="Bắt đầu" value={formatDateTime(booking.startAt)} />
          <Detail label="Thời lượng" value={`${booking.durationMinutes} phút`} />
          <Detail label="Hình thức" value={booking.teachingMode === 'online' ? 'Online' : 'Trực tiếp'} />
          {booking.location && <Detail label="Địa điểm" value={booking.location} />}
          <Detail label="Thanh toán" value={paymentLabel} />
          <Detail label="Tổng cộng" value={`${booking.totalPrice.toLocaleString('vi-VN')}đ`} strong />
        </div>

        {booking.refund && <div className="border border-warning rounded-4 p-3 mt-3" style={{ background: '#fffbeb' }}>
          <div className="d-flex justify-content-between align-items-center mb-2"><strong>Hoàn tiền</strong><Badge bg={booking.refund.status === 'REFUNDED' ? 'success' : booking.refund.status === 'FAILED' ? 'danger' : 'warning'}>{booking.refund.status === 'PENDING' ? 'Chờ xử lý' : booking.refund.status === 'PROCESSING' ? 'Đang xử lý' : booking.refund.status === 'REFUNDED' ? 'Đã hoàn tiền' : 'Hoàn tiền thất bại'}</Badge></div>
          <Detail label="Số tiền hoàn" value={`${booking.refund.amount.toLocaleString('vi-VN')}đ`} strong />
          <Detail label="Lý do" value={booking.refund.reason} />
          {booking.refund.transactionReference && <Detail label="Mã giao dịch" value={booking.refund.transactionReference} />}
          {booking.refund.adminNote && <Detail label="Ghi chú" value={booking.refund.adminNote} />}
        </div>}

        <div className="d-flex gap-2 mt-4">
          <Button className="flex-grow-1" variant="success" onClick={() => navigate('/coaches')}>Tiếp tục tìm Coach</Button>
          <Button variant="outline-secondary" onClick={() => navigate('/my-bookings')}>Lịch của tôi</Button>
        </div>
      </Card.Body>
    </Card>
  </Container>;
};

const Detail = ({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) => <div className="d-flex justify-content-between gap-3 py-2 border-bottom">
  <span className="text-muted">{label}</span>
  <span className={strong ? 'fw-bold text-success text-end' : 'fw-semibold text-end'}>{value}</span>
</div>;

export default CoachBookingSuccessPage;
