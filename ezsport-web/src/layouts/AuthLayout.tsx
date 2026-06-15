import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';

interface AuthLayoutProps {
  leftContent?: React.ReactNode;
  children?: React.ReactNode;
  onBackToLanding?: () => void;
  topLink?: React.ReactNode;
}

/**
 * AuthLayout phục vụ 2 mục đích:
 * 1. Dùng như React Router layout wrapper: render <Outlet /> cho LoginPage / RegisterPage
 * 2. Dùng trực tiếp trong LoginPage / RegisterPage như UI shell (banner trái + form phải)
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ leftContent, children, onBackToLanding, topLink }) => {
  const navigate = useNavigate();

  // Khi dùng như React Router layout (không có props) → chỉ render Outlet
  if (!leftContent && !children) {
    return <Outlet />;
  }

  return (
    <div className="auth-layout" style={{
      display: 'grid',
      gridTemplateColumns: '40% 60%',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Barlow', sans-serif",
      background: '#ffffff'
    }}>
      {/* ── LEFT SIDE ── */}
      <div className="auth-layout-aside" style={{
        background: "url('/images/backgroudauth1.png') no-repeat center center / cover",
        padding: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        color: '#0f172a',
      }}>
        <div
          className="auth-layout-logo"
          onClick={onBackToLanding ?? (() => navigate(ROUTES.LANDING))}
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', zIndex: 10, marginTop: '35px' }}
        >
          <img
            src="/logo3.png"
            alt="EZSport Logo"
            style={{ height: 70, width: 'auto', objectFit: 'contain', transform: 'scale(4.0)', transformOrigin: 'left center', marginLeft: '10px' }}
          />
        </div>

        <div className="auth-layout-aside-content" style={{ zIndex: 10, marginBlock: 'auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          {leftContent}
        </div>

        <div className="auth-layout-aside-footer" style={{ zIndex: 10, fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          © 2026 EZSPORT ECOSYSTEM
        </div>
      </div>

      {/* ── RIGHT SIDE ── */}
      <div className="auth-layout-main" style={{
        background: '#ffffff',
        padding: '56px 80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div
          className="auth-mobile-logo"
          onClick={onBackToLanding ?? (() => navigate(ROUTES.LANDING))}
        >
          <img src="/logo3.png" alt="EZSport Logo" />
        </div>

        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: "url('/images/backgroudauth.jpg') no-repeat center center / contain",
          opacity: 0.45, filter: 'blur(1.5px)', zIndex: 1, pointerEvents: 'none', transform: 'scale(1.02)'
        }} />

        <div className="auth-layout-top-link" style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13.5px', fontWeight: 600, zIndex: 2, position: 'relative' }}>
          {topLink}
        </div>

        <div className="auth-layout-card" style={{
          maxWidth: '480px', width: '100%', margin: 'auto',
          background: 'rgba(255, 255, 255, 0.88)', padding: '36px', borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(12px)', zIndex: 10, position: 'relative'
        }}>
          {children}
        </div>

        <div className="auth-layout-footer" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginTop: '20px', zIndex: 2, position: 'relative' }}>
          <div>© 2026 EZSport Inc.</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ cursor: 'pointer', color: '#64748b' }}>Hỗ trợ</span>
            <span>·</span>
            <span style={{ cursor: 'pointer', color: '#64748b' }}>Liên hệ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
