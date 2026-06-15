import React, { useState, useCallback, useEffect } from 'react';
import { W } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { venueService, courtService, type Venue, type Court } from '../../services/venue.service';
import { OwnerVenuesTab } from './venues/OwnerVenuesTab';
import { CourtManagerSection } from './venues/CourtManagerSection';
import { CreateCourtModal } from './venues/CreateCourtModal';
import { OwnerOverviewTab } from './dashboard/OwnerDashboard';
import { BookingCalendar } from './bookings/BookingCalendar';
import { BookingDetail } from './bookings/BookingDetail';
import { OwnerRevenue } from './analytics/OwnerRevenue';
import { OwnerMessage } from './chats/OwnerMessage';
import api from '../../api/api';

interface OwnerDashboardProps {
  onGoHome: () => void;
}

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
  courtId?: string;
}

export const OwnerPage: React.FC<OwnerDashboardProps> = ({ onGoHome }) => {
  const [activeMenu, setActiveMenu] = useState('bookings');
  const { logout, user } = useAuth();

  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [showCreateCourtModal, setShowCreateCourtModal] = useState(false);
  const [selectedVenueForCourt, setSelectedVenueForCourt] = useState<Venue | null>(null);
  const [creatingCourt, setCreatingCourt] = useState(false);

  // Fetch real bookings for all courts owned by this owner, filtered by selectedDate
  const fetchOwnerBookings = useCallback(async (date: Date) => {
    setLoadingBookings(true);
    try {
      const venues = await venueService.getMyVenues({ active: 'all' });
      if (!venues.length) return;

      const allCourts: Court[] = [];
      for (const venue of venues) {
        const courts = await courtService.getCourts({ venue: venue._id, active: 'all' });
        allCourts.push(...courts);
      }

      // Build date range query for the selected day (local timezone safe)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateParam = `${year}-${month}-${day}`; // YYYY-MM-DD


      const allBookings: Booking[] = [];
      for (const court of allCourts) {
        try {
          const res = await api.get(
            `/bookings/court/${court._id}/bookings?limit=200&startDate=${dateParam}&endDate=${dateParam}`
          );
          const courtBookings: any[] = res.data.data || [];
          courtBookings.forEach((b: any) => {
            const [startH, startM] = (b.startTime || '06:00').split(':').map(Number);
            const [endH, endM] = (b.endTime || '07:00').split(':').map(Number);
            const top = Math.max(0, (startH - 6) * 60 + startM);
            const height = Math.max(30, (endH - startH) * 60 + (endM - startM));

            const bookerName = b.bookerName || b.userId?.name || 'Khách';
            const bookerPhone = b.bookerPhone || b.userId?.phone || '';
            const bookerEmail = b.bookerEmail || b.userId?.email || '';
            const bookerAvatar = b.userId?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(bookerName)}&background=1a6b3c&color=fff`;

            allBookings.push({
              id: b._id,
              name: bookerName,
              phone: bookerPhone,
              email: bookerEmail,
              avatar: bookerAvatar,
              court: court.name,
              date: b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('vi-VN') : '',
              timeSlot: `${b.startTime} - ${b.endTime}`,
              duration: `${b.duration}h`,
              paymentMethod: b.paymentMethod || 'card',
              amount: `${(b.totalPrice || 0).toLocaleString('vi-VN')}đ`,
              status: b.status,
              notes: b.notes || '',
              top,
              height,
              column: 0,
              courtId: court._id,
            } as any);
          });
        } catch {
          // skip court if fetch fails
        }
      }
      setBookingsList(allBookings);
    } catch (err) {
      console.error('Failed to fetch owner bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  useEffect(() => {
    if (activeMenu === 'bookings') {
      fetchOwnerBookings(selectedDate);
    }
  }, [activeMenu, selectedDate, fetchOwnerBookings]);

  const openCreateCourtModal = (venue: Venue) => {
    setSelectedVenueForCourt(venue);
    setShowCreateCourtModal(true);
  };

  const closeCreateCourtModal = () => {
    setShowCreateCourtModal(false);
    setSelectedVenueForCourt(null);
  };

  const handleCreateCourt = async (payloads: (FormData | any)[]) => {
    if (!selectedVenueForCourt) return;
    setCreatingCourt(true);
    try {
      await courtService.createCourt(payloads);
      alert('Tạo sân thành công.');
      closeCreateCourtModal();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Lỗi tạo sân.');
      throw error;
    } finally {
      setCreatingCourt(false);
    }
  };

  const handleStatusUpdate = (id: string, newStatus: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED') => {
    setBookingsList(prev =>
      prev.map(b => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(prev => (prev ? { ...prev, status: newStatus } : null));
    }
  };


  const menuItems = [
    { id: 'overview', icon: 'dashboard', label: 'Tổng quan' },
    { id: 'bookings', icon: 'calendar_month', label: 'Lịch đặt sân' },
    { id: 'revenue', icon: 'payments', label: 'Doanh thu' },
    { id: 'venue_info', icon: 'info', label: 'Quản lí địa điểm' },
    { id: 'hours_prices', icon: 'schedule', label: 'Giờ & Giá' },
    { id: 'messages', icon: 'chat', label: 'Tin nhắn' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ─── SIDEBAR ─── */}
      <div
        style={{
          width: '260px',
          backgroundColor: '#0f3d22',
          color: W,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center cursor-pointer"
          onClick={onGoHome}
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '8px',
            padding: '15px 0px 20px 0px',
          }}
        >
          <img
            src="/logo1.png"
            alt="EZSport Logo"
            style={{ width: '100%', height: 'auto', maxHeight: '110px', objectFit: 'cover' }}
          />
        </div>

        <div className="px-4 mb-4">
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: W,
                  fontWeight: 700,
                  fontSize: '14px',
                }}
              >
                {user?.fullName
                  ?.split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'QA'}
              </div>
            )}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{user?.fullName || 'Chủ sân'}</div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.6)',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: '4px',
                }}
              >
                Chủ sân
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow-1 px-3" style={{ overflowY: 'auto' }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setSelectedBooking(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '4px',
                background: activeMenu === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeMenu === item.id ? W : 'rgba(255,255,255,0.7)',
                fontWeight: activeMenu === item.id ? 600 : 500,
                transition: 'all 0.2s',
                borderLeft: activeMenu === item.id ? '4px solid #22c55e' : '4px solid transparent',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto">
          <div
            onClick={() => {
              logout();
              onGoHome();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              padding: '12px 16px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
              logout
            </span>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Đăng xuất</span>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* Main Scrollable Body */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: activeMenu === 'overview' ? '32px' : '24px',
            }}
          >
            {activeMenu === 'overview' && (
              <OwnerOverviewTab onNavigate={setActiveMenu} />
            )}

            {activeMenu === 'bookings' && (
              <BookingCalendar
                bookingsList={bookingsList}
                onSelectBooking={setSelectedBooking}
                loading={loadingBookings}
                selectedDate={selectedDate}
                onDateChange={(date) => {
                  setSelectedDate(date);
                  setSelectedBooking(null);
                }}
              />
            )}

            {activeMenu === 'revenue' && <OwnerRevenue />}

            {activeMenu === 'venue_info' && (
              <OwnerVenuesTab onOpenCreateCourt={openCreateCourtModal} />
            )}

            {activeMenu === 'hours_prices' && <CourtManagerSection />}

            {activeMenu === 'messages' && <OwnerMessage />}
          </div>

          {activeMenu === 'bookings' && selectedBooking && (
            <BookingDetail
              booking={selectedBooking}
              onClose={() => setSelectedBooking(null)}
              onStatusUpdate={handleStatusUpdate}
            />
          )}

          <CreateCourtModal
            show={showCreateCourtModal}
            venue={selectedVenueForCourt}
            onClose={closeCreateCourtModal}
            onCreateCourt={handleCreateCourt}
            submitting={creatingCourt}
          />

        </div>
      </div>
    </div>
  );
};

export default OwnerPage;