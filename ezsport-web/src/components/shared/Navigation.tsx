import React, { useState } from 'react';
import { Container, Nav, Navbar, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

interface NavigationProps {
  onAddCourtClick?: () => void;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  currentPage?: 'landing' | 'app' | 'auth' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates' | string;
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
  onLogoClick, onLoginClick, onPageChange, currentPage, onRegisterOwnerClick 
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPlayer = !user?.role || user?.role === 'player';

  const playerNavLinks = [
    { page: 'venues' as const, label: 'Tìm sân' },
    { page: 'app' as const, label: 'Bản đồ đặt sân' },
    { page: 'playmates' as const, label: 'Tìm người chơi cùng' },
  ];

  const handleMobileNav = (page: any) => {
    onPageChange?.(page);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>{`
        .mobile-drawer-overlay {
          display: none;
        }
        .mobile-drawer {
          display: none;
        }
        @media (max-width: 767.98px) {
          .mobile-menu-btn {
            display: flex !important;
          }
          .mobile-drawer-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 1099;
            backdrop-filter: blur(2px);
          }
          .mobile-drawer {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0;
            right: 0;
            width: min(300px, 85vw);
            height: 100%;
            background: #fff;
            z-index: 1100;
            box-shadow: -8px 0 32px rgba(0,0,0,0.15);
            padding: 0;
            overflow-y: auto;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          }
          .mobile-drawer.open {
            transform: translateX(0);
          }
        }
        @media (min-width: 768px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>

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
          
          {/* Desktop nav links */}
          <Nav className="me-auto d-none d-md-flex gap-4 ms-5 align-items-center" style={{ fontSize: '17px', fontWeight: 700 }}>
            {user?.role === 'owner' ? (
              <></>
            ) : user?.role === 'admin' ? (
              <>
                <Nav.Link 
                  onClick={() => onPageChange?.('admin-dashboard')} 
                  className={currentPage === 'admin-dashboard' ? "text-success pb-1" : "text-secondary hover-text-dark"}
                  style={{ cursor: 'pointer', color: currentPage === 'admin-dashboard' ? '#1a6b3c !important' : '', borderBottom: currentPage === 'admin-dashboard' ? '2.5px solid #1a6b3c' : '' }}
                >
                  Trang quản trị Admin
                </Nav.Link>
              </>
            ) : (
              <>
                {playerNavLinks.map(link => (
                  <Nav.Link 
                    key={link.page}
                    onClick={() => onPageChange?.(link.page)} 
                    className={currentPage === link.page ? "text-success pb-1" : "text-secondary hover-text-dark"}
                    style={{ 
                      color: currentPage === link.page ? '#1a6b3c !important' : '', 
                      borderBottom: currentPage === link.page ? '2.5px solid #1a6b3c' : '',
                      cursor: 'pointer'
                    }}
                  >
                    {link.label}
                  </Nav.Link>
                ))}
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
            {/* Grouped icon pill — only show when logged in (desktop) */}
            {isAuthenticated && (
              <div className="navigation-actions d-none d-md-flex" style={{ alignItems: 'center', gap: '2px', background: '#f1f5f9', borderRadius: '999px', padding: '4px 6px' }}>
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

            {/* Divider (desktop) */}
            {isAuthenticated && <div className="d-none d-md-block" style={{ width: '1px', height: '28px', background: '#e2e8f0', margin: '0 2px' }} />}

            {/* Desktop user dropdown */}
            {isAuthenticated ? (
              <Dropdown align="end" className="d-none d-md-block">
                <Dropdown.Toggle as={CustomToggle}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px 4px 4px', borderRadius: '999px', border: '1.5px solid #e2e8f0', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'border-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#16a34a')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        alt={user?.fullName || 'User'}
                        src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=16a34a&color=fff&size=80&bold=true`}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                      />
                      <span style={{ position: 'absolute', bottom: 0, right: 0, width: '9px', height: '9px', borderRadius: '50%', background: '#22c55e', border: '1.5px solid #fff' }} />
                    </div>
                    <span className="navigation-user-name" style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.fullName?.split(' ').slice(-1)[0] || 'Tài khoản'}
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#94a3b8' }}>expand_more</span>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg border-0 mt-2 p-0" style={{ minWidth: '230px', borderRadius: '16px', overflow: 'hidden' }}>
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
                className="rounded-pill fw-bold border-0 d-none d-md-block"
                style={{ background: '#1a6b3c', color: 'white', fontSize: '14px', padding: '8px 22px', boxShadow: '0 2px 8px rgba(26,107,60,0.25)' }}
                onClick={onLoginClick}
              >
                Đăng nhập
              </Button>
            )}

            {/* ─── Mobile: Avatar + Hamburger ─── */}
            <div className="mobile-menu-btn" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
              {isAuthenticated ? (
                <img
                  alt={user?.fullName || 'User'}
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=16a34a&color=fff&size=80&bold=true`}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #86efac', cursor: 'pointer' }}
                  onClick={() => setMobileMenuOpen(true)}
                />
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  className="rounded-pill fw-bold border-0"
                  style={{ background: '#1a6b3c', color: 'white', fontSize: '13px', padding: '6px 16px' }}
                  onClick={onLoginClick}
                >
                  Đăng nhập
                </Button>
              )}
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '26px', color: '#0f172a' }}>menu</span>
              </button>
            </div>
          </div>
        </Container>
      </Navbar>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* ─── MOBILE DRAWER MENU ─── */}
      <div className={`mobile-drawer${mobileMenuOpen ? ' open' : ''}`}>
        {/* Drawer header */}
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
          <img src="/logo3.png" alt="EZSport" style={{ height: '32px', objectFit: 'contain' }} />
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{ border: 'none', background: '#f1f5f9', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#475569' }}>close</span>
          </button>
        </div>

        {/* User section */}
        {isAuthenticated && (
          <div style={{ padding: '16px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                alt={user?.fullName || 'User'}
                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'U')}&background=16a34a&color=fff&size=80&bold=true`}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #86efac' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{user?.fullName}</div>
                <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>
                  {user?.email || user?.phone || 'EZSport member'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <div style={{ padding: '12px 8px', flex: 1 }}>
          {isPlayer && (
            <>
              <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Khám phá
              </div>
              {playerNavLinks.map(link => (
                <button
                  key={link.page}
                  onClick={() => handleMobileNav(link.page)}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none',
                    padding: '12px 16px', fontSize: '15px', fontWeight: 600,
                    color: currentPage === link.page ? '#15803d' : '#0f172a',
                    borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                    background: currentPage === link.page ? '#f0fdf4' : 'transparent',
                  } as any}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: currentPage === link.page ? '#15803d' : '#64748b' }}>
                    {link.page === 'venues' ? 'sports_tennis' : link.page === 'app' ? 'map' : 'group'}
                  </span>
                  {link.label}
                </button>
              ))}
              {!isAuthenticated && (
                <button
                  onClick={() => { onRegisterOwnerClick?.(); setMobileMenuOpen(false); }}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    padding: '12px 16px', fontSize: '15px', fontWeight: 600, color: '#0f172a',
                    borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                  } as any}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748b' }}>home_work</span>
                  Dành cho Chủ Sân
                </button>
              )}
            </>
          )}

          {isAuthenticated && (
            <>
              <div style={{ height: '1px', background: '#f1f5f9', margin: '12px 8px' }} />
              <div style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
                Tài khoản
              </div>
              {[
                { icon: 'person', label: 'Hồ sơ cá nhân', action: () => { navigate(ROUTES.PROFILE); setMobileMenuOpen(false); } },
                { icon: 'event_note', label: 'Lịch sử đặt sân', action: () => { navigate(ROUTES.MY_BOOKINGS); setMobileMenuOpen(false); } },
                { icon: 'chat', label: 'Tin nhắn', action: () => { navigate(ROUTES.MESSAGES); setMobileMenuOpen(false); } },
              ].map(item => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: '100%', textAlign: 'left', background: 'none', border: 'none',
                    padding: '12px 16px', fontSize: '15px', fontWeight: 600, color: '#0f172a',
                    borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                  } as any}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748b' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => { logout(); onPageChange?.('landing'); setMobileMenuOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', background: '#fef2f2', border: 'none',
                borderRadius: '10px', cursor: 'pointer', color: '#ef4444', fontWeight: 700, fontSize: '14px',
              } as any}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navigation;
