import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { G, W, TX, TX2, SL } from '../../utils/theme';
import Navigation from '../shared/Navigation';

interface ProfilePageProps {
  onGoHome: () => void;
  onFindVenues: () => void;
  onPageChange?: (page: 'landing' | 'app' | 'venues' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates') => void;
  onLogoClick?: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onGoHome, onFindVenues, onPageChange, onLogoClick }) => {
  const [activeTab, setActiveTab] = useState('all');

  const sidebarMenu = [
    { id: 'history', icon: 'event_note', label: 'Lịch sử đặt sân', active: true },
    { id: 'tournaments', icon: 'emoji_events', label: 'Giải đấu của tôi' },
    { id: 'orders', icon: 'receipt_long', label: 'Đơn hàng' },
    { id: 'settings', icon: 'settings', label: 'Cài đặt tài khoản' },
  ];

  return (
    <div style={{ backgroundColor: SL, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      {/* Top Navbar */}
      <Navigation
        onAddCourtClick={() => { }}
        onLogoClick={onLogoClick || onGoHome}
        onLoginClick={() => { }}
        currentPage="profile"
        onPageChange={onPageChange || (() => { })}
      />

      <Container fluid className="flex-grow-1 p-0" style={{ paddingTop: '72px' /* height of nav */ }}>
        <Row className="g-0 h-100">

          {/* ─── SIDEBAR ─── */}
          <Col md={3} lg={2} style={{
            backgroundColor: W, borderRight: '1px solid #e2e8f0', minHeight: 'calc(100vh - 72px)',
            display: 'flex', flexDirection: 'column'
          }}>
            <div className="p-4 d-flex flex-column align-items-center text-center border-bottom" style={{ borderColor: '#e2e8f0' }}>
              <img
                src="https://i.pravatar.cc/150?img=11"
                alt="Nguyễn Sư Minh Nhật"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px' }}
              />
              <h5 style={{ fontSize: '18px', fontWeight: 700, color: G, marginBottom: '4px' }}>Nguyễn Sư Minh Nhật</h5>
              <div style={{ fontSize: '12px', color: TX2, marginBottom: '12px' }}>Thành viên từ T6/2026</div>
              <Badge style={{ background: '#fef08a', color: '#854d0e', padding: '6px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>emoji_events</span>
                Thành viên Vàng
              </Badge>
            </div>

            <div className="p-4 border-bottom" style={{ borderColor: '#e2e8f0' }}>
              <div className="d-flex justify-content-between align-items-end mb-2">
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: G }}>2.450</h3>
                <span style={{ fontSize: '12px', color: TX2, fontWeight: 600, paddingBottom: '4px' }}>Điểm</span>
              </div>
              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: '80%', height: '100%', background: G, borderRadius: '999px' }} />
              </div>
              <div style={{ fontSize: '11px', color: TX2, display: 'flex', justifyContent: 'space-between' }}>
                <span>Vàng</span>
                <span>Kim cương (Còn 550 điểm)</span>
              </div>
            </div>

            <div className="flex-grow-1 p-3">
              {sidebarMenu.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                    background: item.active ? '#f0fdf4' : 'transparent',
                    color: item.active ? G : TX,
                    borderLeft: item.active ? `4px solid ${G}` : '4px solid transparent',
                    fontWeight: item.active ? 600 : 500,
                    transition: 'all 0.2s'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span style={{ fontSize: '14px' }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="p-4 mt-auto">
              <Button onClick={onFindVenues} style={{ width: '100%', background: G, border: 'none', borderRadius: '8px', padding: '10px 0', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                Đặt sân ngay
              </Button>
            </div>
          </Col>

          {/* ─── MAIN CONTENT ─── */}
          <Col md={9} lg={10} className="p-5" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 72px)' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

              <h2 style={{ fontSize: '28px', fontWeight: 800, color: TX, marginBottom: '8px', letterSpacing: '-0.5px' }}>Lịch sử đặt sân</h2>
              <p style={{ color: TX2, fontSize: '15px', marginBottom: '32px' }}>Quản lý các lượt đặt sân và hoạt động thể thao của bạn.</p>

              {/* Tabs */}
              <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '32px' }}>
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'upcoming', label: 'Sắp diễn ra' },
                  { id: 'completed', label: 'Đã hoàn thành' },
                  { id: 'cancelled', label: 'Đã hủy' }
                ].map(tab => (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '0 0 12px 0', fontSize: '14px', fontWeight: activeTab === tab.id ? 700 : 500,
                      color: activeTab === tab.id ? G : TX2, cursor: 'pointer', position: 'relative'
                    }}
                  >
                    {tab.label}
                    {activeTab === tab.id && (
                      <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '3px', background: G, borderRadius: '3px 3px 0 0' }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Booking List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>

                {/* Item 1: Upcoming */}
                <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <Card.Body className="p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-4">
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ color: '#3b82f6' }}>sports_tennis</span>
                      </div>
                      <div>
                        <h6 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: TX }}>Elite Pickleball Arena</h6>
                        <div style={{ fontSize: '13px', color: TX2 }}>Pickleball • Court 3</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: G }}>schedule</span>
                      <div style={{ fontSize: '13px', color: TX, fontWeight: 600 }}>
                        Hôm nay 16:00 <span style={{ color: TX2, fontWeight: 400 }}>(1,5 giờ)</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: G }}>240.000 ₫</div>
                      <div style={{ fontSize: '12px', color: TX2 }}>Đã trả trước</div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <Badge style={{ background: '#eff6ff', color: '#1d4ed8', padding: '8px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                        Sắp diễn ra
                      </Badge>
                      <span className="material-symbols-outlined" style={{ color: TX2, cursor: 'pointer' }}>more_vert</span>
                    </div>
                  </Card.Body>
                </Card>

                {/* Item 2: Completed */}
                <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
                  <Card.Body className="p-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center gap-4">
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined" style={{ color: '#64748b' }}>sports_tennis</span>
                      </div>
                      <div>
                        <h6 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: TX }}>Riverside Sports Club</h6>
                        <div style={{ fontSize: '13px', color: TX2 }}>Tennis • Court 12</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: TX2 }}>calendar_today</span>
                      <div style={{ fontSize: '13px', color: TX, fontWeight: 600 }}>
                        Thứ Bảy, 24 Tháng 10, 10:00 <span style={{ color: TX2, fontWeight: 400 }}>(2 giờ)</span>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: TX }}>350.000 ₫</div>
                      <div style={{ fontSize: '12px', color: TX2 }}>Đã hoàn thành</div>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <span style={{ fontSize: '13px', color: TX2, fontWeight: 600, marginRight: '8px' }}>Đã hoàn thành</span>
                      <Button variant="outline-primary" style={{ borderRadius: '999px', padding: '6px 20px', fontSize: '13px', fontWeight: 600, borderColor: '#cbd5e1', color: TX }}>
                        Đặt lại
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

              </div>

              {/* Empty State Block */}
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '48px 24px', textAlign: 'center', marginBottom: '32px', border: '1px dashed #cbd5e1' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: W, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '28px', color: TX2 }}>history</span>
                </div>
                <h5 style={{ fontSize: '18px', fontWeight: 700, color: TX, marginBottom: '8px' }}>Bạn chưa có lượt đặt sân nào gần đây</h5>
                <p style={{ color: TX2, fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Hãy bắt đầu hành trình nâng cao sức khỏe của bạn ngay hôm nay bằng cách tìm kiếm và đặt sân tại các câu lạc bộ hàng đầu.
                </p>
                <Button onClick={onFindVenues} style={{ background: G, border: 'none', borderRadius: '8px', padding: '10px 24px', fontWeight: 600, fontSize: '14px' }}>
                  Tìm sân ngay
                </Button>
              </div>

              {/* Stats Row */}
              <Row className="g-4">
                <Col md={8}>
                  <Card style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'none', height: '100%' }}>
                    <Card.Body className="p-4">
                      <h6 style={{ fontSize: '11px', fontWeight: 700, color: TX2, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px' }}>Thống kê hoạt động</h6>
                      <Row>
                        <Col xs={4}>
                          <div style={{ fontSize: '32px', fontWeight: 800, color: G, lineHeight: 1 }}>12</div>
                          <div style={{ fontSize: '12px', color: TX2, marginTop: '8px' }}>Giờ chơi tháng này</div>
                        </Col>
                        <Col xs={4} style={{ borderLeft: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '32px', fontWeight: 800, color: '#3b82f6', lineHeight: 1 }}>5</div>
                          <div style={{ fontSize: '12px', color: TX2, marginTop: '8px' }}>Đối thủ tham gia</div>
                        </Col>
                        <Col xs={4} style={{ borderLeft: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '32px', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>Gold</div>
                          <div style={{ fontSize: '12px', color: TX2, marginTop: '8px' }}>Hạng thành viên</div>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card style={{ borderRadius: '16px', background: G, border: 'none', color: W, height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <Card.Body className="p-4 d-flex flex-column justify-content-center">
                      <div style={{ position: 'absolute', right: '-20px', bottom: '-30px', fontSize: '140px', fontWeight: 900, color: 'rgba(255,255,255,0.06)', lineHeight: 1, userSelect: 'none' }}>
                        D
                      </div>
                      <h6 style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Ưu đãi Diamond</h6>
                      <p style={{ fontSize: '14px', margin: '0 0 16px 0', lineHeight: 1.5, fontWeight: 500 }}>
                        Nâng cấp để nhận giảm giá 15% cho mọi lượt đặt sân.
                      </p>
                      <div style={{ fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        Khám phá ngay <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
