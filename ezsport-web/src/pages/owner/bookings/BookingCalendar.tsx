import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { W, TX, TX2 } from '../../../utils/theme';

interface Booking {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  court: string;
  date: string;
  timeSlot: string;
  duration: string;
  paymentMethod: string;
  amount: string;
  status: 'confirmed' | 'pending_payment' | 'pending_confirm' | 'cancelled';
  notes: string;
  top: number;
  height: number;
  column: number;
}

interface BookingCalendarProps {
  bookingsList: Booking[];
  onSelectBooking: (booking: Booking) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ bookingsList, onSelectBooking }) => {
  const hours = Array.from({ length: 13 }, (_, i) => {
    const hr = 8 + i;
    return `${hr.toString().padStart(2, '0')}:00`;
  });

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div
      key={booking.id}
      onClick={() => onSelectBooking(booking)}
      style={{
        position: 'absolute', top: `${booking.top}px`, height: `${booking.height}px`,
        left: '8px', right: '8px', borderRadius: '12px',
        background: booking.status === 'confirmed' ? '#ecfdf5' : '#fffbeb',
        border: booking.status === 'confirmed' ? '1.5px solid #10b981' : '1.5px dashed #f59e0b',
        boxShadow: '0 4px 10px rgba(0,0,0,0.02)',
        padding: '12px', cursor: 'pointer', zIndex: 3,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
    >
      <div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: TX }}>{booking.name}</div>
        <span style={{ fontSize: '11px', color: TX2, fontWeight: 600 }}>{booking.timeSlot}</span>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <span style={{ fontSize: '10px', fontWeight: 700, color: booking.status === 'confirmed' ? '#047857' : '#b45309' }}>
          {booking.status === 'confirmed' ? '● Đã TT' : '● Chờ duyệt'}
        </span>
        <span style={{ display: 'inline-block', background: booking.status === 'confirmed' ? '#dcfce7' : '#fef3c7', color: booking.status === 'confirmed' ? '#15803d' : '#a16207', border: 'none', padding: '4px 8px', borderRadius: '20px', fontSize: '9px', fontWeight: 700 }}>
          {booking.duration}
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ background: W, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', padding: '24px', overflowX: 'auto', minWidth: '900px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 800, color: TX, margin: '0 0 4px 0' }}>Trang chủ / Lịch đặt sân</h4>
          <span style={{ fontSize: '13px', color: TX2 }}>Hệ thống quản lý lịch đặt theo thời gian thực</span>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-success" size="sm" className="rounded-pill px-3 fw-bold border-success border-opacity-50 text-success bg-white" style={{ fontSize: '13px' }}>
            Hôm nay
          </Button>
          <Dropdown>
            <Dropdown.Toggle variant="light" size="sm" style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '20px', fontSize: '13px', fontWeight: 700, color: TX, display: 'flex', alignItems: 'center', gap: '6px' }}>
              Lịch tuần
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Lịch ngày</Dropdown.Item>
              <Dropdown.Item>Lịch tuần</Dropdown.Item>
              <Dropdown.Item>Lịch tháng</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* Column Headers */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', border: '1px solid #e2e8f0', borderBottomWidth: 0 }}>
          <div style={{ width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #cbd5e1', padding: '16px 0' }}>
            <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>schedule</span>
          </div>
          {[
            { name: 'Sân A1', sub: 'Khách An - Sân cỏ nhân tạo' },
            { name: 'Sân A2', sub: 'Khách An - Sân cỏ nhân tạo' },
            { name: 'Sân B1', sub: 'Khách An - Sân Futsal' },
          ].map((court, idx, arr) => (
            <div key={court.name} style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: idx < arr.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: TX }}>{court.name}</span>
              <span style={{ fontSize: '11px', color: TX2, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginTop: '2px' }}>{court.sub}</span>
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div style={{ display: 'flex', position: 'relative', border: '1px solid #e2e8f0', background: W }}>
          {/* Time column */}
          <div style={{ width: '80px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #cbd5e1', zIndex: 2, background: '#f8fafc' }}>
            {hours.map((hour, idx) => (
              <div key={idx} style={{ height: '60px', display: 'flex', alignItems: 'start', justifyContent: 'center', paddingTop: '6px', fontSize: '12px', fontWeight: 700, color: TX2, borderBottom: idx < hours.length - 1 ? '1px dashed #cbd5e1' : 'none' }}>
                {hour}
              </div>
            ))}
          </div>

          {/* Court columns */}
          <div style={{ flex: 1, display: 'flex', position: 'relative', height: `${hours.length * 60}px` }}>
            {/* Horizontal grid lines */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
              {hours.map((_, idx) => (
                <div key={idx} style={{ height: '60px', borderBottom: idx < hours.length - 1 ? '1px solid #f1f5f9' : 'none' }} />
              ))}
            </div>

            {/* Current time indicator (13:00 = 300px) */}
            <div style={{ position: 'absolute', top: '300px', left: 0, right: 0, height: '2px', background: '#ef4444', zIndex: 4, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', marginLeft: '-4px' }} />
            </div>

            {[1, 2, 3].map((col, idx, arr) => (
              <div key={col} style={{ flex: 1, height: '100%', position: 'relative', borderRight: idx < arr.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                {bookingsList.filter(b => b.column === col && b.status !== 'cancelled').map(booking => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
