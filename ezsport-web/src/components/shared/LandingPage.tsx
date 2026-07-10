import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useAuth } from '../../context/AuthContext';

import FadingVideo from './FadingVideo';
import BlurText from './BlurText';
import { Arrow } from '../ui/LandingIcons';
import VenueCard from '../ui/VenueCard1';
import Footer from './Footer';
import { G, GL, GD, OG, W, SL, TX, TX2, glass } from '../../utils/theme';

// Helper to resolve court images to reliable local assets
const resolveCourtImage = (imgUrl: string, sportType?: string) => {
  const sport = (sportType || '').toLowerCase();
  if (!imgUrl || imgUrl.includes('unsplash.com') || imgUrl.includes('placeholder')) {
    if (sport.includes('pickleball')) return '/images/pickleball.png';
    if (sport.includes('badminton') || sport.includes('cầu lông')) return '/images/badminton.png';
    if (sport.includes('football') || sport.includes('bóng đá') || sport.includes('soccer')) return '/images/football.png';
    return '/images/pickleball.png'; // default
  }
  return imgUrl;
};

const getVenueSports = (court: any): string[] => {
  if (Array.isArray(court?.sportTypes) && court.sportTypes.length > 0) {
    return court.sportTypes;
  }

  if (court?.sportType) {
    return [court.sportType];
  }

  return ['Sports'];
};

