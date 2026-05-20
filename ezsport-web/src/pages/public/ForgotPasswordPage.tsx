import React from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { ROUTES } from '../../constants';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="bg-white rounded-4 shadow-lg overflow-hidden" style={{ width: '100%', maxWidth: 420 }}>
        <div className="bg-success bg-opacity-10 p-4 text-center border-bottom border-light">
          <img
            src="/logo3.png"
            alt="EZSport"
            style={{ height: 48, cursor: 'pointer' }}
            onClick={() => navigate(ROUTES.LANDING)}
          />
          <p className="text-muted small mb-0 mt-2">Quên mật khẩu</p>
        </div>

        <div className="p-4">
          <h5 className="fw-bold mb-1">Đặt lại mật khẩu</h5>

          <ForgotPasswordForm
            onLoginClick={() => navigate(ROUTES.LOGIN)}
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
