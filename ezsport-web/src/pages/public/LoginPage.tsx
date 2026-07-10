import React, { useEffect, useRef, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';
import AuthLayout from '../../layouts/AuthLayout';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initializeGoogle = () => {
      const google = (window as any).google;
      if (!google?.accounts?.id || !googleClientId) return;
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          if (response?.credential) {
            try {
              setLoading(true);
              const result = await authService.googleLogin(response.credential);
              authLogin({ ...result.user, id: result.user._id }, result.accessToken);
              const role = result.user.role;
              if (role === 'admin') navigate(ROUTES.ADMIN_DASHBOARD);
              else if (role === 'owner') navigate(ROUTES.OWNER_PAGE);
              else if (role === 'shop') navigate(ROUTES.SHOP_DASHBOARD);
              else navigate(ROUTES.MAP);
            } catch (err: any) {
              setError(err.response?.data?.message || err.message || 'Đăng nhập bằng Google thất bại');
            } finally {
              setLoading(false);
            }
          }
        },
      });
      if (googleButtonRef.current && !googleButtonRendered) {
        google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard', theme: 'outline', size: 'large', width: 240, text: 'signin_with',
        });
        setGoogleButtonRendered(true);
      }
      setGoogleReady(true);
    };

    if ((window as any).google?.accounts?.id) {
      initializeGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogle;
      document.head.appendChild(script);
      return () => { document.head.removeChild(script); };
    }
  }, [authLogin, googleClientId, googleButtonRendered, navigate]);

  const handleGoogleLogin = () => {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      setError('Không thể tải Google Sign-In. Vui lòng thử lại sau.');
      return;
    }
    google.accounts.id.prompt();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login({ username, password });
      authLogin({ ...result.user, id: result.user._id }, result.accessToken);
      const role = result.user.role;
      if (role === 'admin') navigate(ROUTES.ADMIN_DASHBOARD);
      else if (role === 'owner') navigate(ROUTES.OWNER_PAGE);
      else if (role === 'shop') navigate(ROUTES.SHOP_DASHBOARD);
      else navigate(ROUTES.MAP);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const leftContent = (
    <>
      <div>
        <h1 style={{ fontSize: '46px', fontWeight: 950, lineHeight: 1.12, letterSpacing: '-2px', marginBottom: '16px' }}>
          Chào mừng trở lại
        </h1>
        <p style={{ fontSize: '16.5px', color: '#475569', fontWeight: 600 }}>
          Đặt sân nhanh hơn, thông minh hơn.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {[
          { t: '500+ sân thể thao', s: 'Đa dạng bộ môn từ bóng đá đến pickleball.', i: 'stadium' },
          { t: 'Đặt sân trong 60 giây', s: 'Hệ thống thanh toán tự động và tức thì.', i: 'schedule' },
          { t: 'Hỗ trợ AI 24/7', s: 'Luôn sẵn sàng giải đáp thắc mắc của bạn.', i: 'smart_toy' },
        ].map(item => (
          <div key={item.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '12px', background: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.8)', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#1a6b3c', fontSize: '20px', fontWeight: 'bold' }}>{item.i}</span>
            </div>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', display: 'block' }}>{item.t}</span>
              <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, marginTop: 2, display: 'block' }}>{item.s}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const topLink = (
    <span style={{ color: '#64748b' }}>
      Chưa có tài khoản?{' '}
      <span onClick={() => navigate(ROUTES.REGISTER)} style={{ color: '#1a6b3c', cursor: 'pointer', fontWeight: 700 }}>
        Đăng ký
      </span>
    </span>
  );

  return (
    <AuthLayout leftContent={leftContent} topLink={topLink}>
      <div className="auth-form-heading" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '8px' }}>
          Đăng nhập
        </h2>
        <p style={{ fontSize: '14.5px', color: '#64748b', fontWeight: 500 }}>Nhập thông tin để tiếp tục</p>
      </div>

      {/* Social login buttons */}
      <div className="auth-social-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          <div ref={googleButtonRef} style={{ width: '100%' }} />
          {!googleButtonRendered && (
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || !googleReady}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
                background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '11px 0', fontSize: '13.5px', fontWeight: 700, color: '#334155', cursor: 'pointer',
                opacity: loading || !googleReady ? 0.65 : 1,
              }}
            >
              <img src="https://d261zod40n0w22.cloudfront.net/google-logo.svg" alt="Google"
                onError={(e) => { e.currentTarget.src = 'https://www.gstatic.com/images/branding/product/1x/gsa_android_48dp.png'; }}
                style={{ width: 16, height: 16 }} />
              Google
            </button>
          )}
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
          padding: '11px 0', fontSize: '13.5px', fontWeight: 700, color: '#334155', cursor: 'pointer',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </button>
      </div>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '28px' }}>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>HOẶC</span>
        <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
      </div>

      {error && <Alert variant="danger" className="py-2 px-3 border-0 rounded-3 small mb-3">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Tên đăng nhập</Form.Label>
          <div style={{ position: 'relative' }}>
            <Form.Control
              type="text"
              placeholder="alex_nguyen"
              className="py-2 shadow-none border-1"
              style={{ borderRadius: '10px', fontSize: '14px', borderColor: username.length > 2 ? '#22c55e' : '#cbd5e1', paddingRight: '40px' }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            {username.length > 2 && (
              <span className="material-symbols-outlined position-absolute end-0 top-50 translate-middle-y me-3 text-success fs-5">check_circle</span>
            )}
          </div>
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Mật khẩu</Form.Label>
          <div style={{ position: 'relative' }}>
            <Form.Control
              type={showPassword ? 'text' : 'password'}
              placeholder="password"
              className="py-2 shadow-none border-1"
              style={{ borderRadius: '10px', fontSize: '14px', borderColor: password.length > 5 ? '#22c55e' : '#cbd5e1', paddingRight: '45px' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', padding: 4 }}
              className="material-symbols-outlined position-absolute end-0 top-50 translate-middle-y me-3 text-secondary fs-5"
            >
              {showPassword ? 'visibility_off' : 'visibility'}
            </button>
          </div>
        </Form.Group>

        <div className="auth-form-options" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px', marginBottom: '28px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
            <input type="checkbox" style={{ accentColor: '#1a6b3c', width: 16, height: 16 }} />
            Ghi nhớ đăng nhập
          </label>
          <span
            onClick={() => navigate(ROUTES.FORGOT_PASSWORD)}
            style={{ color: '#1a6b3c', fontWeight: 700, cursor: 'pointer' }}
          >
            Quên mật khẩu?
          </span>
        </div>

        <Button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', background: '#0f172a', color: '#ffffff', border: 'none',
            borderRadius: '12px', padding: '14px 0', fontSize: '14.5px', fontWeight: 800,
          }}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default LoginPage;