// ─── MAIN ───────────────────────────────────────────────────────────────────
export const LandingPage: React.FC<{
  onExplore?: () => void;
  onLogin?: () => void;
  onRegisterVenue?: () => void;
  courts?: any[];
  venues?: any[];
}> = ({ courts = [], venues = [] }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const displayCourts = venues.length > 0 ? venues : courts;
  const f = "'Inter', 'Barlow', sans-serif";

  // Ref for venues section to enable auto-scroll after login
  const venuesSectionRef = React.useRef<HTMLElement>(null);
  
  // State for user dropdown menu
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // Auto-playing Promo Ads State
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const ads = [
    {
      badge: 'DEAL HỜI THỂ THAO MỚI',
      title: 'Pickleball Đồng Giá 99K/h',
      desc: 'Áp dụng cho mọi sân Pickleball thuộc hệ thống đối tác của EZSport vào khung giờ vàng từ 08:00 - 14:00. Chơi cực đã, giá cực êm!',
      code: 'EZPICKLE99',
      bg: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
      btnText: 'Đặt sân ngay',
      icon: 'sports_tennis'
    },
    {
      badge: 'QUÀ BẠN MỚI',
      title: 'Tặng 50K Lượt Đặt Đầu Tiên',
      desc: 'Nhập mã giảm giá ngay tại màn hình thanh toán để được giảm thẳng 50.000đ trên tổng hóa đơn. Áp dụng cho mọi bộ môn thể thao!',
      code: 'EZWELCOME50',
      bg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      btnText: 'Đăng ký nhận quà',
      icon: 'featured_seasonal_and_gifts'
    },
    {
      badge: 'EZSPORT PRO MEMBER',
      title: 'Hội Viên EZSport Pro - Tiết Kiệm 30%',
      desc: 'Đặt trước sân 7 ngày, ưu tiên giờ vàng, tặng nước uống miễn phí và miễn cọc thuê vợt. Nâng tầm phong cách sống năng động cùng chúng tôi.',
      code: 'EZPRO30',
      bg: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
      btnText: 'Tìm hiểu gói Pro',
      icon: 'workspace_premium'
    }
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to venues section after login
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('scrollToVenues') === 'true' && venuesSectionRef.current) {
      // Small delay to ensure page is fully rendered
      setTimeout(() => {
        venuesSectionRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        // Clean up URL parameter
        window.history.replaceState({}, '', window.location.pathname);
      }, 300);
    }
  }, []);

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showUserMenu && !target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <div style={{ fontFamily: f, background: SL, color: TX, overflowX: 'hidden', minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav className="landing-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 90,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        <div className="landing-nav-logo" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => navigate(ROUTES.LANDING)}>
          <img src="/logo3.png" alt="EZSport Logo" style={{ height: 60, width: 'auto', objectFit: 'contain', transform: 'scale(3.5)', transformOrigin: 'left center', marginLeft: '5px' }} />
        </div>
        <div className="landing-nav-links" style={{ display: 'flex', gap: 40 }}>
          {[
            { en: 'Bookings', vi: 'Đặt sân', onClick: () => navigate(ROUTES.MAP) },
            { en: 'Marketplace', vi: 'Cửa hàng', onClick: () => alert('Tính năng Cửa hàng sắp ra mắt!') },
            { en: 'Venues', vi: 'Địa điểm', onClick: () => navigate(ROUTES.MAP) },
            { en: 'Activities', vi: 'Hoạt động', onClick: () => navigate(ROUTES.PLAYMATES) }
          ].map(l => (
            <a key={l.en} href="#" onClick={(e) => { e.preventDefault(); l.onClick(); }} style={{ fontSize: 17, fontWeight: 700, color: TX2, textDecoration: 'none' }}>{l.vi}</a>
          ))}
        </div>
        <div className="landing-nav-actions" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {!isAuthenticated ? (
            <>
              <button onClick={() => navigate(ROUTES.LOGIN)} style={{
                background: 'transparent', color: G, border: `1.5px solid ${G}`, borderRadius: 999,
                padding: '12px 28px', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.2
              }}>
                Đăng nhập
              </button>
              <button onClick={() => navigate(ROUTES.MAP)} style={{
                ...glass(true), background: G, color: W, border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: 999, padding: '10px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 0.2,
                boxShadow: `0 4px 20px ${G}50`,
              }}>
                Đặt ngay <Arrow />
              </button>
            </>
          ) : (
            <div style={{ position: 'relative' }} data-user-menu>
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: 'rgba(26, 107, 60, 0.08)',
                  border: '1px solid rgba(26, 107, 60, 0.2)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: user?.avatar ? `url(${user.avatar}) center/cover` : 'linear-gradient(135deg, #1a6b3c 0%, #22c55e 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: W,
                  fontWeight: 700,
                  fontSize: 14,
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {!user?.avatar && (user?.fullName?.[0] || user?.username?.[0] || 'U')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: TX }}>{user?.fullName || user?.username}</span>
                  <span style={{ fontSize: 11, color: TX2, fontWeight: 500 }}>
                    {user?.role === 'owner' 
                      ? 'Chủ sân' 
                      : user?.role === 'admin' 
                      ? 'Quản trị viên' 
                      : user?.role === 'shop' 
                      ? 'Cửa hàng' 
                      : 'Người chơi'
                    }
                  </span>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: TX2 }}>
                  {showUserMenu ? 'expand_less' : 'expand_more'}
                </span>
              </div>
              
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'white',
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  minWidth: 220,
                  overflow: 'hidden',
                  zIndex: 1000
                }}>
                  {user?.role === 'owner' && (
                    <div 
                      onClick={() => { setShowUserMenu(false); navigate(ROUTES.OWNER_PAGE); }}
                      style={{
                        padding: '14px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        color: TX,
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 107, 60, 0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: G }}>dashboard</span>
                      Dashboard
                    </div>
                  )}
                  {user?.role === 'admin' && (
                    <div 
                      onClick={() => { setShowUserMenu(false); navigate(ROUTES.ADMIN_DASHBOARD); }}
                      style={{
                        padding: '14px 20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        fontSize: 14,
                        fontWeight: 600,
                        color: TX,
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 107, 60, 0.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20, color: G }}>admin_panel_settings</span>
                      Quản trị
                    </div>
                  )}
                  <div 
                    onClick={() => { setShowUserMenu(false); navigate(ROUTES.MAP); }}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      color: TX,
                      borderBottom: '1px solid rgba(0,0,0,0.06)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 107, 60, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: G }}>map</span>
                    Đặt sân
                  </div>
                  <div 
                    onClick={() => { 
                      setShowUserMenu(false); 
                      logout(); 
                      navigate(ROUTES.LANDING);
                    }}
                    style={{
                      padding: '14px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#ef4444',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.04)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#ef4444' }}>logout</span>
                    Đăng xuất
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO (Full-screen video background) ── */}
      <section className="landing-hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {/* Video BG */}
        <FadingVideo src="caulong.mp4" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />

        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(5,20,10,0.5) 0%, rgba(10,30,18,0.65) 55%, rgba(15,61,34,0.88) 100%)' }} />

        {/* Content */}
        <div className="landing-hero-content" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '120px 48px 80px', maxWidth: 900, width: '100%' }}>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999, padding: '7px 18px', marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: GL, boxShadow: `0 0 0 3px ${GL}40`, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: W, letterSpacing: 1.5, textTransform: 'uppercase' }}>CHƠI HẾT MÌNH - SỐNG TRỌN ĐAM MÊ</span>
          </motion.div>

          <BlurText
            className="landing-hero-title"
            text="Tương lai của quản lý & đặt sân thể thao"
            greenWords={['quản', 'lý', 'đặt', 'sân']}
            style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3, color: W, justifyContent: 'center', marginBottom: 24 }}
          />

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
            style={{ margin: '0 0 40px', fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', maxWidth: 540 }}>
            Nền tảng đặt sân thể thao số 1 Việt Nam. Đặt sân chất lượng cao ngay lập tức, không cần gọi điện thoại.
          </motion.p>

          <motion.div className="landing-hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
            style={{ display: 'flex', gap: 16, marginBottom: 64 }}>
            <button onClick={() => navigate(ROUTES.MAP)} style={{ background: G, color: W, border: 'none', borderRadius: 999, padding: '16px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, boxShadow: `0 12px 36px ${G}60` }}>
              Đặt sân ngay <Arrow />
            </button>
            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              style={{ ...glass(true), color: W, border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '16px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >
              Đăng ký chủ sân
            </button>
          </motion.div>

          <motion.div className="landing-stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            style={{ display: 'flex', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 24, overflow: 'hidden' }}>
            {[{ n: '5.2K+', l: 'Thành viên' }, { n: '98%', l: 'Tỉ lệ đặt sân' }, { n: '120+', l: 'Sân thể thao' }, { n: '4.9★', l: 'Đánh giá' }].map((s, i) => (
              <div key={s.l} style={{ padding: '20px 36px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.12)' : 'none', textAlign: 'center' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: W, letterSpacing: -1 }}>{s.n}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' }}>Cuộn xuống</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
        </motion.div>
      </section>


      {/* ── VENUES ── */}
      <section className="landing-section landing-venues" ref={venuesSectionRef} style={{ padding: '100px 64px', background: W }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div className="landing-section-heading" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: OG, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>⚽ Địa điểm nổi bật</div>
              <h2 style={{ margin: 0, fontSize: 48, fontWeight: 900, letterSpacing: -2, color: TX }}>Sân thể thao cao cấp </h2>
            </div>
            <button onClick={() => navigate(ROUTES.MAP)} style={{ background: 'none', border: `2px solid ${G}`, color: G, borderRadius: 999, padding: '11px 26px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              Xem tất cả <Arrow />
            </button>
          </motion.div>
          <div className="landing-venue-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {displayCourts && displayCourts.length > 0 ? (
              displayCourts.slice(0, 3).map((court, index) => (
                <VenueCard
                  key={court._id || index}
                  delay={index * 0.12}
                  name={court.name}
                  price={court.price ? (court.price.includes('/h') || court.price.includes('K') ? court.price : `${court.price}đ/h`) : '300.000đ/h'}
                  rating={court.reviewsCount > 0 ? String(court.rating.toFixed(1)) : 'Mới'}
                  area={court.location}
                  sport={getVenueSports(court)}
                  img={resolveCourtImage(court.image, getVenueSports(court)[0])}
                  onClick={() => navigate(`/venues/${court._id}`)}
                />
              ))
            ) : (
              <>
                <VenueCard delay={0} name="Tổ hợp Sân Skyline" price="350K/h" rating="4.9" area="Hải Châu, Đà Nẵng" sport="TENNIS"
                  img="/images/pickleball.png" onClick={() => navigate(ROUTES.MAP)} />
                <VenueCard delay={0.12} name="Tổ hợp Sân Padel Pulse" price="280K/h" rating="4.7" area="Thanh Khê, Đà Nẵng" sport="PADEL"
                  img="/images/badminton.png" onClick={() => navigate(ROUTES.MAP)} />
                <VenueCard delay={0.24} name="Trung tâm Thể thao Elite" price="450K/h" rating="5.0" area="Ngũ Hành Sơn" sport="ĐA NĂNG"
                  img="/images/football.png" onClick={() => navigate(ROUTES.MAP)} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER CAROUSEL ── */}
      <section className="landing-section landing-promo-section" style={{ padding: '30px 64px 80px', background: W }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div
            className="landing-promo"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              borderRadius: 32,
              background: ads[currentSlide].bg,
              padding: '60px 80px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              color: W
            }}
          >
            {/* Background graphic details */}
            <div style={{ position: 'absolute', right: '-60px', bottom: '-60px', fontSize: '220px', fontWeight: 950, color: 'rgba(255,255,255,0.05)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              PROMO
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 48,
              position: 'relative',
              zIndex: 2
            }}>
              {/* Left Side Info */}
              <div style={{ flex: '1 1 580px' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 999,
                  padding: '6px 16px',
                  marginBottom: 24
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: W }}>{ads[currentSlide].icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: W, letterSpacing: 1.5, textTransform: 'uppercase' }}>{ads[currentSlide].badge}</span>
                </div>

                <h2 style={{ fontSize: 44, fontWeight: 900, color: W, letterSpacing: -2, margin: '0 0 16px', lineHeight: 1.15 }}>
                  {ads[currentSlide].title}
                </h2>

                <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.85)', margin: '0 0 32px', maxWidth: 620 }}>
                  {ads[currentSlide].desc}
                </p>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate(ROUTES.MAP)} style={{
                    background: W,
                    color: '#0f3d22',
                    border: 'none',
                    borderRadius: 999,
                    padding: '14px 36px',
                    fontSize: 15,
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                  }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                    {ads[currentSlide].btnText}
                  </button>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1.5px dashed rgba(255,255,255,0.4)',
                    borderRadius: 14,
                    padding: '10px 20px',
                    gap: 12
                  }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>MÃ GIẢM:</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: W, letterSpacing: 1 }}>{ads[currentSlide].code}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(ads[currentSlide].code);
                        alert(`🎉 Đã sao chép mã ưu đãi thành công: ${ads[currentSlide].code}`);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: W,
                        padding: 0,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Sao chép mã"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>content_copy</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Side Icon Container */}
              <div className="landing-promo-icon" style={{
                flex: '1 1 250px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.15)'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '76px', color: W }}>
                    {ads[currentSlide].icon}
                  </span>
                </div>
              </div>
            </div>

            {/* Slider Dots indicators */}
            <div style={{
              position: 'absolute',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 8,
              zIndex: 3
            }}>
              {ads.map((_, idx) => (
                <span
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: idx === currentSlide ? 28 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: idx === currentSlide ? W : 'rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section className="landing-section" style={{ padding: '100px 64px', background: SL }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 48, fontWeight: 900, letterSpacing: -2, color: TX }}>Tại sao chọn EZSport?</h2>
            <p style={{ margin: 0, fontSize: 17, color: TX2, maxWidth: 500, marginInline: 'auto', lineHeight: 1.7 }}>
              Chúng tôi tái định nghĩa trải nghiệm thể thao với công nghệ tiên phong và tập trung gắn kết cộng đồng.
            </p>
          </motion.div>
          <div className="landing-feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
            {[
              { icon: 'auto_awesome', title: 'Đặt sân thông minh bằng AI', text: 'Thuật toán gợi ý khung giờ đặt sân tối ưu dựa trên lịch sử hoạt động của bạn.', iconColor: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' },
              { icon: 'explore', title: 'Bản đồ trực quan', text: 'Xem các sân thể thao còn trống quanh thành phố của bạn theo thời gian thực dễ dàng.', iconColor: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
              { icon: 'shopping_bag', title: 'Cửa hàng thể thao', text: 'Mua sắm dụng cụ tập luyện, đặt lịch huấn luyện viên và cập nhật sự kiện thể thao.', iconColor: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
              { icon: 'analytics', title: 'Quản lý chuyên nghiệp', text: 'Công cụ đắc lực dành cho chủ sân quản lý thành viên, doanh thu và định giá linh hoạt.', iconColor: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                style={{ background: W, borderRadius: 24, padding: '32px 28px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.3s' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: f.bgColor,
                  color: f.iconColor,
                  marginBottom: 20
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>{f.icon}</span>
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800, color: TX }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: TX2, lineHeight: 1.7 }}>{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-section landing-cta" style={{ padding: '100px 64px', background: GD, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: `${G}60` }} />
        <div style={{ position: 'absolute', bottom: -60, left: 100, width: 240, height: 240, borderRadius: '50%', background: `${OG}30` }} />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="landing-cta-title" style={{ margin: '0 0 20px', fontSize: 56, fontWeight: 900, color: W, letterSpacing: -2, lineHeight: 1.1 }}>
              Sẵn sàng nâng tầm<br /><span style={{ color: '#86efac' }}>Cuộc chơi của bạn?</span>
            </h2>
            <p style={{ margin: '0 0 44px', fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              Tham gia cùng hơn 5,200+ người chơi đang trải nghiệm đặt sân thông minh cùng EZSport.
            </p>
            <div className="landing-cta-actions" style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button onClick={() => navigate(ROUTES.MAP)} style={{ background: W, color: GD, border: 'none', borderRadius: 999, padding: '16px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                Khám phá sân ngay <Arrow />
              </button>
              <button onClick={() => navigate(ROUTES.REGISTER)} style={{ ...glass(true), background: 'transparent', color: W, borderRadius: 999, padding: '16px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
                Đăng ký chủ sân
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 8px rgba(34,197,94,0)} }`}</style>
    </div>
  );
};
