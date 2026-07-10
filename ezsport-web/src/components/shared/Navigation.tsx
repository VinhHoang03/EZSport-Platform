import React from 'react';
import { Container, Nav, Navbar, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

interface NavigationProps {
  onAddCourtClick?: () => void;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates' | 'shops' | string) => void;
  currentPage?: 'landing' | 'app' | 'auth' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates' | 'shops' | string;
  onRegisterOwnerClick?: () => void;
}
 
const CustomToggle = React.forwardRef<HTMLDivElement, any>(({ children, onClick }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    style={{ cursor: 'pointer' }}
  >
    {children}
  </div>
));

const Navigation: React.FC<NavigationProps> = ({ 
  onAddCourtClick, onLogoClick, onLoginClick, onPageChange, currentPage, onRegisterOwnerClick 
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
 
  return (
    <>
      <Navbar 
        bg="white" 
        className="main-navigation px-4 py-3 shadow-sm sticky-top border-bottom"
        style={{ 
          zIndex: 1050, 
          fontFamily: "'Inter', sans-serif",
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.92)'
        }}
      >
        <Container fluid className="px-md-4">
          <Navbar.Brand 
            onClick={(e) => { e.preventDefault(); onLogoClick?.(); }} 
            href="#" 
            className="d-flex align-items-center cursor-pointer" 
            style={{ cursor: 'pointer' }}
          >
            <div className="navigation-logo" style={{ width: 210, height: 60, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'visible' }}>
              <img 
                className="navigation-logo-image"
                src="/logo3.png" 
                alt="EZSport Logo" 
                style={{ 
                  height: 60, 
                  width: 'auto', 
                  objectFit: 'contain', 
                  transform: 'scale(3.5)', 
                  transformOrigin: 'left center', 
                  position: 'absolute',
                  left: 0
                }} 
              />
            </div>
          </Navbar.Brand>
          
          <Nav className="me-auto d-none d-md-flex gap-4 ms-5 align-items-center" style={{ fontSize: '17px', fontWeight: 700 }}>
            {user?.role === 'owner' ? (
              <>
                {/* <Nav.Link 
                  onClick={() => onPageChange?.('owner-dashboard')} 
                  className={currentPage === 'owner-dashboard' ? "text-success pb-1" : "text-secondary hover-text-dark"}
                  style={{ cursor: 'pointer', color: currentPage === 'owner-dashboard' ? '#1a6b3c !important' : '', borderBottom: currentPage === 'owner-dashboard' ? '2.5px solid #1a6b3c' : '' }}
                >
                  Trang quản trị Chủ Sân
                </Nav.Link>
                <Nav.Link onClick={onAddCourtClick} className="text-success fw-bold cursor-pointer d-flex align-items-center gap-1 hover-scale" style={{ color: '#1a6b3c !important' }}>
                  <span className="material-symbols-outlined fs-5">add_circle</span>
                  Thêm sân
                </Nav.Link> */}
              </>
            ) : user?.role === 'admin' ? (
              <>
                <Nav.Link 
                  onClick={() => onPageChange?.('admin-dashboard')} 
                  className={currentPage === 'admin-dashboard' ? "text-success pb-1" : "text-secondary hover-text-dark"}
                  style={{ cursor: 'pointer', color: currentPage === 'admin-dashboard' ? '#1a6b3c !important' : '', borderBottom: currentPage === 'admin-dashboard' ? '2.5px solid #1a6b3c' : '' }}
                >
                  Trang quản trị Admin
                </Nav.Link>
                <Nav.Link onClick={onAddCourtClick} className="text-success fw-bold cursor-pointer d-flex align-items-center gap-1 hover-scale" style={{ color: '#1a6b3c !important' }}>
                  <span className="material-symbols-outlined fs-5">add_circle</span>
                  Thêm sân
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link 
                  onClick={() => {
                    navigate('/venues');
                    onPageChange?.('venues');
                  }} 
                  className={currentPage === 'venues' ? "text-success pb-1" : "text-secondary hover-text-dark"}
                  style={{ 
                    color: currentPage === 'venues' ? '#1a6b3c !important' : '', 
                    borderBottom: currentPage === 'venues' ? '2.5px solid #1a6b3c' : '',
                    cursor: 'pointer'
                  }}
                >
                  Tìm sân
                </Nav.Link>
                <Nav.Link 
                  onClick={() => onPageChange?.('app')} 
                  className={currentPage === 'app' ? "text-success pb-1" : "text-secondary hover-text-dark"}
                  style={{ 
                    color: currentPage === 'app' ? '#1a6b3c !important' : '', 
                    borderBottom: currentPage === 'app' ? '2.5px solid #1a6b3c' : '',
                    cursor: 'pointer'
                  }}
                >
                  Bản đồ đặt sân
                </Nav.Link>
                <Nav.Link 
                  onClick={() => onPageChange?.('playmates')} 
                  className={currentPage === 'playmates' ? "text-success pb-1" : "text-secondary hover-text-dark"}
                  style={{ 
                    color: currentPage === 'playmates' ? '#1a6b3c !important' : '', 
                    borderBottom: currentPage === 'playmates' ? '2.5px solid #1a6b3c' : '',
                    cursor: 'pointer'
                  }}
                >
                  Tìm người chơi cùng
                </Nav.Link>
                <Nav.Link 
                  onClick={() => {
                    navigate('/shops');
                    onPageChange?.('shops');
                  }} 
                  className={currentPage === 'shops' ? "text-success pb-1" : "text-secondary hover-text-dark"}
                  style={{ 
                    color: currentPage === 'shops' ? '#1a6b3c !important' : '', 
                    borderBottom: currentPage === 'shops' ? '2.5px solid #1a6b3c' : '',
                    cursor: 'pointer'
                  }}
                >
                  Cửa hàng
                </Nav.Link>
                {!isAuthenticated && (
                  <Nav.Link 
                    onClick={onRegisterOwnerClick || (() => {})} 
                    className="text-secondary hover-text-dark"
                    style={{ cursor: 'pointer' }}
                  >
                    Dành cho Chủ Sân
                  </Nav.Link>
                )}
              </>
            )}
          </Nav>
  
          <div className="d-flex align-items-center gap-2">

            {/* Grouped icon pill — only show when logged in */}
            {isAuthenticated && (
              <div className="navigation-actions" style={{ display: 'flex', alignItems: 'center', gap: '2px', background: '#f1f5f9', borderRadius: '999px', padding: '4px 6px' }}>
                {[
                  { icon: 'notifications', title: 'Thông báo' },
                  { icon: 'favorite', title: 'Yêu thích' },
                ].map(btn => (
                  <button
                    key={btn.icon}
                    title={btn.title}
                    style={{ border: 'none', background: 'transparent', borderRadius: '999px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#475569' }}>{btn.icon}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            {isAuthenticated && <div style={{ width: '1px', height: '28px', background: '#e2e8f0', margin: '0 2px' }} />}

            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle as={CustomToggle}>
                  {/* Pill trigger */}
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px 4px 4px', borderRadius: '999px', border: '1.5px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#16a34a')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    {/* Avatar + online dot */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        alt={user?.fullName || 'User'}
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=16a34a&color=fff&size=80&bold=true`}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                      />
                      <span style={{ position: 'absolute', bottom: 0, right: 0, width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', border: '1.5px solid #fff' }} />
                    </div>
                    {/* Short name */}
                    <span className="navigation-user-name" style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.fullName?.split(' ').slice(-1)[0] || 'Tài khoản'}
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#94a3b8' }}>expand_more</span>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg border-0 mt-2 p-0" style={{ minWidth: '230px', borderRadius: '16px', overflow: 'hidden' }}>
                  {/* Gradient header */}
                  <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        alt={user?.fullName || 'User'}
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=16a34a&color=fff&size=80&bold=true`}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #86efac' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', lineHeight: 1.3 }}>{user?.fullName}</div>
                        <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                          {user?.email || user?.phone || 'EZSport member'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: '8px' }}>
                    {[
                      { icon: 'person', label: 'Hồ sơ cá nhân', action: () => navigate(ROUTES.PROFILE) },
                      { icon: 'event_note', label: 'Lịch sử đặt sân', action: () => navigate(ROUTES.MY_BOOKINGS) },
                      { icon: 'chat', label: 'Tin nhắn', action: () => navigate(ROUTES.MESSAGES) },
                    ].map(item => (
                      <Dropdown.Item
                        key={item.label}
                        onClick={item.action}
                        className="rounded-3"
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', fontSize: '13px', fontWeight: 500, color: '#0f172a' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#16a34a' }}>{item.icon}</span>
                        {item.label}
                      </Dropdown.Item>
                    ))}

                    <div style={{ height: '1px', background: '#f1f5f9', margin: '6px 4px' }} />

                    <Dropdown.Item
                      onClick={() => { logout(); onPageChange?.('landing'); }}
                      className="rounded-3"
                      style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', fontSize: '13px', fontWeight: 600, color: '#ef4444' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
                      Đăng xuất
                    </Dropdown.Item>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button
                variant="success"
                className="rounded-pill fw-bold border-0"
                style={{ background: '#1a6b3c', color: 'white', fontSize: '14px', padding: '8px 22px', boxShadow: '0 2px 8px rgba(26,107,60,0.25)' }}
                onClick={onLoginClick}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </Container>
      </Navbar>
    </>
  );
};

export default Navigation;

