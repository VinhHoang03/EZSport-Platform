import React, { useEffect, useState, useCallback } from 'react';
import { Spinner, Button } from 'react-bootstrap';
import { W, TX, TX2 } from '../../../utils/theme';
import { venueService, courtService, type Venue, type Court } from '../../../services/venue.service';

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
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  notes: string;
  top: number;
  height: number;
  column: number;
}

interface BookingCalendarProps {
  bookingsList: Booking[];
  onSelectBooking: (booking: Booking) => void;
  loading?: boolean;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  bookingsList,
  onSelectBooking,
  loading = false,
  selectedDate = new Date(),
  onDateChange,
}) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingCourts, setLoadingCourts] = useState(false);

  const formatDateVN = (d: Date) =>
    d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  const toInputValue = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }; // YYYY-MM-DD


  const isToday = (d: Date) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const changeDate = (offset: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + offset);
    onDateChange?.(next);
  };

  // Load venues on mount
  useEffect(() => {
    venueService.getMyVenues({ active: 'all' })
      .then(v => {
        setVenues(v);
        if (v.length > 0) setSelectedVenueId(v[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoadingVenues(false));
  }, []);

  // Fetch courts when selected venue changes
  const fetchCourts = useCallback((venueId: string) => {
    if (!venueId) return;
    setLoadingCourts(true);
    // Fetch tất cả sân, không lọc theo active
    courtService.getCourts({ venue: venueId, active: 'all' })
      .then(courts => {
        setCourts(courts);
      })
      .catch(console.error)
      .finally(() => setLoadingCourts(false));
  }, []);

  useEffect(() => {
    if (selectedVenueId) fetchCourts(selectedVenueId);
  }, [selectedVenueId, fetchCourts]);

  const selectedVenue = venues.find(v => v._id === selectedVenueId) || null;

  const handleDeleteCourt = async (court: Court) => {
    if (!window.confirm(`Xoá sân "${court.name}"?`)) return;
    try {
      await courtService.deleteCourt(court._id);
      fetchCourts(selectedVenueId);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi xoá sân');
    }
  };

  const handleToggleStatus = async (court: Court) => {
    const nextActive = !(court as any).isActive;
    try {
      await courtService.updateCourt(court._id, {
        isActive: nextActive,
        status: nextActive ? 'available' : 'inactive',
      } as any);
      fetchCourts(selectedVenueId);
    } catch (err: any) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const hours = Array.from({ length: 17 }, (_, i) => {
    const hr = 6 + i; // Bắt đầu từ 6h sáng
    return `${hr.toString().padStart(2, '0')}:00`;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          bg: '#ecfdf5',
          border: '1.5px solid #10b981',
          color: '#047857',
          badgeBg: '#dcfce7',
          badgeColor: '#15803d',
          label: '● Đã TT'
        };
      case 'CHECKED_IN':
        return {
          bg: '#f3e8ff',
          border: '1.5px solid #8b5cf6',
          color: '#6d28d9',
          badgeBg: '#faf5ff',
          badgeColor: '#7c3aed',
          label: '● Đã Check-in'
        };
      case 'COMPLETED':
        return {
          bg: '#f3f4f6',
          border: '1.5px solid #9ca3af',
          color: '#4b5563',
          badgeBg: '#e5e7eb',
          badgeColor: '#374151',
          label: '● Hoàn thành'
        };
      case 'CANCELLED':
        return {
          bg: '#fef2f2',
          border: '1.5px solid #ef4444',
          color: '#b91c1c',
          badgeBg: '#fee2e2',
          badgeColor: '#991b1b',
          label: '● Đã hủy'
        };
      case 'PENDING':
      default:
        return {
          bg: '#fffbeb',
          border: '1.5px dashed #f59e0b',
          color: '#b45309',
          badgeBg: '#fef3c7',
          badgeColor: '#a16207',
          label: '● Chờ duyệt'
        };
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const style = getStatusStyle(booking.status);
    return (
      <div
        key={booking.id}
        onClick={() => onSelectBooking(booking)}
        style={{
          position: 'absolute', top: `${booking.top}px`, height: `${booking.height}px`,
          left: '8px', right: '8px', borderRadius: '12px',
          background: style.bg,
          border: style.border,
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
          <span style={{ fontSize: '10px', fontWeight: 700, color: style.color }}>
            {style.label}
          </span>
          <span style={{ display: 'inline-block', background: style.badgeBg, color: style.badgeColor, border: 'none', padding: '4px 8px', borderRadius: '20px', fontSize: '9px', fontWeight: 700 }}>
            {booking.duration}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: W, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', padding: '24px', overflowX: 'auto', minWidth: '900px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ fontSize: '18px', fontWeight: 800, color: TX, margin: '0 0 4px 0' }}>Lịch đặt sân</h4>
          <span style={{ fontSize: '13px', color: TX2 }}>Quản lý lịch đặt theo ngày</span>
        </div>

        {/* ── Date Navigator ── */}
        <div className="d-flex align-items-center gap-2" style={{ flexWrap: 'wrap' }}>
          {/* Prev day */}
          <button
            onClick={() => changeDate(-1)}
            style={{
              width: '34px', height: '34px', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            title="Ngày trước"
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f8fafc')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: TX }}>chevron_left</span>
          </button>

          {/* Date label + input */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: isToday(selectedDate)
                  ? 'linear-gradient(135deg, #0f3d22, #166534)'
                  : 'linear-gradient(135deg, #1e40af, #1d4ed8)',
                color: '#fff',
                borderRadius: '12px', padding: '7px 16px',
                fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                whiteSpace: 'nowrap',
              }}
              onClick={() => (document.getElementById('bk-date-input') as HTMLInputElement)?.showPicker?.()}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>calendar_today</span>
              {isToday(selectedDate) ? '📅 Hôm nay · ' : ''}{formatDateVN(selectedDate)}
            </div>
            <input
              id="bk-date-input"
              type="date"
              value={toInputValue(selectedDate)}
              onChange={e => {
                if (e.target.value) onDateChange?.(new Date(e.target.value + 'T00:00:00'));
              }}
              style={{
                position: 'absolute', opacity: 0, pointerEvents: 'none',
                top: 0, left: 0, width: '1px', height: '1px',
              }}
            />
          </div>

          {/* Next day */}
          <button
            onClick={() => changeDate(1)}
            style={{
              width: '34px', height: '34px', borderRadius: '10px',
              border: '1px solid #e2e8f0', background: '#f8fafc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            title="Ngày sau"
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f8fafc')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: TX }}>chevron_right</span>
          </button>

          {/* Today shortcut */}
          {!isToday(selectedDate) && (
            <Button
              variant="outline-success"
              size="sm"
              className="rounded-pill px-3 fw-bold"
              style={{ fontSize: '12px', borderColor: '#22c55e', color: '#15803d' }}
              onClick={() => onDateChange?.(new Date())}
            >
              Hôm nay
            </Button>
          )}

          {/* Booking count badge */}
          <div style={{
            background: bookingsList.length > 0 ? '#dcfce7' : '#f1f5f9',
            color: bookingsList.length > 0 ? '#15803d' : '#64748b',
            borderRadius: '20px', padding: '6px 14px',
            fontSize: '12px', fontWeight: 700,
            border: bookingsList.length > 0 ? '1px solid #86efac' : '1px solid #e2e8f0',
          }}>
            {bookingsList.filter(b => b.status !== 'CANCELLED').length} lịch hôm nay
          </div>
        </div>
      </div>

      {/* ═══ Premium Venue & Court Selector Bar ═══ */}
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 40%, #f0f9ff 100%)',
          padding: '20px 24px',
          borderRadius: '20px',
          border: '1px solid rgba(134,239,172,0.3)',
          marginBottom: '20px',
          boxShadow: '0 4px 24px rgba(15,61,34,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        {/* Row 1: Venue selector */}
        <div className="d-flex align-items-center gap-3" style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(134,239,172,0.25)' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #0f3d22, #166534)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(15,61,34,0.25)',
            flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#fff' }}>location_on</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
              📍 Địa điểm đang quản lý
            </div>
            {loadingVenues ? (
              <Spinner size="sm" variant="success" />
            ) : venues.length === 0 ? (
              <span style={{ fontSize: '14px', color: TX2, fontStyle: 'italic' }}>Chưa có địa điểm nào</span>
            ) : (
              <select
                style={{
                  border: 'none', background: 'transparent', outline: 'none',
                  fontSize: '16px', fontWeight: 800, color: '#0f3d22', padding: 0,
                  cursor: 'pointer', width: '100%', maxWidth: '320px',
                }}
                value={selectedVenueId}
                onChange={e => setSelectedVenueId(e.target.value)}
              >
                {venues.map(v => (
                  <option key={v._id} value={v._id}>{v.name}</option>
                ))}
              </select>
            )}
          </div>
          {selectedVenue && (
            <div style={{
              background: 'rgba(15,61,34,0.08)', borderRadius: '10px',
              padding: '6px 14px', fontSize: '11px', fontWeight: 700,
              color: '#0f3d22', display: 'flex', alignItems: 'center', gap: '6px',
              flexShrink: 0,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>verified</span>
              Đang hoạt động
            </div>
          )}
        </div>

        {/* Row 2: Courts list + Add button */}
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div style={{
            fontSize: '11px', fontWeight: 800, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            display: 'flex', alignItems: 'center', gap: '4px',
            marginRight: '4px', flexShrink: 0,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>grid_view</span>
          </div>

          {loadingCourts ? (
            <Spinner size="sm" variant="success" />
          ) : courts.length === 0 ? (
            <span style={{
              fontSize: '13px', color: '#94a3b8', fontStyle: 'italic',
              background: 'rgba(148,163,184,0.08)', borderRadius: '10px',
              padding: '6px 14px',
            }}>
              Chưa có sân — hãy thêm sân đầu tiên →
            </span>
          ) : (
            courts.map((court) => {
              const isActive = (court as any).isActive !== false;
              return (
                <div
                  key={court._id}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
                      : 'linear-gradient(135deg, #fef9e7, #fef3c7)',
                    color: isActive ? '#15803d' : '#92400e',
                    border: isActive ? '1.5px solid #86efac' : '1.5px dashed #fbbf24',
                    borderRadius: '24px', padding: '6px 16px', fontSize: '13px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: isActive
                      ? '0 2px 8px rgba(34,197,94,0.12)'
                      : '0 2px 8px rgba(251,191,36,0.15)',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    opacity: isActive ? 1 : 0.85,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
                    e.currentTarget.style.boxShadow = isActive
                      ? '0 6px 20px rgba(34,197,94,0.2)'
                      : '0 6px 20px rgba(251,191,36,0.25)';
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = isActive
                      ? '0 2px 8px rgba(34,197,94,0.12)'
                      : '0 2px 8px rgba(251,191,36,0.15)';
                    e.currentTarget.style.opacity = isActive ? '1' : '0.85';
                  }}
                >
                  {/* Status dot */}
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: isActive ? '#22c55e' : '#f59e0b',
                    boxShadow: isActive ? '0 0 6px rgba(34,197,94,0.5)' : '0 0 6px rgba(245,158,11,0.4)',
                    flexShrink: 0,
                  }} />

                  <span
                    onClick={() => handleToggleStatus(court)}
                    title={isActive ? 'Nhấp để tạm đóng sân' : 'Nhấp để kích hoạt lại sân'}
                    style={{ whiteSpace: 'nowrap', flex: 1 }}
                  >
                    {court.name}
                    {!isActive && <span style={{ fontSize: '10px', marginLeft: '6px', opacity: 0.7 }}>(Tạm đóng)</span>}
                  </span>

                  {/* Delete button */}
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: '15px', cursor: 'pointer', opacity: 0.4,
                      transition: 'all 0.2s',
                    }}
                    title="Xoá sân"
                    onClick={(e) => { e.stopPropagation(); handleDeleteCourt(court); }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#dc2626'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0.4'; e.currentTarget.style.color = 'inherit'; }}
                  >
                    delete
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <Spinner variant="success" />
            <div style={{ fontSize: '13px', color: TX2, marginTop: '12px' }}>Đang tải lịch đặt sân...</div>
          </div>
        ) : courts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', border: '1px dashed #cbd5e1', borderRadius: '16px', background: '#f8fafc' }}>
            <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '48px' }}>sports_tennis</span>
            <div style={{ fontWeight: 800, color: TX, fontSize: '15px' }}>Không có sân con nào</div>
            <div style={{ fontSize: '13px', color: TX2, marginTop: '4px' }}>Nhấp vào nút "+" ở trên để thêm sân con đầu tiên cho địa điểm này.</div>
          </div>
        ) : (
          <>
            {/* Column Headers */}
            <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', border: '1px solid #e2e8f0', borderBottomWidth: 0 }}>
              <div style={{ width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #cbd5e1', padding: '16px 0' }}>
                <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>schedule</span>
              </div>
              {courts.map((court, idx, arr) => {
                const isActive = (court as any).isActive !== false;
                return (
                  <div 
                    key={court._id} 
                    style={{ 
                      flex: 1, 
                      padding: '16px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      borderRight: idx < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                      background: isActive ? 'transparent' : 'linear-gradient(180deg, #fffbeb 0%, #fef9e7 100%)',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 800, color: isActive ? TX : '#92400e' }}>
                      {(court as any).emoji || '🏟️'} {court.name}
                    </span>
                    <span style={{ fontSize: '11px', color: isActive ? TX2 : '#a16207', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginTop: '2px' }}>
                      {court.sportTypes.join(', ')} · {(court as any).courtType === 'outdoor' ? 'Ngoài trời' : 'Trong nhà'}
                    </span>
                    {!isActive && (
                      <div style={{
                        marginTop: '6px',
                        background: '#fef3c7',
                        color: '#92400e',
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '12px',
                        border: '1px solid #fbbf24',
                      }}>
                        🔒 Tạm đóng
                      </div>
                    )}
                  </div>
                );
              })}
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

                {/* Current time indicator */}
                <div style={{ position: 'absolute', top: '300px', left: 0, right: 0, height: '2px', background: '#ef4444', zIndex: 4, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', marginLeft: '-4px' }} />
                </div>

                {courts.map((court, idx, arr) => {
                  const isActive = (court as any).isActive !== false;
                  return (
                    <div 
                      key={court._id} 
                      style={{ 
                        flex: 1, 
                        height: '100%', 
                        position: 'relative', 
                        borderRight: idx < arr.length - 1 ? '1px solid #e2e8f0' : 'none',
                        background: isActive ? 'transparent' : 'repeating-linear-gradient(45deg, #fffbeb, #fffbeb 10px, #fef9e7 10px, #fef9e7 20px)',
                      }}
                    >
                      {/* Overlay cho sân tạm đóng */}
                      {!isActive && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(254, 243, 199, 0.4)',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none',
                        }}>
                          <div style={{
                            background: 'rgba(146, 64, 14, 0.9)',
                            color: '#fff',
                            padding: '12px 24px',
                            borderRadius: '16px',
                            fontSize: '13px',
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>lock</span>
                            Sân tạm đóng
                          </div>
                        </div>
                      )}
                      
                      {bookingsList.filter(b => {
                        // Chỉ hiển thị booking nếu có courtId khớp chính xác
                        // Nếu booking có courtId, so sánh với court._id
                        // Nếu không có courtId (mock data cũ), bỏ qua
                        const bookingCourtId = (b as any).courtId;
                        if (bookingCourtId) {
                          return bookingCourtId === court._id && b.status !== 'CANCELLED';
                        }
                        // Fallback: nếu không có courtId, không hiển thị gì
                        return false;
                      }).map(booking => (
                        <BookingCard key={booking.id} booking={booking} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
