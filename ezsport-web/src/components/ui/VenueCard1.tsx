import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin } from './LandingIcons';
import { G, W, OG, TX, TX2, glass } from '../../utils/theme';

const SPORT_LABELS: Record<string, string> = {
  badminton: 'Cầu lông',
  pickleball: 'Pickleball',
  soccer: 'Bóng đá',
  football: 'Bóng đá',
  tennis: 'Tennis',
  basketball: 'Bóng rổ',
};

const normalizeSports = (sport: string | string[]) => {
  const rawSports = Array.isArray(sport) ? sport : String(sport || '').split(',');
  const uniqueSports = Array.from(
    new Set(
      rawSports
        .map(item => String(item).trim())
        .filter(Boolean)
    )
  );

  return uniqueSports.length > 0 ? uniqueSports : ['Sports'];
};

const formatSportLabel = (sport: string) => {
  const key = sport.toLowerCase();
  return (SPORT_LABELS[key] || sport).toUpperCase();
};

const formatStartingPrice = (price: string) => {
  const cleanPrice = price.trim();
  const normalizedPrice = cleanPrice
    .replace(/^chỉ\s*từ\s+/i, '')
    .replace(/^từ\s+/i, '')
    .trim();
  const lowestPrice = normalizedPrice.split(/\s*(?:-|–|—|to|đến)\s*/i)[0]?.trim() || normalizedPrice;
  const priceOnly = lowestPrice
    .replace(/\s*\/\s*(h|giờ)\s*$/i, '')
    .replace(/\s+giờ\s*$/i, '')
    .trim();
  const hasCurrency = /(đ|vnd|vnđ|k)$/i.test(priceOnly);
  const displayPrice = `${hasCurrency ? priceOnly : `${priceOnly}đ`}/h`;

  return `Chỉ từ ${displayPrice}`;
};

const VenueCard: React.FC<{ name: string; price: string; rating: string; area: string; sport: string | string[]; img: string; delay: number; onClick?: () => void }> =
  ({ name, price, rating, area, sport, img, delay, onClick }) => {
    const [hov, setHov] = useState(false);
    const sports = useMemo(() => normalizeSports(sport), [sport]);
    const visibleSports = sports.slice(0, 2);
    const hiddenSportsCount = Math.max(sports.length - visibleSports.length, 0);

    return (
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay }}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        onClick={onClick}
        style={{
          borderRadius: 28, overflow: 'hidden', cursor: 'pointer', position: 'relative',
          boxShadow: hov ? '0 32px 64px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.08)',
          transform: hov ? 'scale(1.03) translateY(-6px)' : 'scale(1) translateY(0)',
          transition: 'all 0.35s ease', background: W,
        }}>
        <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
          <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hov ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.5s ease', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', top: 14, left: 14, right: 88, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {visibleSports.map((item) => (
              <div key={item} style={{ background: OG, color: W, borderRadius: 999, padding: '4px 10px', fontSize: 10, fontWeight: 800, lineHeight: 1.1, letterSpacing: 0.4 }}>
                {formatSportLabel(item)}
              </div>
            ))}
            {hiddenSportsCount > 0 && (
              <div style={{ ...glass(true), color: W, borderRadius: 999, padding: '4px 9px', fontSize: 10, fontWeight: 800, lineHeight: 1.1 }}>
                +{hiddenSportsCount}
              </div>
            )}
          </div>
          <div style={{ position: 'absolute', top: 14, right: 14, ...glass(true), borderRadius: 999, padding: '5px 13px', color: W, fontWeight: 700, fontSize: 13 }}>{formatStartingPrice(price)}</div>
          <div style={{ position: 'absolute', bottom: 14, left: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star /><span style={{ color: W, fontSize: 13, fontWeight: 700 }}>{rating}</span>
          </div>
        </div>
        <div style={{ padding: '20px 22px' }}>
          <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: TX, letterSpacing: -0.3 }}>{name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: TX2, fontSize: 12 }}>
            <MapPin />{area}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); if (onClick) onClick(); }} 
            style={{ marginTop: 16, width: '100%', background: G, color: W, border: 'none', borderRadius: 999, padding: '11px 0', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: 0.3 }}
          >
            Đặt sân ngay
          </button>
        </div>
      </motion.div>
    );
  };

export default VenueCard;
