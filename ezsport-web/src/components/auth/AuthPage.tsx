import React, { useEffect, useRef, useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants';

interface AuthPageProps {
  // Keep props for backward compat — router version uses navigate internally
  onBackToLanding?: () => void;
  onSuccess?: (role?: string) => void;
  initialMode?: 'login' | 'register';
  initialAccountType?: AccountType;
}

type AccountType = 'player' | 'owner' | 'shop';

export const AuthPage: React.FC<AuthPageProps> = ({
  onBackToLanding,
  onSuccess,
  initialMode = 'login',
  initialAccountType = 'player'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>(
    location.pathname === ROUTES.REGISTER ? 'register' : initialMode
  );

  // Registration stepper states
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<AccountType>(initialAccountType);

  // Form states
  const [ho, setHo] = useState('');
  const [ten, setTen] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleButtonRendered, setGoogleButtonRendered] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const { login: authLogin } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
              else if (role === 'owner') navigate(ROUTES.OWNER_DASHBOARD);
              else navigate(ROUTES.VENUES);
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
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: 240,
          text: 'signin_with',
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

      return () => {
        document.head.removeChild(script);
      };
    }
  }, [authLogin, googleClientId, navigate]);

  const handleGoogleLogin = () => {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      setError('Không thể tải Google Sign-In. Vui lòng thử lại sau.');
      return;
    }
    google.accounts.id.prompt();
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login({ email, password });
      authLogin({ ...result.user, id: result.user._id }, result.accessToken);
      const role = result.user.role;
      if (onSuccess) {
        onSuccess(role);
      } else {
        if (role === 'admin') navigate(ROUTES.ADMIN_DASHBOARD);
        else if (role === 'owner') navigate(ROUTES.OWNER_DASHBOARD);
        else navigate(ROUTES.VENUES);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agreeTerms) {
      setError('Bạn phải đồng ý với Điều khoản sử dụng và Chính sách bảo mật');
      return;
    }

    setLoading(true);
    try {
      const fullName = `${ho} ${ten}`.trim();
      await authService.register({
        email,
        password,
        fullName,
        role: accountType === 'owner' ? 'owner' : 'player'
      });

      // Move to success step
      setTimeout(() => {
        setRegisterStep(3);
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, email đã tồn tại');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = () => {
    setMode('login');
    setRegisterStep(1);
    setError(null);
  };

  // Helper to calculate password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { label: 'YẾU', color: '#ef4444', percent: 15 };
    if (password.length < 6) return { label: 'YẾU', color: '#ef4444', percent: 30 };
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (hasLetters && hasNumbers && password.length >= 8) {
      return { label: 'MẠNH', color: '#1a6b3c', percent: 100 };
    }
    return { label: 'KHÁ', color: '#0ea5e9', percent: 65 };
  };

  const strength = getPasswordStrength();

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '40% 60%',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Barlow', sans-serif",
      background: '#ffffff'
    }}>

      {/* ── LEFT SIDE (Banner - High Resolution Silhouette Image) ── */}
      <div style={{
        background: "url('/images/backgroudauth1.png') no-repeat center center / cover",
        padding: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        color: '#0f172a',
        transition: 'all 0.6s ease'
      }}>

        {/* Logo */}
        <div
          onClick={onBackToLanding || (() => navigate(ROUTES.LANDING))}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 10,
            marginTop: '35px'
          }}
        >
          <img
            src="/logo3.png"
            alt="EZSport Logo"
            style={{
              height: 70,
              width: 'auto',
              objectFit: 'contain',
              transform: 'scale(4.0)',
              transformOrigin: 'left center',
              marginLeft: '10px'
            }}
          />
        </div>

        {/* Main Content */}
        <div style={{ zIndex: 10, marginBlock: 'auto', display: 'flex', flexDirection: 'column', gap: 36 }}>
          {registerStep === 2 ? (
            <div>
              <h1 style={{ fontSize: '42px', fontWeight: 950, lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: '20px' }}>
                Nâng tầm trải nghiệm thể thao của bạn.
              </h1>
              <p style={{ fontSize: '15.5px', color: '#334155', fontWeight: 500, lineHeight: 1.6 }}>
                Kết nối với cộng đồng vận động viên chuyên nghiệp và đặt sân bãi chỉ trong vài giây. EZSport mang lại sự tiện nghi và hiệu suất đỉnh cao cho mọi hành trình vận động.
              </p>
            </div>
          ) : mode === 'login' ? (
            <div>
              <h1 style={{ fontSize: '46px', fontWeight: 950, lineHeight: 1.12, letterSpacing: '-2px', marginBottom: '16px' }}>
                Chào mừng trở lại
              </h1>
              <p style={{ fontSize: '16.5px', color: '#475569', fontWeight: 600 }}>
                Đặt sân nhanh hơn, thông minh hơn.
              </p>
            </div>
          ) : (
            <div>
              <h1 style={{ fontSize: '46px', fontWeight: 950, lineHeight: 1.12, letterSpacing: '-2px', marginBottom: '16px' }}>
                Tham gia cộng đồng thể thao
              </h1>
              <p style={{ fontSize: '16.5px', color: '#475569', fontWeight: 600 }}>
                Đặt sân nhanh hơn, thông minh hơn.
              </p>
            </div>
          )}

          {/* Dynamic elements below title based on steps */}
          {registerStep === 2 ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              padding: '16px 24px',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.06)',
              alignSelf: 'flex-start'
            }}>
              {/* Stacked avatars */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80'
                ].map((imgUrl, idx) => (
                  <img
                    key={imgUrl}
                    src={imgUrl}
                    alt="avatar"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: '2px solid #1a6b3c',
                      marginLeft: idx === 0 ? 0 : -10,
                      objectFit: 'cover'
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
                +2,500 vận động viên đã gia nhập cộng đồng
              </span>
            </div>
          ) : (
            /* Checklist for login or step 1 */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { t: '500+ sân thể thao', s: 'Đa dạng bộ môn từ bóng đá đến pickleball.', i: 'stadium' },
                { t: 'Đặt sân trong 60 giây', s: 'Hệ thống thanh toán tự động và tức thì.', i: 'schedule' },
                { t: 'Hỗ trợ AI 24/7', s: 'Luôn sẵn sàng giải đáp thắc mắc của bạn.', i: 'smart_toy' }
              ].map(item => (
                <div key={item.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '12px', background: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.8)',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
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
          )}
        </div>

        {/* Footer */}
        <div style={{ zIndex: 10, fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          © 2026 EZSPORT ECOSYSTEM
        </div>
      </div>

      {/* ── RIGHT SIDE (Stepper Form) ── */}
      <div style={{
        background: '#ffffff',
        padding: '56px 80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Image Layer (Soft blur & faded opacity to prevent clashing with form) */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: "url('/images/backgroudauth.jpg') no-repeat center center / contain",
          opacity: 0.45,
          filter: 'blur(1.5px)',
          zIndex: 1,
          pointerEvents: 'none',
          transform: 'scale(1.02)'
        }} />
        {/* Top Toggle Mode Link */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '13.5px', fontWeight: 600, zIndex: 2, position: 'relative' }}>
          {mode === 'login' ? (
            <span style={{ color: '#64748b' }}>
              Chưa có tài khoản?{' '}
              <span
                onClick={() => { setMode('register'); setRegisterStep(1); setError(null); }}
                style={{ color: '#1a6b3c', cursor: 'pointer', fontWeight: 700 }}
              >
                Đăng ký
              </span>
            </span>
          ) : (
            <span style={{ color: '#64748b' }}>
              Đã có tài khoản?{' '}
              <span
                onClick={() => { setMode('login'); setError(null); }}
                style={{ color: '#1a6b3c', cursor: 'pointer', fontWeight: 700 }}
              >
                Đăng nhập
              </span>
            </span>
          )}
        </div>

        {/* Form Container (Premium card floating over background illustration) */}
        <div style={{
          maxWidth: '480px',
          width: '100%',
          margin: 'auto',
          background: 'rgba(255, 255, 255, 0.88)',
          padding: '36px',
          borderRadius: '20px',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(12px)',
          zIndex: 10,
          position: 'relative'
        }}>

          {/* LOGIN MODE */}
          {mode === 'login' && (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '8px' }}>
                  Đăng nhập
                </h2>
                <p style={{ fontSize: '14.5px', color: '#64748b', fontWeight: 500 }}>
                  Nhập thông tin để tiếp tục
                </p>
              </div>

              {/* Social Logins */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '28px' }}>
                <div ref={googleButtonRef} />
                {!googleButtonRendered && (
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading || !googleReady}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
                      padding: '11px 0', fontSize: '13.5px', fontWeight: 700, color: '#334155', cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.02)', opacity: loading || !googleReady ? 0.65 : 1,
                    }}
                  >
                    <img src="https://d261zod40n0w22.cloudfront.net/google-logo.svg" alt="Google" onError={(e) => { e.currentTarget.src = "https://www.gstatic.com/images/branding/product/1x/gsa_android_48dp.png" }} style={{ width: 16, height: 16 }} />
                    Google
                  </button>
                )}
                <button style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
                  padding: '11px 0', fontSize: '13.5px', fontWeight: 700, color: '#334155', cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  Facebook
                </button>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '28px' }}>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>HOẶC</span>
                <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
              </div>

              {error && <Alert variant="danger" className="py-2.5 px-3 border-0 rounded-3 small mb-3">{error}</Alert>}

              <Form onSubmit={handleLoginSubmit}>
                {/* Email */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Email</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type="email"
                      placeholder="alex.nguyen@email.com"
                      className="py-2.5 shadow-none border-1"
                      style={{ borderRadius: '10px', fontSize: '14px', borderColor: email.includes('@') ? '#22c55e' : '#cbd5e1', paddingRight: '40px' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    {email.includes('@') && (
                      <span className="material-symbols-outlined position-absolute end-0 top-50 translate-middle-y me-3 text-success fs-5">check_circle</span>
                    )}
                  </div>
                </Form.Group>

                {/* Password */}
                <Form.Group className="mb-4">
                  <Form.Label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Mật khẩu</Form.Label>
                  <div style={{ position: 'relative' }}>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      placeholder="password"
                      className="py-2.5 shadow-none border-1"
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

                {/* Additional Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px', marginBottom: '28px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 600, color: '#334155' }}>
                    <input type="checkbox" style={{ accentColor: '#1a6b3c', width: 16, height: 16, borderRadius: 4 }} />
                    Ghi nhớ đăng nhập
                  </label>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); navigate(ROUTES.FORGOT_PASSWORD); }}
                    style={{ color: '#1a6b3c', textDecoration: 'none', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%', background: '#0f172a', color: '#ffffff', border: 'none',
                    borderRadius: '12px', padding: '14px 0', fontSize: '14.5px', fontWeight: 800,
                    cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </Form>
            </div>
          )}

          {/* REGISTER MODE (Multi-step Wizard) */}
          {mode === 'register' && (
            <div>
              {/* Stepper Header (High fidelity circles & checkmarks matching step 2 screen) */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
                {/* Stepper Line 1 */}
                <div style={{ position: 'absolute', top: '16px', left: '12%', right: '12%', height: '2px', background: '#e2e8f0', zIndex: 1 }} />
                <div style={{ position: 'absolute', top: '16px', left: '12%', width: registerStep === 2 ? '42%' : registerStep === 3 ? '80%' : '0%', height: '2px', background: '#22c55e', zIndex: 2, transition: 'all 0.4s' }} />

                {[
                  { step: 1, label: 'TÀI KHOẢN' },
                  { step: 2, label: 'THÔNG TIN CÁ NHÂN' },
                  { step: 3, label: 'HOÀN TẤT' }
                ].map((item) => {
                  const isCompleted = registerStep > item.step;
                  const isActive = registerStep === item.step;

                  return (
                    <div key={item.step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5, flex: 1 }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isCompleted ? '#22c55e' : isActive ? '#0f172a' : '#e2e8f0',
                        color: isCompleted || isActive ? '#ffffff' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                        border: isCompleted ? '2px solid #22c55e' : 'none',
                        transition: 'all 0.3s'
                      }}>
                        {isCompleted ? (
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', fontWeight: 900 }}>check</span>
                        ) : (
                          item.step
                        )}
                      </div>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        color: isActive || isCompleted ? '#1a6b3c' : '#94a3b8',
                        letterSpacing: '0.5px',
                        marginTop: '8px',
                        textAlign: 'center'
                      }}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* STEP 1: Select Account Type */}
              {registerStep === 1 && (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '8px' }}>
                      Bạn là ai?
                    </h2>
                    <p style={{ fontSize: '14.5px', color: '#64748b', fontWeight: 500 }}>
                      Chọn loại tài khoản phù hợp
                    </p>
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: '36px' }}>
                    {[
                      {
                        type: 'player' as AccountType,
                        title: 'Người chơi',
                        desc: 'Tìm sân, đặt lịch, tham gia giải đấu',
                        icon: 'person'
                      },
                      {
                        type: 'owner' as AccountType,
                        title: 'Chủ sân',
                        desc: 'Đăng sân, quản lý lịch, tăng doanh thu',
                        icon: 'stadium'
                      },
                      {
                        type: 'shop' as AccountType,
                        title: 'Cửa hàng',
                        desc: 'Bán đồ thể thao, tiếp cận người chơi',
                        icon: 'shopping_bag'
                      }
                    ].map(opt => {
                      const isSelected = accountType === opt.type;
                      return (
                        <div
                          key={opt.type}
                          onClick={() => setAccountType(opt.type)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '20px 24px',
                            borderRadius: '16px',
                            background: isSelected ? 'rgba(26,107,60,0.05)' : '#f8fafc',
                            border: isSelected ? '2px solid #1a6b3c' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                            transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{
                              width: 44, height: 44, borderRadius: '12px',
                              background: isSelected ? 'rgba(26,107,60,0.15)' : '#e2e8f0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: isSelected ? '#1a6b3c' : '#64748b',
                              transition: 'all 0.2s'
                            }}>
                              <span className="material-symbols-outlined">{opt.icon}</span>
                            </div>
                            <div>
                              <h5 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                                {opt.title}
                              </h5>
                              <p style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500, marginBottom: 0 }}>
                                {opt.desc}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%', background: '#1a6b3c',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Next Step Button */}
                  <Button
                    onClick={() => setRegisterStep(2)}
                    style={{
                      width: '100%', background: '#0f172a', color: '#ffffff', border: 'none',
                      borderRadius: '12px', padding: '14px 0', fontSize: '14.5px', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    Tiếp theo <span className="material-symbols-outlined fs-5">arrow_forward</span>
                  </Button>
                </div>
              )}

              {/* STEP 2: Fill Personal Info (HIGH FIDELITY UPDATE AS SHOWN IN THE STEP 2 IMAGE) */}
              {registerStep === 2 && (
                <div>
                  <div style={{ marginBottom: '28px' }}>
                    <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.2px', marginBottom: '8px' }}>
                      Thông tin của bạn
                    </h2>
                    <p style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 500, lineHeight: 1.5 }}>
                      Vui lòng cung cấp các thông tin cơ bản để cá nhân hóa trải nghiệm đặt sân của bạn.
                    </p>
                  </div>

                  {error && <Alert variant="danger" className="py-2.5 px-3 border-0 rounded-3 small mb-3">{error}</Alert>}

                  <Form onSubmit={handleRegisterSubmit}>
                    {/* Họ & Tên columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '14px', marginBottom: '14px' }}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Họ</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nguyễn"
                          className="py-2.5 shadow-none border-1"
                          style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }}
                          value={ho}
                          onChange={(e) => setHo(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Tên</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Văn An"
                          className="py-2.5 shadow-none border-1"
                          style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }}
                          value={ten}
                          onChange={(e) => setTen(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </div>

                    {/* Email */}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="an.nguyen@example.com"
                        className="py-2.5 shadow-none border-1"
                        style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    {/* Số điện thoại */}
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Số điện thoại</Form.Label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <div style={{
                          position: 'absolute', left: '12px', display: 'flex', alignItems: 'center', gap: 6,
                          pointerEvents: 'none', zIndex: 10
                        }}>
                          <span style={{ fontSize: '14px' }}>🇻🇳</span>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569' }}>+84</span>
                          <span style={{ color: '#cbd5e1' }}>|</span>
                        </div>
                        <Form.Control
                          type="tel"
                          placeholder="901 234 567"
                          className="py-2.5 shadow-none border-1"
                          style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc', paddingLeft: '78px' }}
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </div>
                    </Form.Group>

                    {/* Mật khẩu & Xác nhận mật khẩu */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '8px' }}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Mật khẩu</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password123"
                          className="py-2.5 shadow-none border-1"
                          style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </Form.Group>
                      <Form.Group>
                        <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Xác nhận mật khẩu</Form.Label>
                        <Form.Control
                          type="password"
                          placeholder="Password123"
                          className="py-2.5 shadow-none border-1"
                          style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </Form.Group>
                    </div>

                    {/* Password strength progress bar */}
                    {password && (
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px', marginBottom: '4px' }}>
                          <span>ĐỘ MẠNH: {strength.label}</span>
                        </div>
                        <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${strength.percent}%`, height: '100%', background: strength.color, transition: 'all 0.3s' }} />
                        </div>
                      </div>
                    )}

                    {/* Terms Agreement Checkbox */}
                    <div style={{ marginBottom: '28px' }}>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '12.5px', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
                        <input
                          type="checkbox"
                          style={{ accentColor: '#1a6b3c', width: 16, height: 16, borderRadius: 4, marginTop: 1 }}
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          required
                        />
                        <span>
                          Tôi đồng ý với{' '}
                          <a href="#" style={{ color: '#1a6b3c', fontWeight: 700, textDecoration: 'none' }}>Điều khoản sử dụng</a>
                          {' '}và{' '}
                          <a href="#" style={{ color: '#1a6b3c', fontWeight: 700, textDecoration: 'none' }}>Chính sách bảo mật</a>
                        </span>
                      </label>
                    </div>

                    {/* Side-by-side action buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px' }}>
                      <button
                        type="button"
                        onClick={() => setRegisterStep(1)}
                        style={{
                          background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1',
                          borderRadius: '12px', padding: '13px 0', fontSize: '14px', fontWeight: 800,
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        Quay lại
                      </button>
                      <Button
                        type="submit"
                        disabled={loading}
                        style={{
                          background: '#1a6b3c', color: '#ffffff', border: 'none',
                          borderRadius: '12px', padding: '13px 0', fontSize: '14.5px', fontWeight: 800,
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {loading ? 'Đang tạo...' : 'Tiếp theo'}
                      </Button>
                    </div>
                  </Form>
                </div>
              )}

              {/* STEP 3: Confirmation / Success screen */}
              {registerStep === 3 && (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: '50%', background: 'rgba(26,107,60,0.1)',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #1a6b3c', color: '#1a6b3c', marginBottom: 24
                  }}>
                    <span className="material-symbols-outlined fs-1" style={{ fontWeight: 800 }}>check</span>
                  </div>

                  <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', marginBottom: '12px' }}>
                    Chào mừng đến với EZSport!
                  </h2>
                  <p style={{ fontSize: '14.5px', color: '#64748b', fontWeight: 500, lineHeight: 1.6, marginBottom: '32px' }}>
                    Tài khoản của bạn đã được đăng ký thành công.<br />
                    Sẵn sàng đặt những sân thể thao chất lượng cao ngay bây giờ!
                  </p>

                  <Button
                    onClick={handleCompleteRegistration}
                    style={{
                      width: '100%', background: '#1a6b3c', color: '#ffffff', border: 'none',
                      borderRadius: '12px', padding: '14px 0', fontSize: '14.5px', fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    Đăng nhập ngay
                  </Button>
                </div>
              )}

              {/* Back to Login Footer at the bottom */}
              {registerStep < 3 && (
                <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: '#64748b' }}>
                    Bạn đã có tài khoản?{' '}
                    <span
                      onClick={() => { setMode('login'); setError(null); }}
                      style={{ color: '#1a6b3c', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Đăng nhập ngay
                    </span>
                  </span>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginTop: '20px', zIndex: 2, position: 'relative' }}>
          <div>
            © 2026 EZSport Inc.
          </div>
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
