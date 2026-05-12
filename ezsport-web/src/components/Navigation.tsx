import React, { useState } from 'react';
import { Container, Nav, Navbar, Button, Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

interface NavigationProps {
  onAddCourtClick?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onAddCourtClick }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <Navbar bg="white" className="px-4 py-2 shadow-sm sticky-top border-bottom bg-opacity-75 backdrop-blur" style={{ zIndex: 1050 }}>
        <Container fluid>
          <Navbar.Brand href="#" className="fw-black fs-3 text-success tracking-tighter" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            EZSport
          </Navbar.Brand>
          
          <Nav className="me-auto d-none d-md-flex gap-4 ms-5">
            <Nav.Link href="#" className="text-success fw-bold border-bottom border-success border-2 pb-1">Find Courts</Nav.Link>
            <Nav.Link href="#" className="text-muted">My Bookings</Nav.Link>
            <Nav.Link href="#" className="text-muted">Memberships</Nav.Link>
            <Nav.Link href="#" className="text-muted">Coaching</Nav.Link>
            <Nav.Link onClick={onAddCourtClick} className="text-success fw-bold cursor-pointer d-flex align-items-center gap-1">
              <span className="material-symbols-outlined fs-5">add_circle</span>
              Thêm sân
            </Nav.Link>
          </Nav>

          <div className="d-flex align-items-center gap-3">
            <Button variant="link" className="text-muted p-2 rounded-circle hover-bg-light d-flex align-items-center">
              <span className="material-symbols-outlined">notifications</span>
            </Button>
            <Button variant="link" className="text-muted p-2 rounded-circle hover-bg-light d-flex align-items-center">
              <span className="material-symbols-outlined">favorite</span>
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
                <Dropdown.Menu className="shadow-lg border-0 rounded-3 mt-2">
                  <Dropdown.Header className="fw-bold text-dark">{user?.fullName}</Dropdown.Header>
                  <Dropdown.Item href="#profile" className="small">My Profile</Dropdown.Item>
                  <Dropdown.Item href="#settings" className="small">Settings</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="small text-danger">Logout</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Button 
                variant="success" 
                className="rounded-pill px-4 fw-bold shadow-sm border-0"
                onClick={() => setShowAuthModal(true)}
              >
                Login
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
