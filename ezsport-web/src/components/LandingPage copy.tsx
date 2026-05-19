import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ─── PALETTE ────────────────────────────────────────────────────────────────
const G = '#1a6b3c';   // Forest Green
const GL = '#22c55e';  // Green Light (pulse)
const GD = '#0f3d22';  // Green Dark
const OG = '#c2632a';  // Clay Orange
const W = '#ffffff';
const SL = '#f8fafc';  // slate-50
const TX = '#0f172a';  // text
const TX2 = '#64748b'; // text muted

// ─── GLASS STYLES ───────────────────────────────────────────────────────────
const glass = (strong = false): React.CSSProperties => ({
  background: strong ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.12)',
  backdropFilter: `blur(${strong ? 40 : 12}px)`,
  WebkitBackdropFilter: `blur(${strong ? 40 : 12}px)`,
  border: '1px solid rgba(255,255,255,0.35)',
  boxShadow: strong
    ? '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.4)'
    : '0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.3)',
});

// ─── FADING VIDEO ───────────────────────────────────────────────────────────
const FadingVideo: React.FC<{ src: string; style?: React.CSSProperties; className?: string }> = ({ src, style, className }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const fadingOut = useRef(false);
  const raf = useRef<number | null>(null);

  const fadeTo = (target: number, ms: number) => {
    if (raf.current) cancelAnimationFrame(raf.current);
    const v = ref.current; if (!v) return;
    const start = parseFloat(v.style.opacity) || 0, t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1);
      v.style.opacity = String(start + (target - start) * p);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  return (
    <video
      ref={ref} src={src} muted playsInline preload="auto"
      style={{ ...style, opacity: 0 }} className={className}
      onLoadedData={() => { ref.current!.play().catch(() => { }); fadeTo(1, 600); }}
      onTimeUpdate={() => {
        const v = ref.current!;
        if (!fadingOut.current && v.duration - v.currentTime <= 0.55) {
          fadingOut.current = true; fadeTo(0, 500);
        }
      }}
      onEnded={() => {
        const v = ref.current!; v.style.opacity = '0';
        setTimeout(() => { v.currentTime = 0; v.play().catch(() => { }); fadingOut.current = false; fadeTo(1, 600); }, 100);
      }}
    />
  );
};

// ─── BLUR TEXT ──────────────────────────────────────────────────────────────
const BlurText: React.FC<{ text: string; style?: React.CSSProperties; greenWords?: string[] }> = ({ text, style, greenWords = [] }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: '0 0.25em', ...style }}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i}
          initial={{ filter: 'blur(12px)', opacity: 0, y: 40 }}
          animate={visible ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, ease: 'easeOut', delay: i * 0.08 }}
          style={{ display: 'inline-block', color: greenWords.includes(w) ? G : 'inherit' }}
        >{w}</motion.span>
      ))}
    </div>
  );
};

// ─── ICONS ──────────────────────────────────────────────────────────────────
const Arrow = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>;
const Star = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
const MapPin = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;

// ─── VENUE CARD ─────────────────────────────────────────────────────────────
const VenueCard: React.FC<{ name: string; price: string; rating: string; area: string; sport: string; img: string; delay: number }> =
  ({ name, price, rating, area, sport, img, delay }) => {
    const [hov, setHov] = useState(false);
    return (
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        style={{
          borderRadius: 28, overflow: 'hidden', cursor: 'pointer', position: 'relative',
          boxShadow: hov ? '0 32px 64px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.08)',
          transform: hov ? 'scale(1.03) translateY(-6px)' : 'scale(1) translateY(0)',
          transition: 'all 0.35s ease', background: W,
        }}>
        <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
          <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.5s ease', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', top: 14, left: 14, background: OG, color: W, borderRadius: 999, padding: '4px 12px', fontSize: 11, fontWeight: 700 }}>{sport}</div>
          <div style={{ position: 'absolute', top: 14, right: 14, ...glass(true), borderRadius: 999, padding: '5px 13px', color: W, fontWeight: 700, fontSize: 13 }}>{price}</div>
          <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star /><span style={{ color: W, fontSize: 13, fontWeight: 700 }}>{rating}</span>
          </div>
        </div>
        <div style={{ padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: TX, letterSpacing: -0.3 }}>{name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: TX2, fontSize: 12 }}>
            <MapPin />{area}
          </div>
          <button style={{ marginTop: 16, width: '100%', background: G, color: W, border: 'none', borderRadius: 999, padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: 0.3 }}>
            Đặt sân ngay
          </button>
        </div>
      </motion.div>
    );
  };

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

