import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Button, Dropdown, Modal } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { voucherService, type Voucher } from '../../services/voucher.service';
import { venueService, type Venue } from '../../services/venue.service';
import { CreateVoucherModal, type VoucherFormData } from './CreateVoucherModal';
import { EditVoucherModal } from './EditVoucherModal';

interface AdminDashboardProps {
  onGoHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onGoHome }) => {
  const { logout } = useAuth();
  // Theme styling tokens (Matches modern clean Admin layout)
  const W = '#ffffff';
  const TX = '#0f172a'; // Slate 900
  const TX2 = '#64748b'; // Slate 500
  const BG = '#f8fafc'; // Slate 50
  const BORDER = '#e2e8f0'; // Slate 200
  const PRIMARY = '#0f3d22'; // EZSport Forest Green

  const [activeMenu, setActiveMenu] = useState('overview'); // 'overview' | 'owners' | 'users' | 'finance' | 'marketing' | 'settings'
  const [commissionRate, setCommissionRate] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'processing' | 'pending'>('all');

  // New States for User Directory (Danh bạ Người dùng)
  const [playerStatusFilter, setPlayerStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  
  const [players, setPlayers] = useState([
    { id: '#EZP-9021', name: 'Hoàng Nam', email: 'hoangnam@gmail.com', date: '12/03/2024', bookings: 42, spend: 12500000, status: 'active', img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=60' },
    { id: '#EZP-8854', name: 'Minh Thư', email: 'minhthu.kd@gmail.com', date: '05/03/2024', bookings: 15, spend: 4200000, status: 'active', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=60' },
    { id: '#EZP-7612', name: 'Anh Tuấn', email: 'tuananh96@yahoo.com', date: '28/02/2024', bookings: 9, spend: 1500000, status: 'blocked', img: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=80&auto=format&fit=crop&q=60' },
    { id: '#EZP-7501', name: 'Khánh Hoàng', email: 'hoangkhanh_sport@gmail.com', date: '20/02/2024', bookings: 22, spend: 6800000, status: 'active', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=60' }
  ]);

  // States for Owner Management (Quản lý Chủ sân)
  const [ownerStatusFilter, setOwnerStatusFilter] = useState<'all' | 'verified' | 'pending' | 'locked'>('all');

  const [owners, setOwners] = useState([
    { id: '#EZ-1092', name: 'Nguyễn Văn An', email: 'annguyen@example.com', phone: '090-123-4567', venues: 4, status: 'verified', initials: 'NV', avatarBg: '#1e293b' },
    { id: '#EZ-1085', name: 'Trần Thị Hoa', email: 'hoa.tran@ezcourt.vn', phone: '091-557-8843', venues: 2, status: 'pending', initials: 'TH', avatarBg: '#22c55e' },
    { id: '#EZ-1072', name: 'Lê Văn Minh', email: 'minhle@outlook.com', phone: '084-222-3333', venues: 1, status: 'locked', initials: 'LM', avatarBg: '#ef4444' }
  ]);

  const [pendingRequests, setPendingRequests] = useState([
    { id: 'REQ-101', venue: 'Sân bóng Đại Việt', owner: 'Phan Hùng Cường', time: '3 giờ trước', initials: 'PC', img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop&q=60' },
    { id: 'REQ-102', venue: 'Tennis Academy', owner: 'Lý Bảo Ngọc', time: '5 giờ trước', initials: 'BN', img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=80&auto=format&fit=crop&q=60' },
    { id: 'REQ-103', venue: 'Cầu lông Ngôi Sao', owner: 'Đặng Mỹ Linh', time: '1 ngày trước', initials: 'ML', img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=80&auto=format&fit=crop&q=60' }
  ]);

  // States for Marketing & Promotion Management
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showCreateVoucherModal, setShowCreateVoucherModal] = useState(false);
  const [showEditVoucherModal, setShowEditVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const [banners, setBanners] = useState([
    { id: 'b1', title: 'Chiến dịch Mùa Hè Rực Lửa', link: 'ezsport.vn/may-day-mobi', views: '12.8k', clicks: '2,560', img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=200&auto=format&fit=crop&q=60' },
    { id: 'b2', title: 'Giải Quần Vợt Mở Rộng 2024', link: 'ezsport.vn/tennis-open', views: '8.5k', clicks: '1,120', img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=200&auto=format&fit=crop&q=60' }
  ]);

  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [pushTarget, setPushTarget] = useState('Tất cả người dùng');

  // Transactions State
  const [transactions, setTransactions] = useState([
    { id: 'RLD-08221', venue: 'Sân bóng Đại Nam', owner: 'Nguyễn Văn A', value: 450000, rate: 10, commission: 45000, status: 'paid', img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=80&auto=format&fit=crop&q=60' },
    { id: 'JKF-94043', venue: 'Sân Tennis Hòa Bình', owner: 'Trần Thị B', value: 800000, rate: 10, commission: 80000, status: 'processing', img: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=80&auto=format&fit=crop&q=60' },
    { id: 'HZX-88295', venue: 'CLB Cầu Lông Ngôi Sao', owner: 'Lê Văn C', value: 200000, rate: 10, commission: 20000, status: 'pending', img: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=80&auto=format&fit=crop&q=60' },
    { id: 'RLD-98207', venue: 'Sân bóng 365', owner: 'Phạm Minh D', value: 600000, rate: 10, commission: 60000, status: 'paid', img: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=80&auto=format&fit=crop&q=60' },
  ]);

  const [venues, setVenues] = useState<Venue[]>([]);

  // States for Venue Combo Config Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedVenueForConfig, setSelectedVenueForConfig] = useState<Venue | null>(null);
  const [configWeeklyDiscount, setConfigWeeklyDiscount] = useState(5);
  const [configMonthlyDiscount, setConfigMonthlyDiscount] = useState(15);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const menuItems = [
    { id: 'overview', icon: 'dashboard', label: 'Tổng quan' },
    { id: 'owners', icon: 'real_estate_agent', label: 'Quản lý chủ sân' },
    { id: 'venues', icon: 'sports_tennis', label: 'Cấu hình Combo & Sân' },
    { id: 'users', icon: 'groups', label: 'Danh bạ người dùng' },
    { id: 'finance', icon: 'payments', label: 'Tài chính & Hoa hồng' },
    { id: 'marketing', icon: 'campaign', label: 'Marketing & Khuyến mãi' },
    { id: 'settings', icon: 'settings', label: 'Cấu hình hệ thống' },
  ];

  // Helper formatting functions
  const formatVND = (num: number) => {
    return num.toLocaleString('vi-VN') + 'đ';
  };

  const fetchVenues = () => {
    venueService.getVenues()
      .then(setVenues)
      .catch((err) => console.error('Lỗi tải danh sách sân:', err));
  };

  useEffect(() => {
    voucherService.listAdmin()
      .then(setVouchers)
      .catch((err) => alert(err?.response?.data?.message || 'Khong the tai danh sach voucher'));
    fetchVenues();
  }, []);

  // Dynamic Commission Rate updates
  const handleUpdateCommission = () => {
    const rate = prompt('Nhập tỷ lệ hoa hồng hệ thống mới (%):', commissionRate.toString());
    if (rate !== null) {
      const parsed = parseFloat(rate);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
        setCommissionRate(parsed);
        setTransactions(prev => prev.map(t => ({
          ...t,
          rate: parsed,
          commission: Math.round(t.value * (parsed / 100))
        })));
        alert(`🎉 Đã cập nhật tỷ lệ hoa hồng hệ thống thành công: ${parsed}%!`);
      } else {
        alert('❌ Vui lòng nhập tỷ lệ hợp lệ từ 0 đến 100.');
      }
    }
  };

  // Create mock payout
  const handleCreatePayout = () => {
    const venue = prompt('Nhập tên câu lạc bộ / Sân nhận thanh toán:');
    const valueStr = prompt('Nhập số tiền chuyển khoản (VND):');
    const owner = prompt('Nhập tên chủ sân nhận thụ hưởng:');
    
    if (venue && valueStr && owner) {
      const val = parseInt(valueStr, 10);
      if (!isNaN(val)) {
        const newTx = {
          id: `RLD-${Math.floor(10000 + Math.random() * 90000)}`,
          venue,
          owner,
          value: val,
          rate: commissionRate,
          commission: Math.round(val * (commissionRate / 100)),
          status: 'processing',
          img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=80&auto=format&fit=crop&q=60'
        };
        setTransactions(prev => [newTx, ...prev]);
        alert(`💸 Đã tạo lệnh thanh toán cho chủ sân ${owner} trị giá ${formatVND(val)} thành công!`);
      }
    }
  };

  // Create mock player
  const handleCreatePlayer = () => {
    const name = prompt('Nhập họ tên người chơi mới:');
    const email = prompt('Nhập địa chỉ email người chơi:');
    const bookingsStr = prompt('Nhập số lượt đặt sân khởi tạo (ví dụ: 0):');
    const spendStr = prompt('Nhập số tiền chi tiêu (VND, ví dụ: 0):');
    
    if (name && email) {
      const bookings = parseInt(bookingsStr || '0', 10) || 0;
      const spend = parseInt(spendStr || '0', 10) || 0;
      const newPlayer = {
        id: `#EZP-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        email,
        date: new Date().toLocaleDateString('vi-VN'),
        bookings,
        spend,
        status: 'active',
        img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=60'
      };
      setPlayers(prev => [newPlayer, ...prev]);
      alert(`🎉 Đã thêm người chơi ${name} vào danh bạ thành công!`);
    }
  };

  // Block/Unblock Player
  const handleTogglePlayerStatus = (id: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'active' ? 'blocked' : 'active';
        alert(`🔒 Đã chuyển đổi trạng thái của người chơi ${p.name} thành: ${nextStatus === 'active' ? 'HOẠT ĐỘNG' : 'BỊ CHẶN'}!`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  // Delete Player
  const handleDeletePlayer = (id: string) => {
    const confirm = window.confirm('⚠️ Bạn có chắc chắn muốn xóa người dùng này khỏi hệ thống EZSport?');
    if (confirm) {
      setPlayers(prev => prev.filter(p => p.id !== id));
      alert('🗑️ Đã xóa tài khoản người chơi thành công!');
    }
  };

  // Owner Management Specific Operations
  const handleCreateOwner = () => {
    const name = prompt('Nhập tên chủ sân mới:');
    const email = prompt('Nhập địa chỉ email chủ sân:');
    const phone = prompt('Nhập số điện thoại liên hệ:');
    const venuesStr = prompt('Nhập số lượng sân sở hữu (ví dụ: 1):');
    
    if (name && email && phone) {
      const venues = parseInt(venuesStr || '1', 10) || 1;
      const initials = name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
      const colors = ['#1e293b', '#22c55e', '#ef4444', '#0f3d22', '#3b82f6'];
      const avatarBg = colors[Math.floor(Math.random() * colors.length)];
      
      const newOwner = {
        id: `#EZ-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        email,
        phone,
        venues,
        status: 'verified',
        initials,
        avatarBg
      };
      
      setOwners(prev => [newOwner, ...prev]);
      alert(`🎉 Đã thêm chủ sân ${name} vào danh sách thành công!`);
    }
  };

  const handleToggleOwnerStatus = (id: string) => {
    setOwners(prev => prev.map(o => {
      if (o.id === id) {
        const nextStatus = o.status === 'verified' ? 'locked' : 'verified';
        alert(`🔒 Trạng thái chủ sân ${o.name} đã được chuyển sang: ${nextStatus === 'verified' ? 'ĐÃ XÁC MINH' : 'TẠM KHÓA'}!`);
        return { ...o, status: nextStatus };
      }
      return o;
    }));
  };

  const handleApproveRequest = (id: string, venue: string, ownerName: string) => {
    setPendingRequests(prev => prev.filter(r => r.id !== id));
    const initials = ownerName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const newOwner = {
      id: `#EZ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: ownerName,
      email: `${ownerName.toLowerCase().replace(/\s+/g, '')}@ezcourt.vn`,
      phone: '090-' + Math.floor(100000 + Math.random() * 900000),
      venues: 1,
      status: 'verified',
      initials,
      avatarBg: '#22c55e'
    };
    setOwners(prev => [newOwner, ...prev]);
    alert(`✓ Đã phê duyệt và kích hoạt tài khoản câu lạc bộ "${venue}" của chủ sân ${ownerName} thành công!`);
  };

  const handleRejectRequest = (id: string, venue: string) => {
    const confirm = window.confirm(`❌ Bạn có chắc chắn muốn từ chối yêu cầu đăng ký của sân "${venue}"?`);
    if (confirm) {
      setPendingRequests(prev => prev.filter(r => r.id !== id));
      alert(`Đã từ chối đăng ký của sân "${venue}".`);
    }
  };

  // Marketing & Promotions Operations
  const handleCreateVoucher = async (voucherData: VoucherFormData) => {
    try {
      const voucher = await voucherService.create(voucherData);
      setVouchers(prev => [voucher, ...prev]);
      setShowCreateVoucherModal(false);
      alert(`Đã tạo voucher ${voucher.code} thành công!`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Tạo voucher thất bại');
    }
  };

  const handleEditVoucher = async (voucherId: string, voucherData: Partial<VoucherFormData>) => {
    try {
      // Call API to update voucher
      await voucherService.update(voucherId, voucherData);
      
      // Update local state
      setVouchers(prev => prev.map(v => 
        v._id === voucherId ? { ...v, ...voucherData } : v
      ));
      
      setShowEditVoucherModal(false);
      setSelectedVoucher(null);
      alert('Đã cập nhật voucher thành công!');
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Cập nhật voucher thất bại');
    }
  };

  const handleOpenEditModal = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setShowEditVoucherModal(true);
  };

  const handleDeleteVoucher = async (id: string, code: string) => {
    const confirmDelete = window.confirm(`Ban co chac chan muon xoa voucher ${code}?`);
    if (!confirmDelete) return;

    try {
      await voucherService.delete(id);
      setVouchers(prev => prev.filter(v => v._id !== id));
      alert(`Da xoa voucher ${code}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Xoa voucher that bai');
    }
  };

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert('⚠️ Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo đẩy!');
      return;
    }
    alert(`🔔 [EZSport Push Notification]\n\nĐang gửi thông báo đến: ${pushTarget}\nTiêu đề: ${pushTitle}\nNội dung: ${pushBody}\n\n➔ Gửi thành công đến toàn hệ thống!`);
    setPushTitle('');
    setPushBody('');
  };

  const handleUploadBanner = () => {
    const title = prompt('Nhập tiêu đề banner mới:');
    const link = prompt('Nhập đường liên kết (ví dụ: ezsport.vn/khuyen-mai-hot):');
    
    if (title && link) {
      const newBanner = {
        id: `banner-${Date.now()}`,
        title,
        link,
        views: '0',
        clicks: '0',
        img: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&auto=format&fit=crop&q=60'
      };
      setBanners(prev => [...prev, newBanner]);
      alert(`📸 Đã tải lên banner "${title}" thành công!`);
    }
  };

  const handleDeleteBanner = (id: string, title: string) => {
    const confirm = window.confirm(`⚠️ Bạn có chắc chắn muốn gỡ bỏ banner "${title}"?`);
    if (confirm) {
      setBanners(prev => prev.filter(b => b.id !== id));
      alert(`🗑️ Đã gỡ bỏ banner thành công!`);
    }
  };

  const handleOpenConfig = (v: Venue) => {
    setSelectedVenueForConfig(v);
    setConfigWeeklyDiscount(v.comboWeeklyDiscount !== undefined ? v.comboWeeklyDiscount : 5);
    setConfigMonthlyDiscount(v.comboMonthlyDiscount !== undefined ? v.comboMonthlyDiscount : 15);
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedVenueForConfig) return;
    if (configWeeklyDiscount < 0 || configWeeklyDiscount > 100 || configMonthlyDiscount < 0 || configMonthlyDiscount > 100) {
      alert('Tỷ lệ phần trăm chiết khấu phải từ 0 đến 100%');
      return;
    }
    setIsSavingConfig(true);
    try {
      await venueService.updateVenue(selectedVenueForConfig._id, {
        comboWeeklyDiscount: configWeeklyDiscount,
        comboMonthlyDiscount: configMonthlyDiscount
      });
      alert('🎉 Cập nhật tỷ lệ chiết khấu combo thành công!');
      setShowConfigModal(false);
      setSelectedVenueForConfig(null);
      fetchVenues();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể cập nhật cấu hình combo');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Filtered transactions computed dynamically
  const filteredTransactions = transactions.filter(t => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  // Filtered players computed dynamically
  const filteredPlayers = players.filter(p => {
    if (playerStatusFilter === 'all') return true;
    return p.status === playerStatusFilter;
  });

  // Filtered owners computed dynamically
  const filteredOwners = owners.filter(o => {
    if (ownerStatusFilter === 'all') return true;
    return o.status === ownerStatusFilter;
  });

  // Show all vouchers (no filtering since we removed search)
  const filteredVouchers = vouchers;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: BG, fontFamily: "'Inter', sans-serif" }}>
      
      {/* ─── SIDEBAR ─── */}
      <div style={{ 
        width: '260px', backgroundColor: W, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column',
        zIndex: 10
      }}>
        {/* Top Branding Logo */}
        <div 
          onClick={onGoHome}
          style={{ 
            borderBottom: `1px solid ${BORDER}`, padding: '8px 16px', marginBottom: '8px', 
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            overflow: 'visible'
          }}
        >
          <img 
            src="/logo2.png" 
            alt="EZSport Admin Logo" 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxHeight: '58px', 
              objectFit: 'contain', 
              transform: 'scale(2.9)', 
              transformOrigin: 'center',
              marginTop: '24px',
              marginBottom: '24px'
            }} 
          />
          <div style={{ fontSize: '10px', color: '#1e40af', fontWeight: 800, marginTop: '18px', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>
            Quản trị hệ thống
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-grow-1 px-3" style={{ overflowY: 'auto' }}>
          {menuItems.map(item => {
            const isActive = activeMenu === item.id;
            return (
              <div 
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                  background: isActive ? '#e6fcf0' : 'transparent',
                  color: isActive ? PRIMARY : TX2,
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s',
                  borderLeft: isActive ? `4px solid ${PRIMARY}` : '4px solid transparent',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ fontSize: '14px' }}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Sidebar bottom footer */}
        <div className="p-3" style={{ borderTop: `1px solid ${BORDER}` }}>
          <div 
            className="d-flex align-items-center gap-3 p-2 rounded" 
            style={{ color: TX2, fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginBottom: '4px' }}
            onClick={() => alert('📞 Tổng đài hỗ trợ kỹ thuật Admin hoạt động 24/7!')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>contact_support</span>
            <span>Hỗ trợ</span>
          </div>
          
          <div 
            className="d-flex align-items-center gap-3 p-2 rounded text-danger" 
            style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => {
              logout();
              onGoHome();
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Scrollable Dashboard Viewport */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {activeMenu === 'overview' ? (
            <>
              {/* ─── GENERAL SYSTEM OVERVIEW VIEW ─── */}
              {/* Title & Actions */}
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: TX, margin: 0 }}>Trang Tổng Quan</h2>
                  <p style={{ fontSize: '13px', color: TX2, margin: '2px 0 0 0' }}>Chào mừng trở lại, Huyền. Đây là tình hình vận hành hệ thống hôm nay.</p>
                </div>
                
                <div className="d-flex align-items-center gap-2">
                  <Dropdown>
                    <Dropdown.Toggle variant="light" size="sm" style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '8px', fontWeight: 700, fontSize: '12px', padding: '8px 16px', color: TX }}>
                      📅 30 ngày qua
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item>📅 Hôm nay</Dropdown.Item>
                      <Dropdown.Item>📅 7 ngày qua</Dropdown.Item>
                      <Dropdown.Item>📅 30 ngày qua</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  
                  <Button 
                    style={{ 
                      background: '#0f3d22', border: 'none', borderRadius: '8px', padding: '8px 16px', 
                      fontSize: '12px', fontWeight: 700, color: W, display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 2px 6px rgba(15,61,34,0.15)'
                    }}
                    onClick={() => alert('📤 Đang xuất báo cáo tổng quan vận hành hệ thống dạng PDF...')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
                    Xuất Báo Cáo
                  </Button>
                </div>
              </div>

              {/* Metrics Row (4 Cards) */}
              <Row className="g-4 mb-4">
                {/* Metric 1: Total Revenue */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', position: 'relative' }}>
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng doanh thu (GMT)</span>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>2.500.000.000đ</div>
                        
                        {/* Premium Soft Mint Green Rounded Growth Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e6fcf0', color: '#15803d', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '4px 10px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px', fontWeight: 800 }}>trending_up</span>
                          <span>+15% so với tháng trước</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '24px' }}>trending_up</span>
                    </div>
                  </Card>
                </Col>

                {/* Metric 2: Earned Commissions */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%' }}>
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lợi nhuận hoa hồng</span>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif", borderBottom: '4px solid #16803d', display: 'inline-block', paddingBottom: '2px' }}>
                          250.000.000đ
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '24px' }}>payments</span>
                    </div>
                  </Card>
                </Col>

                {/* Metric 3: Total Bookings */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%' }}>
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng lượt đặt sân</span>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>1,250</div>
                        
                        {/* Mini vertical wave chart */}
                        <div className="d-flex align-items-end gap-1 mt-2" style={{ height: '16px' }}>
                          <div style={{ width: '3px', height: '8px', background: '#22c55e', borderRadius: '1px' }} />
                          <div style={{ width: '3px', height: '14px', background: '#22c55e', borderRadius: '1px' }} />
                          <div style={{ width: '3px', height: '11px', background: '#22c55e', borderRadius: '1px' }} />
                          <div style={{ width: '3px', height: '15px', background: '#22c55e', borderRadius: '1px' }} />
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-success" style={{ fontSize: '24px' }}>chair</span>
                    </div>
                  </Card>
                </Col>

                {/* Metric 4: Cancellation Rate */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%' }}>
                    <div className="d-flex align-items-start justify-content-between">
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tỷ lệ huỷ sân</span>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>2.4%</div>
                        
                        {/* Premium Soft Mint Green Rounded Growth Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e6fcf0', color: '#15803d', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '4px 10px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px', fontWeight: 800 }}>trending_down</span>
                          <span>-0.8% giảm đáng kể</span>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-danger" style={{ fontSize: '24px' }}>cancel</span>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Chart Grid Mid Section */}
              <Row className="g-4 mb-4">
                {/* Column Left (8cols) - Revenue & Bookings Bar chart */}
                <Col lg={8}>
                  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', height: '100%' }}>
                    <Card.Body className="p-4 d-flex flex-column justify-content-between">
                      
                      {/* Chart Header */}
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <span style={{ fontSize: '16px', fontWeight: 800, color: TX }}>Doanh thu & Số lượt đặt</span>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', fontWeight: 700 }}>
                          <span style={{ color: PRIMARY }}><span style={{ color: PRIMARY, marginRight: '4px' }}>●</span>Doanh thu</span>
                          <span style={{ color: '#22c55e' }}><span style={{ color: '#22c55e', marginRight: '4px' }}>●</span>Số lượt đặt</span>
                        </div>
                      </div>

                      {/* Premium native CSS bar chart container */}
                      <div style={{ height: '220px', position: 'relative', overflow: 'hidden', background: '#f8fafc', borderRadius: '12px', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '16px 24px' }}>
                        {/* Curve Line Graphic behind */}
                        <svg viewBox="0 0 500 120" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80%', zIndex: 1, pointerEvents: 'none' }}>
                          <path d="M 0 100 Q 80 40 160 70 T 320 30 T 480 50 L 500 120 L 0 120 Z" fill="rgba(15, 61, 34, 0.04)" stroke="rgba(15, 61, 34, 0.12)" strokeWidth="2" />
                        </svg>

                        {/* Chart Grid lines */}
                        <div style={{ position: 'absolute', top: '25%', left: 0, width: '100%', borderTop: `1px dashed ${BORDER}`, zIndex: 0 }} />
                        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', borderTop: `1px dashed ${BORDER}`, zIndex: 0 }} />
                        <div style={{ position: 'absolute', top: '75%', left: 0, width: '100%', borderTop: `1px dashed ${BORDER}`, zIndex: 0 }} />

                        {/* Six columns */}
                        {[
                          { val: '40%', month: 'Th06' },
                          { val: '75%', month: 'Th07' },
                          { val: '60%', month: 'Th08' },
                          { val: '95%', month: 'Th09' },
                          { val: '80%', month: 'Th10' },
                          { val: '90%', month: 'Th11' }
                        ].map((bar, index) => (
                          <div key={index} style={{ zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', width: '45px' }}>
                            <div style={{
                              width: '24px', 
                              height: bar.val, 
                              background: 'linear-gradient(180deg, #15803d 0%, #0f3d22 100%)', 
                              borderRadius: '6px',
                              boxShadow: '0 4px 8px rgba(15,61,34,0.15)',
                              transition: 'all 0.3s'
                            }} 
                              onMouseEnter={e => e.currentTarget.style.transform = 'scaleY(1.05)'}
                              onMouseLeave={e => e.currentTarget.style.transform = 'scaleY(1)'}
                            />
                            <div style={{ fontSize: '10px', color: TX2, fontWeight: 700, marginTop: '8px' }}>{bar.month}</div>
                          </div>
                        ))}
                      </div>

                    </Card.Body>
                  </Card>
                </Col>

                {/* Column Right (4cols) - Donut chart category mix */}
                <Col lg={4}>
                  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', height: '100%' }}>
                    <Card.Body className="p-4 d-flex flex-column justify-content-between">
                      
                      <span style={{ fontSize: '16px', fontWeight: 800, color: TX, marginBottom: '20px', display: 'block' }}>Cơ cấu loại hình</span>

                      {/* Donut slice circle created elegantly in pure conic gradient */}
                      <div style={{
                        width: '130px', height: '130px', borderRadius: '50%',
                        background: 'conic-gradient(#0f3d22 0% 50%, #22c55e 50% 75%, #3b82f6 75% 90%, #f59e0b 90% 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ width: '96px', height: '96px', borderRadius: '50%', background: W, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '18px', fontWeight: 900, color: TX }}>100%</span>
                          <span style={{ fontSize: '10px', color: TX2, fontWeight: 700 }}>Hiệu quả</span>
                        </div>
                      </div>

                      {/* Legend List */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', fontWeight: 700, color: TX }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span><span style={{ color: '#0f3d22', marginRight: '6px' }}>●</span>Bóng đá</span>
                          <span style={{ color: TX2 }}>50%</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span><span style={{ color: '#22c55e', marginRight: '6px' }}>●</span>Cầu lông</span>
                          <span style={{ color: TX2 }}>25%</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span><span style={{ color: '#3b82f6', marginRight: '6px' }}>●</span>Tennis</span>
                          <span style={{ color: TX2 }}>15%</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span><span style={{ color: '#f59e0b', marginRight: '6px' }}>●</span>Pickleball</span>
                          <span style={{ color: TX2 }}>10%</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span><span style={{ color: '#e2e8f0', marginRight: '6px' }}>●</span>Khác</span>
                          <span style={{ color: TX2 }}>0%</span>
                        </div>
                      </div>

                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Bottom 3 cards segment */}
              <Row className="g-4">
                
                {/* Column Bottom 1: Hoạt động gần đây */}
                <Col lg={4}>
                  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', height: '100%' }}>
                    <Card.Body className="p-4">
                      
                      <span style={{ fontSize: '15px', fontWeight: 800, color: TX, marginBottom: '24px', display: 'block' }}>Hoạt động gần đây</span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Activity 1 */}
                        <div className="d-flex align-items-start gap-3">
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e6fcf0', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>sports_soccer</span>
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', color: TX, fontWeight: 500 }}>
                              <strong style={{ fontWeight: 800 }}>Nguyễn Văn A</strong> vừa đặt sân tại <span style={{ color: PRIMARY, fontWeight: 700 }}>CLB Lan Anh</span>
                            </div>
                            <div style={{ fontSize: '11px', color: TX2, marginTop: '4px' }}>2 phút trước • Quận 10</div>
                          </div>
                        </div>

                        {/* Activity 2 */}
                        <div className="d-flex align-items-start gap-3">
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', color: TX, fontWeight: 500 }}>
                              <strong style={{ fontWeight: 800 }}>Chủ sân Hoa Lư</strong> vừa cập nhật bảng giá
                            </div>
                            <div style={{ fontSize: '11px', color: TX2, marginTop: '4px' }}>15 phút trước • Quận 1</div>
                          </div>
                        </div>

                        {/* Activity 3 */}
                        <div className="d-flex align-items-start gap-3">
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ffe4e6', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>payments</span>
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', color: TX, fontWeight: 500 }}>
                              Yêu cầu rút tiền mới từ <span style={{ color: PRIMARY, fontWeight: 700 }}>CLB Kỳ Hòa</span>
                            </div>
                            <div style={{ fontSize: '11px', color: TX2, marginTop: '4px' }}>45 phút trước • Quận 10</div>
                          </div>
                        </div>
                      </div>

                    </Card.Body>
                  </Card>
                </Col>

                {/* Column Bottom 2: Khu vực sôi động nhất */}
                <Col lg={4}>
                  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', height: '100%' }}>
                    <Card.Body className="p-4">
                      
                      <span style={{ fontSize: '15px', fontWeight: 800, color: TX, marginBottom: '24px', display: 'block' }}>Khu vực sôi động nhất</span>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                          { num: 1, name: 'Quận 7, HCM', count: '842 bookings' },
                          { num: 2, name: 'Quận 1, HCM', count: '720 bookings' },
                          { num: 3, name: 'Q. Cầu Giấy, HN', count: '695 bookings' },
                          { num: 4, name: 'Q. Bình Thạnh', count: '540 bookings' },
                          { num: 5, name: 'Q. Thủ Đức', count: '482 bookings' }
                        ].map(area => (
                          <div key={area.num} className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: BG, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: TX }}>
                                {area.num}
                              </div>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: TX }}>{area.name}</span>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: '#16803d' }}>{area.count}</span>
                          </div>
                        ))}
                      </div>

                    </Card.Body>
                  </Card>
                </Col>

                {/* Column Bottom 3: Việc cần làm ngay */}
                <Col lg={4}>
                  <Card style={{ background: PRIMARY, border: 'none', borderRadius: '16px', boxShadow: '0 4px 16px rgba(15,61,34,0.18)', height: '100%' }}>
                    <Card.Body className="p-4 d-flex flex-column justify-content-between" style={{ minHeight: '260px' }}>
                      
                      {/* Section Title */}
                      <div className="d-flex align-items-center gap-2 mb-4" style={{ color: W }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                        <span style={{ fontSize: '15px', fontWeight: 800 }}>Việc cần làm ngay</span>
                      </div>

                      {/* To-Do Items */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Task 1 */}
                        <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <span style={{ fontSize: '13px', color: W, fontWeight: 700 }}>Chủ sân chờ duyệt</span>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#22c55e', color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                            12
                          </div>
                        </div>

                        {/* Task 2 */}
                        <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <span style={{ fontSize: '13px', color: W, fontWeight: 700 }}>Khiếu nại chưa xử lý</span>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ef4444', color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                            03
                          </div>
                        </div>

                        {/* Task 3 */}
                        <div className="d-flex align-items-center justify-content-between p-3 rounded" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <span style={{ fontSize: '13px', color: W, fontWeight: 700 }}>Đối soát quá hạn</span>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f59e0b', color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                            02
                          </div>
                        </div>
                      </div>

                      {/* Bottom Button */}
                      <Button 
                        onClick={() => alert('Đang mở màn hình quản lý nhiệm vụ cần làm ngay...')}
                        style={{ 
                          width: '100%', 
                          background: '#4ade80', 
                          border: 'none', 
                          borderRadius: '8px', 
                          padding: '10px 0', 
                          fontSize: '12px', 
                          fontWeight: 800, 
                          color: '#000000', 
                          boxShadow: '0 4px 10px rgba(74,222,128,0.2)',
                          marginTop: '20px'
                        }}
                      >
                        Xem tất cả nhiệm vụ
                      </Button>

                    </Card.Body>
                  </Card>
                </Col>

              </Row>
            </>
          ) : activeMenu === 'finance' ? (
            <>
              {/* Page Title & Quick Actions */}
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: TX, margin: 0 }}>Tài chính & Hoa hồng</h2>
                  <p style={{ fontSize: '13px', color: TX2, margin: '2px 0 0 0' }}>Theo dõi và quản lý dòng tiền toàn hệ thống</p>
                </div>
                
                <div className="d-flex align-items-center gap-3">
                  <button 
                    style={{ 
                      border: `1px solid ${BORDER}`, background: W, color: TX, borderRadius: '8px', 
                      padding: '10px 20px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)', cursor: 'pointer' 
                    }}
                    onClick={() => alert('📤 Đang xuất báo cáo tài chính toàn hệ thống dưới dạng tệp Excel...')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                    Xuất báo cáo
                  </button>
                  
                  <Button 
                    style={{ 
                      background: '#000', border: 'none', borderRadius: '8px', padding: '10px 20px', 
                      fontSize: '12px', fontWeight: 700, color: W, boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                    onClick={handleCreatePayout}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                    Tạo lệnh thanh toán
                  </Button>
                </div>
              </div>

              {/* Row of Four Metric cards */}
              <Row className="g-4 mb-4">
                
                {/* Card 1: System Commission config (Green theme, wider) */}
                <Col lg={3} md={6}>
                  <Card style={{ background: PRIMARY, color: W, border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(15,61,34,0.15)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.7, letterSpacing: '0.05em' }}>Hợp đồng mặc định</span>
                        <div style={{ background: 'rgba(255,255,255,0.15)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>percent</span>
                        </div>
                      </div>
                      <h6 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 12px 0' }}>Cấu hình hoa hồng hệ thống</h6>
                      <div className="d-flex align-items-baseline mb-2">
                        <span style={{ fontSize: '32px', fontWeight: 900 }}>{commissionRate}%</span>
                        <span style={{ fontSize: '13px', opacity: 0.8, marginLeft: '6px' }}>/ lượt đặt</span>
                      </div>
                      <p style={{ fontSize: '11px', opacity: 0.7, lineHeight: 1.4 }}>Áp dụng cho tất cả các câu lạc bộ/sân vận động trong mạng lưới EZSport chưa có thỏa thuận riêng.</p>
                    </div>
                    
                    <button 
                      onClick={handleUpdateCommission}
                      style={{ width: '100%', background: '#15803d', border: 'none', borderRadius: '8px', padding: '10px', color: W, fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', marginTop: '12px' }}
                    >
                      Cập nhật tỷ lệ
                    </button>
                  </Card>
                </Col>

                {/* Card 2: Total System revenue */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng doanh thu hệ thống</span>
                        
                        {/* Unified Mint Growth Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#e6fcf0', color: '#15803d', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '3px 8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 800 }}>trending_up</span>
                          <span>+12%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: TX, margin: '8px 0' }}>1.500.000.000đ</div>
                    </div>
                    <div style={{ fontSize: '11px', color: TX2, marginTop: '12px' }}>So với tháng trước</div>
                  </Card>
                </Col>

                {/* Card 3: Earned commission */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hoa hồng hệ thống</span>
                        
                        {/* Unified Mint Growth Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#e6fcf0', color: '#15803d', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '3px 8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 800 }}>trending_up</span>
                          <span>+15%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: TX, margin: '8px 0' }}>150.000.000đ</div>
                    </div>
                    <div style={{ fontSize: '11px', color: TX2, marginTop: '12px' }}>Lợi nhuận từ phí dịch vụ</div>
                  </Card>
                </Col>

                {/* Card 4: Pending payout to owners */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tiền chờ thanh toán</span>
                        <span style={{ background: '#fee2e2', color: '#ef4444', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_downward</span>
                          -2%
                        </span>
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: TX, margin: '8px 0' }}>45.000.000đ</div>
                    </div>
                    <div style={{ fontSize: '11px', color: TX2, marginTop: '12px' }}>Đang xử lý chuyển khoản</div>
                  </Card>
                </Col>

              </Row>

              {/* Section: Dynamic Transaction Reconciliation table */}
              <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <Card.Body className="p-4">
                  
                  {/* Table Header Filter options */}
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '16px', fontWeight: 800, color: TX }}>Bảng kê thu nhập</span>
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', padding: '6px 12px', color: TX }}>
                          Tháng 11/2026
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item>Tháng 11/2026</Dropdown.Item>
                          <Dropdown.Item>Tháng 10/2026</Dropdown.Item>
                          <Dropdown.Item>Tháng 09/2026</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                      <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" style={{ background: '#f1f5f9', border: `1px solid ${BORDER}`, borderRadius: '8px', fontWeight: 700, fontSize: '12px', padding: '6px 12px', color: TX2, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {statusFilter === 'all' ? 'Tất cả trạng thái' : statusFilter === 'paid' ? 'Đã thanh toán' : statusFilter === 'processing' ? 'Đang xử lý' : 'Chờ đối soát'}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => setStatusFilter('all')}>Tất cả trạng thái</Dropdown.Item>
                          <Dropdown.Item onClick={() => setStatusFilter('paid')}>Đã thanh toán</Dropdown.Item>
                          <Dropdown.Item onClick={() => setStatusFilter('processing')}>Đang xử lý</Dropdown.Item>
                          <Dropdown.Item onClick={() => setStatusFilter('pending')}>Chờ đối soát</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      
                      <button style={{ border: `1px solid ${BORDER}`, background: '#fff', borderRadius: '8px', padding: '6px 10px', color: TX2, cursor: 'pointer' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle' }}>filter_alt</span>
                      </button>
                    </div>
                  </div>

                  {/* Transactions grid list */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${BORDER}` }}>
                          {['MÃ GIAO DỊCH', 'TÊN SÂN', 'CHỦ SÂN', 'GIÁ TRỊ (VND)', 'CHIẾT KHẤU', 'HOA HỒNG (VND)', 'TRẠNG THÁI ĐỐI SOÁT'].map((h, i) => (
                            <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: TX2, letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((tx, idx) => {
                          return (
                            <tr key={tx.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 0 ? '#fff' : '#fafafa', transition: 'all 0.1s' }}>
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: TX }}>{tx.id}</td>
                              <td style={{ padding: '16px' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <img src={tx.img} alt={tx.venue} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                  <span style={{ fontSize: '13px', fontWeight: 700, color: TX }}>{tx.venue}</span>
                                </div>
                              </td>
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: TX }}>{tx.owner}</td>
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: TX }}>{formatVND(tx.value)}</td>
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: TX2 }}>{tx.rate}%</td>
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: PRIMARY }}>{formatVND(tx.commission)}</td>
                              <td style={{ padding: '16px' }}>
                                <span 
                                  style={{ 
                                    display: 'inline-block',
                                    padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700,
                                    background: tx.status === 'paid' || tx.status === 'processing' ? '#e6fcf0' : '#f1f5f9',
                                    color: tx.status === 'paid' || tx.status === 'processing' ? '#15803d' : '#475569'
                                  }}
                                >
                                  {tx.status === 'paid' ? 'ĐÃ THANH TOÁN' : tx.status === 'processing' ? 'ĐANG XỬ LÝ' : 'CHỜ ĐỐI SOÁT'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}

                        {filteredTransactions.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-5 text-muted" style={{ fontSize: '13px' }}>
                              <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '32px' }}>search_off</span>
                              <div>Không tìm thấy giao dịch nào phù hợp</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table pagination footer bar */}
                  <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: '12px', color: TX2, fontWeight: 500 }}>
                      Hiển thị 1-{filteredTransactions.length} trên {transactions.length} giao dịch
                    </span>
                    
                    <div className="d-flex align-items-center gap-1">
                      <button style={{ border: `1px solid ${BORDER}`, background: W, borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TX2 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
                      </button>
                      <button style={{ border: 'none', background: PRIMARY, color: W, borderRadius: '4px', width: '28px', height: '28px', fontSize: '12px', fontWeight: 700 }}>1</button>
                      <button style={{ border: `1px solid ${BORDER}`, background: W, color: TX2, borderRadius: '4px', width: '28px', height: '28px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>2</button>
                      <button style={{ border: `1px solid ${BORDER}`, background: W, color: TX2, borderRadius: '4px', width: '28px', height: '28px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>3</button>
                      <button style={{ border: `1px solid ${BORDER}`, background: W, borderRadius: '4px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TX2 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
                      </button>
                    </div>
                  </div>

                </Card.Body>
              </Card>
            </>
          ) : activeMenu === 'users' ? (
            <>
              {/* ─── USER DIRECTORY VIEW ─── */}
              {/* Page Title & Quick Actions */}
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: TX, margin: 0 }}>Danh bạ Người dùng</h2>
                  <p style={{ fontSize: '13px', color: TX2, margin: '2px 0 0 0' }}>Quản lý và theo dõi thông tin chi tiết của tất cả người chơi trong hệ thống EZSport.</p>
                </div>
                
                <Button 
                  style={{ 
                    background: '#0f3d22', border: 'none', borderRadius: '8px', padding: '10px 20px', 
                    fontSize: '12px', fontWeight: 700, color: W, boxShadow: '0 2px 6px rgba(15,61,34,0.15)',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                  onClick={handleCreatePlayer}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                  Thêm người dùng mới
                </Button>
              </div>

              {/* Three User Metric Cards */}
              <Row className="g-4 mb-4">
                {/* Card 1: Total Users */}
                <Col lg={4} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng người dùng</span>
                        
                        {/* Unified Mint Growth Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#e6fcf0', color: '#15803d', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '3px 8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 800 }}>trending_up</span>
                          <span>+12%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>12.840</div>
                    </div>
                  </Card>
                </Col>

                {/* Card 2: New Members (This Month) */}
                <Col lg={4} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thành viên mới (tháng này)</span>
                        
                        {/* Unified Mint Growth Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#e6fcf0', color: '#15803d', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '3px 8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 800 }}>trending_up</span>
                          <span>+8.5%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>850</div>
                    </div>
                  </Card>
                </Col>

                {/* Card 3: Online Users */}
                <Col lg={4} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Đang trực tuyến</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                        </div>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>1.240</div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Table List of Players */}
              <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <Card.Body className="p-4">
                  
                  {/* Table Header Filter options */}
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-3">
                      <span style={{ fontSize: '16px', fontWeight: 800, color: TX }}>Danh sách người chơi</span>
                      
                      {/* Status Tabs pills */}
                      <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: `1px solid ${BORDER}` }}>
                        <button 
                          onClick={() => setPlayerStatusFilter('all')}
                          style={{
                            border: 'none', 
                            background: playerStatusFilter === 'all' ? W : 'transparent',
                            color: playerStatusFilter === 'all' ? TX : TX2,
                            padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.15s',
                            boxShadow: playerStatusFilter === 'all' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          Tất cả
                        </button>
                        <button 
                          onClick={() => setPlayerStatusFilter('active')}
                          style={{
                            border: 'none', 
                            background: playerStatusFilter === 'active' ? W : 'transparent',
                            color: playerStatusFilter === 'active' ? TX : TX2,
                            padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.15s',
                            boxShadow: playerStatusFilter === 'active' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          Hoạt động
                        </button>
                        <button 
                          onClick={() => setPlayerStatusFilter('blocked')}
                          style={{
                            border: 'none', 
                            background: playerStatusFilter === 'blocked' ? W : 'transparent',
                            color: playerStatusFilter === 'blocked' ? TX : TX2,
                            padding: '6px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                            transition: 'all 0.15s',
                            boxShadow: playerStatusFilter === 'blocked' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
                          }}
                        >
                          Bị chặn
                        </button>
                      </div>
                    </div>
                    
                    <div className="d-flex align-items-center gap-2">
                      <button style={{ border: `1px solid ${BORDER}`, background: '#fff', borderRadius: '8px', padding: '6px 10px', color: TX2, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_alt</span>
                      </button>
                      
                      <button 
                        style={{ border: `1px solid ${BORDER}`, background: '#fff', borderRadius: '8px', padding: '6px 10px', color: TX2, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => alert('📥 Đang tải danh sách người chơi về máy tính...')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                      </button>
                    </div>
                  </div>

                  {/* Players list table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${BORDER}` }}>
                          {['ID NGƯỜI DÙNG', 'ẢNH & HỌ TÊN', 'NGÀY THAM GIA', 'TỔNG LƯỢT ĐẶT', 'TỔNG CHI TIÊU', 'TRẠNG THÁI', 'HÀNH ĐỘNG'].map((h, i) => (
                            <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: TX2, letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPlayers.map((p, idx) => {
                          return (
                            <tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 0 ? '#fff' : '#fafafa', transition: 'all 0.1s' }}>
                              
                              {/* Player ID */}
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: TX }}>{p.id}</td>
                              
                              {/* Avatar & Info */}
                              <td style={{ padding: '16px' }}>
                                <div className="d-flex align-items-center gap-3">
                                  <img src={p.img} alt={p.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                  <div>
                                    <div style={{ fontSize: '13px', fontWeight: 800, color: TX }}>{p.name}</div>
                                    <div style={{ fontSize: '11px', color: TX2 }}>{p.email}</div>
                                  </div>
                                </div>
                              </td>
                              
                              {/* Join Date */}
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: TX }}>{p.date}</td>
                              
                              {/* Total Bookings */}
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: TX }}>{p.bookings}</td>
                              
                              {/* Total Spend */}
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: TX }}>{formatVND(p.spend)}</td>
                              
                              {/* Status Badge - Unified Pill */}
                              <td style={{ padding: '16px' }}>
                                <span 
                                  style={{ 
                                    display: 'inline-block',
                                    padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700,
                                    background: p.status === 'active' ? '#e6fcf0' : '#fee2e2',
                                    color: p.status === 'active' ? '#15803d' : '#ef4444'
                                  }}
                                >
                                  {p.status === 'active' ? 'HOẠT ĐỘNG' : 'BỊ CHẶN'}
                                </span>
                              </td>

                              {/* Action Dropdown component */}
                              <td style={{ padding: '16px' }}>
                                <Dropdown align="end">
                                  <Dropdown.Toggle as="div" style={{ cursor: 'pointer', color: TX2, display: 'inline-block', padding: '4px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px', verticalAlign: 'middle' }}>more_vert</span>
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleTogglePlayerStatus(p.id)}>
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '8px', verticalAlign: 'middle' }}>
                                        {p.status === 'active' ? 'lock' : 'lock_open'}
                                      </span>
                                      {p.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                    </Dropdown.Item>
                                    <Dropdown.Item className="text-danger" onClick={() => handleDeletePlayer(p.id)}>
                                      <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '8px', verticalAlign: 'middle' }}>delete</span>
                                      Xóa người dùng
                                    </Dropdown.Item>
                                  </Dropdown.Menu>
                                </Dropdown>
                              </td>

                            </tr>
                          );
                        })}

                        {filteredPlayers.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-5 text-muted" style={{ fontSize: '13px' }}>
                              <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '32px' }}>search_off</span>
                              <div>Không tìm thấy người chơi nào phù hợp</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table pagination footer bar */}
                  <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                    <span style={{ fontSize: '12px', color: TX2, fontWeight: 500 }}>
                      Hiển thị 1-{filteredPlayers.length} trên tổng số 12.840 người dùng
                    </span>
                    
                    <div className="d-flex align-items-center gap-1">
                      <button style={{ border: `1px solid ${BORDER}`, background: W, borderRadius: '4px', width: '48px', height: '28px', fontSize: '11px', fontWeight: 700, color: TX2 }}>Trước</button>
                      <button style={{ border: 'none', background: PRIMARY, color: W, borderRadius: '4px', width: '28px', height: '28px', fontSize: '12px', fontWeight: 700 }}>1</button>
                      <button style={{ border: `1px solid ${BORDER}`, background: W, color: TX2, borderRadius: '4px', width: '28px', height: '28px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>2</button>
                      <button style={{ border: `1px solid ${BORDER}`, background: W, color: TX2, borderRadius: '4px', width: '28px', height: '28px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>3</button>
                      <span style={{ fontSize: '12px', color: TX2, margin: '0 4px' }}>...</span>
                      <button style={{ border: `1px solid ${BORDER}`, background: W, color: TX2, borderRadius: '4px', width: '48px', height: '28px', fontSize: '12px', fontWeight: 700 }}>1284</button>
                      <button style={{ border: `1px solid ${BORDER}`, background: W, borderRadius: '4px', width: '48px', height: '28px', fontSize: '11px', fontWeight: 700, color: TX2 }}>Sau</button>
                    </div>
                  </div>

                </Card.Body>
              </Card>
            </>
          ) : activeMenu === 'owners' ? (
            <>
              {/* ─── OWNER MANAGEMENT VIEW (SPLIT LAYOUT) ─── */}
              {/* Page Title & Breadcrumb */}
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: TX, margin: 0 }}>Quản lý Chủ sân</h2>
                  <p style={{ fontSize: '13px', color: TX2, margin: '2px 0 0 0' }}>Hệ thống / <span style={{ color: PRIMARY, fontWeight: 700 }}>Chủ sân</span></p>
                </div>
              </div>

              {/* Grid split view: 8cols Owner list, 4cols Pending approvals */}
              <Row className="g-4">
                
                {/* Column Left (8cols) - Danh sách chủ sân */}
                <Col lg={8}>
                  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <Card.Body className="p-4">
                      
                      {/* Owner list Filter Header */}
                      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <span style={{ fontSize: '16px', fontWeight: 800, color: TX }}>Danh sách Chủ sân</span>
                        
                        <div className="d-flex align-items-center gap-2">
                          {/* Status Filter */}
                          <Dropdown>
                            <Dropdown.Toggle variant="light" size="sm" style={{ background: '#f1f5f9', border: `1px solid ${BORDER}`, borderRadius: '8px', fontWeight: 700, fontSize: '12px', padding: '6px 12px', color: TX2, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {ownerStatusFilter === 'all' ? 'Tất cả trạng thái' : ownerStatusFilter === 'verified' ? 'Đã xác minh' : ownerStatusFilter === 'pending' ? 'Chờ duyệt' : 'Tạm khóa'}
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => setOwnerStatusFilter('all')}>Tất cả trạng thái</Dropdown.Item>
                              <Dropdown.Item onClick={() => setOwnerStatusFilter('verified')}>Đã xác minh</Dropdown.Item>
                              <Dropdown.Item onClick={() => setOwnerStatusFilter('pending')}>Chờ duyệt</Dropdown.Item>
                              <Dropdown.Item onClick={() => setOwnerStatusFilter('locked')}>Tạm khóa</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>

                          {/* Add Owner button */}
                          <Button 
                            style={{ 
                              background: '#0f3d22', border: 'none', borderRadius: '8px', padding: '6px 12px', 
                              fontSize: '12px', fontWeight: 700, color: W, display: 'flex', alignItems: 'center', gap: '4px'
                            }}
                            onClick={handleCreateOwner}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
                            Thêm chủ sân
                          </Button>
                        </div>
                      </div>

                      {/* Owner list table */}
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${BORDER}` }}>
                              {['ID CHỦ SÂN', 'HỌ VÀ TÊN', 'LIÊN HỆ', 'SỐ LƯỢNG SÂN', 'TRẠNG THÁI', 'HÀNH ĐỘNG'].map((h, i) => (
                                <th key={i} style={{ padding: '14px 16px', textAlign: h === 'SỐ LƯỢNG SÂN' ? 'center' : 'left', fontSize: '11px', fontWeight: 800, color: TX2, letterSpacing: '0.05em' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOwners.map((o, idx) => {
                              return (
                                <tr key={o.id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 0 ? '#fff' : '#fafafa', transition: 'all 0.1s' }}>
                                  
                                  {/* Owner ID (green link style) */}
                                  <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: '#15803d' }}>{o.id}</td>
                                  
                                  {/* Initials Avatar & Name */}
                                  <td style={{ padding: '16px' }}>
                                    <div className="d-flex align-items-center gap-3">
                                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: o.avatarBg, color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px' }}>
                                        {o.initials}
                                      </div>
                                      <span style={{ fontSize: '13px', fontWeight: 800, color: TX }}>{o.name}</span>
                                    </div>
                                  </td>
                                  
                                  {/* Contact info */}
                                  <td style={{ padding: '16px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 500, color: TX }}>{o.email}</div>
                                    <div style={{ fontSize: '11px', color: TX2, marginTop: '2px' }}>{o.phone}</div>
                                  </td>
                                  
                                  {/* Venues count */}
                                  <td style={{ padding: '16px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: TX }}>
                                    {o.venues.toString().padStart(2, '0')}
                                  </td>
                                  
                                  {/* Status Badge - Unified Pill */}
                                  <td style={{ padding: '16px' }}>
                                    <span 
                                      style={{ 
                                        display: 'inline-block',
                                        padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700,
                                        background: o.status === 'verified' ? '#e6fcf0' : o.status === 'pending' ? '#f1f5f9' : '#fee2e2',
                                        color: o.status === 'verified' ? '#15803d' : o.status === 'pending' ? '#475569' : '#ef4444'
                                      }}
                                    >
                                      {o.status === 'verified' ? 'ĐÃ XÁC MINH' : o.status === 'pending' ? 'CHỜ DUYỆT' : 'TẠM KHÓA'}
                                    </span>
                                  </td>
                                  
                                  {/* Circular Actions Buttons */}
                                  <td style={{ padding: '16px' }}>
                                    <div className="d-flex align-items-center gap-1">
                                      <button 
                                        onClick={() => alert(`👁️ Chi tiết chủ sân ${o.name}:\nID: ${o.id}\nEmail: ${o.email}\nSĐT: ${o.phone}\nSố lượng sân: ${o.venues}`)}
                                        style={{ border: `1px solid ${BORDER}`, background: W, borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TX2, cursor: 'pointer' }}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>visibility</span>
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const newName = prompt('Nhập họ tên mới cho chủ sân:', o.name);
                                          if (newName) setOwners(prev => prev.map(item => item.id === o.id ? { ...item, name: newName } : item));
                                        }}
                                        style={{ border: `1px solid ${BORDER}`, background: W, borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: TX2, cursor: 'pointer' }}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                                      </button>
                                      <button 
                                        onClick={() => handleToggleOwnerStatus(o.id)}
                                        style={{ border: `1px solid ${BORDER}`, background: W, borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: o.status === 'locked' ? '#22c55e' : '#ef4444', cursor: 'pointer' }}
                                      >
                                        <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{o.status === 'locked' ? 'lock_open' : 'lock'}</span>
                                      </button>
                                    </div>
                                  </td>
                                  
                                </tr>
                              );
                            })}
                            
                            {filteredOwners.length === 0 && (
                              <tr>
                                <td colSpan={6} className="text-center py-5 text-muted" style={{ fontSize: '13px' }}>
                                  <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '32px' }}>search_off</span>
                                  <div>Không tìm thấy chủ sân nào phù hợp</div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Owner list Footer Pagination */}
                      <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2 pt-3" style={{ borderTop: `1px solid ${BORDER}` }}>
                        <span style={{ fontSize: '12px', color: TX2, fontWeight: 500 }}>
                          Hiển thị 1-{filteredOwners.length} của {owners.length} chủ sân
                        </span>
                        
                        <div className="d-flex align-items-center gap-1">
                          <button style={{ border: `1px solid ${BORDER}`, background: W, borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TX2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_left</span>
                          </button>
                          <button style={{ border: 'none', background: PRIMARY, color: W, borderRadius: '4px', width: '24px', height: '24px', fontSize: '11px', fontWeight: 700 }}>1</button>
                          <button style={{ border: `1px solid ${BORDER}`, background: W, color: TX2, borderRadius: '4px', width: '24px', height: '24px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>2</button>
                          <button style={{ border: `1px solid ${BORDER}`, background: W, color: TX2, borderRadius: '4px', width: '24px', height: '24px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>3</button>
                          <button style={{ border: `1px solid ${BORDER}`, background: W, borderRadius: '4px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TX2 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
                          </button>
                        </div>
                      </div>
                      
                    </Card.Body>
                  </Card>
                </Col>
                
                {/* Column Right (4cols) - Yêu cầu chờ duyệt */}
                <Col lg={4}>
                  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <Card.Body className="p-4">
                      
                      {/* Section Title */}
                      <div className="d-flex align-items-center justify-content-between mb-4 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="material-symbols-outlined" style={{ color: PRIMARY, fontSize: '20px' }}>description</span>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: TX }}>Yêu cầu chờ duyệt</span>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: TX2, fontSize: '20px', cursor: 'pointer' }}>more_horiz</span>
                      </div>
                      
                      {/* Requests Stack */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {pendingRequests.map(req => {
                          return (
                            <div key={req.id} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '16px', transition: 'all 0.15s' }}>
                              
                              {/* Venue details row */}
                              <div className="d-flex align-items-center gap-3 mb-3">
                                <img src={req.img} alt={req.venue} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: `1px solid ${BORDER}` }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '13px', fontWeight: 800, color: TX, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.venue}</div>
                                  <div style={{ fontSize: '11px', color: TX2, marginTop: '2px' }}>{req.owner}</div>
                                  <div style={{ fontSize: '10px', color: '#16803d', fontWeight: 700, marginTop: '4px' }}>{req.time}</div>
                                </div>
                              </div>
                              
                              {/* Dynamic verification action buttons */}
                              <Row className="g-2">
                                <Col xs={6}>
                                  <Button 
                                    onClick={() => handleApproveRequest(req.id, req.venue, req.owner)}
                                    style={{ width: '100%', background: '#15803d', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, padding: '6px 0', color: W }}
                                  >
                                    ✓ Duyệt
                                  </Button>
                                </Col>
                                <Col xs={6}>
                                  <Button 
                                    onClick={() => handleRejectRequest(req.id, req.venue)}
                                    style={{ width: '100%', background: W, border: '1px solid #ef4444', borderRadius: '6px', fontSize: '11px', fontWeight: 700, padding: '5px 0', color: '#ef4444' }}
                                  >
                                    ✕ Từ chối
                                  </Button>
                                </Col>
                              </Row>
                              
                            </div>
                          );
                        })}
                        
                        {pendingRequests.length === 0 && (
                          <div className="text-center py-5 text-muted" style={{ fontSize: '12px' }}>
                            <span className="material-symbols-outlined text-success mb-2" style={{ fontSize: '32px' }}>check_circle</span>
                            <div>Đã duyệt hết yêu cầu chờ duyệt!</div>
                          </div>
                        )}
                      </div>
                      
                      {/* View all button at bottom */}
                      <div className="text-center mt-4 pt-2">
                        <span 
                          onClick={() => alert('Đang chuyển hướng đến danh sách toàn bộ 15 yêu cầu đăng ký sân...')}
                          style={{ fontSize: '12px', color: PRIMARY, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                          Xem tất cả yêu cầu →
                        </span>
                      </div>
                      
                    </Card.Body>
                  </Card>
                </Col>
                
              </Row>
            </>
          ) : activeMenu === 'marketing' ? (
            <>
              {/* ─── MARKETING & PROMOTION VIEW ─── */}
              {/* Page Title & Breadcrumb */}
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: TX, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Quản lý Marketing & Khuyến mãi</h2>
                  <p style={{ fontSize: '13px', color: TX2, margin: '2px 0 0 0' }}>Theo dõi hiệu quả các chiến dịch và quản lý mã giảm giá hệ thống</p>
                </div>
                
                <Button 
                  style={{ 
                    background: '#0f3d22', border: 'none', borderRadius: '8px', padding: '10px 20px', 
                    fontSize: '12px', fontWeight: 700, color: W, boxShadow: '0 2px 6px rgba(15,61,34,0.15)',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                  onClick={() => setShowCreateVoucherModal(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Tạo mã mới
                </Button>
              </div>

              {/* Row of Four Metric cards */}
              <Row className="g-4 mb-4">
                {/* Card 1: Total Vouchers */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng Voucher đã phát hành</span>
                        
                        {/* Unified Mint Growth Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#e6fcf0', color: '#15803d', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '3px 8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 800 }}>trending_up</span>
                          <span>+12%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>1,250</div>
                    </div>
                  </Card>
                </Col>

                {/* Card 2: Usage Rate */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tỷ lệ sử dụng</span>
                        
                        {/* Unified Mint Growth Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#e6fcf0', color: '#15803d', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '3px 8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 800 }}>trending_up</span>
                          <span>+5%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>65%</div>
                    </div>
                  </Card>
                </Col>

                {/* Card 3: Total Money Discounted */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tổng tiền đã giảm giá</span>
                        <span style={{ background: '#fee2e2', color: '#ef4444', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '2px', padding: '4px 8px', fontSize: '12px', fontWeight: 700 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>arrow_downward</span>
                          -2%
                        </span>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>25.500k</div>
                    </div>
                  </Card>
                </Col>

                {/* Card 4: New Users */}
                <Col lg={3} md={6}>
                  <Card style={{ background: W, border: `1px solid ${BORDER}`, borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span style={{ fontSize: '10px', fontWeight: 800, color: TX2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lượt người dùng mới</span>
                        
                        {/* Unified Mint Growth Badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#e6fcf0', color: '#15803d', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, padding: '3px 8px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '12px', fontWeight: 800 }}>trending_up</span>
                          <span>+24%</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 900, color: TX, margin: '8px 0', fontFamily: "'Outfit', sans-serif" }}>482</div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Voucher list table section */}
              <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <Card.Body className="p-4">
                  
                  {/* Table Header Filter options */}
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <span style={{ fontSize: '16px', fontWeight: 800, color: TX }}>Danh sách Voucher</span>
                    
                    <div className="d-flex align-items-center gap-2">
                      <button style={{ border: `1px solid ${BORDER}`, background: '#fff', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: TX2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>filter_alt</span>
                        Bộ lọc
                      </button>
                      
                      <button 
                        style={{ border: `1px solid ${BORDER}`, background: '#fff', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 700, color: TX2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                        onClick={() => alert('📤 Đang xuất báo cáo các mã voucher khuyến mãi hệ thống...')}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                        Xuất báo cáo
                      </button>
                    </div>
                  </div>

                  {/* Vouchers list table */}
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${BORDER}` }}>
                          {['MÃ VOUCHER', 'LOẠI KHUYẾN MÃI', 'MỨC GIẢM', 'ÁP DỤNG CHO', 'SỐ LƯỢNG', 'THỜI HẠN', 'TRẠNG THÁI', 'HÀNH ĐỘNG'].map((h, i) => (
                            <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: TX2, letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVouchers.map((v, idx) => {
                          const expired = !v.active || (!!v.expiresAt && new Date(v.expiresAt).getTime() < Date.now()) || v.usedCount >= v.quantity;
                          const typeLabel = v.type === 'percent' ? 'Phần trăm hóa đơn' : 'Giảm giá trực tiếp';
                          const expiryLabel = v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('vi-VN') : 'Không thời hạn';
                          return (
                            <tr key={v.code} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 0 ? '#fff' : '#fafafa', transition: 'all 0.1s' }}>
                              
                              {/* Voucher Code (green bold link style) */}
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: '#15803d' }}>{v.code}</td>
                              
                              {/* Promotion Type */}
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: TX }}>{typeLabel}</td>
                              
                              {/* Discount Amount */}
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: TX }}>
                                {v.type === 'percent' ? `${v.value}%` : formatVND(v.value)}
                              </td>
                              
                              {/* Applicable for */}
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: TX }}>{v.target}</td>
                              
                              {/* Qty Progress Bar */}
                              <td style={{ padding: '16px' }}>
                                <div style={{ width: '100px' }}>
                                  <div style={{ fontSize: '10px', color: TX2, fontWeight: 700, marginBottom: '4px' }}>{v.usedCount}/{v.quantity}</div>
                                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(v.usedCount / v.quantity) * 100}%`, height: '100%', background: expired ? '#94a3b8' : '#22c55e', borderRadius: '3px' }} />
                                  </div>
                                </div>
                              </td>

                              {/* Expiry Date */}
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: TX }}>{expiryLabel}</td>
                              
                              {/* Status Badge - Unified Pill */}
                              <td style={{ padding: '16px' }}>
                                <span 
                                  style={{ 
                                    display: 'inline-block',
                                    padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700,
                                    background: expired ? '#fee2e2' : '#e6fcf0',
                                    color: expired ? '#ef4444' : '#15803d'
                                  }}
                                >
                                  {expired ? 'HET HAN' : 'DANG CHAY'}
                                </span>
                              </td>

                              {/* Action icons */}
                              <td style={{ padding: '16px' }}>
                                <div className="d-flex align-items-center gap-2">
                                  <button 
                                    onClick={() => handleOpenEditModal(v)}
                                    style={{ border: 'none', background: 'transparent', padding: 0, color: TX2, cursor: 'pointer' }}
                                    title="Chỉnh sửa voucher"
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteVoucher(v._id, v.code)}
                                    style={{ border: 'none', background: 'transparent', padding: 0, color: TX2, cursor: 'pointer' }}
                                  >
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}

                        {filteredVouchers.length === 0 && (
                          <tr>
                            <td colSpan={8} className="text-center py-5 text-muted" style={{ fontSize: '13px' }}>
                              <span className="material-symbols-outlined text-muted mb-2" style={{ fontSize: '32px' }}>search_off</span>
                              <div>Không tìm thấy voucher nào phù hợp</div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                </Card.Body>
              </Card>

              {/* Bottom split view: Send Push & Home Banner */}
              <Row className="g-4">
                
                {/* Left panel: Gửi Thông Báo Đẩy */}
                <Col lg={6}>
                  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', height: '100%' }}>
                    <Card.Body className="p-4 d-flex flex-column">
                      
                      {/* Panel Title */}
                      <div className="d-flex align-items-center gap-2 mb-4 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <span className="material-symbols-outlined text-success" style={{ fontSize: '20px' }}>notifications_active</span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: TX }}>Gửi Thông Báo Đẩy</span>
                      </div>
                      
                      {/* Push Notification Form */}
                      <form onSubmit={handleSendPush} className="d-flex flex-column flex-grow-1 justify-content-between gap-3">
                        <div>
                          <div className="mb-3">
                            <label style={{ fontSize: '12px', fontWeight: 700, color: TX, marginBottom: '6px', display: 'block' }}>Tiêu đề thông báo</label>
                            <input 
                              type="text" 
                              placeholder="VD: Khuyến mãi cuối tuần cực sốc!" 
                              value={pushTitle}
                              onChange={e => setPushTitle(e.target.value)}
                              style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', outline: 'none' }}
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label style={{ fontSize: '12px', fontWeight: 700, color: TX, marginBottom: '6px', display: 'block' }}>Nội dung thông báo</label>
                            <textarea 
                              placeholder="Nhập nội dung thông điệp bạn muốn gửi..." 
                              value={pushBody}
                              onChange={e => setPushBody(e.target.value)}
                              rows={4}
                              style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', outline: 'none', resize: 'none' }}
                            />
                          </div>
                          
                          <div className="mb-3">
                            <label style={{ fontSize: '12px', fontWeight: 700, color: TX, marginBottom: '6px', display: 'block' }}>Đối tượng nhận tin</label>
                            <Dropdown>
                              <Dropdown.Toggle variant="light" style={{ width: '100%', background: W, border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '10px 14px', fontSize: '13px', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: TX }}>
                                {pushTarget}
                              </Dropdown.Toggle>
                              <Dropdown.Menu style={{ width: '100%' }}>
                                <Dropdown.Item onClick={() => setPushTarget('Tất cả người dùng')}>Tất cả người dùng</Dropdown.Item>
                                <Dropdown.Item onClick={() => setPushTarget('Chủ sân')}>Chủ sân</Dropdown.Item>
                                <Dropdown.Item onClick={() => setPushTarget('Người chơi')}>Người chơi</Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </div>
                        
                        <Button 
                          type="submit"
                          style={{ width: '100%', background: '#000000', border: 'none', borderRadius: '8px', padding: '12px 0', fontSize: '13px', fontWeight: 700, color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>play_arrow</span>
                          Gửi Ngay Bây Giờ
                        </Button>
                      </form>

                    </Card.Body>
                  </Card>
                </Col>

                {/* Right panel: Banner Trang Chủ */}
                <Col lg={6}>
                  <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', height: '100%' }}>
                    <Card.Body className="p-4 d-flex flex-column justify-content-between">
                      
                      {/* Panel Title */}
                      <div className="d-flex align-items-center justify-content-between mb-4 pb-2" style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <div className="d-flex align-items-center gap-2">
                          <span className="material-symbols-outlined text-success" style={{ fontSize: '20px' }}>image</span>
                          <span style={{ fontSize: '16px', fontWeight: 800, color: TX }}>Banner Trang Chủ</span>
                        </div>
                        <span style={{ fontSize: '11px', color: TX2, fontWeight: 600 }}>Kích thước chuẩn: 1200x450px</span>
                      </div>
                      
                      {/* Banners active stack */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {banners.map(b => {
                          return (
                            <div key={b.id} style={{ background: BG, border: `1px solid ${BORDER}`, borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <img src={b.img} alt={b.title} style={{ width: '80px', height: '45px', borderRadius: '6px', objectFit: 'cover', border: `1px solid ${BORDER}` }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: TX, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.title}</div>
                                <div style={{ fontSize: '10px', color: TX2, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Liên kết: {b.link}</div>
                                <div style={{ fontSize: '10px', color: '#15803d', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>visibility</span>
                                  <span>{b.views}</span>
                                  <span style={{ margin: '0 4px', color: TX2 }}>➔</span>
                                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>ads_click</span>
                                  <span>{b.clicks}</span>
                                </div>
                              </div>
                              
                              <div className="d-flex align-items-center gap-1">
                                <button 
                                  onClick={() => {
                                    const newTitle = prompt('Nhập tiêu đề mới cho banner:', b.title);
                                    if (newTitle) setBanners(prev => prev.map(item => item.id === b.id ? { ...item, title: newTitle } : item));
                                  }}
                                  style={{ border: 'none', background: 'transparent', padding: 4, color: TX2, cursor: 'pointer' }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit</span>
                                </button>
                                <button 
                                  onClick={() => handleDeleteBanner(b.id, b.title)}
                                  style={{ border: 'none', background: 'transparent', padding: 4, color: TX2, cursor: 'pointer' }}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Dashed upload container */}
                      <div 
                        onClick={handleUploadBanner}
                        style={{ 
                          border: `2px dashed ${BORDER}`, borderRadius: '12px', padding: '24px 16px', textAlign: 'center',
                          marginTop: '20px', cursor: 'pointer', transition: 'all 0.15s', background: BG
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = PRIMARY}
                        onMouseLeave={e => e.currentTarget.style.borderColor = BORDER}
                      >
                        <span className="material-symbols-outlined text-success mb-2" style={{ fontSize: '32px' }}>cloud_upload</span>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: TX }}>Kéo thả hoặc nhấn để tải lên banner mới</div>
                        <div style={{ fontSize: '10px', color: TX2, marginTop: '4px' }}>Hỗ trợ JPG, PNG (Tối đa 5MB)</div>
                      </div>

                    </Card.Body>
                  </Card>
                </Col>

              </Row>
            </>
          ) : activeMenu === 'venues' ? (
            <>
              {/* ─── VENUES & COMBO CONFIGURATION VIEW ─── */}
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, color: TX, margin: 0 }}>Cấu hình Combo & Sân</h2>
                  <p style={{ fontSize: '13px', color: TX2, margin: '2px 0 0 0' }}>Thiết lập tỷ lệ chiết khấu combo tuần và tháng trực tiếp cho từng sân thể thao</p>
                </div>
              </div>

              <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <Card.Body className="p-4">
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: `1px solid ${BORDER}` }}>
                          {['TÊN SÂN', 'ĐỊA CHỈ', 'COMBO TUẦN (%)', 'COMBO THÁNG (%)', 'GIÁ HIỂN THỊ', 'TRẠNG THÁI', 'HÀNH ĐỘNG'].map((h, i) => (
                            <th key={i} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: TX2, letterSpacing: '0.05em' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {venues.map((v, idx) => {
                          const weeklyDisc = v.comboWeeklyDiscount !== undefined ? v.comboWeeklyDiscount : 5;
                          const monthlyDisc = v.comboMonthlyDiscount !== undefined ? v.comboMonthlyDiscount : 15;
                          return (
                            <tr key={v._id} style={{ borderBottom: `1px solid ${BORDER}`, background: idx % 2 === 0 ? '#fff' : '#fafafa', transition: 'all 0.1s' }}>
                              <td style={{ padding: '16px' }}>
                                <div className="d-flex align-items-center gap-3">
                                  {v.image && <img src={v.image} alt={v.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: `1px solid ${BORDER}` }} />}
                                  <div>
                                    <span style={{ fontSize: '13px', fontWeight: 800, color: TX }}>{v.name}</span>
                                    <div style={{ fontSize: '11px', color: TX2 }}>{v.sportTypes?.join(', ')}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px', fontSize: '12px', color: TX2, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {v.location}
                              </td>
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: PRIMARY }}>
                                {weeklyDisc}%
                              </td>
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 800, color: '#ef4444' }}>
                                {monthlyDisc}%
                              </td>
                              <td style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: TX }}>
                                {v.price}
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '6px 12px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700,
                                  background: v.isActive ? '#e6fcf0' : '#fee2e2',
                                  color: v.isActive ? '#15803d' : '#ef4444'
                                }}>
                                  {v.isActive ? 'HOẠT ĐỘNG' : 'TẠM ĐÓNG'}
                                </span>
                              </td>
                              <td style={{ padding: '16px' }}>
                                <Button
                                  variant="light"
                                  size="sm"
                                  style={{
                                    border: `1px solid ${BORDER}`,
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '11px',
                                    padding: '6px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: TX
                                  }}
                                  onClick={() => handleOpenConfig(v)}
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>settings</span>
                                  Cấu hình
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </>
          ) : (
            <>
              {/* Fallback for unfinished admin tabs */}
              <div className="text-center py-5" style={{ background: W, borderRadius: '16px', border: `1px solid ${BORDER}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <span className="material-symbols-outlined text-muted" style={{ fontSize: '48px' }}>construction</span>
                <h4 style={{ color: TX, fontWeight: 800, marginTop: '16px' }}>Đang phát triển</h4>
                <p style={{ color: TX2, fontSize: '13px', marginTop: '4px' }}>Tính năng này đang được thiết lập và sẽ sẵn sàng trong phiên bản tiếp theo!</p>
              </div>
            </>
          )}

          {/* System Footer info */}
          <div className="d-flex justify-content-between align-items-center mt-5 pt-3 flex-wrap gap-2" style={{ borderTop: `1px solid ${BORDER}`, fontSize: '12px', color: TX2, fontWeight: 500 }}>
            <span>© 2026 EZSport Admin. Bản quyền thuộc về EZSport Team.</span>
            <div className="d-flex gap-3">
              {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Liên hệ', 'Hỗ trợ kỹ thuật'].map((link) => (
                <span key={link} style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.color = PRIMARY} onMouseLeave={e => e.currentTarget.style.color = TX2}>
                  {link}
                </span>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Create Voucher Modal */}
      <CreateVoucherModal
        show={showCreateVoucherModal}
        onHide={() => setShowCreateVoucherModal(false)}
        onSubmit={handleCreateVoucher}
      />

      {/* Edit Voucher Modal */}
      <EditVoucherModal
        show={showEditVoucherModal}
        onHide={() => {
          setShowEditVoucherModal(false);
          setSelectedVoucher(null);
        }}
        onSubmit={handleEditVoucher}
        voucher={selectedVoucher}
      />

      {/* Cấu hình Combo Modal */}
      <Modal
        show={showConfigModal}
        onHide={() => {
          if (!isSavingConfig) {
            setShowConfigModal(false);
            setSelectedVenueForConfig(null);
          }
        }}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton={!isSavingConfig} style={{ borderBottom: `1px solid ${BORDER}`, background: '#f8fafc' }}>
          <Modal.Title style={{ fontSize: '18px', fontWeight: 800, color: TX }}>
            Cấu hình Chiết khấu Combo
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedVenueForConfig && (
            <div className="mb-4 d-flex align-items-center gap-3 p-3" style={{ background: '#f1f5f9', borderRadius: '12px' }}>
              {selectedVenueForConfig.image && (
                <img
                  src={selectedVenueForConfig.image}
                  alt={selectedVenueForConfig.name}
                  style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: `1px solid ${BORDER}` }}
                />
              )}
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: TX }}>{selectedVenueForConfig.name}</div>
                <div style={{ fontSize: '12px', color: TX2 }}>{selectedVenueForConfig.location}</div>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label style={{ fontSize: '12px', fontWeight: 700, color: TX, marginBottom: '6px', display: 'block' }}>
              Tỷ lệ chiết khấu Combo Tuần (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={configWeeklyDiscount}
              onChange={e => setConfigWeeklyDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
              style={{
                width: '100%',
                border: `1px solid ${BORDER}`,
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: 700,
                outline: 'none',
                color: PRIMARY
              }}
              placeholder="Mặc định: 5"
            />
            <small style={{ color: TX2, fontSize: '11px', marginTop: '4px', display: 'block' }}>
              Áp dụng giảm giá khi đặt lịch cố định lặp lại theo tuần.
            </small>
          </div>

          <div className="mb-3">
            <label style={{ fontSize: '12px', fontWeight: 700, color: TX, marginBottom: '6px', display: 'block' }}>
              Tỷ lệ chiết khấu Combo Tháng (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={configMonthlyDiscount}
              onChange={e => setConfigMonthlyDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
              style={{
                width: '100%',
                border: `1px solid ${BORDER}`,
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '14px',
                fontWeight: 700,
                outline: 'none',
                color: '#ef4444'
              }}
              placeholder="Mặc định: 15"
            />
            <small style={{ color: TX2, fontSize: '11px', marginTop: '4px', display: 'block' }}>
              Áp dụng giảm giá khi đặt lịch cố định lặp lại theo tháng.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: `1px solid ${BORDER}`, background: '#f8fafc' }}>
          <Button
            variant="light"
            disabled={isSavingConfig}
            onClick={() => {
              setShowConfigModal(false);
              setSelectedVenueForConfig(null);
            }}
            style={{ borderRadius: '8px', fontWeight: 700, fontSize: '13px' }}
          >
            Hủy bỏ
          </Button>
          <Button
            disabled={isSavingConfig}
            onClick={handleSaveConfig}
            style={{
              background: '#0f3d22',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              padding: '8px 20px',
              color: W
            }}
          >
            {isSavingConfig ? 'Đang lưu...' : 'Lưu cấu hình'}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};





