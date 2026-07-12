import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Container, Spinner, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { bookingService, type Booking } from '../../../services/booking.service';
import { coachService, type CoachBooking } from '../../../services/coach.service';

type BookingKind = 'court' | 'coach';
type HistoryTab = 'upcoming' | 'done' | 'cancelled';

const COURT_STATUS: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'success' },
  CHECKED_IN: { label: 'Đã check-in', variant: 'info' },
  COMPLETED: { label: 'Hoàn thành', variant: 'secondary' },
  CANCELLED: { label: 'Đã hủy', variant: 'danger' },
};

const COACH_STATUS: Record<CoachBooking['status'], { label: string; variant: string }> = {
  PENDING_PAYMENT: { label: 'Chưa thanh toán', variant: 'warning' },
  PENDING_COACH_CONFIRMATION: { label: 'Chờ Coach xác nhận', variant: 'info' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'success' },
  COMPLETED: { label: 'Hoàn thành', variant: 'secondary' },
  REJECTED: { label: 'Coach từ chối', variant: 'danger' },
  CANCELLED_BY_PLAYER: { label: 'Đã hủy', variant: 'danger' },
  CANCELLED_BY_COACH: { label: 'Coach đã hủy', variant: 'danger' },
  EXPIRED: { label: 'Hết hạn thanh toán', variant: 'secondary' },
  NO_SHOW: { label: 'Vắng mặt', variant: 'secondary' },
};

const COURT_TABS: Record<HistoryTab, string[]> = {
  upcoming: ['PENDING', 'CONFIRMED', 'CHECKED_IN'],
  done: ['COMPLETED'],
  cancelled: ['CANCELLED'],
};

const COACH_TABS: Record<HistoryTab, CoachBooking['status'][]> = {
  upcoming: ['PENDING_PAYMENT', 'PENDING_COACH_CONFIRMATION', 'CONFIRMED'],
  done: ['COMPLETED'],
  cancelled: ['REJECTED', 'CANCELLED_BY_PLAYER', 'CANCELLED_BY_COACH', 'EXPIRED', 'NO_SHOW'],
};

const formatCoachDate = (value: string) => new Date(value).toLocaleDateString('vi-VN', {
  weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh',
});

