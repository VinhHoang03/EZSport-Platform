import React, { useState } from 'react';
import { Modal, Alert, Nav } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

interface AuthModalProps {
  show: boolean;
  onHide: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onHide }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = () => {
    if (activeTab === 'login') {
      onHide();
    } else {
      setActiveTab('login');
      setError('Registration successful! Please login.');
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
      style={{ maxWidth: '400px', margin: 'auto' }}
    >
      <div className="bg-success bg-opacity-10 p-4 text-center border-bottom border-light">
        <h4 className="fw-black text-success mb-1 tracking-tighter">EZSport</h4>
        <p className="text-muted small mb-0">Your ultimate sports companion</p>
      </div>
      
      <Modal.Body className="p-4">
        <Nav variant="pills" className="justify-content-center gap-2 mb-4 bg-light p-1 rounded-pill">
          <Nav.Item className="flex-fill">
            <Nav.Link 
              active={activeTab === 'login'} 
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`rounded-pill text-center fw-bold small ${activeTab === 'login' ? 'bg-success shadow-sm text-white' : 'text-muted'}`}
            >
              Login
            </Nav.Link>
          </Nav.Item>
          <Nav.Item className="flex-fill">
            <Nav.Link 
              active={activeTab === 'register'} 
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`rounded-pill text-center fw-bold small ${activeTab === 'register' ? 'bg-success shadow-sm text-white' : 'text-muted'}`}
            >
              Register
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error && (
              <Alert variant={error.includes('successful') ? 'success' : 'danger'} className="py-2 small border-0 shadow-sm mb-3">
                {error}
              </Alert>
            )}

            {activeTab === 'login' ? (
              <LoginForm 
                onSuccess={handleSuccess} 
                onError={setError} 
                onRegisterClick={() => setActiveTab('register')} 
              />
            ) : (
              <RegisterForm 
                onSuccess={handleSuccess} 
                onError={setError} 
                onLoginClick={() => setActiveTab('login')} 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
