import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { ROUTES } from '../../constants';
import AuthLayout from '../../layouts/AuthLayout';

type AccountType = 'player' | 'owner' | 'shop';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [accountType, setAccountType] = useState<AccountType>('player');
  const [ho, setHo] = useState('');
  const [ten, setTen] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStrength = () => {
    if (!password) return { label: 'YẾU', color: '#ef4444', percent: 15 };
    if (password.length < 6) return { label: 'YẾU', color: '#ef4444', percent: 30 };
    if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password) && password.length >= 8)
      return { label: 'MẠNH', color: '#1a6b3c', percent: 100 };
    return { label: 'KHÁ', color: '#0ea5e9', percent: 65 };
  };
  const strength = getStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }
    if (!agreeTerms) { setError('Bạn phải đồng ý với Điều khoản sử dụng và Chính sách bảo mật'); return; }
    setLoading(true);
    try {
      await authService.register({
        username, email, password,
        fullName: `${ho} ${ten}`.trim(),
        role: accountType === 'owner' ? 'owner' : 'player',
      });
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, tên đăng nhập đã tồn tại');
    } finally {
      setLoading(false);
    }
  };

  const stepperDots = [
    { s: 1, label: 'TÀI KHOẢN' },
    { s: 2, label: 'THÔNG TIN' },
    { s: 3, label: 'HOÀN TẤT' },
  ];

  const leftContent = step === 2 ? (
    <>
      <div>
        <h1 style={{ fontSize: '42px', fontWeight: 950, lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: '20px' }}>
          Nâng tầm trải nghiệm thể thao của bạn.
        </h1>
        <p style={{ fontSize: '15.5px', color: '#334155', fontWeight: 500, lineHeight: 1.6 }}>
          Kết nối với cộng đồng vận động viên chuyên nghiệp và đặt sân bãi chỉ trong vài giây.
        </p>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)',
        padding: '16px 24px', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', alignSelf: 'flex-start',
      }}>
        <div style={{ display: 'flex' }}>
          {[
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
          ].map((src, idx) => (
            <img key={src} src={src} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #1a6b3c', marginLeft: idx === 0 ? 0 : -10, objectFit: 'cover' }} />
          ))}
        </div>
        <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>+2,500 vận động viên đã gia nhập</span>
      </div>
    </>
  ) : (
    <>
      <div>
        <h1 style={{ fontSize: '46px', fontWeight: 950, lineHeight: 1.12, letterSpacing: '-2px', marginBottom: '16px' }}>
          Tham gia cộng đồng thể thao
        </h1>
        <p style={{ fontSize: '16.5px', color: '#475569', fontWeight: 600 }}>Đặt sân nhanh hơn, thông minh hơn.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {[
          { t: '500+ sân thể thao', s: 'Đa dạng bộ môn từ bóng đá đến pickleball.', i: 'stadium' },
          { t: 'Đặt sân trong 60 giây', s: 'Hệ thống thanh toán tự động và tức thì.', i: 'schedule' },
          { t: 'Hỗ trợ AI 24/7', s: 'Luôn sẵn sàng giải đáp thắc mắc của bạn.', i: 'smart_toy' },
        ].map(item => (
          <div key={item.t} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: '12px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <span className="material-symbols-outlined" style={{ color: '#1a6b3c', fontSize: '20px' }}>{item.i}</span>
            </div>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', display: 'block' }}>{item.t}</span>
              <span style={{ fontSize: '12.5px', color: '#475569', fontWeight: 500, display: 'block' }}>{item.s}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const topLink = (
    <span style={{ color: '#64748b' }}>
      Đã có tài khoản?{' '}
      <span onClick={() => navigate(ROUTES.LOGIN)} style={{ color: '#1a6b3c', cursor: 'pointer', fontWeight: 700 }}>Đăng nhập</span>
    </span>
  );

  return (
    <AuthLayout leftContent={leftContent} topLink={topLink}>
      {/* Stepper */}
      <div className="register-stepper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '16px', left: '12%', right: '12%', height: '2px', background: '#e2e8f0', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: '16px', left: '12%', width: step === 2 ? '42%' : step === 3 ? '80%' : '0%', height: '2px', background: '#22c55e', zIndex: 2, transition: 'all 0.4s' }} />
        {stepperDots.map(item => {
          const done = step > item.s; const active = step === item.s;
          return (
            <div key={item.s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5, flex: 1 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? '#22c55e' : active ? '#0f172a' : '#e2e8f0', color: done || active ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '13px', border: done ? '2px solid #22c55e' : 'none', transition: 'all 0.3s' }}>
                {done ? <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span> : item.s}
              </div>
              <span style={{ fontSize: '9.5px', fontWeight: 800, color: active || done ? '#1a6b3c' : '#94a3b8', letterSpacing: '0.5px', marginTop: '8px', textAlign: 'center' }}>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div>
          <div className="auth-form-heading" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '8px' }}>Bạn là ai?</h2>
            <p style={{ fontSize: '14.5px', color: '#64748b', fontWeight: 500 }}>Chọn loại tài khoản phù hợp</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: '36px' }}>
            {([
              { type: 'player' as AccountType, title: 'Người chơi', desc: 'Tìm sân, đặt lịch, tham gia giải đấu', icon: 'person' },
              { type: 'owner' as AccountType, title: 'Chủ sân', desc: 'Đăng sân, quản lý lịch, tăng doanh thu', icon: 'stadium' },
              { type: 'shop' as AccountType, title: 'Cửa hàng', desc: 'Bán đồ thể thao, tiếp cận người chơi', icon: 'shopping_bag' },
            ]).map(opt => {
              const sel = accountType === opt.type;
              return (
                <div className="register-account-option" key={opt.type} onClick={() => setAccountType(opt.type)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderRadius: '16px', background: sel ? 'rgba(26,107,60,0.05)' : '#f8fafc', border: sel ? '2px solid #1a6b3c' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.25s', transform: sel ? 'scale(1.01)' : 'scale(1)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: sel ? 'rgba(26,107,60,0.15)' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sel ? '#1a6b3c' : '#64748b' }}>
                      <span className="material-symbols-outlined">{opt.icon}</span>
                    </div>
                    <div>
                      <h5 style={{ fontSize: '15.5px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{opt.title}</h5>
                      <p style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500, marginBottom: 0 }}>{opt.desc}</p>
                    </div>
                  </div>
                  {sel && (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#1a6b3c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Button onClick={() => setStep(2)} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 0', fontSize: '14.5px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            Tiếp theo <span className="material-symbols-outlined fs-5">arrow_forward</span>
          </Button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1.2px', marginBottom: '8px' }}>Thông tin của bạn</h2>
            <p style={{ fontSize: '13.5px', color: '#64748b', fontWeight: 500 }}>Cung cấp thông tin cơ bản để cá nhân hóa trải nghiệm.</p>
          </div>
          {error && <Alert variant="danger" className="py-2 px-3 border-0 rounded-3 small mb-3">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <div className="register-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '14px', marginBottom: '14px' }}>
              <Form.Group>
                <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Họ</Form.Label>
                <Form.Control type="text" placeholder="Nguyễn" className="py-2 shadow-none" style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }} value={ho} onChange={e => setHo(e.target.value)} required />
              </Form.Group>
              <Form.Group>
                <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Tên</Form.Label>
                <Form.Control type="text" placeholder="Văn An" className="py-2 shadow-none" style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }} value={ten} onChange={e => setTen(e.target.value)} required />
              </Form.Group>
            </div>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Tên đăng nhập</Form.Label>
              <Form.Control type="text" placeholder="an_nguyen" className="py-2 shadow-none" style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }} value={username} onChange={e => setUsername(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Email</Form.Label>
              <Form.Control type="email" placeholder="an.nguyen@example.com" className="py-2 shadow-none" style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }} value={email} onChange={e => setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Số điện thoại</Form.Label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '12px', display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none', zIndex: 10 }}>
                  <span>🇻🇳</span>
                  <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#475569' }}>+84</span>
                  <span style={{ color: '#cbd5e1' }}>|</span>
                </div>
                <Form.Control type="tel" placeholder="901 234 567" className="py-2 shadow-none" style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc', paddingLeft: '78px' }} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
              </div>
            </Form.Group>
            <div className="register-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '8px' }}>
              <Form.Group>
                <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Mật khẩu</Form.Label>
                <Form.Control type="password" placeholder="Password123" className="py-2 shadow-none" style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }} value={password} onChange={e => setPassword(e.target.value)} required />
              </Form.Group>
              <Form.Group>
                <Form.Label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>Xác nhận mật khẩu</Form.Label>
                <Form.Control type="password" placeholder="Password123" className="py-2 shadow-none" style={{ borderRadius: '10px', fontSize: '14px', borderColor: '#e2e8f0', background: '#f8fafc' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </Form.Group>
            </div>
            {password && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px', marginBottom: '4px' }}>ĐỘ MẠNH: {strength.label}</div>
                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${strength.percent}%`, height: '100%', background: strength.color, transition: 'all 0.3s' }} />
                </div>
              </div>
            )}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: '12.5px', color: '#64748b', fontWeight: 500, lineHeight: 1.4 }}>
                <input type="checkbox" style={{ accentColor: '#1a6b3c', width: 16, height: 16, marginTop: 1 }} checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} required />
                <span>
                  Tôi đồng ý với{' '}
                  <a href="#" style={{ color: '#1a6b3c', fontWeight: 700, textDecoration: 'none' }}>Điều khoản sử dụng</a>
                  {' '}và{' '}
                  <a href="#" style={{ color: '#1a6b3c', fontWeight: 700, textDecoration: 'none' }}>Chính sách bảo mật</a>
                </span>
              </label>
            </div>
            <div className="register-action-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px' }}>
              <button type="button" onClick={() => setStep(1)} style={{ background: '#fff', color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '13px 0', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>Quay lại</button>
              <Button type="submit" disabled={loading} style={{ background: '#1a6b3c', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 0', fontSize: '14.5px', fontWeight: 800 }}>
                {loading ? 'Đang tạo...' : 'Hoàn tất'}
              </Button>
            </div>
          </Form>
          <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
            <span style={{ color: '#64748b' }}>Đã có tài khoản?{' '}<span onClick={() => navigate(ROUTES.LOGIN)} style={{ color: '#1a6b3c', cursor: 'pointer', fontWeight: 700 }}>Đăng nhập ngay</span></span>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(26,107,60,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1a6b3c', color: '#1a6b3c', marginBottom: 24 }}>
            <span className="material-symbols-outlined fs-1" style={{ fontWeight: 800 }}>check</span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-1px', marginBottom: '12px' }}>Chào mừng đến với EZSport!</h2>
          <p style={{ fontSize: '14.5px', color: '#64748b', fontWeight: 500, lineHeight: 1.6, marginBottom: '32px' }}>
            Tài khoản của bạn đã được đăng ký thành công.<br />Sẵn sàng đặt sân thể thao chất lượng cao ngay bây giờ!
          </p>
          <Button onClick={() => navigate(ROUTES.LOGIN)} style={{ width: '100%', background: '#1a6b3c', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px 0', fontSize: '14.5px', fontWeight: 800 }}>
            Đăng nhập ngay
          </Button>
        </div>
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
