import React, { useState } from 'react';
import { Row, Col, Card, Dropdown, Button } from 'react-bootstrap';
import { G, W, TX, TX2, SL } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

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

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onGoHome }) => {
  const [activeMenu, setActiveMenu] = useState('bookings'); // Default to bookings as requested to test immediately
  const { logout, user } = useAuth();
  
  // Interactive bookings state
  const [bookingsList, setBookingsList] = useState<Booking[]>([
    {
      id: 'BK20250516042',
      name: 'Nguyễn Văn A',
      phone: '0901 234 567',
      email: 'van.nguyen@gmail.com',
      avatar: '11',
      court: 'Sân A1',
      date: 'Thứ 5, 13/05/2026',
      timeSlot: '09:00 - 11:00',
      duration: '120 phút',
      paymentMethod: 'Chuyển khoản',
      amount: '400.000 VND',
      status: 'confirmed',
      notes: 'Khách quen, chuẩn bị sẵn giỏ nước suối.',
      top: 60, // 08:00 is 0px, 09:00 is 60px
      height: 120, // 2 hours = 120px
      column: 1
    },
    {
      id: 'BK20250516043',
      name: 'Lê Thị C',
      phone: '0934 567 890',
      email: 'thi.le@gmail.com',
      avatar: '33',
      court: 'Sân A2',
      date: 'Thứ 5, 13/05/2026',
      timeSlot: '11:00 - 12:30',
      duration: '90 phút',
      paymentMethod: 'Chuyển khoản',
      amount: '300.000 VND',
      status: 'confirmed',
      notes: 'Yêu cầu bật đèn nếu trời tối.',
      top: 180, // 11:00 is 180px
      height: 90, // 1.5 hours = 90px
      column: 2
    },
    {
      id: 'BK20250516044',
      name: 'Trần Nam B',
      phone: '0987 654 321',
      email: 'nam.tran@gmail.com',
      avatar: '12',
      court: 'Sân A1',
      date: 'Thứ 5, 13/05/2026',
      timeSlot: '12:30 - 14:00',
      duration: '90 phút',
      paymentMethod: 'Tiền mặt',
      amount: '300.000 VND',
      status: 'pending_confirm',
      notes: 'Mượn thêm 2 vợt Pickleball.',
      top: 270, // 12:30 is 270px
      height: 90, // 1.5 hours = 90px
      column: 1
    },
    {
      id: 'BK20250516045',
      name: 'Mỹ Duyên',
      phone: '0977 665 544',
      email: 'duyen.my@gmail.com',
      avatar: '44',
      court: 'Sân B1',
      date: 'Thứ 5, 13/05/2026',
      timeSlot: '15:30 - 17:00',
      duration: '90 phút',
      paymentMethod: 'Chuyển khoản',
      amount: '350.000 VND',
      status: 'pending_payment',
      notes: '',
      top: 450, // 15:30 is 450px
      height: 90, // 1.5 hours = 90px
      column: 3
    }
  ]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // --- States for Venue Information ---
  const [venueName, setVenueName] = useState('Sân Pickleball EZSport - Quận 1');
  const [sports, setSports] = useState(['Cầu lông', 'Pickleball']);
  const [venueDescription, setVenueDescription] = useState(
    'Sân Pickleball EZSport Quận 1 sở hữu hệ thống sân chơi đạt tiêu chuẩn thi đấu quốc tế. Mặt sân giảm chấn cao cấp giúp hạn chế chấn thương, hệ thống chiếu sáng chuẩn truyền hình không gây chói mắt. Sân có mái che kiên cố mát mẻ cả ngày cùng đầy đủ các tiện ích đi kèm.'
  );
  const [venueAddress, setVenueAddress] = useState('123 Lê Lợi, Phường Bến Thành, Quận 1, TP. HCM');
  const [venuePhone, setVenuePhone] = useState('0901 234 567');
  const [venueEmail, setVenueEmail] = useState('contact@ezsport.vn');
  
  // Amenities toggles
  const [amenities, setAmenities] = useState<Record<string, boolean>>({
    parking: true,
    changingRoom: true,
    water: true,
    lights: true,
    wifi: true,
    racket: true,
    canteen: false,
    shop: false
  });

  const [openTime, setOpenTime] = useState('05:00 AM');
  const [closeTime, setCloseTime] = useState('10:00 PM');
  const [cancelPolicy, setCancelPolicy] = useState('24h'); // '24h', '12h', 'none'
  const [onlinePay, setOnlinePay] = useState(true);
  const [venueNotes, setVenueNotes] = useState(
    '- Vui lòng mang giày thể thao đế cao su (không để lại vết đen trên thảm sân).\n- Không mang đồ ăn, thức uống ngọt có ga lên thảm đấu.\n- Có mặt trước giờ đặt 10 phút để nhận sân.'
  );
  const [videoLink, setVideoLink] = useState('https://youtube.com/watch?v=ezsport-pickleball-premium');

  const handleUpdateVenueInfo = () => {
    alert('🎉 Đã cập nhật và đồng bộ thông tin sân bóng Pickleball thành công!');
  };

  // --- States for Hours & Prices ---
  const [selectedCourt, setSelectedCourt] = useState('Sân A1');
  const [courtCapacity, setCourtCapacity] = useState('Tối đa 5 người');
  const [courtType, setCourtType] = useState('Thường');
  const [isCourtActive, setIsCourtActive] = useState(true);
  
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

  // --- States for Chat/Messages system ---
  const [selectedRoomId, setSelectedRoomId] = useState('room-1');
  const [typedMessage, setTypedMessage] = useState('');
  const [chatRooms, setChatRooms] = useState([
    {
      id: 'room-1',
      name: 'Nguyễn Văn A',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60',
      lastMsg: 'Anh chuẩn bị sân giúp em nhé',
      time: '10 phút trước',
      unread: 2,
      online: true,
      messages: [
        { sender: 'player', text: 'Chào anh, hôm nay em có đặt sân lúc 9h', time: '08:30 AM' },
        { sender: 'owner', text: 'Chào Nam! Anh nhận được lịch đặt rồi nhé. Sân đã được chuẩn bị sẵn sàng.', time: '08:35 AM' },
        { sender: 'player', text: 'Dạ vâng, lát nhóm em qua. Anh chuẩn bị sân giúp em nhé.', time: '08:45 AM' }
      ]
    },
    {
      id: 'room-2',
      name: 'Lê Thị C',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60',
      lastMsg: 'Dạ em đã thanh toán chuyển khoản rồi ạ',
      time: '1 giờ trước',
      unread: 0,
      online: false,
      messages: [
        { sender: 'owner', text: 'Chào chị Thư, lịch đặt sân A2 của chị lúc 11h chưa được thanh toán ạ.', time: '09:15 AM' },
        { sender: 'player', text: 'Dạ em đã thanh toán chuyển khoản rồi ạ', time: '10:00 AM' },
        { sender: 'owner', text: 'Anh đã nhận được 300k chuyển khoản của em rồi nha. Hẹn gặp nhóm em lúc 11h.', time: '10:05 AM' }
      ]
    },
    {
      id: 'room-3',
      name: 'Trần Nam B',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60',
      lastMsg: 'Sân mình có vợt cho thuê không anh?',
      time: '3 giờ trước',
      unread: 0,
      online: true,
      messages: [
        { sender: 'player', text: 'Sân mình có vợt cho thuê không anh?', time: '03:15 PM' },
        { sender: 'owner', text: 'Chào Tuấn, bên anh có cho thuê vợt Pickleball 20k/vợt nha em.', time: '03:20 PM' }
      ]
    }
  ]);

  const menuItems = [
    { id: 'overview', icon: 'dashboard', label: 'Tổng quan' },
    { id: 'bookings', icon: 'calendar_month', label: 'Lịch đặt sân' },
    { id: 'revenue', icon: 'payments', label: 'Doanh thu' },
    { id: 'venue_info', icon: 'info', label: 'Thông tin sân' },
    { id: 'hours_prices', icon: 'schedule', label: 'Giờ & Giá' },
    { id: 'tournaments', icon: 'emoji_events', label: 'Giải đấu' },
    { id: 'messages', icon: 'chat', label: 'Tin nhắn' },
    { id: 'notifications', icon: 'notifications', label: 'Thông báo' },
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

  // Hour markers array from 08:00 to 20:00
  const hours = Array.from({ length: 13 }, (_, i) => {
    const hr = 8 + i;
    return `${hr.toString().padStart(2, '0')}:00`;
  });

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
              {activeMenu === 'overview' ? 'Tổng quan' : activeMenu === 'bookings' ? 'Lịch đặt sân' : activeMenu === 'revenue' ? 'Doanh thu' : activeMenu === 'venue_info' ? 'Thông tin sân' : activeMenu === 'hours_prices' ? 'Giờ & Giá' : activeMenu === 'messages' ? 'Hộp thư & Chat' : 'Quản lý'}
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
            ) : activeMenu === 'venue_info' ? (
              <>
                {/* Preview Link */}
                <button
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#0f3d22',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    cursor: 'pointer'
                  }}
                  onClick={() => alert('🔗 Đang mở trang xem trước giao diện sân dành cho khách hàng...')}
                >
                  Xem trước trang sân
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
                </button>
                
                {/* Save Changes button */}
                <Button
                  style={{
                    background: '#0f3d22',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '8px 20px',
                    color: W,
                    boxShadow: '0 2px 8px rgba(15,61,34,0.2)'
                  }}
                  onClick={() => handleUpdateVenueInfo()}
                >
                  Lưu thay đổi
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
              <>
                {/* KPI Cards Row */}
                <Row className="g-4 mb-4">
                  <Col md={3}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>calendar_month</span>
                          </div>
                          <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', fontSize: '11px' }}>+15% so với tuần trước</span>
                        </div>
                        <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Lượt đặt sân hôm nay</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: TX }}>12</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={3}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>payments</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#22c55e', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>trending_up</span> +8%
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Doanh thu hôm nay</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: TX }}>4,500K</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center gap-3 mb-3">
                          <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #22c55e', borderRightColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: TX }}>
                            75%
                          </div>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: TX }}>Rất tốt</div>
                            <div style={{ fontSize: '12px', color: TX2 }}>Tỉ lệ lấp đầy</div>
                          </div>
                        </div>
                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: '75%', height: '100%', background: '#22c55e', borderRadius: '3px' }} />
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col md={3}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef08a', color: '#a16207', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>star</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginBottom: '4px' }}>Đánh giá (500 đánh giá)</div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: TX, display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                          4.8 <span style={{ fontSize: '16px', color: TX2, fontWeight: 600 }}>/ 5.0</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Middle Row: Chart & Today Bookings */}
                <Row className="g-4 mb-4">
                  <Col lg={8}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
                      <Card.Body className="p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, margin: 0 }}>Doanh thu 7 ngày qua</h5>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: TX2 }}>Tổng: 22.45 Triệu</div>
                        </div>
                        <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
                          <svg viewBox="0 0 800 200" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
                            <defs>
                              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22c55e" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                              </linearGradient>
                            </defs>
                            <path d="M0,150 C100,150 150,140 200,130 C300,110 350,50 450,50 C550,50 600,160 650,140 C700,120 750,20 800,20 L800,200 L0,200 Z" fill="url(#chartGradient)" />
                            <path d="M0,150 C100,150 150,140 200,130 C300,110 350,50 450,50 C550,50 600,160 650,140 C700,120 750,20 800,20" fill="none" stroke="#22c55e" strokeWidth="4" />
                            <circle cx="200" cy="130" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                            <circle cx="450" cy="50" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                            <circle cx="650" cy="140" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                            <circle cx="800" cy="20" r="5" fill="#fff" stroke="#22c55e" strokeWidth="2" />
                          </svg>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px', color: TX2, fontSize: '11px', fontWeight: 600 }}>
                            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={4}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
                      <Card.Body className="p-4 d-flex flex-column">
                        <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, marginBottom: '20px' }}>Đặt sân hôm nay</h5>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                          {[
                            { name: 'Nguyễn Văn A', court: 'Sân A1', time: '18:00 - 19:00', status: 'Đã TT', color: '#15803d', bg: '#dcfce7' },
                            { name: 'Trần Thị B', court: 'Sân B2', time: '19:00 - 20:30', status: 'Chưa TT', color: '#a16207', bg: '#fef08a' },
                            { name: 'Hoàng Nam', court: 'Sân A1', time: '20:00 - 21:00', status: 'Đã TT', color: '#15803d', bg: '#dcfce7' },
                          ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: i < 2 ? '1px solid #f1f5f9' : 'none' }}>
                              <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: G, border: '1px solid #e2e8f0' }}>
                                {item.time}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: TX }}>{item.name}</div>
                                <div style={{ fontSize: '12px', color: TX2 }}>{item.court}</div>
                              </div>
                              <span style={{ display: 'inline-block', background: item.bg, color: item.color, border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: 600, fontSize: '12px' }}>
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div 
                          onClick={() => setActiveMenu('bookings')} 
                          style={{ textAlign: 'center', marginTop: '16px', cursor: 'pointer', color: G, fontSize: '13px', fontWeight: 700 }}
                        >
                          Xem tất cả lịch đặt
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Bottom Row: Heatmap & Reviews */}
                <Row className="g-4">
                  <Col lg={7}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
                      <Card.Body className="p-4">
                        <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, marginBottom: '24px' }}>Mật độ lấp đầy (7 ngày)</h5>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '24px', paddingRight: '8px', color: TX2, fontSize: '12px', fontWeight: 600 }}>
                            <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>Sáng</div>
                            <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>Chiều</div>
                            <div style={{ height: '32px', display: 'flex', alignItems: 'center' }}>Tối</div>
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: TX2, fontSize: '12px', fontWeight: 600, paddingLeft: '8px' }}>
                              <div style={{ flex: 1, textAlign: 'center' }}>T2</div>
                              <div style={{ flex: 1, textAlign: 'center' }}>T3</div>
                              <div style={{ flex: 1, textAlign: 'center' }}>T4</div>
                              <div style={{ flex: 1, textAlign: 'center' }}>T5</div>
                              <div style={{ flex: 1, textAlign: 'center' }}>T6</div>
                              <div style={{ flex: 1, textAlign: 'center' }}>T7</div>
                              <div style={{ flex: 1, textAlign: 'center' }}>CN</div>
                            </div>

                            {[
                              ['#bbf7d0', '#86efac', '#f1f5f9', '#bbf7d0', '#4ade80', '#22c55e', '#22c55e'],
                              ['#22c55e', '#f1f5f9', '#4ade80', '#86efac', '#22c55e', '#16a34a', '#16a34a'],
                              ['#16a34a', '#15803d', '#15803d', '#16a34a', '#15803d', '#14532d', '#14532d']
                            ].map((row, rIdx) => (
                              <div key={rIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                {row.map((color, cIdx) => (
                                  <div key={cIdx} style={{ flex: 1, height: '32px', backgroundColor: color, borderRadius: '4px' }} />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '11px', color: TX2, fontWeight: 600 }}>
                          <span>Trống</span>
                          <div style={{ width: '12px', height: '12px', background: '#f1f5f9', borderRadius: '2px' }} />
                          <div style={{ width: '12px', height: '12px', background: '#bbf7d0', borderRadius: '2px' }} />
                          <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '2px' }} />
                          <div style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '2px' }} />
                          <div style={{ width: '12px', height: '12px', background: '#14532d', borderRadius: '2px' }} />
                          <span>Kín</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={5}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
                      <Card.Body className="p-4 d-flex flex-column">
                        <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, marginBottom: '20px' }}>Đánh giá gần đây</h5>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {[
                            { name: 'Lê Minh', avatar: '12', rating: 5, text: '"Sân đẹp, mát về đêm. Nhân viên phục vụ rất nhiệt tình..."' },
                            { name: 'Quốc Bảo', avatar: '33', rating: 4, text: '"Ánh sáng ban đêm hơi yếu một chút nhưng nhìn chung ok."' },
                            { name: 'Thanh Trúc', avatar: '44', rating: 5, text: '"Giá cả hợp lý, khu vực vệ sinh sạch sẽ. Sẽ quay lại."' }
                          ].map((review, idx) => (
                            <div key={idx} style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: W }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img src={`https://i.pravatar.cc/150?img=${review.avatar}`} alt="User" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                  <div style={{ fontSize: '13px', fontWeight: 700, color: TX }}>{review.name}</div>
                                </div>
                                <div style={{ display: 'flex', gap: '2px', color: '#eab308' }}>
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                  ))}
                                </div>
                              </div>
                              <div style={{ fontSize: '13px', color: TX2, fontStyle: 'italic', lineHeight: 1.5 }}>
                                {review.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </>
            )}

            {/* ─── TAB 2: BOOKING CALENDAR GRID ─── */}
            {activeMenu === 'bookings' && (
              <div style={{ background: W, borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', padding: '24px', overflowX: 'auto', minWidth: '900px' }}>
                
                {/* Calendar Filter Options / Breadcrumb in Page */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: TX, margin: '0 0 4px 0' }}>Trang chủ / Lịch đặt sân</h4>
                    <span style={{ fontSize: '13px', color: TX2 }}>Hệ thống quản lý lịch đặt theo thời gian thực</span>
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-success" size="sm" className="rounded-pill px-3 fw-bold border-success border-opacity-50 text-success bg-white hover-bg-success-light" style={{ fontSize: '13px' }}>
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

                {/* Calendar main board layout */}
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Grid Column Headers (Courts) */}
                  <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', background: '#f8fafc', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', border: '1px solid #e2e8f0', borderBottomWidth: 0 }}>
                    {/* Time Column Header */}
                    <div style={{ width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #cbd5e1', padding: '16px 0' }}>
                      <span className="material-symbols-outlined text-muted" style={{ fontSize: '18px' }}>schedule</span>
                    </div>
                    {/* Court 1 */}
                    <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: TX }}>Sân A1</span>
                      <span style={{ fontSize: '11px', color: TX2, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginTop: '2px' }}>Khách An - Sân cỏ nhân tạo</span>
                    </div>
                    {/* Court 2 */}
                    <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: TX }}>Sân A2</span>
                      <span style={{ fontSize: '11px', color: TX2, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginTop: '2px' }}>Khách An - Sân cỏ nhân tạo</span>
                    </div>
                    {/* Court 3 */}
                    <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: TX }}>Sân B1</span>
                      <span style={{ fontSize: '11px', color: TX2, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginTop: '2px' }}>Khách An - Sân Futsal</span>
                    </div>
                  </div>

                  {/* Calendar Grid Body (Slots & Overlay Bookings) */}
                  <div style={{ display: 'flex', position: 'relative', border: '1px solid #e2e8f0', background: W }}>
                    
                    {/* 1. Left side Time Columns */}
                    <div style={{ width: '80px', display: 'flex', flexDirection: 'column', borderRight: '1px solid #cbd5e1', zIndex: 2, background: '#f8fafc' }}>
                      {hours.map((hour, idx) => (
                        <div 
                          key={idx} 
                          style={{ 
                            height: '60px', display: 'flex', alignItems: 'start', justifyContent: 'center', 
                            paddingTop: '6px', fontSize: '12px', fontWeight: 700, color: TX2,
                            borderBottom: idx < hours.length - 1 ? '1px dashed #cbd5e1' : 'none'
                          }}
                        >
                          {hour}
                        </div>
                      ))}
                    </div>

                    {/* 2. Absolute/Relative Columns Grid Container */}
                    <div style={{ flex: 1, display: 'flex', position: 'relative', height: `${hours.length * 60}px` }}>
                      
                      {/* Grid Background Horizontal Lines */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
                        {hours.map((_, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              height: '60px', 
                              borderBottom: idx < hours.length - 1 ? '1px solid #f1f5f9' : 'none' 
                            }} 
                          />
                        ))}
                      </div>

                      {/* Current Time Indicator Red Line (at 13:00, which is offset 5 hours => 5 * 60 = 300px) */}
                      <div style={{ position: 'absolute', top: '300px', left: 0, right: 0, height: '2px', background: '#ef4444', zIndex: 4, pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', marginLeft: '-4px' }} />
                      </div>

                      {/* Column 1: Sân A1 */}
                      <div style={{ flex: 1, height: '100%', position: 'relative', borderRight: '1px solid #e2e8f0' }}>
                        {bookingsList.filter(b => b.column === 1 && b.status !== 'cancelled').map(booking => (
                          <div
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
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
                        ))}
                      </div>

                      {/* Column 2: Sân A2 */}
                      <div style={{ flex: 1, height: '100%', position: 'relative', borderRight: '1px solid #e2e8f0' }}>
                        {bookingsList.filter(b => b.column === 2 && b.status !== 'cancelled').map(booking => (
                          <div
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
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
                        ))}
                      </div>

                      {/* Column 3: Sân B1 */}
                      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
                        {bookingsList.filter(b => b.column === 3 && b.status !== 'cancelled').map(booking => (
                          <div
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
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
                        ))}
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ─── TAB 3: REVENUE DASHBOARD ─── */}
            {activeMenu === 'revenue' && (
              <>
                {/* KPI Cards Row */}
                <Row className="g-4 mb-4">
                  {/* Card 1: Tổng doanh thu */}
                  <Col md={4}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div style={{ fontSize: '13px', color: TX2, fontWeight: 700 }}>Tổng doanh thu (Tổng)</div>
                          <span style={{ display: 'inline-block', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '4px 8px', borderRadius: '8px', fontSize: '12px' }}>+12%</span>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#15803d', letterSpacing: '-0.5px', marginBottom: '4px' }}>18,500,000đ</div>
                        <div style={{ fontSize: '12px', color: TX2 }}>+2.1m so với tháng trước</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 2: Doanh thu đặt sân */}
                  <Col md={4}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div style={{ fontSize: '13px', color: TX2, fontWeight: 700 }}>Doanh thu đặt sân</div>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: TX, letterSpacing: '-0.5px', marginBottom: '4px' }}>15,200,000đ</div>
                        <div style={{ fontSize: '12px', color: TX2 }}>350 lượt đặt sân thành công</div>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* Card 3: Dịch vụ kèm theo */}
                  <Col md={4}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div style={{ fontSize: '13px', color: TX2, fontWeight: 700 }}>Dịch vụ kèm theo</div>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shopping_cart</span>
                          </div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#f97316', letterSpacing: '-0.5px', marginBottom: '4px' }}>3,300,000đ</div>
                        <div style={{ fontSize: '12px', color: TX2 }}>Thuê vợt, nước uống, bóng</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Charts Row */}
                <Row className="g-4 mb-4">
                  <Col lg={8}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
                      <Card.Body className="p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h5 style={{ fontSize: '15px', fontWeight: 800, color: TX, margin: 0 }}>Doanh thu theo ngày</h5>
                          
                          <div className="d-flex gap-3" style={{ fontSize: '12px', fontWeight: 600 }}>
                            <div className="d-flex align-items-center gap-1.5">
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f3d22' }} />
                              <span style={{ color: TX2 }}>Đặt sân</span>
                            </div>
                            <div className="d-flex align-items-center gap-1.5">
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fed7aa' }} />
                              <span style={{ color: TX2 }}>Dịch vụ</span>
                            </div>
                          </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '200px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '160px', position: 'relative', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                            
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '25%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', left: 0, right: 0, top: '75%', borderTop: '1px dashed #f1f5f9', pointerEvents: 'none' }} />

                            {[
                              { label: 'T2', booking: 43, service: 10, bVal: '1.8M', sVal: '0.4M' },
                              { label: 'T3', booking: 53, service: 12, bVal: '2.2M', sVal: '0.5M' },
                              { label: 'T4', booking: 60, service: 15, bVal: '2.5M', sVal: '0.6M' },
                              { label: 'T5', booking: 48, service: 10, bVal: '2.0M', sVal: '0.4M' },
                              { label: 'T6', booking: 68, service: 17, bVal: '2.8M', sVal: '0.7M' },
                              { label: 'T7', booking: 78, service: 22, bVal: '3.2M', sVal: '0.9M' },
                              { label: 'CN', booking: 72, service: 20, bVal: '3.0M', sVal: '0.8M' },
                            ].map((bar, idx) => (
                              <div key={idx} className="d-flex flex-column align-items-center" style={{ width: '40px', cursor: 'pointer', zIndex: 2 }}>
                                <div style={{ width: '20px', height: '140px', display: 'flex', flexDirection: 'column-reverse', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
                                  <div style={{ width: '100%', height: `${bar.booking}%`, background: '#0f3d22' }} title={`Đặt sân: ${bar.bVal}`} />
                                  <div style={{ width: '100%', height: `${bar.service}%`, background: '#fed7aa' }} title={`Dịch vụ: ${bar.sVal}`} />
                                </div>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: TX2, marginTop: '8px' }}>{bar.label}</span>
                              </div>
                            ))}

                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col lg={4}>
                    <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', height: '100%' }}>
                      <Card.Body className="p-4 d-flex flex-column align-items-center">
                        <div className="w-100 mb-3 text-start">
                          <h5 style={{ fontSize: '15px', fontWeight: 800, color: TX, margin: 0 }}>Doanh thu theo sân</h5>
                        </div>

                        <div style={{ position: 'relative', width: '140px', height: '140px', margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="100%" height="100%" viewBox="0 0 40 40">
                            <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4.5" />
                            <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#0f3d22" strokeWidth="4.5" strokeDasharray="50 50" strokeDashoffset="25" />
                            <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4.5" strokeDasharray="30 70" strokeDashoffset="75" />
                            <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#f97316" strokeWidth="4.5" strokeDasharray="20 80" strokeDashoffset="5" />
                          </svg>
                          <div style={{ position: 'absolute', textAlign: 'center' }}>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: TX }}>100%</div>
                            <div style={{ fontSize: '10px', color: TX2, fontWeight: 700 }}>Tổng cộng</div>
                          </div>
                        </div>

                        <div className="w-100" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                          {[
                            { name: 'Sân A1', pct: '50%', color: '#0f3d22' },
                            { name: 'Sân A2', pct: '30%', color: '#3b82f6' },
                            { name: 'Sân B1', pct: '20%', color: '#f97316' },
                          ].map((court, idx) => (
                            <div key={idx} className="d-flex justify-content-between align-items-center" style={{ fontSize: '13px', fontWeight: 600 }}>
                              <div className="d-flex align-items-center gap-2">
                                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: court.color }} />
                                <span style={{ color: TX }}>{court.name}</span>
                              </div>
                              <span style={{ color: TX2, fontWeight: 700 }}>{court.pct}</span>
                            </div>
                          ))}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                {/* Heatmap Golden Hours Card */}
                <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: '24px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <div>
                        <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Khung giờ vàng</h5>
                        <span style={{ fontSize: '12px', color: TX2 }}>Phân tích mật độ đặt sân theo giờ trong tuần</span>
                      </div>
                      <span style={{ display: 'inline-flex', background: '#dcfce7', color: '#15803d', border: 'none', padding: '8px 16px', borderRadius: '20px', fontWeight: 700, alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                        <span className="material-symbols-outlined fs-6">bolt</span>
                        Giờ vàng: 17:00 - 20:00 (mật độ thanh toán 95%)
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <div style={{ minWidth: '800px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '4px', borderBottom: '1px solid #e2e8f0', color: TX2, fontSize: '11px', fontWeight: 700 }}>
                          <div style={{ width: '80px' }} />
                          {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map((h, idx) => (
                            <div key={idx} style={{ flex: 1, textAlign: 'center' }}>{h}</div>
                          ))}
                        </div>

                        {[
                          { name: 'Thứ 2', peaks: [9, 10, 11, 12] },
                          { name: 'Thứ 3', peaks: [9, 10, 11, 12] },
                          { name: 'Thứ 4', peaks: [9, 10, 11, 12, 13] },
                          { name: 'Thứ 5', peaks: [9, 10, 11, 12, 13] },
                          { name: 'Thứ 6', peaks: [8, 9, 10, 11, 12, 13] },
                          { name: 'Thứ 7', peaks: [6, 7, 8, 9, 10, 11, 12, 13, 14] },
                          { name: 'Chủ nhật', peaks: [6, 7, 8, 9, 10, 11, 12, 13, 14] }
                        ].map((day, dIdx) => (
                          <div key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '80px', fontSize: '13px', fontWeight: 700, color: TX }}>{day.name}</div>
                            {Array.from({ length: 15 }).map((_, hIdx) => {
                              const isPeak = day.peaks.includes(hIdx);
                              const isMid = hIdx >= 7 && hIdx <= 13 && !isPeak;
                              
                              let bg = '#f1f5f9';
                              let density = '10%';
                              if (isPeak) {
                                bg = '#0f3d22';
                                density = '95%';
                              } else if (isMid) {
                                bg = '#4ade80';
                                density = '65%';
                              } else if (hIdx >= 6) {
                                bg = '#bbf7d0';
                                density = '40%';
                              }

                              return (
                                <div 
                                  key={hIdx} 
                                  title={`${day.name} - ${hIdx + 8}:00: Mật độ ${density}`}
                                  style={{ 
                                    flex: 1, 
                                    height: '36px', 
                                    backgroundColor: bg, 
                                    borderRadius: '6px', 
                                    cursor: 'pointer',
                                    transition: 'all 0.15s'
                                  }}
                                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '11px', color: TX2, fontWeight: 700 }}>
                      <span>Mật độ thanh toán:</span>
                      <div style={{ width: '12px', height: '12px', background: '#f1f5f9', borderRadius: '2px' }} /> <span>Trống (10%)</span>
                      <div style={{ width: '12px', height: '12px', background: '#bbf7d0', borderRadius: '2px' }} /> <span>Thấp (40%)</span>
                      <div style={{ width: '12px', height: '12px', background: '#4ade80', borderRadius: '2px' }} /> <span>Trung bình (65%)</span>
                      <div style={{ width: '12px', height: '12px', background: '#0f3d22', borderRadius: '2px' }} /> <span>Cao (95%)</span>
                    </div>
                  </Card.Body>
                </Card>

                {/* Transaction History Card */}
                <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: '24px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Lịch sử giao dịch</h5>
                      <div className="d-flex align-items-center bg-light border rounded-pill px-3 py-1.5 gap-2" style={{ fontSize: '13px' }}>
                        <span className="material-symbols-outlined fs-5 text-muted">search</span>
                        <input type="text" placeholder="Tìm kiếm hóa đơn..." style={{ border: 'none', background: 'transparent', outline: 'none', width: '220px' }} />
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-hover align-middle" style={{ fontSize: '14px', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                          <tr className="text-muted" style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                            <th style={{ border: 'none', padding: '12px 16px' }}>Mã GD</th>
                            <th style={{ border: 'none', padding: '12px 16px' }}>Khách hàng</th>
                            <th style={{ border: 'none', padding: '12px 16px' }}>Sân</th>
                            <th style={{ border: 'none', padding: '12px 16px' }}>Ngày</th>
                            <th style={{ border: 'none', padding: '12px 16px' }}>Tiền sân</th>
                            <th style={{ border: 'none', padding: '12px 16px' }}>Dịch vụ</th>
                            <th style={{ border: 'none', padding: '12px 16px' }}>Tổng thanh toán</th>
                            <th style={{ border: 'none', padding: '12px 16px' }}>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { id: '#BK889025', name: 'Nguyễn Văn Nam', court: 'Sân A1', date: '18/05/2026', courtFee: '320.000đ', serviceFee: '+30.000đ', total: '350.000đ', status: 'confirmed' },
                            { id: '#BK889026', name: 'Trần Thị Hồng', court: 'Sân A2', date: '18/05/2026', courtFee: '320.000đ', serviceFee: '+0đ', total: '320.000đ', status: 'confirmed' },
                            { id: '#BK889027', name: 'Lê Hoàng Long', court: 'Sân B1', date: '18/05/2026', courtFee: '150.000đ', serviceFee: '+20.000đ', total: '170.000đ', status: 'pending' },
                            { id: '#BK889028', name: 'Phạm Minh Đức', court: 'Sân A1', date: '17/05/2026', courtFee: '400.000đ', serviceFee: '+50.000đ', total: '450.000đ', status: 'confirmed' },
                            { id: '#BK889029', name: 'Hoàng Thùy Linh', court: 'Sân A2', date: '17/05/2026', courtFee: '300.000đ', serviceFee: '+15.000đ', total: '315.000đ', status: 'confirmed' }
                          ].map((row, idx) => (
                            <tr key={idx} style={{ background: '#f8fafc', borderRadius: '12px' }}>
                              <td style={{ border: 'none', padding: '16px', fontWeight: 700, color: TX }}>{row.id}</td>
                              <td style={{ border: 'none', padding: '16px' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#0f3d22', color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                                    {row.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                                  </div>
                                  <span style={{ fontWeight: 600, color: TX }}>{row.name}</span>
                                </div>
                              </td>
                              <td style={{ border: 'none', padding: '16px', fontWeight: 600 }}>{row.court}</td>
                              <td style={{ border: 'none', padding: '16px', color: TX2 }}>{row.date}</td>
                              <td style={{ border: 'none', padding: '16px', color: TX }}>{row.courtFee}</td>
                              <td style={{ border: 'none', padding: '16px', color: '#f97316', fontWeight: 600 }}>{row.serviceFee}</td>
                              <td style={{ border: 'none', padding: '16px', fontWeight: 800, color: '#15803d' }}>{row.total}</td>
                              <td style={{ border: 'none', padding: '16px' }}>
                                <span style={{ display: 'inline-block', background: row.status === 'confirmed' ? '#dcfce7' : '#fffbeb', color: row.status === 'confirmed' ? '#15803d' : '#d97706', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, fontSize: '12px' }}>
                                  {row.status === 'confirmed' ? 'Đã thanh toán' : 'Chờ duyệt'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                            <td colSpan={6} style={{ border: 'none', padding: '16px', textAlign: 'right', fontSize: '15px' }}>Tổng cộng:</td>
                            <td colSpan={2} style={{ border: 'none', padding: '16px', color: '#15803d', fontSize: '16px' }}>18,500,000đ</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4" style={{ fontSize: '13px' }}>
                      <span className="text-muted">Hiển thị 1 - 5 của 350 giao dịch</span>
                      <div className="d-flex gap-1">
                        <Button variant="light" size="sm" className="rounded-circle border p-1" style={{ width: '32px', height: '32px' }}>
                          <span className="material-symbols-outlined fs-5">chevron_left</span>
                        </Button>
                        <Button variant="success" size="sm" className="rounded-circle p-1 border-0" style={{ width: '32px', height: '32px', background: '#0f3d22', color: W }}>1</Button>
                        <Button variant="light" size="sm" className="rounded-circle border p-1" style={{ width: '32px', height: '32px' }}>2</Button>
                        <Button variant="light" size="sm" className="rounded-circle border p-1" style={{ width: '32px', height: '32px' }}>3</Button>
                        <Button variant="light" size="sm" className="rounded-circle border p-1" style={{ width: '32px', height: '32px' }}>
                          <span className="material-symbols-outlined fs-5">chevron_right</span>
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </>
            )}

            {/* ─── TAB 4: VENUE INFORMATION ─── */}
            {activeMenu === 'venue_info' && (
              <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }} className="animate-slide-up">
                
                {/* Block 1: Photos & Media */}
                <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '22px' }}>image</span>
                      <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Ảnh & Media</h5>
                    </div>

                    {/* Dotted Dropzone */}
                    <div 
                      style={{ 
                        border: '2px dashed #cbd5e1', 
                        borderRadius: '12px', 
                        padding: '32px', 
                        textAlign: 'center', 
                        background: '#f8fafc', 
                        cursor: 'pointer', 
                        marginBottom: '20px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#0f3d22'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                      onClick={() => alert('📷 Chọn ảnh từ máy tính để tải lên...')}
                    >
                      <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '40px' }}>cloud_upload</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TX }}>Kéo thả ảnh hoặc nhấp vào đây để tải lên</div>
                      <div style={{ fontSize: '12px', color: TX2, marginTop: '4px' }}>Định dạng hỗ trợ: JPG, PNG, WEBP. Dung lượng tối đa: 5MB</div>
                    </div>

                    {/* Image Thumbnails Previews */}
                    <div className="d-flex gap-3 mb-4 flex-wrap">
                      {[
                        'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&auto=format&fit=crop&q=60',
                        'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=300&auto=format&fit=crop&q=60',
                        'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=300&auto=format&fit=crop&q=60'
                      ].map((img, i) => (
                        <div key={i} style={{ width: '100px', height: '75px', borderRadius: '8px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                          <img src={img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div 
                            style={{ position: 'absolute', top: '4px', right: '4px', width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            onClick={(e) => { e.stopPropagation(); alert('🗑️ Đã xóa hình ảnh này!'); }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>close</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* Dotted plus container */}
                      <div 
                        style={{ 
                          width: '100px', height: '75px', borderRadius: '8px', border: '1px dashed #cbd5e1', 
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                          background: W, cursor: 'pointer', color: TX2
                        }}
                        onClick={() => alert('📷 Thêm hình ảnh mới...')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>add</span>
                        <span style={{ fontSize: '10px', fontWeight: 700 }}>Thêm ảnh...</span>
                      </div>
                    </div>

                    {/* Video Link */}
                    <div className="d-flex flex-column gap-2">
                      <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Link video giới thiệu (Youtube, Vimeo...)</label>
                      <input 
                        type="text" 
                        value={videoLink} 
                        onChange={e => setVideoLink(e.target.value)}
                        placeholder="https://youtube.com/..."
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: 500, color: TX }}
                      />
                    </div>
                  </Card.Body>
                </Card>

                {/* Block 2: Basic Info */}
                <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '22px' }}>info</span>
                      <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Thông tin cơ bản</h5>
                    </div>

                    <div className="d-flex flex-column gap-4">
                      {/* Venue Name */}
                      <div className="d-flex flex-column gap-2">
                        <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Tên sân *</label>
                        <input 
                          type="text" 
                          value={venueName} 
                          onChange={e => setVenueName(e.target.value)}
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: 500, color: TX }}
                        />
                      </div>

                      {/* Sports type tags */}
                      <div className="d-flex flex-column gap-2">
                        <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Môn thể thao *</label>
                        <div className="d-flex gap-2 align-items-center flex-wrap">
                          {sports.map((sport, i) => (
                            <span 
                              key={i} 
                              style={{ 
                                background: '#dcfce7', color: '#15803d', border: 'none', 
                                padding: '8px 16px', borderRadius: '20px', fontWeight: 700, 
                                fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' 
                              }}
                            >
                              {sport}
                              <span 
                                className="material-symbols-outlined" 
                                style={{ fontSize: '14px', cursor: 'pointer' }}
                                onClick={() => setSports(prev => prev.filter(s => s !== sport))}
                              >
                                close
                              </span>
                            </span>
                          ))}
                          <span 
                            style={{ 
                              background: '#f1f5f9', color: TX2, border: '1px dashed #cbd5e1', 
                              padding: '8px 16px', borderRadius: '20px', fontWeight: 700, 
                              fontSize: '12px', cursor: 'pointer', display: 'inline-block' 
                            }}
                            onClick={() => {
                              const newSport = prompt('Nhập tên môn thể thao muốn thêm:');
                              if (newSport) setSports(prev => [...prev, newSport]);
                            }}
                          >
                            + Thêm môn...
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="d-flex flex-column gap-2">
                        <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Mô tả</label>
                        <textarea 
                          value={venueDescription} 
                          onChange={e => setVenueDescription(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: 500, color: TX, minHeight: '100px', lineHeight: '1.5' }}
                        />
                      </div>

                      {/* Address */}
                      <div className="d-flex flex-column gap-2">
                        <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Địa chỉ *</label>
                        <div className="d-flex gap-2">
                          <input 
                            type="text" 
                            value={venueAddress} 
                            onChange={e => setVenueAddress(e.target.value)}
                            style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: 500, color: TX }}
                          />
                          <Button 
                            style={{ background: '#f1f5f9', color: TX, border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', padding: '0 16px' }}
                            onClick={() => alert('📍 Đang định vị lại vị trí trên bản đồ...')}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>location_on</span>
                            Bản đồ
                          </Button>
                        </div>

                        {/* Interactive mini map mock */}
                        <div style={{ height: '180px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', position: 'relative', marginTop: '8px' }}>
                          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=60" alt="Map View" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9) grayscale(0.2)' }} />
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="material-symbols-outlined text-danger" style={{ fontSize: '36px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>location_on</span>
                            <div style={{ background: '#0f3d22', color: W, fontSize: '10px', fontWeight: 700, padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', marginTop: '4px', whiteSpace: 'nowrap' }}>Sân Pickleball EZSport</div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Phone & Email */}
                      <Row>
                        <Col md={6}>
                          <div className="d-flex flex-column gap-2">
                            <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Số điện thoại</label>
                            <input 
                              type="text" 
                              value={venuePhone} 
                              onChange={e => setVenuePhone(e.target.value)}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: 500, color: TX }}
                            />
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="d-flex flex-column gap-2">
                            <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Email liên hệ</label>
                            <input 
                              type="email" 
                              value={venueEmail} 
                              onChange={e => setVenueEmail(e.target.value)}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: 500, color: TX }}
                            />
                          </div>
                        </Col>
                      </Row>

                    </div>
                  </Card.Body>
                </Card>

                {/* Block 3: Amenities & Services */}
                <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '24px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '22px' }}>widgets</span>
                      <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Tiện ích & Dịch vụ</h5>
                    </div>

                    <Row className="g-3">
                      {[
                        { key: 'parking', label: 'Bãi đỗ xe', icon: 'local_parking' },
                        { key: 'changingRoom', label: 'Phòng thay đồ', icon: 'wc' },
                        { key: 'water', label: 'Nước uống', icon: 'water_drop' },
                        { key: 'lights', label: 'Hệ thống đèn', icon: 'emoji_objects' },
                        { key: 'wifi', label: 'Free Wifi', icon: 'wifi' },
                        { key: 'racket', label: 'Cho thuê vợt', icon: 'sports_tennis' },
                        { key: 'canteen', label: 'Căng tin', icon: 'local_cafe' },
                        { key: 'shop', label: 'Cửa hàng đồ tập', icon: 'shopping_bag' }
                      ].map((item, idx) => {
                        const isChecked = amenities[item.key];
                        return (
                          <Col md={3} sm={6} key={idx}>
                            <div 
                              style={{ 
                                padding: '16px', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '12px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                gap: '10px',
                                background: isChecked ? '#f8fafc' : W,
                                transition: 'all 0.2s',
                                cursor: 'pointer'
                              }}
                              onClick={() => setAmenities(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                            >
                              <span className="material-symbols-outlined text-success" style={{ fontSize: '24px' }}>{item.icon}</span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: TX }}>{item.label}</span>
                              
                              {/* Premium Custom Toggle Switch */}
                              <div style={{
                                width: '40px',
                                height: '22px',
                                borderRadius: '11px',
                                background: isChecked ? '#10b981' : '#cbd5e1',
                                position: 'relative',
                                transition: 'all 0.2s'
                              }}>
                                <div style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  background: '#fff',
                                  position: 'absolute',
                                  top: '3px',
                                  left: isChecked ? '21px' : '3px',
                                  transition: 'all 0.2s'
                                }} />
                              </div>
                            </div>
                          </Col>
                        );
                      })}
                    </Row>
                  </Card.Body>
                </Card>

                {/* Block 4: Court Regulations */}
                <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '32px' }}>
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '22px' }}>gavel</span>
                      <h5 style={{ fontSize: '16px', fontWeight: 800, color: TX, margin: 0 }}>Quy định sân</h5>
                    </div>

                    <div className="d-flex flex-column gap-4">
                      {/* Open/Close Hours */}
                      <Row>
                        <Col md={6}>
                          <div className="d-flex flex-column gap-2">
                            <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Giờ mở cửa</label>
                            <input 
                              type="text" 
                              value={openTime} 
                              onChange={e => setOpenTime(e.target.value)}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: 500, color: TX }}
                            />
                          </div>
                        </Col>
                        <Col md={6}>
                          <div className="d-flex flex-column gap-2">
                            <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Giờ đóng cửa</label>
                            <input 
                              type="text" 
                              value={closeTime} 
                              onChange={e => setCloseTime(e.target.value)}
                              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: 500, color: TX }}
                            />
                          </div>
                        </Col>
                      </Row>

                      {/* Refund policies */}
                      <div className="d-flex flex-column gap-2">
                        <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Chính sách hủy sân & hoàn tiền</label>
                        <div className="d-flex flex-column gap-3 mt-1">
                          {[
                            { key: '24h', label: 'Cho phép hủy lịch trước 24 giờ (hoàn tiền 100%)' },
                            { key: '12h', label: 'Cho phép hủy lịch trước 12 giờ (hoàn tiền 50%)' },
                            { key: 'none', label: 'Không cho phép hoàn tiền' }
                          ].map((policy, i) => (
                            <div 
                              key={i} 
                              className="d-flex align-items-center gap-2" 
                              style={{ cursor: 'pointer' }}
                              onClick={() => setCancelPolicy(policy.key)}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '2px solid #cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: cancelPolicy === policy.key ? '#0f3d22' : W,
                                borderColor: cancelPolicy === policy.key ? '#0f3d22' : '#cbd5e1',
                                transition: 'all 0.15s'
                              }}>
                                {cancelPolicy === policy.key && (
                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
                                )}
                              </div>
                              <span style={{ fontSize: '14px', fontWeight: 500, color: TX }}>{policy.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Online Payment Switch */}
                      <div className="d-flex justify-content-between align-items-center p-3" style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: TX }}>Thanh toán online</div>
                          <div style={{ fontSize: '12px', color: TX2, marginTop: '2px' }}>Cho phép khách hàng đặt sân thanh toán ngay qua Ví điện tử hoặc Thẻ ngân hàng</div>
                        </div>
                        
                        {/* Switch */}
                        <div 
                          style={{
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            background: onlinePay ? '#10b981' : '#cbd5e1',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }} 
                          onClick={() => setOnlinePay(prev => !prev)}
                        >
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: '#fff',
                            position: 'absolute',
                            top: '3px',
                            left: onlinePay ? '23px' : '3px',
                            transition: 'all 0.2s'
                          }} />
                        </div>
                      </div>

                      {/* Important customer notes */}
                      <div className="d-flex flex-column gap-2">
                        <label style={{ fontSize: '13px', fontWeight: 700, color: TX }}>Lưu ý đặc biệt cho khách (Quy định về giày, trang phục, bóng...)</label>
                        <textarea 
                          value={venueNotes} 
                          onChange={e => setVenueNotes(e.target.value)}
                          style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', fontWeight: 500, color: TX, minHeight: '100px', lineHeight: '1.5' }}
                        />
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Final bottom save button */}
                <div className="d-flex justify-content-end">
                  <Button 
                    style={{ background: '#0f3d22', border: 'none', borderRadius: '8px', padding: '12px 32px', fontSize: '14px', fontWeight: 700, color: W, boxShadow: '0 4px 12px rgba(15,61,34,0.15)' }}
                    onClick={() => handleUpdateVenueInfo()}
                  >
                    Cập nhật thông tin sân
                  </Button>
                </div>

              </div>
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
              <div className="animate-slide-up" style={{ height: 'calc(100vh - 140px)', display: 'flex', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', background: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                {/* 1. Chat rooms list panel (Left) */}
                <div style={{ width: '320px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff' }}>
                  {/* Chat Search bar */}
                  <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '20px', padding: '6px 12px', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ color: TX2, fontSize: '18px' }}>search</span>
                      <input type="text" placeholder="Tìm kiếm hội thoại..." style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' }} />
                    </div>
                  </div>
                  
                  {/* Conversations List */}
                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    {chatRooms.map((room) => {
                      const isSelected = room.id === selectedRoomId;
                      return (
                        <div 
                          key={room.id}
                          onClick={() => {
                            setSelectedRoomId(room.id);
                            // Clear unread count on click
                            setChatRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread: 0 } : r));
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                            cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                            background: isSelected ? '#f0fdf4' : 'transparent',
                            borderLeft: isSelected ? '4px solid #22c55e' : '4px solid transparent',
                            transition: 'all 0.15s'
                          }}
                        >
                          {/* Avatar with active green dot */}
                          <div style={{ position: 'relative' }}>
                            <img src={room.avatar} alt={room.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                            {room.online && (
                              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', border: '2px solid #fff', position: 'absolute', bottom: 0, right: 0 }} />
                            )}
                          </div>
                          
                          {/* Name & message excerpt */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 800, color: TX, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{room.name}</span>
                              <span style={{ fontSize: '10px', color: TX2 }}>{room.time}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', color: room.unread > 0 ? TX : TX2, fontWeight: room.unread > 0 ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {room.lastMsg}
                              </span>
                              {room.unread > 0 && (
                                <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', fontSize: '10px', fontWeight: 800, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {room.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* 2. Selected Chat Conversation pane (Right) */}
                {(() => {
                  const activeRoom = chatRooms.find(r => r.id === selectedRoomId);
                  if (!activeRoom) return null;
                  
                  return (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
                      {/* Chat room header widget */}
                      <div style={{ background: '#fff', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="d-flex align-items-center gap-3">
                          <img src={activeRoom.avatar} alt={activeRoom.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 800, color: TX }}>{activeRoom.name}</div>
                            <div className="d-flex align-items-center gap-1.5" style={{ gap: '6px' }}>
                              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeRoom.online ? '#22c55e' : '#94a3b8' }} />
                              <span style={{ fontSize: '11px', color: TX2, fontWeight: 600 }}>{activeRoom.online ? 'Đang hoạt động' : 'Ngoại tuyến'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="d-flex align-items-center gap-2">
                          <button onClick={() => alert(`📞 Đang gọi cuộc gọi thoại đến ${activeRoom.name}...`)} style={{ border: '1px solid #e2e8f0', background: '#fff', color: TX2, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>call</span>
                          </button>
                          <button onClick={() => alert(`📹 Đang gọi video đến ${activeRoom.name}...`)} style={{ border: '1px solid #e2e8f0', background: '#fff', color: TX2, borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>videocam</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Messages body (Scrollable) */}
                      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {activeRoom.messages.map((msg, i) => {
                          const isOwner = msg.sender === 'owner';
                          return (
                            <div key={i} style={{ display: 'flex', justifyContent: isOwner ? 'flex-end' : 'flex-start' }}>
                              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', maxWidth: '70%' }}>
                                <div 
                                  style={{ 
                                    padding: '12px 16px', 
                                    borderRadius: isOwner ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                                    background: isOwner ? '#0f3d22' : '#fff',
                                    color: isOwner ? '#fff' : TX,
                                    border: isOwner ? 'none' : '1px solid #e2e8f0',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                  }}
                                >
                                  {msg.text}
                                </div>
                                <span style={{ fontSize: '10px', color: TX2, textAlign: isOwner ? 'right' : 'left', alignSelf: isOwner ? 'flex-end' : 'flex-start' }}>{msg.time}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Chat Input panel */}
                      <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #e2e8f0' }}>
                        <form 
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!typedMessage.trim()) return;
                            
                            const now = new Date();
                            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            
                            const newMsg = {
                              sender: 'owner',
                              text: typedMessage.trim(),
                              time: timeStr
                            };
                            
                            setChatRooms(prev => prev.map(room => {
                              if (room.id === selectedRoomId) {
                                return {
                                  ...room,
                                  lastMsg: typedMessage.trim(),
                                  time: 'Vừa xong',
                                  messages: [...room.messages, newMsg]
                                };
                              }
                              return room;
                            }));
                            
                            setTypedMessage('');
                          }}
                          className="d-flex align-items-center gap-3"
                        >
                          {/* Attachment button */}
                          <button type="button" onClick={() => alert('📤 Chọn file đính kèm (Ảnh, PDF...)...')} style={{ border: 'none', background: 'transparent', color: TX2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>attach_file</span>
                          </button>
                          
                          {/* Text input */}
                          <input 
                            type="text" 
                            value={typedMessage}
                            onChange={(e) => setTypedMessage(e.target.value)}
                            placeholder="Nhập tin nhắn..." 
                            style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '24px', padding: '10px 20px', fontSize: '13px', outline: 'none', background: '#f8fafc', color: TX, fontWeight: 500 }} 
                          />
                          
                          {/* Send button widget */}
                          <button 
                            type="submit" 
                            style={{ 
                              border: 'none', 
                              background: typedMessage.trim() ? '#0f3d22' : '#cbd5e1', 
                              color: '#fff', 
                              borderRadius: '50%', 
                              width: '40px', 
                              height: '40px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              cursor: typedMessage.trim() ? 'pointer' : 'default',
                              boxShadow: typedMessage.trim() ? '0 2px 6px rgba(15,61,34,0.2)' : 'none',
                              transition: 'all 0.15s'
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

          </div>

          {/* ─── TAB 2 SIDE DRAWER: BOOKING DETAILS ─── */}
          {activeMenu === 'bookings' && selectedBooking && (
            <div 
              style={{ 
                width: '360px', background: W, borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column',
                boxShadow: '-4px 0 20px rgba(0,0,0,0.03)', zIndex: 5, animation: 'slideIn 0.3s ease'
              }}
            >
              {/* Drawer Header */}
              <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ background: '#f8fafc' }}>
                <div>
                  <span className="material-symbols-outlined text-success mb-1" style={{ fontSize: '24px' }}>check_circle</span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: TX }}>#{selectedBooking.id}</div>
                  <span style={{ fontSize: '12px', color: TX2 }}>Chi tiết lịch đặt sân</span>
                </div>
                <Button 
                  variant="light" 
                  className="rounded-circle border-0 d-flex align-items-center justify-content-center p-2" 
                  onClick={() => setSelectedBooking(null)}
                >
                  <span className="material-symbols-outlined fs-5">close</span>
                </Button>
              </div>

              {/* Drawer Body Scrollable Content */}
              <div className="p-4 flex-grow-1 overflow-auto d-flex flex-column gap-4">
                
                {/* 1. Customer Card */}
                <div className="p-3 border rounded-4 d-flex align-items-center gap-3" style={{ background: '#f8fafc' }}>
                  <img 
                    src={`https://i.pravatar.cc/150?img=${selectedBooking.avatar}`} 
                    alt="Customer" 
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                  <div>
                    <h6 style={{ fontSize: '14px', fontWeight: 800, color: TX, margin: 0 }}>{selectedBooking.name}</h6>
                    <span style={{ fontSize: '11px', color: TX2 }}>{selectedBooking.phone}</span>
                    <div style={{ fontSize: '11px', color: TX2 }}>{selectedBooking.email}</div>
                  </div>
                </div>

                {/* 2. Detailed Specs */}
                <div>
                  <h6 style={{ fontSize: '12px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Thông tin đặt sân</h6>
                  <Row className="g-3">
                    <Col xs={6}>
                      <span style={{ fontSize: '11px', color: TX2 }}>Sân đặt</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{selectedBooking.court}</div>
                    </Col>
                    <Col xs={6}>
                      <span style={{ fontSize: '11px', color: TX2 }}>Ngày chơi</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{selectedBooking.date}</div>
                    </Col>
                    <Col xs={6}>
                      <span style={{ fontSize: '11px', color: TX2 }}>Thời gian</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{selectedBooking.timeSlot}</div>
                    </Col>
                    <Col xs={6}>
                      <span style={{ fontSize: '11px', color: TX2 }}>Thời lượng</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{selectedBooking.duration}</div>
                    </Col>
                    <Col xs={6}>
                      <span style={{ fontSize: '11px', color: TX2 }}>Phương thức</span>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: TX, marginTop: '2px' }}>{selectedBooking.paymentMethod}</div>
                    </Col>
                    <Col xs={6}>
                      <span style={{ fontSize: '11px', color: TX2 }}>Tổng tiền</span>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: G, marginTop: '2px' }}>{selectedBooking.amount}</div>
                    </Col>
                  </Row>
                </div>

                {/* 3. Notes section */}
                {selectedBooking.notes && (
                  <div>
                    <h6 style={{ fontSize: '12px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Ghi chú của khách</h6>
                    <div style={{ padding: '12px 16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', fontSize: '13px', color: '#b45309', fontStyle: 'italic', lineHeight: 1.5 }}>
                      {selectedBooking.notes}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-top d-flex flex-column gap-2">
                {selectedBooking.status !== 'confirmed' && (
                  <Button 
                    variant="success" 
                    className="w-100 py-2.5 rounded-pill fw-bold border-0 shadow-sm"
                    style={{ background: '#10b981', color: W }}
                    onClick={() => handleCompleteBooking(selectedBooking.id)}
                  >
                    Phê duyệt & Hoàn thành
                  </Button>
                )}
                <Button 
                  variant="outline-success" 
                  className="w-100 py-2.5 rounded-pill fw-bold border-success border-opacity-20 hover-bg-success-light text-success d-flex align-items-center justify-content-center gap-2"
                  onClick={() => alert(`📞 Đang kết nối cuộc gọi đến số: ${selectedBooking.phone}`)}
                >
                  <span className="material-symbols-outlined fs-5">call</span>
                  Liên hệ khách
                </Button>
                <Button 
                  variant="link" 
                  className="w-100 py-2 text-danger fw-bold border-0 shadow-none mt-1"
                  style={{ fontSize: '13px' }}
                  onClick={() => handleCancelBooking(selectedBooking.id)}
                >
                  Hủy đặt sân
                </Button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
