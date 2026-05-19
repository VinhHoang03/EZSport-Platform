import React, { useState } from 'react';
import { Container, Nav, Navbar, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface NavigationProps {
  onAddCourtClick?: () => void;
  onLogoClick?: () => void;
  onLoginClick?: () => void;
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  currentPage?: 'landing' | 'app' | 'auth' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates' | string;
  onRegisterOwnerClick?: () => void;
}
 
const Navigation: React.FC<NavigationProps> = ({ 
  onAddCourtClick, onLogoClick, onLoginClick, onPageChange, currentPage, onRegisterOwnerClick 
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
 
  return (
    <>
      <Navbar 
        bg="white" 
        className="px-4 py-3 shadow-sm sticky-top border-bottom" 
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
            onClick={onLogoClick} 
            href="#" 
            className="d-flex align-items-center cursor-pointer" 
            style={{ cursor: 'pointer' }}
          >
            <div style={{ width: 210, height: 60, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'visible' }}>
              <img 
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
            {user?.role === 'PROVIDER' ? (
              <>
                <Nav.Link 
                  onClick={() => onPageChange?.('owner-dashboard')} 
                  className={currentPage === 'owner-dashboard' ? "text-success pb-1" : "text-secondary hover-text-dark"}
                  style={{ cursor: 'pointer', color: currentPage === 'owner-dashboard' ? '#1a6b3c !important' : '', borderBottom: currentPage === 'owner-dashboard' ? '2.5px solid #1a6b3c' : '' }}
                >
                  Trang quản trị Chủ Sân
                </Nav.Link>
                <Nav.Link onClick={onAddCourtClick} className="text-success fw-bold cursor-pointer d-flex align-items-center gap-1 hover-scale" style={{ color: '#1a6b3c !important' }}>
                  <span className="material-symbols-outlined fs-5">add_circle</span>
                  Thêm sân
                </Nav.Link>
              </>
            ) : user?.role === 'ADMIN' ? (
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
                  onClick={() => onPageChange?.('venues')} 
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
 
          <div className="d-flex align-items-center gap-3">
            <Button variant="link" className="text-muted p-2 rounded-circle hover-bg-light d-flex align-items-center border-0 shadow-none">
              <span className="material-symbols-outlined fs-5" style={{ color: '#64748b' }}>notifications</span>
            </Button>
            <Button variant="link" className="text-muted p-2 rounded-circle hover-bg-light d-flex align-items-center border-0 shadow-none">
              <span className="material-symbols-outlined fs-5" style={{ color: '#64748b' }}>favorite</span>
            </Button>
 
            {isAuthenticated ? (
              <Dropdown align="end">
                <Dropdown.Toggle as="div" className="cursor-pointer">
                  <div className="rounded-circle overflow-hidden border border-2 border-success border-opacity-25" style={{ width: '40px', height: '40px' }}>
                    <img 
                      alt="User" 
                      className="w-100 h-100 object-fit-cover" 
                      src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.fullName}
                    />
                  </div>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow-lg border-0 rounded-4 mt-3 p-2" style={{ minWidth: '180px' }}>
                  <Dropdown.Header className="fw-bold text-dark pb-2" style={{ fontSize: '14px' }}>{user?.fullName}</Dropdown.Header>
                  <Dropdown.Item onClick={(e) => { e.preventDefault(); onPageChange?.('profile'); }} className="rounded-3 py-2 small">Hồ sơ cá nhân</Dropdown.Item>
                  <Dropdown.Item href="#settings" className="rounded-3 py-2 small">Cài đặt</Dropdown.Item>
                  <Dropdown.Divider className="my-2 opacity-50" />
                  <Dropdown.Item 
                    onClick={() => {
                      logout();
                      onPageChange?.('landing');
                    }} 
                    className="rounded-3 py-2 small text-danger fw-semibold"
                  >
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button 
                variant="success" 
                className="rounded-pill px-4 py-2 fw-bold shadow-sm border-0"
                style={{ background: '#1a6b3c', color: 'white', fontSize: '14px' }}
                onClick={onLoginClick}
              >
                Đăng nhập
              </Button>
            )}
          </div>
        </Container>
      </Navbar>

      <AuthModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
    </>
  );
};

export default Navigation;

