import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Spinner, Tabs, Tab } from 'react-bootstrap';
import { bookingService, type Booking } from '../../../services/booking.service';

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
  PENDING:    { label: 'Chờ xác nhận', variant: 'warning' },
  CONFIRMED:  { label: 'Đã xác nhận',  variant: 'success' },
  CHECKED_IN: { label: 'Đã check-in',  variant: 'info' },
  COMPLETED:  { label: 'Hoàn thành',   variant: 'secondary' },
  CANCELLED:  { label: 'Đã huỷ',       variant: 'danger' },
};

const TAB_STATUSES: Record<string, string[]> = {
  upcoming:  ['PENDING', 'CONFIRMED'],
  checked_in: ['CHECKED_IN'],
  done:      ['COMPLETED'],
  cancelled: ['CANCELLED'],
};

const BookingCard: React.FC<{
  booking: Booking;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
}> = ({ booking, onClick, onDelete }) => {
  const status = STATUS_MAP[booking.status] ?? { label: booking.status, variant: 'secondary' };
  const date = new Date(booking.bookingDate).toLocaleDateString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  const showDelete = booking.status === 'CANCELLED';

  return (
    <Card
      className="border-0 shadow-sm mb-3"
      style={{ borderRadius: '14px', cursor: 'pointer' }}
      onClick={onClick}
    >
      <Card.Body className="p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <p className="fw-bold mb-0" style={{ fontSize: '15px' }}>
              {(booking.courtId as any)?.venue?.name || 'Sân EZSport'}
            </p>
            <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
              {(booking.courtId as any)?.name || 'Sân 1'} · {booking.sport}
            </p>
          </div>
          <div className="d-flex flex-column align-items-end gap-1">
            <Badge bg={status.variant} style={{ fontSize: '11px' }}>{status.label}</Badge>
            {showDelete && onDelete && (
              <button
                className="btn btn-link p-0 text-danger d-flex align-items-center mt-1 text-decoration-none"
                style={{ fontSize: '12px', opacity: 0.8 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(e);
                }}
              >
                <span className="material-symbols-outlined me-0.5" style={{ fontSize: '16px' }}>delete</span>
                Xóa lịch sử
              </button>
            )}
          </div>
        </div>
        <div className="d-flex gap-3" style={{ fontSize: '13px', color: '#6b7280' }}>
          <span>
            <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '14px' }}>calendar_today</span>
            {date}
          </span>
          <span>
            <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '14px' }}>schedule</span>
            {booking.startTime} – {booking.endTime}
          </span>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <span style={{ fontSize: '13px', color: '#6b7280' }}>#{booking._id.slice(-8).toUpperCase()}</span>
          <span className="fw-bold" style={{ color: '#16a34a', fontSize: '15px' }}>
            {booking.totalPrice.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

const MyBookingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    bookingService
      .getUserBookings({ limit: 50 })
      .then(({ bookings }) => setBookings(bookings))
      .catch(() => setError('Không thể tải lịch sử đặt sân.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteBooking = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn đặt sân này khỏi lịch sử không?')) {
      return;
    }
    try {
      await bookingService.deleteBookingHistory(bookingId);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      alert('Không thể xóa lịch sử đặt sân.');
    }
  };

  const handleDeleteAllBookings = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử đặt sân đã hủy không?')) {
      return;
    }
    try {
      await bookingService.deleteAllBookingHistory();
      // Keep only bookings that are NOT cancelled
      setBookings((prev) => prev.filter((b) => b.status !== 'CANCELLED'));
    } catch (err) {
      alert('Không thể xóa tất cả lịch sử đặt sân.');
    }
  };

  const filtered = bookings.filter((b) => TAB_STATUSES[activeTab]?.includes(b.status));

  return (
    <Container className="py-4" style={{ maxWidth: '720px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Lịch sử đặt sân</h5>
        {activeTab === 'cancelled' && bookings.some(b => b.status === 'CANCELLED') && (
          <button
            className="btn btn-outline-danger btn-sm d-flex align-items-center px-2.5 py-1.5"
            style={{ borderRadius: '10px', fontSize: '13px' }}
            onClick={handleDeleteAllBookings}
          >
            <span className="material-symbols-outlined me-1" style={{ fontSize: '18px' }}>delete_sweep</span>
            Xóa tất cả lịch sử
          </button>
        )}
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'upcoming')}
        className="mb-4"
        style={{ borderBottom: '2px solid #e5e7eb' }}
      >
        <Tab eventKey="upcoming" title="Sắp tới" />
        <Tab eventKey="checked_in" title="Đã check-in" />
        <Tab eventKey="done" title="Hoàn thành" />
        <Tab eventKey="cancelled" title="Đã huỷ" />
      </Tabs>

      {loading && (
        <div className="text-center py-5"><Spinner variant="success" /></div>
      )}

      {!loading && error && (
        <p className="text-danger text-center">{error}</p>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-5">
          <span className="material-symbols-outlined d-block mb-2" style={{ fontSize: '48px', color: '#d1d5db' }}>sports_tennis</span>
          <p className="text-muted">Không có đơn đặt sân nào.</p>
        </div>
      )}

      {!loading && filtered.map((b) => (
        <BookingCard
          key={b._id}
          booking={b}
          onClick={() => navigate(`/my-bookings/${b._id}`)}
          onDelete={() => handleDeleteBooking(b._id)}
        />
      ))}
    </Container>
  );
};

export default MyBookingsPage;
