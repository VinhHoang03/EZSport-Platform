import { useEffect, useState } from 'react';
import { Button, Card, Container, Nav, Spinner, Tab } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import CoachAvailabilityCalendar, { type DateException, type WeeklySlot } from '../../components/coach/CoachAvailabilityCalendar';
import '../../components/coach/CoachAvailabilityCalendar.css';
import { coachService } from '../../services/coach.service';
import { ROUTES } from '../../constants';

interface CoachProfileState {
  reviewStatus: string;
  updatedAt?: string;
  weeklyAvailability?: WeeklySlot[];
  dateExceptions?: DateException[];
}

interface CoachBookingState {
  _id: string;
  playerId?: { fullName?: string };
  startAt: string;
  endAt: string;
  sport: string;
  status: string;
}

const errorMessage = (error: unknown, fallback: string) => {
  const candidate = error as { response?: { data?: { message?: string } } };
  return candidate.response?.data?.message || fallback;
};

const CoachDashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CoachProfileState | null>(null);
  const [bookings, setBookings] = useState<CoachBookingState[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    try {
      const [coachProfile, coachBookings] = await Promise.all([
        coachService.getMyProfile(),
        coachService.getMyBookings(),
      ]);
      setProfile(coachProfile);
      setBookings(coachBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveAvailability = async (weeklyAvailability: WeeklySlot[], dateExceptions: DateException[]) => {
    setSaving(true);
    setMessage('');
    try {
      const updated = await coachService.saveAvailability({
        weeklyAvailability,
        dateExceptions,
        isAcceptingBookings: true,
      });
      setProfile(updated);
      setMessage('Đã lưu lịch rảnh. Player có thể xem các khung giờ mới ngay bây giờ.');
    } catch (error: unknown) {
      setMessage(errorMessage(error, 'Không thể lưu lịch rảnh.'));
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const transition = async (id: string, action: 'confirm' | 'reject' | 'complete') => {
    const reason = action === 'reject' ? window.prompt('Lý do từ chối:') || undefined : undefined;
    if (action === 'reject' && !reason) return;
    try {
      await coachService.transitionBooking(id, action, reason);
      load();
    } catch (error: unknown) {
      setMessage(errorMessage(error, 'Không thể cập nhật lịch.'));
    }
  };

  if (loading) return <div className="text-center py-5"><Spinner variant="success" /></div>;
  if (!profile || profile.reviewStatus !== 'APPROVED') return <Container className="py-5" style={{ maxWidth: 720 }}><Card><Card.Body className="p-4"><h3>Hồ sơ Coach chưa sẵn sàng</h3><p className="text-muted">Hãy hoàn thiện thông tin huấn luyện trong Hồ sơ cá nhân và chờ Admin duyệt trước khi nhận lịch.</p><Button variant="success" onClick={() => navigate(ROUTES.PROFILE)}>Mở hồ sơ cá nhân</Button></Card.Body></Card></Container>;

  return <Container className="py-4" style={{ maxWidth: 1240 }}>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div><h2 className="fw-bold mb-1">Lịch dạy Coach</h2><p className="text-muted mb-0">Mở lịch theo tuần và điều chỉnh riêng từng ngày khi cần.</p></div>
      <Button variant="outline-success" onClick={() => navigate(ROUTES.PROFILE)}>Hồ sơ cá nhân</Button>
    </div>
    {message && <div className="alert alert-info py-2">{message}</div>}
    <Tab.Container defaultActiveKey="availability">
      <Nav variant="tabs" className="mb-3">
        <Nav.Item><Nav.Link eventKey="availability">Lịch rảnh</Nav.Link></Nav.Item>
        <Nav.Item><Nav.Link eventKey="bookings">Lịch dạy</Nav.Link></Nav.Item>
      </Nav>
      <Tab.Content>
        <Tab.Pane eventKey="availability">
          <CoachAvailabilityCalendar
            key={`${profile.updatedAt || ''}-${profile.weeklyAvailability?.length || 0}`}
            weeklyAvailability={profile.weeklyAvailability || []}
            dateExceptions={profile.dateExceptions || []}
            saving={saving}
            onSave={saveAvailability}
          />
        </Tab.Pane>
        <Tab.Pane eventKey="bookings">
          <Card><Card.Body>{bookings.length ? bookings.map(booking => <div className="border-bottom py-3 d-flex justify-content-between align-items-center" key={booking._id}><div><strong>{booking.playerId?.fullName || 'Player'}</strong><div className="text-muted small">{new Date(booking.startAt).toLocaleString('vi-VN')} · {booking.sport} · {booking.status}</div></div><div className="d-flex gap-2">{booking.status === 'PENDING_COACH_CONFIRMATION' && <><Button size="sm" variant="success" onClick={() => transition(booking._id, 'confirm')}>Xác nhận</Button><Button size="sm" variant="outline-danger" onClick={() => transition(booking._id, 'reject')}>Từ chối</Button></>}{booking.status === 'CONFIRMED' && new Date(booking.endAt) <= new Date() && <Button size="sm" onClick={() => transition(booking._id, 'complete')}>Hoàn tất</Button>}</div></div>) : <p className="text-muted mb-0">Chưa có lịch dạy.</p>}</Card.Body></Card>
        </Tab.Pane>
      </Tab.Content>
    </Tab.Container>
  </Container>;
};

export default CoachDashboardPage;