// ─── MAIN ───────────────────────────────────────────────────────────────────
export const LandingPage: React.FC<{
  onExplore: () => void;
  onLogin?: () => void;
  onRegisterVenue?: () => void;
  courts?: any[];
}> = ({ onExplore, onLogin, onRegisterVenue, courts = [] }) => {
  const f = "'Inter', 'Barlow', sans-serif";

  return (
    <div style={{ fontFamily: f, background: SL, color: TX, overflowX: 'hidden', minHeight: '100vh' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, height: 90,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo3.png" alt="EZSport Logo" style={{ height: 60, width: 'auto', objectFit: 'contain', transform: 'scale(3.5)', transformOrigin: 'left center', marginLeft: '5px' }} />
        </div>
        <div style={{ display: 'flex', gap: 40 }}>
          {[
            { en: 'Bookings', vi: 'Đặt sân' },
            { en: 'Marketplace', vi: 'Cửa hàng' },
            { en: 'Venues', vi: 'Địa điểm' },
            { en: 'Activities', vi: 'Hoạt động' }
          ].map(l => (
            <a key={l.en} href="#" style={{ fontSize: 17, fontWeight: 700, color: TX2, textDecoration: 'none' }}>{l.vi}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <button onClick={onLogin} style={{
            background: 'transparent', color: G, border: `1.5px solid ${G}`, borderRadius: 999,
            padding: '12px 28px', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: 0.2
          }}>
            Đăng nhập
          </button>
          <button onClick={onExplore} style={{
            ...glass(true), background: G, color: W, border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 999, padding: '10px 26px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8, letterSpacing: 0.2,
            boxShadow: `0 4px 20px ${G}50`,
          }}>
            Đặt ngay <Arrow />
          </button>
        </div>
      </nav>

      {/* ── HERO (Full-screen video background) ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {/* Video BG */}
        <FadingVideo src="caulong.mp4" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />

        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(5,20,10,0.5) 0%, rgba(10,30,18,0.65) 55%, rgba(15,61,34,0.88) 100%)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '120px 48px 80px', maxWidth: 900, width: '100%' }}>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999, padding: '7px 18px', marginBottom: 28 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: GL, boxShadow: `0 0 0 3px ${GL}40`, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: W, letterSpacing: 1.5, textTransform: 'uppercase' }}>CHƠI HẾT MÌNH - SỐNG TRỌN ĐAM MÊ</span>
          </motion.div>

          <BlurText
            text="Tương lai của quản lý & đặt sân thể thao"
            greenWords={['quản', 'lý', 'đặt', 'sân']}
            style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05, letterSpacing: -3, color: W, justifyContent: 'center', marginBottom: 24 }}
          />

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
            style={{ margin: '0 0 40px', fontSize: 18, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', maxWidth: 540 }}>
            Nền tảng đặt sân thể thao số 1 Việt Nam. Đặt sân chất lượng cao ngay lập tức, không cần gọi điện thoại.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6 }}
            style={{ display: 'flex', gap: 16, marginBottom: 64 }}>
            <button onClick={onExplore} style={{ background: G, color: W, border: 'none', borderRadius: 999, padding: '16px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, boxShadow: `0 12px 36px ${G}60` }}>
              Đặt sân ngay <Arrow />
            </button>
            <button
              onClick={onRegisterVenue}
              style={{ ...glass(true), color: W, border: '1.5px solid rgba(255,255,255,0.35)', borderRadius: 999, padding: '16px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >
              Đăng ký chủ sân
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
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
      <section style={{ padding: '100px 64px', background: W }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ marginBottom: 56, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: OG, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>⚽ Địa điểm nổi bật</div>
              <h2 style={{ margin: 0, fontSize: 48, fontWeight: 900, letterSpacing: -2, color: TX }}>Sân thể thao cao cấp gần bạn</h2>
            </div>
            <button onClick={onExplore} style={{ background: 'none', border: `2px solid ${G}`, color: G, borderRadius: 999, padding: '11px 26px', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              Xem tất cả <Arrow />
            </button>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
            {courts && courts.length > 0 ? (
              courts.slice(0, 3).map((court, index) => (
                <VenueCard
                  key={court._id || index}
                  delay={index * 0.12}
                  name={court.name}
                  price={court.price ? (court.price.includes('/h') || court.price.includes('K') ? court.price : `${court.price}đ/h`) : '300.000đ/h'}
                  rating={court.rating ? String(court.rating) : '4.5'}
                  area={court.location}
                  sport={(court.sportType || 'SPORTS').toUpperCase()}
                  img={resolveCourtImage(court.image, court.sportType)}
                />
              ))
            ) : (
              <>
                <VenueCard delay={0} name="Tổ hợp Sân Skyline" price="350K/h" rating="4.9" area="Hải Châu, Đà Nẵng" sport="TENNIS"
                  img="/images/pickleball.png" />
                <VenueCard delay={0.12} name="Tổ hợp Sân Padel Pulse" price="280K/h" rating="4.7" area="Thanh Khê, Đà Nẵng" sport="PADEL"
                  img="/images/badminton.png" />
                <VenueCard delay={0.24} name="Trung tâm Thể thao Elite" price="450K/h" rating="5.0" area="Ngũ Hành Sơn" sport="ĐA NĂNG"
                  img="/images/football.png" />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── WHY ── */}
      <section style={{ padding: '100px 64px', background: SL }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 48, fontWeight: 900, letterSpacing: -2, color: TX }}>Tại sao chọn EZSport?</h2>
            <p style={{ margin: 0, fontSize: 17, color: TX2, maxWidth: 500, marginInline: 'auto', lineHeight: 1.7 }}>
              Chúng tôi tái định nghĩa trải nghiệm thể thao với công nghệ tiên phong và tập trung gắn kết cộng đồng.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22 }}>
            {[
              { emoji: '⚡', title: 'Đặt sân thông minh bằng AI', text: 'Thuật toán gợi ý khung giờ đặt sân tối ưu dựa trên lịch sử hoạt động của bạn.' },
              { emoji: '🗺️', title: 'Bản đồ trực quan', text: 'Xem các sân thể thao còn trống quanh thành phố của bạn theo thời gian thực dễ dàng.' },
              { emoji: '🛍️', title: 'Cửa hàng thể thao', text: 'Mua sắm dụng cụ tập luyện, đặt lịch huấn luyện viên và cập nhật sự kiện thể thao.' },
              { emoji: '📊', title: 'Quản lý chuyên nghiệp', text: 'Công cụ đắc lực dành cho chủ sân quản lý thành viên, doanh thu và định giá linh hoạt.' },
            ].map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                style={{ background: W, borderRadius: 24, padding: '32px 28px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.3s' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.emoji}</div>
                <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 800, color: TX }}>{f.title}</h3>
                <p style={{ margin: 0, fontSize: 14, color: TX2, lineHeight: 1.7 }}>{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 64px', background: GD, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', background: `${G}60` }} />
        <div style={{ position: 'absolute', bottom: -60, left: 100, width: 240, height: 240, borderRadius: '50%', background: `${OG}30` }} />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 56, fontWeight: 900, color: W, letterSpacing: -2, lineHeight: 1.1 }}>
              Sẵn sàng nâng tầm<br /><span style={{ color: '#86efac' }}>Cuộc chơi của bạn?</span>
            </h2>
            <p style={{ margin: '0 0 44px', fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
              Tham gia cùng hơn 5,200+ người chơi đang trải nghiệm đặt sân thông minh cùng EZSport.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button onClick={onExplore} style={{ background: W, color: GD, border: 'none', borderRadius: 999, padding: '16px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                Khám phá sân ngay <Arrow />
              </button>
              <button onClick={onRegisterVenue} style={{ ...glass(true), background: 'transparent', color: W, borderRadius: 999, padding: '16px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer' }}>
                Đăng ký chủ sân
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#07160a', color: 'rgba(255,255,255,0.7)', padding: '72px 64px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Main Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 48, marginBottom: 56 }}>

            {/* Column 1: Brand & Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ width: 150, height: 48, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'visible' }}>
                <img
                  src="/logo3.png"
                  alt="EZSport Logo"
                  style={{
                    height: 48,
                    width: 'auto',
                    objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                    transform: 'scale(3.2)',
                    transformOrigin: 'left center',
                    position: 'absolute',
                    left: 0
                  }}
                />
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '12px 0 0' }}>
                Hệ sinh thái quản lý và đặt sân thể thao số 1 Việt Nam. Đồng hành cùng các chủ sân và người chơi thể thao nâng tầm trải nghiệm mỗi ngày.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '13.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ color: GL, fontSize: '18px' }}>call</span>
                  <a href="tel:0905123456" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 600 }}>0905 123 456</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ color: GL, fontSize: '18px' }}>mail</span>
                  <a href="mailto:leovant@ezsport.vn" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 600 }}>leovant@ezsport.vn</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ color: GL, fontSize: '18px' }}>location_on</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>120 Nguyễn Văn Linh, Hải Châu, Đà Nẵng</span>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>Hệ sinh thái</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '14.5px' }}>
                {[
                  { en: 'Bookings', vi: 'Đặt sân nhanh' },
                  { en: 'Marketplace', vi: 'Cửa hàng thiết bị' },
                  { en: 'Venues', vi: 'Bản đồ địa điểm' },
                  { en: 'Activities', vi: 'Hoạt động thể thao' }
                ].map(l => (
                  <a key={l.en} href="#" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>{l.vi}</a>
                ))}
              </div>
            </div>

            {/* Column 3: Social & Partnership */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h4 style={{ color: '#ffffff', fontSize: '16px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>Kết nối xã hội</h4>
              <p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
                Theo dõi ưu đãi đặc quyền, sự kiện giải đấu kịch tính và các cập nhật mới nhất từ EZSport.
              </p>

              {/* Social Icons row */}
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  {
                    n: 'Facebook',
                    l: 'https://facebook.com',
                    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                  },
                  {
                    n: 'Instagram',
                    l: 'https://instagram.com',
                    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                  },
                  {
                    n: 'YouTube',
                    l: 'https://youtube.com',
                    svg: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
                  },
                  {
                    n: 'Zalo',
                    l: 'https://zalo.me',
                    svg: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        <text x="6.5" y="15.5" fill="currentColor" fontSize="11" fontWeight="950" fontFamily="system-ui, sans-serif">Z</text>
                      </svg>
                    )
                  }
                ].map(s => (
                  <a
                    key={s.n}
                    href={s.l}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.n}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', color: '#ffffff',
                      textDecoration: 'none', transition: 'all 0.3s ease',
                      border: '1px solid rgba(255,255,255,0.05)',
                      justifyContent: 'center'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = G;
                      e.currentTarget.style.boxShadow = `0 4px 14px ${G}70`;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {s.svg}
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              © 2026 Bản quyền thuộc về EZSport. Bảo lưu mọi quyền.
            </span>
            <div style={{ display: 'flex', gap: 28 }}>
              {[
                { en: 'Terms', vi: 'Điều khoản dịch vụ' },
                { en: 'Privacy', vi: 'Chính sách bảo mật' }
              ].map(l => (
                <a key={l.en} href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ffffff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>{l.vi}</a>
              ))}
            </div>
          </div>

        </div>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,0.4)} 50%{box-shadow:0 0 0 8px rgba(34,197,94,0)} }`}</style>
    </div>
  );
};
