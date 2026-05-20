import React from 'react';

const Footer: React.FC = () => {
  return (
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
                <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '18px' }}>call</span>
                <a href="tel:0905123456" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 600 }}>0905 123 456</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '18px' }}>mail</span>
                <a href="mailto:leovant@ezsport.vn" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 600 }}>leovant@ezsport.vn</a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="material-symbols-outlined" style={{ color: '#22c55e', fontSize: '18px' }}>location_on</span>
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
                    e.currentTarget.style.background = '#1a6b3c';
                    e.currentTarget.style.boxShadow = `0 4px 14px #1a6b3c70`;
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
  );
};

export default Footer;
