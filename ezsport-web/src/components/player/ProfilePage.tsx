import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal } from 'react-bootstrap';
import { G, W, TX, TX2, SL } from '../../utils/theme';
// import Navigation from '../shared/Navigation'; // Not used
import { useAuth } from '../../context/AuthContext';
import { userService, type UserProfile } from '../../services/user.service';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

interface ProfilePageProps {
  onGoHome: () => void;
  onFindVenues: () => void;
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  onLogoClick?: () => void;
}

const MEMBER_TIER = (pts: number) => {
  if (pts >= 3000) return { label: 'Kim Cương', color: '#a78bfa', bg: '#ede9fe', next: null, nextPts: 0 };
  if (pts >= 1500) return { label: 'Vàng', color: '#d97706', bg: '#fef3c7', next: 'Kim Cương', nextPts: 3000 };
  if (pts >= 500)  return { label: 'Bạc', color: '#64748b', bg: '#f1f5f9', next: 'Vàng', nextPts: 1500 };
  return { label: 'Đồng', color: '#92400e', bg: '#fef9f0', next: 'Bạc', nextPts: 500 };
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ onFindVenues }) => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', email: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load profile from API
  useEffect(() => {
    (async () => {
      try {
        setLoadingProfile(true);
        const data = await userService.getMe();
        setProfile(data);
        // Also sync AuthContext
        updateUser({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
        });
      } catch {
        // Fallback to cached AuthContext data
        if (user) {
          setProfile({
            _id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
            role: user.role,
            loyaltyPoints: 0,
            createdAt: undefined,
          });
        }
      } finally {
        setLoadingProfile(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEdit = () => {
    setEditForm({
      fullName: profile?.fullName || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
    });
    setAvatarFile(null);
    setAvatarPreview(null);
    setSaveError('');
    setShowEdit(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!editForm.fullName.trim()) {
      setSaveError('Tên không được để trống.');
      return;
    }
    try {
      setSaving(true);
      setSaveError('');
      const updated = await userService.updateProfile({
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim(),
        avatarFile: avatarFile ?? undefined,
      });
      setProfile(updated);
      updateUser({
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        avatar: updated.avatar,
      });
      setShowEdit(false);
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || err?.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const pts = profile?.loyaltyPoints ?? 0;
  const tier = MEMBER_TIER(pts);
  const tierPct = tier.nextPts ? Math.min(100, Math.round((pts / tier.nextPts) * 100)) : 100;

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })
    : '—';

  const avatarSrc =
    avatarPreview ||
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.fullName || 'U')}&background=16a34a&color=fff&size=128`;

  return (
    <div style={{ backgroundColor: SL, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      <Container fluid className="flex-grow-1 p-0" style={{ paddingTop: '72px' }}>
        <Row className="g-0 h-100">

          {/* ─── SIDEBAR ─── */}
          <Col md={3} lg={2} style={{
            backgroundColor: W, borderRight: '1px solid #e2e8f0',
            minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column'
          }}>
            {loadingProfile ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 200 }}>
                <Spinner variant="success" />
              </div>
            ) : (
              <>
                {/* Avatar + name */}
                <div className="p-4 d-flex flex-column align-items-center text-center border-bottom" style={{ borderColor: '#e2e8f0' }}>
                  <div style={{ position: 'relative', marginBottom: '12px' }}>
                    <img
                      src={avatarSrc}
                      alt={profile?.fullName}
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dcfce7' }}
                    />
                    <button
                      onClick={openEdit}
                      title="Chỉnh sửa hồ sơ"
                      style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: '26px', height: '26px', borderRadius: '50%',
                        background: G, border: '2px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#fff' }}>edit</span>
                    </button>
                  </div>

                  <h5 style={{ fontSize: '16px', fontWeight: 700, color: TX, marginBottom: '2px' }}>
                    {profile?.fullName || '—'}
                  </h5>
                  <div style={{ fontSize: '12px', color: TX2, marginBottom: '6px' }}>
                    {profile?.email || profile?.phone || '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: TX2, marginBottom: '12px' }}>
                    Thành viên từ {memberSince}
                  </div>

                  <Badge style={{
                    background: tier.bg, color: tier.color,
                    padding: '6px 14px', borderRadius: '999px',
                    fontSize: '12px', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '4px',
                    border: `1px solid ${tier.color}30`
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>emoji_events</span>
                    Thành viên {tier.label}
                  </Badge>
                </div>

                {/* Loyalty points */}
                <div className="p-4 border-bottom" style={{ borderColor: '#e2e8f0' }}>
                  <div className="d-flex justify-content-between align-items-end mb-2">
                    <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: G }}>
                      {pts.toLocaleString('vi-VN')}
                    </h3>
                    <span style={{ fontSize: '12px', color: TX2, fontWeight: 600, paddingBottom: '4px' }}>Điểm tích lũy</span>
                  </div>
                  <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
                    <div style={{ width: `${tierPct}%`, height: '100%', background: tier.color, borderRadius: '999px', transition: 'width 0.6s' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: TX2, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{tier.label}</span>
                    {tier.next && <span>{tier.next} (Còn {(tier.nextPts - pts).toLocaleString('vi-VN')} điểm)</span>}
                  </div>
                </div>

                {/* Profile info */}
                <div className="p-4 border-bottom" style={{ borderColor: '#e2e8f0' }}>
                  {[
                    { icon: 'phone', label: 'Điện thoại', value: profile?.phone || 'Chưa cập nhật' },
                    { icon: 'email', label: 'Email', value: profile?.email || 'Chưa cập nhật' },
                    { icon: 'person', label: 'Tên đăng nhập', value: profile?.username || '—' },
                  ].map(item => (
                    <div key={item.icon} className="d-flex align-items-start gap-2 mb-3">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: G, marginTop: '1px' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '11px', color: TX2 }}>{item.label}</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: TX }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-4 mt-auto d-flex flex-column gap-2">
                  <Button
                    onClick={openEdit}
                    style={{ width: '100%', background: G, border: 'none', borderRadius: '8px', padding: '10px 0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    Chỉnh sửa hồ sơ
                  </Button>
                  <Button
                    onClick={onFindVenues}
                    variant="outline-success"
                    style={{ width: '100%', borderRadius: '8px', padding: '10px 0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '14px', borderColor: G, color: G }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                    Đặt sân ngay
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="outline-danger"
                    style={{ width: '100%', borderRadius: '8px', padding: '8px 0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
                    Đăng xuất
                  </Button>
                </div>
              </>
            )}
          </Col>

          {/* ─── MAIN CONTENT ─── */}
          <Col md={9} lg={10} className="p-5" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 72px)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

              <h2 style={{ fontSize: '28px', fontWeight: 800, color: TX, marginBottom: '8px', letterSpacing: '-0.5px' }}>
                Hồ sơ của tôi
              </h2>
              <p style={{ color: TX2, fontSize: '15px', marginBottom: '32px' }}>
                Xem và quản lý thông tin tài khoản, điểm thưởng và lịch sử hoạt động.
              </p>

              {/* Stats Row */}
              <Row className="g-4 mb-4">
                {[
                  { icon: 'emoji_events', label: 'Thành viên', value: tier.label, color: tier.color, bg: tier.bg },
                  { icon: 'stars', label: 'Điểm tích lũy', value: pts.toLocaleString('vi-VN'), color: '#16a34a', bg: '#f0fdf4' },
                  { icon: 'verified_user', label: 'Trạng thái TK', value: 'Đang hoạt động', color: '#2563eb', bg: '#eff6ff' },
                ].map(stat => (
                  <Col md={4} key={stat.label}>
                    <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                      <Card.Body className="p-4 d-flex align-items-center gap-3">
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className="material-symbols-outlined" style={{ color: stat.color, fontSize: '24px' }}>{stat.icon}</span>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: TX2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                          <div style={{ fontSize: '20px', fontWeight: 800, color: TX, lineHeight: 1.2 }}>{stat.value}</div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Personal Info Card */}
              <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none', marginBottom: '24px' }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6 style={{ fontSize: '16px', fontWeight: 700, color: TX, margin: 0 }}>Thông tin cá nhân</h6>
                    <Button
                      onClick={openEdit}
                      size="sm"
                      style={{ background: G, border: 'none', borderRadius: '8px', fontWeight: 600, padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>edit</span>
                      Chỉnh sửa
                    </Button>
                  </div>
                  <Row className="g-3">
                    {[
                      { label: 'Họ và tên', value: profile?.fullName, icon: 'badge' },
                      { label: 'Tên đăng nhập', value: profile?.username, icon: 'person' },
                      { label: 'Email', value: profile?.email, icon: 'email' },
                      { label: 'Số điện thoại', value: profile?.phone, icon: 'phone' },
                      { label: 'Vai trò', value: profile?.role === 'player' ? 'Người chơi' : profile?.role, icon: 'manage_accounts' },
                      { label: 'Thành viên từ', value: memberSince, icon: 'calendar_today' },
                    ].map(field => (
                      <Col md={6} key={field.label}>
                        <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '14px 16px' }}>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: G }}>{field.icon}</span>
                            <span style={{ fontSize: '11px', color: TX2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: field.value ? TX : TX2 }}>
                            {field.value || 'Chưa cập nhật'}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card.Body>
              </Card>

              {/* Upgrade Banner */}
              {tier.next && (
                <Card style={{ borderRadius: '16px', background: `linear-gradient(135deg, ${G} 0%, #0f3d22 100%)`, border: 'none', color: W, position: 'relative', overflow: 'hidden' }}>
                  <Card.Body className="p-4">
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-30px', fontSize: '140px', fontWeight: 900, color: 'rgba(255,255,255,0.05)', lineHeight: 1, userSelect: 'none' }}>
                      {tier.next?.charAt(0)}
                    </div>
                    <Row className="align-items-center">
                      <Col>
                        <h6 style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                          Nâng cấp lên {tier.next}
                        </h6>
                        <p style={{ fontSize: '15px', margin: '0 0 4px', fontWeight: 700 }}>
                          Còn {(tier.nextPts - pts).toLocaleString('vi-VN')} điểm để đạt hạng {tier.next}!
                        </p>
                        <p style={{ fontSize: '13px', margin: 0, color: 'rgba(255,255,255,0.7)' }}>
                          Đặt thêm sân để tích lũy điểm và nhận ưu đãi hấp dẫn hơn.
                        </p>
                      </Col>
                      <Col xs="auto">
                        <Button
                          onClick={onFindVenues}
                          style={{ background: '#fff', color: G, border: 'none', borderRadius: '10px', fontWeight: 700, padding: '10px 20px', fontSize: '13px' }}
                        >
                          Đặt sân ngay →
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </Container>

      {/* ─── EDIT PROFILE MODAL ─── */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)} centered size="sm">
        <Modal.Header closeButton style={{ borderBottom: '1px solid #e2e8f0' }}>
          <Modal.Title style={{ fontSize: '16px', fontWeight: 700, color: TX }}>Chỉnh sửa hồ sơ</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {/* Avatar picker */}
          <div className="d-flex flex-column align-items-center mb-4">
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <img
                src={avatarPreview || profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(editForm.fullName || 'U')}&background=16a34a&color=fff&size=128`}
                alt="avatar"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #dcfce7' }}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, width: '26px', height: '26px', borderRadius: '50%', background: G, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#fff' }}>photo_camera</span>
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
            <span style={{ fontSize: '12px', color: TX2 }}>Nhấn biểu tượng để đổi ảnh</span>
          </div>

          {/* Fields */}
          {[
            { label: 'Họ và tên *', key: 'fullName', type: 'text', placeholder: 'Nhập tên đầy đủ' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'example@email.com' },
            { label: 'Số điện thoại', key: 'phone', type: 'tel', placeholder: '0901 234 567' },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: TX, display: 'block', marginBottom: '6px' }}>{field.label}</label>
              <input
                type={field.type}
                value={(editForm as any)[field.key]}
                onChange={e => setEditForm(f => ({ ...f, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '14px', color: TX }}
              />
            </div>
          ))}

          {saveError && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginTop: '4px' }}>
              ⚠️ {saveError}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #e2e8f0', padding: '16px 20px' }}>
          <Button variant="light" onClick={() => setShowEdit(false)} style={{ borderRadius: '8px', fontWeight: 600, fontSize: '14px' }}>
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{ background: G, border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '14px', minWidth: '120px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {saving ? <><Spinner size="sm" /><span>Đang lưu...</span></> : <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>save</span><span>Lưu thay đổi</span></>}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