const formatCoachTime = (value: string) => new Date(value).toLocaleTimeString('vi-VN', {
  hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh',
});

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [kind, setKind] = useState<BookingKind>('court');
  const [activeTab, setActiveTab] = useState<HistoryTab>('upcoming');
  const [courtBookings, setCourtBookings] = useState<Booking[]>([]);
  const [coachBookings, setCoachBookings] = useState<CoachBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.allSettled([
      bookingService.getUserBookings({ limit: 50 }),
      coachService.playerBookings(),
    ]).then(([courtResult, coachResult]) => {
      if (courtResult.status === 'fulfilled') setCourtBookings(courtResult.value.bookings);
      if (coachResult.status === 'fulfilled') setCoachBookings(coachResult.value as CoachBooking[]);
      if (courtResult.status === 'rejected' && coachResult.status === 'rejected') setError('Không thể tải lịch của bạn.');
    }).finally(() => setLoading(false));
  }, []);

  const visibleCourts = useMemo(
    () => courtBookings.filter(booking => COURT_TABS[activeTab].includes(booking.status)),
    [courtBookings, activeTab],
  );
  const visibleCoaches = useMemo(
    () => coachBookings.filter(booking => COACH_TABS[activeTab].includes(booking.status)),
    [coachBookings, activeTab],
  );

  const cancelCoachBooking = async (event: React.MouseEvent, booking: CoachBooking) => {
    event.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn hủy lịch Coach này?')) return;
    try {
      await coachService.cancel(booking._id, 'Player hủy lịch');
      setCoachBookings(current => current.map(item => item._id === booking._id
        ? { ...item, status: 'CANCELLED_BY_PLAYER', paymentStatus: item.paymentStatus }
        : item));
    } catch {
      window.alert('Không thể hủy lịch Coach.');
    }
  };

  const deleteCourtBooking = async (event: React.MouseEvent, bookingId: string) => {
    event.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa lịch sử đặt sân này?')) return;
    try {
      await bookingService.deleteBookingHistory(bookingId);
      setCourtBookings(current => current.filter(item => item._id !== bookingId));
    } catch {
      window.alert('Không thể xóa lịch sử đặt sân.');
    }
  };

  const currentItems = kind === 'court' ? visibleCourts.length : visibleCoaches.length;

  return <Container className="py-4" style={{ maxWidth: 760 }}>
    <div className="mb-4">
      <h4 className="fw-bold mb-1">Lịch của tôi</h4>
      <p className="text-muted mb-0">Quản lý lịch đặt sân và lịch tập cùng Coach.</p>
    </div>

    <div className="d-flex gap-2 mb-3" role="group" aria-label="Loại lịch">
      <Button variant={kind === 'court' ? 'success' : 'outline-success'} onClick={() => { setKind('court'); setActiveTab('upcoming'); }}>
        Đặt sân <Badge bg={kind === 'court' ? 'light' : 'success'} text={kind === 'court' ? 'dark' : undefined} className="ms-1">{courtBookings.length}</Badge>
      </Button>
      <Button variant={kind === 'coach' ? 'success' : 'outline-success'} onClick={() => { setKind('coach'); setActiveTab('upcoming'); }}>
        Đặt Coach <Badge bg={kind === 'coach' ? 'light' : 'success'} text={kind === 'coach' ? 'dark' : undefined} className="ms-1">{coachBookings.length}</Badge>
      </Button>
    </div>

    <Tabs activeKey={activeTab} onSelect={key => setActiveTab((key || 'upcoming') as HistoryTab)} className="mb-4">
      <Tab eventKey="upcoming" title="Sắp tới" />
      <Tab eventKey="done" title="Hoàn thành" />
      <Tab eventKey="cancelled" title="Đã hủy / Hết hạn" />
    </Tabs>

    {loading && <div className="text-center py-5"><Spinner variant="success" /></div>}
    {!loading && error && <p className="text-danger text-center">{error}</p>}
    {!loading && !error && currentItems === 0 && <div className="text-center py-5 text-muted">
      <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: 48, color: '#d1d5db' }}>{kind === 'court' ? 'sports_tennis' : 'sports'}</span>
      Chưa có lịch {kind === 'court' ? 'đặt sân' : 'Coach'} trong mục này.
    </div>}

    {!loading && kind === 'court' && visibleCourts.map(booking => {
      const status = COURT_STATUS[booking.status] || { label: booking.status, variant: 'secondary' };
      return <Card key={booking._id} className="border-0 shadow-sm mb-3" style={{ borderRadius: 14, cursor: 'pointer' }} onClick={() => navigate(`/my-bookings/${booking._id}`)}>
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between gap-3">
            <div><strong>{(booking.courtId as any)?.venue?.name || 'Sân EZSport'}</strong><div className="small text-muted">{booking.sport} · {booking.startTime}–{booking.endTime}</div></div>
            <div className="text-end"><Badge bg={status.variant}>{status.label}</Badge><div className="fw-bold text-success mt-2">{booking.totalPrice.toLocaleString('vi-VN')}đ</div></div>
          </div>
          {booking.status === 'CANCELLED' && <Button size="sm" variant="link" className="text-danger px-0 mt-2" onClick={event => deleteCourtBooking(event, booking._id)}>Xóa lịch sử</Button>}
        </Card.Body>
      </Card>;
    })}

    {!loading && kind === 'coach' && visibleCoaches.map(booking => {
      const status = COACH_STATUS[booking.status];
      const canCancel = ['PENDING_PAYMENT', 'PENDING_COACH_CONFIRMATION', 'CONFIRMED'].includes(booking.status);
      return <Card key={booking._id} className="border-0 shadow-sm mb-3" style={{ borderRadius: 14, cursor: 'pointer' }} onClick={() => navigate(`/coach-bookings/success/${booking._id}`)}>
        <Card.Body className="p-3">
          <div className="d-flex justify-content-between gap-3">
            <div>
              <strong>{booking.coachId?.fullName || 'Coach EZSport'}</strong>
              <div className="small text-muted">{booking.sport} · {formatCoachDate(booking.startAt)}</div>
              <div className="small text-muted">{formatCoachTime(booking.startAt)} · {booking.durationMinutes} phút · {booking.teachingMode === 'online' ? 'Online' : 'Trực tiếp'}</div>
            </div>
            <div className="text-end"><Badge bg={status.variant}>{status.label}</Badge><div className="fw-bold text-success mt-2">{booking.totalPrice.toLocaleString('vi-VN')}đ</div></div>
          </div>
          {canCancel && <Button size="sm" variant="outline-danger" className="mt-3" onClick={event => cancelCoachBooking(event, booking)}>Hủy lịch Coach</Button>}
        </Card.Body>
      </Card>;
    })}
  </Container>;
};

export default MyBookingsPage;
