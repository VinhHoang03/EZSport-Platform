import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin } from './LandingIcons';
import { G, W, OG, TX, TX2, glass } from '../utils/theme';

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

export default VenueCard;
