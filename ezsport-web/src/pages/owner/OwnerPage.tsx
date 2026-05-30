import React, { useState, useCallback, useEffect } from 'react';
import { Row, Col, Card, Dropdown, Button } from 'react-bootstrap';
import { W, TX, TX2, SL } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';
import { venueService, courtService, type Venue, type Court } from '../../services/venue.service';
import { OwnerVenuesTab } from './venues/OwnerVenuesTab';
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
  status: 'confirmed' | 'pending_payment' | 'pending_confirm' | 'cancelled';
  notes: string;
  top: number; // offset in pixels (based on 60px per hour starting at 08:00)
  height: number; // height in pixels (based on 60px per hour)
  column: number; // 1: Sân A1, 2: Sân A2, 3: Sân B1
}

export const OwnerPage: React.FC<OwnerDashboardProps> = ({ onGoHome }) => {
  const [activeMenu, setActiveMenu] = useState('bookings'); // Default to bookings as requested to test immediately
  const { logout, user } = useAuth();
  
  // Interactive bookings state
  // Xóa mock data - sẽ fetch booking thật từ API
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Fetch real bookings for all courts owned by this owner
  const fetchOwnerBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      // 1. Get all venues of this owner
      const venues = await venueService.getVenues({ active: 'all' });
      if (!venues.length) return;

      // 2. Get all courts for each venue
      const allCourts: Court[] = [];
      for (const venue of venues) {
        const courts = await courtService.getCourts({ venue: venue._id, active: 'all' });
        allCourts.push(...courts);
      }

      // 3. Fetch bookings for each court
      const allBookings: Booking[] = [];
      for (const court of allCourts) {
        try {
          const res = await api.get(`/bookings/court/${court._id}/bookings?limit=100`);
          const courtBookings: any[] = res.data.data || [];
          courtBookings.forEach((b: any) => {
            // Calculate top/height for calendar grid (starts at 08:00)
            const [startH, startM] = (b.startTime || '08:00').split(':').map(Number);
            const [endH, endM] = (b.endTime || '09:00').split(':').map(Number);
            const top = Math.max(0, (startH - 8) * 60 + startM);
            const height = Math.max(30, (endH - startH) * 60 + (endM - startM));

            allBookings.push({
              id: b._id,
              name: b.bookerName || 'Khách',
              phone: b.bookerPhone || '',
              email: b.bookerEmail || '',
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(b.bookerName || 'K')}&background=1a6b3c&color=fff`,
              court: court.name,
              date: b.bookingDate ? new Date(b.bookingDate).toLocaleDateString('vi-VN') : '',
              timeSlot: `${b.startTime} - ${b.endTime}`,
              duration: `${b.duration}h`,
              paymentMethod: b.paymentMethod || 'card',
              amount: `${(b.totalPrice || 0).toLocaleString('vi-VN')}đ`,
              status: b.status === 'CONFIRMED' || b.status === 'COMPLETED' ? 'confirmed'
                : b.status === 'CANCELLED' ? 'cancelled'
                : 'pending_confirm',
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
      fetchOwnerBookings();
    }
  }, [activeMenu, fetchOwnerBookings]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);


  // --- States for Hours & Prices ---
  const [selectedCourt, setSelectedCourt] = useState('Sân A1');
  const [courtCapacity, setCourtCapacity] = useState('Tối đa 5 người');
  const [courtType, setCourtType] = useState('Thường');
  const [isCourtActive, setIsCourtActive] = useState(true);

  const [showCreateCourtModal, setShowCreateCourtModal] = useState(false);
  const [selectedVenueForCourt, setSelectedVenueForCourt] = useState<Venue | null>(null);
  const [creatingCourt, setCreatingCourt] = useState(false);
  
  const [priceRows] = useState([
    { slot: '06:00 - 09:00', weekday: '100.000đ', sat: '120.000đ', sun: '120.000đ', holiday: '150.000đ', peak: false },
    { slot: '09:00 - 15:00', weekday: '120.000đ', sat: '150.000đ', sun: '150.000đ', holiday: '180.000đ', peak: false },
    { slot: '15:00 - 18:00', weekday: '200.000đ', sat: '250.000đ', sun: '250.000đ', holiday: '300.000đ', peak: true },
    { slot: '18:00 - 21:00', weekday: '220.000đ', sat: '280.000đ', sun: '280.000đ', holiday: '350.000đ', peak: true },
    { slot: '21:00 - 23:00', weekday: '150.000đ', sat: '180.000đ', sun: '180.000đ', holiday: '200.000đ', peak: false },
  ]);

  const [blockedTimes, setBlockedTimes] = useState([
    { id: 1, date: 'THỨ TƯ 24', dateNum: 24, time: '18:00 - 21:00', reason: 'Bảo trì chiếu sáng định kỳ' },
    { id: 2, date: 'CHỦ NHẬT 28', dateNum: 28, time: '06:00 - 23:00', reason: 'Bảo trì sân gỗ định kỳ' },
  ]);

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

  const menuItems = [
    { id: 'overview', icon: 'dashboard', label: 'Tổng quan' },
    { id: 'bookings', icon: 'calendar_month', label: 'Lịch đặt sân' },
    { id: 'revenue', icon: 'payments', label: 'Doanh thu' },
    { id: 'venue_info', icon: 'info', label: 'Quản lí địa điểm' },
    { id: 'hours_prices', icon: 'schedule', label: 'Giờ & Giá' },
    // { id: 'tournaments', icon: 'emoji_events', label: 'Giải đấu' },
    { id: 'messages', icon: 'chat', label: 'Tin nhắn' },
    // { id: 'notifications', icon: 'notifications', label: 'Thông báo' },
  ];

  // Action handlers inside Right Drawer
  const handleCompleteBooking = (id: string) => {
    setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking(prev => prev ? { ...prev, status: 'confirmed' } : null);
    }
    alert('🎉 Đã xác nhận hoàn thành và thanh toán booking thành công!');
  };

  const handleCancelBooking = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch đặt sân này không?')) {
      setBookingsList(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      setSelectedBooking(null);
    }
  };


  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ─── SIDEBAR ─── */}
      <div style={{ 
        width: '260px', backgroundColor: '#0f3d22', color: W, display: 'flex', flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.1)', zIndex: 10
      }}>
        <div className="d-flex align-items-center justify-content-center cursor-pointer" onClick={onGoHome} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '8px', padding: '15px 0px 20px 0px' }}>
          <img src="/logo1.png" alt="EZSport Logo" style={{ width: '100%', height: 'auto', maxHeight: '110px', objectFit: 'cover' }} />
        </div>

        <div className="px-4 mb-4">
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: W, fontWeight: 700, fontSize: '14px' }}>
                {user?.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'QA'}
              </div>
            )}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700 }}>{user?.fullName || 'Chủ sân'}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>Chủ sân</div>
            </div>
          </div>
        </div>

        <div className="flex-grow-1 px-3" style={{ overflowY: 'auto' }}>
          {menuItems.map(item => (
            <div 
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setSelectedBooking(null); // reset drawer on tab change
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                background: activeMenu === item.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: activeMenu === item.id ? W : 'rgba(255,255,255,0.7)',
                fontWeight: activeMenu === item.id ? 600 : 500,
                transition: 'all 0.2s',
                borderLeft: activeMenu === item.id ? `4px solid #22c55e` : '4px solid transparent',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
              <span style={{ fontSize: '14px' }}>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="p-4 mt-auto">
          <div 
            onClick={() => { logout(); onGoHome(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '12px 16px', borderRadius: '8px', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>Đăng xuất</span>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <div style={{ height: '72px', background: W, borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div className="d-flex align-items-center gap-3">
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: TX, margin: 0 }}>
              {activeMenu === 'overview' ? 'Tổng quan' : activeMenu === 'bookings' ? 'Lịch đặt sân' : activeMenu === 'revenue' ? 'Doanh thu' : activeMenu === 'venue_info' ? 'Thông tin địa điểm' : activeMenu === 'hours_prices' ? 'Giờ & Giá' : activeMenu === 'messages' ? 'Hộp thư & Chat' : 'Quản lý'}
            </h2>
            {activeMenu === 'bookings' && (
              <div className="d-none d-md-flex align-items-center bg-light border rounded-pill px-3 py-1 gap-2" style={{ fontSize: '13px' }}>
                <span className="material-symbols-outlined fs-5 text-muted">search</span>
                <input type="text" placeholder="Tìm kiếm nhanh..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '150px' }} />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {activeMenu === 'revenue' ? (
              <>
                {/* Date select pills matching screen */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '20px', padding: '4px', gap: '4px' }}>
                  {['Hôm nay', 'Tuần này', 'Tháng này', 'Tùy chọn'].map((pill, idx) => {
                    const isActive = pill === 'Tháng này';
                    return (
                      <button
                        key={idx}
                        style={{
                          border: 'none',
                          background: isActive ? '#0f3d22' : 'transparent',
                          color: isActive ? W : TX2,
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '6px 16px',
                          borderRadius: '16px',
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                      >
                        {pill}
                      </button>
                    );
                  })}
                </div>
                
                {/* Export report button */}
                <Button
                  style={{
                    background: '#10b981',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '8px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: W,
                    boxShadow: '0 2px 8px rgba(16,185,129,0.2)'
                  }}
                  onClick={() => alert('📤 Đang xuất báo cáo doanh thu định dạng Excel...')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                  Xuất báo cáo
                </Button>
              </>
            ) : activeMenu === 'hours_prices' ? (
              <>
                {/* Save All button */}
                <button
                  style={{
                    border: '1px solid #0f3d22',
                    background: 'transparent',
                    color: '#0f3d22',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '8px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => alert('💾 Đã lưu cấu hình bảng giá khung giờ và lịch chặn thành công!')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>save</span>
                  Lưu tất cả
                </button>
                
                {/* Add new court button */}
                <Button
                  style={{
                    background: '#0f3d22',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '8px 20px',
                    color: W,
                    boxShadow: '0 2px 8px rgba(15,61,34,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => {
                    const name = prompt('Nhập tên sân mới:');
                    if (name) alert(`🎾 Đã khởi tạo cấu hình cho ${name} thành công!`);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Thêm sân mới
                </Button>
              </>
            ) : (
              <Dropdown>
                <Dropdown.Toggle variant="light" size="sm" style={{ background: SL, border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {activeMenu === 'overview' ? '7 ngày qua' : '12/05 - 18/05, 2026'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>Hôm nay</Dropdown.Item>
                  <Dropdown.Item>7 ngày qua</Dropdown.Item>
                  <Dropdown.Item>Tháng này</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
            
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: SL, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ color: TX2, fontSize: '20px' }}>notifications</span>
              <div style={{ position: 'absolute', top: '8px', right: '10px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: `2px solid ${SL}` }} />
            </div>
            
            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }} />
          </div>
        </div>

        {/* Outer Split Container */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Main Scrollable Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: activeMenu === 'overview' ? '32px' : '24px' }}>
            
            {/* ─── TAB 1: OVERVIEW ─── */}
            {activeMenu === 'overview' && (
              <OwnerOverviewTab onNavigate={setActiveMenu} />
            )}

            {/* ─── TAB 2: BOOKING CALENDAR GRID ─── */}
            {activeMenu === 'bookings' && (
              <BookingCalendar
                bookingsList={bookingsList}
                onSelectBooking={setSelectedBooking}
                loading={loadingBookings}
              />
            )}
                
            {/* ─── TAB 3: REVENUE DASHBOARD ─── */}
            {activeMenu === 'revenue' && (
              <OwnerRevenue />
            )}
            {/* ─── TAB 4: ĐỊA ĐIỂM / QUẢN LÝ ĐỊA ĐIỂM ─── */}
            {activeMenu === 'venue_info' && (
              <OwnerVenuesTab onOpenCreateCourt={openCreateCourtModal} />
            )}

            {/* ─── TAB 5: HOURS & PRICES ─── */}
            {activeMenu === 'hours_prices' && (
              <div className="animate-slide-up" style={{ paddingBottom: '40px' }}>
                
                {/* Top Tabs - Court Selector */}
                <div className="d-flex align-items-center gap-2 mb-4 flex-wrap" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
                  {['Sân A1', 'Sân A2', 'Sân B1', 'Sân B2'].map((court) => {
                    const isActive = selectedCourt === court;
                    return (
                      <button
                        key={court}
                        onClick={() => {
                          setSelectedCourt(court);
                          if (court.includes('A')) {
                            setCourtCapacity('Tối đa 5 người');
                            setCourtType('Thường');
                          } else {
                            setCourtCapacity('Tối đa 8 người');
                            setCourtType('Cao cấp');
                          }
                        }}
                        style={{
                          border: isActive ? '1px solid #0f3d22' : '1px solid #cbd5e1',
                          background: isActive ? '#fff' : 'transparent',
                          color: TX,
                          fontSize: '13px',
                          fontWeight: 700,
                          padding: '8px 20px',
                          borderRadius: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                          transition: 'all 0.15s'
                        }}
                      >
                        {isActive && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                        )}
                        {court}
                      </button>
                    );
                  })}
                  
                  {/* Plus button */}
                  <button
                    onClick={() => {
                      const name = prompt('Nhập tên sân mới:');
                      if (name) alert(`🎾 Đã khởi tạo cấu hình thành công cho ${name}!`);
                    }}
                    style={{
                      border: '1px dashed #cbd5e1',
                      background: 'transparent',
                      color: '#15803d',
                      fontSize: '13px',
                      fontWeight: 700,
                      padding: '8px 20px',
                      borderRadius: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    + Thêm sân
                  </button>
                </div>

                {/* Court Info Header bar */}
                <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', padding: '16px 24px', marginBottom: '24px' }}>
                  <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-5 flex-wrap">
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Tên Sân</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: TX }}>{selectedCourt}</div>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Loại Hình</div>
                        <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px' }}>
                          {courtType}
                        </span>
                      </div>
                      
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.05em' }}>Sức Chứa</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: TX, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>groups</span>
                          {courtCapacity}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right action options */}
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '13px', fontWeight: 700, color: TX2 }}>Đang hoạt động</span>
                        <div 
                          style={{
                            width: '40px',
                            height: '22px',
                            borderRadius: '11px',
                            background: isCourtActive ? '#10b981' : '#cbd5e1',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => setIsCourtActive(prev => !prev)}
                        >
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            background: '#fff',
                            position: 'absolute',
                            top: '3px',
                            left: isCourtActive ? '21px' : '3px',
                            transition: 'all 0.2s'
                          }} />
                        </div>
                      </div>
                      
                      <button 
                        style={{ 
                          border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', 
                          borderRadius: '8px', padding: '6px 16px', fontSize: '12px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                          transition: 'all 0.1s'
                        }}
                        onClick={() => {
                          const time = prompt('Nhập khung giờ chặn (ví dụ: 14:00 - 16:00):');
                          const reason = prompt('Nhập lý do chặn sân:');
                          if (time && reason) {
                            setBlockedTimes(prev => [
                              ...prev,
                              { id: Date.now(), date: 'THỨ HAI 29', dateNum: 29, time, reason }
                            ]);
                          }
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>block</span>
                        Chặn giờ
                      </button>
                      
                      <button 
                        style={{ 
                          border: '1px solid #cbd5e1', background: '#fff', color: TX, 
                          borderRadius: '8px', padding: '6px 16px', fontSize: '12px', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                          transition: 'all 0.1s'
                        }}
                        onClick={() => alert('📋 Đã sao chép cấu hình giờ thành công!')}
                      >
                        Sao chép giờ từ sân khác
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>keyboard_arrow_down</span>
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Section 1: Price List by Hours */}
                <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <div className="d-flex align-items-center gap-2">
                        <span className="material-symbols-outlined text-success" style={{ fontSize: '22px' }}>payments</span>
                        <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Bảng giá theo khung giờ</h5>
                      </div>
                      
                      {/* Quick Edit options */}
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '12px', fontWeight: 700, color: TX2 }}>Chỉnh sửa nhanh</span>
                        <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                          {['edit', 'content_copy', 'delete'].map((icon, i) => (
                            <button 
                              key={i} 
                              style={{ background: '#fff', border: 'none', borderRight: i < 2 ? '1px solid #e2e8f0' : 'none', padding: '6px 10px', color: TX2, cursor: 'pointer', transition: 'all 0.1s' }}
                              onClick={() => alert(`⚙️ Tính năng chỉnh sửa nhanh (${icon}) đang hoạt động!`)}
                              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                            {['Khung giờ', 'Thứ 2 - Thứ 6', 'Thứ 7', 'Chủ Nhật', 'Ngày lễ'].map((h, idx) => (
                              <th key={idx} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 800, color: TX2 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {priceRows.map((row, idx) => {
                            return (
                              <tr 
                                key={idx} 
                                style={{ 
                                  background: row.peak ? '#fffbeb' : idx % 2 === 0 ? '#fff' : '#f8fafc',
                                  borderBottom: '1px solid #e2e8f0'
                                }}
                              >
                                {/* Column 1: Time slot + peak badge */}
                                <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: TX }}>
                                  <div className="d-flex align-items-center gap-2">
                                    <span>{row.slot}</span>
                                    {row.peak && (
                                      <span style={{ display: 'inline-flex', background: '#fef3c7', color: '#d97706', border: 'none', alignItems: 'center', gap: '4px', fontSize: '10px', padding: '4px 8px', fontWeight: 800, borderRadius: '4px' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>bolt</span>
                                        Giờ cao điểm
                                      </span>
                                    )}
                                  </div>
                                </td>
                                
                                {/* Column 2: Weekday */}
                                <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: row.peak ? '#15803d' : TX }}>
                                  {row.weekday}
                                </td>
                                
                                {/* Column 3: Sat */}
                                <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: row.peak ? '#15803d' : TX }}>
                                  {row.sat}
                                </td>
                                
                                {/* Column 4: Sun */}
                                <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: row.peak ? '#15803d' : TX }}>
                                  {row.sun}
                                </td>
                                
                                {/* Column 5: Holiday */}
                                <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>
                                  {row.holiday}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>

                {/* Section 2: Blocked Hours List and Monthly Calendar */}
                <Row className="g-4">
                  
                  {/* Block 1: Blocked Hours list */}
                  <Col md={7}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between mb-4">
                          <div className="d-flex align-items-center gap-2">
                            <span className="material-symbols-outlined text-success" style={{ fontSize: '22px' }}>event_busy</span>
                            <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Giờ chặn / Lịch đóng cửa</h5>
                          </div>
                          
                          <button 
                            style={{ border: 'none', background: 'transparent', color: '#15803d', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                            onClick={() => {
                              const time = prompt('Nhập khung giờ chặn (ví dụ: 18:00 - 21:00):');
                              const reason = prompt('Nhập lý do chặn sân:');
                              if (time && reason) {
                                setBlockedTimes(prev => [
                                  ...prev,
                                  { id: Date.now(), date: 'THỨ NĂM 25', dateNum: 25, time, reason }
                                ]);
                              }
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                            Thêm khung giờ chặn
                          </button>
                        </div>
                        
                        <div className="d-flex flex-column gap-3">
                          {blockedTimes.map((item) => (
                            <div 
                              key={item.id} 
                              style={{ 
                                border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', 
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                background: '#f8fafc', position: 'relative'
                              }}
                            >
                              <div className="d-flex align-items-center gap-3">
                                {/* Custom date card widget */}
                                <div 
                                  style={{ 
                                    background: '#fee2e2', color: '#ef4444', border: '1px solid #fecaca', 
                                    borderRadius: '8px', padding: '6px 12px', display: 'flex', flexDirection: 'column', 
                                    alignItems: 'center', minWidth: '72px', textAlign: 'center' 
                                  }}
                                >
                                  <span style={{ fontSize: '8px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.8 }}>
                                    {item.date.split(' ')[0]}
                                  </span>
                                  <span style={{ fontSize: '16px', fontWeight: 800, lineHeight: 1.1 }}>
                                    {item.date.split(' ')[1] || item.dateNum}
                                  </span>
                                </div>
                                
                                {/* Details */}
                                <div>
                                  <div style={{ fontSize: '14px', fontWeight: 800, color: TX }}>{item.time}</div>
                                  <div style={{ fontSize: '12px', color: TX2, marginTop: '2px' }}>{item.reason}</div>
                                </div>
                              </div>
                              
                              {/* Trash action button */}
                              <button 
                                style={{ border: 'none', background: 'transparent', color: TX2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px' }}
                                onClick={() => setBlockedTimes(prev => prev.filter(t => t.id !== item.id))}
                                onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                onMouseLeave={e => e.currentTarget.style.color = TX2}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                              </button>
                            </div>
                          ))}
                          
                          {blockedTimes.length === 0 && (
                            <div className="text-center text-muted py-5" style={{ fontSize: '13px' }}>
                              <span className="material-symbols-outlined text-muted" style={{ fontSize: '32px', marginBottom: '8px' }}>event_available</span>
                              <div>Không có khung giờ nào bị chặn</div>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Block 2: Month Calendar selector */}
                  <Col md={5}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
                      <Card.Body className="p-4">
                        {/* Calendar Header */}
                        <div className="d-flex align-items-center justify-content-between mb-4">
                          <h5 style={{ fontSize: '14px', fontWeight: 800, color: TX, margin: 0 }}>Tháng 11, 2026</h5>
                          <div className="d-flex gap-2">
                            <button style={{ border: 'none', background: 'transparent', padding: '4px', color: TX2, cursor: 'pointer' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                            </button>
                            <button style={{ border: 'none', background: 'transparent', padding: '4px', color: TX2, cursor: 'pointer' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Weekday headers */}
                        <div className="d-grid mb-2 text-center" style={{ gridTemplateColumns: 'repeat(7, 1fr)', fontSize: '11px', fontWeight: 800, color: TX2 }}>
                          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
                            <div key={day} style={{ padding: '4px 0' }}>{day}</div>
                          ))}
                        </div>
                        
                        {/* Calendar days grid */}
                        <div className="d-grid text-center align-items-center" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px 4px' }}>
                          {/* November 2026 starts on CN (Sunday CN day 1) */}
                          {/* Let's mock days offset (CN is day 1, so offset is 5 empty cells: T2 to T7 is empty) */}
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={`empty-${i}`} />
                          ))}
                          
                          {Array.from({ length: 30 }, (_, i) => {
                            const dayNum = i + 1;
                            
                            // Check if blocked
                            const isBlocked = blockedTimes.some(t => t.dateNum === dayNum);
                            
                            // Check if holiday (day 27)
                            const isHoliday = dayNum === 27;
                            
                            return (
                              <div 
                                key={dayNum} 
                                style={{ 
                                  aspectRatio: '1', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  fontSize: '12px', 
                                  fontWeight: 700, 
                                  borderRadius: '50%',
                                  color: isBlocked ? W : isHoliday ? '#15803d' : TX,
                                  background: isBlocked ? '#ef4444' : isHoliday ? '#dcfce7' : 'transparent',
                                  cursor: 'pointer',
                                  boxShadow: isBlocked ? '0 2px 6px rgba(239,68,68,0.3)' : 'none',
                                  transition: 'all 0.15s'
                                }}
                                onClick={() => {
                                  if (isBlocked) {
                                    alert(`🚫 Ngày ${dayNum}/11 đang có lịch chặn bảo trì!`);
                                  } else if (isHoliday) {
                                    alert(`🎉 Ngày ${dayNum}/11 là Ngày lễ!`);
                                  } else {
                                    alert(`🎾 Ngày ${dayNum}/11 đang hoạt động bình thường!`);
                                  }
                                }}
                              >
                                {dayNum}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Legends */}
                        <div className="d-flex gap-4 mt-4 pt-3 border-top" style={{ fontSize: '11px', fontWeight: 700, color: TX2 }}>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '2px' }} />
                            <span>Hoạt động chặn</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '12px', height: '12px', background: '#dcfce7', borderRadius: '2px' }} />
                            <span>Ngày lễ</span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                </Row>

              </div>
            )}

            {/* ─── TAB 7: MESSAGES / TIN NHẮN ─── */}
            {activeMenu === 'messages' && (
              <OwnerMessage />
            )}

          </div>

          {/* ─── TAB 2 SIDE DRAWER: BOOKING DETAILS ─── */}
          {activeMenu === 'bookings' && selectedBooking && (
            <BookingDetail
              booking={selectedBooking}
              onClose={() => setSelectedBooking(null)}
              onComplete={handleCompleteBooking}
              onCancel={handleCancelBooking}
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
