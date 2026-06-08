import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

interface VenueCardProps {
  id: number | string;
  name: string;
  image: string;
  rating: number;
  location: string;
  distance: string;
  price: string;
  trending?: boolean;
  active?: boolean;
  lat: number;
  lng: number;
  sportType?: string;
  onDirectionsClick?: (lat: number, lng: number) => void;
  onDetailClick?: (id: number | string) => void;
  onBookingClick?: (id: number | string) => void;
  index?: number;
  layout?: 'vertical' | 'horizontal';
}

const resolveVenueImage = (imgUrl: string, sportType?: string) => {
  const sport = (sportType || '').toLowerCase();
  if (!imgUrl || imgUrl.includes('unsplash.com') || imgUrl.includes('placeholder')) {
    if (sport.includes('pickleball')) return '/images/pickleball.png';
    if (sport.includes('badminton') || sport.includes('cầu lông')) return '/images/badminton.png';
    if (sport.includes('football') || sport.includes('bóng đá') || sport.includes('soccer')) return '/images/football.png';
    return '/images/pickleball.png'; // default
  }
  return imgUrl;
};

const VenueCard: React.FC<VenueCardProps> = ({ 
  id, name, image, rating, location, distance, price, trending, active, lat, lng, sportType, onDirectionsClick, onDetailClick, onBookingClick, index = 1, layout = 'vertical'
}) => {
  const [hovered, setHovered] = useState(false);

  // Parse price string to make sure it looks like 180.000đ or similar
  const formattedPrice = price.includes('đ') ? price : `${price}đ`;

  // Determine tags based on sport type
  const tags: string[] = [];
  const lowerSport = (sportType || '').toLowerCase();
  if (lowerSport.includes('pickleball')) {
    tags.push('PICKLEBALL');
  } else if (lowerSport.includes('badminton') || lowerSport.includes('cầu lông')) {
    tags.push('BADMINTON');
  } else if (lowerSport.includes('football') || lowerSport.includes('bóng đá')) {
    tags.push('BÓNG ĐÁ');
  } else {
    tags.push('PICKLEBALL');
  }

  // ── Render 1: Horizontal Premium Layout (For Discovery Page) ──
  if (layout === 'horizontal') {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="mb-3"
        style={{
          borderRadius: '20px',
          background: '#ffffff',
          border: `1.5px solid ${hovered ? '#1a6b3c33' : 'rgba(0,0,0,0.06)'}`,
          boxShadow: hovered ? '0 16px 40px rgba(26,107,60,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
          cursor: 'pointer',
        }}
        onClick={() => onDetailClick?.(id)}
      >
        <div style={{ display: 'flex', gap: 0 }}>

          {/* Left: Image */}
          <div style={{ position: 'relative', width: '220px', minWidth: '220px', height: '165px', flexShrink: 0, overflow: 'hidden' }}>
            <img
              src={resolveVenueImage(image, sportType)}
              alt={name}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hovered ? 'scale(1.06)' : 'scale(1)',
                transition: 'transform 0.5s ease'
              }}
            />
            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.35) 0%, transparent 60%)' }} />
            {/* Sport badge */}
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: '#1a6b3c', color: '#fff',
              borderRadius: 999, padding: '3px 10px',
              fontSize: 10, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase'
            }}>
              {tags[0]}
            </div>
            {/* Trending badge */}
            {trending && (
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: '#f97316', color: '#fff',
                borderRadius: 999, padding: '3px 8px',
                fontSize: 9, fontWeight: 800, letterSpacing: 0.5
              }}>
                🔥 HOT
              </div>
            )}
            {/* Index pill */}
            <div style={{
              position: 'absolute', bottom: 10, left: 10,
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(8px)',
              borderRadius: 999, padding: '2px 8px',
              fontSize: 10, fontWeight: 700, color: '#fff', border: '1px solid rgba(255,255,255,0.3)'
            }}>
              #{index}
            </div>
          </div>

          {/* Right: Info */}
          <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>

            {/* Top row: name + price */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ minWidth: 0 }}>
                <h6 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {name}
                </h6>
                {/* Rating + location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{ fontSize: 13, color: '#f59e0b', lineHeight: 1 }}>★</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{rating || '0'}</span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>(120 đánh giá)</span>
                  <span style={{ color: '#e2e8f0' }}>•</span>
                  {distance && parseFloat(distance) > 0 && (
                    <span title="Khoảng cách đường thẳng" style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>{distance} ↗</span>
                  )}
                </div>
              </div>
              {/* Price */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>Từ</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#15803d', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                  {formattedPrice}
                </div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>/giờ</div>
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#94a3b8' }}>location_on</span>
              <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{location}</span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#f1f5f9', margin: '10px 0' }} />

            {/* Bottom row: status + CTAs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              {/* Status pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: active ? '#f0fdf4' : '#fff1f2',
                border: `1px solid ${active ? '#bbf7d0' : '#fecdd3'}`,
                borderRadius: 999, padding: '4px 10px',
                fontSize: 11, fontWeight: 700,
                color: active ? '#15803d' : '#e11d48',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#22c55e' : '#f43f5e', display: 'inline-block' }} />
                {active ? 'Còn chỗ' : 'Hết chỗ'}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onDetailClick?.(id); }}
                  style={{
                    background: 'transparent', border: '1.5px solid #1a6b3c', borderRadius: 999,
                    padding: '7px 16px', fontSize: 12, fontWeight: 700, color: '#1a6b3c',
                    cursor: 'pointer', transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onBookingClick?.(id); }}
                  style={{
                    background: '#1a6b3c', border: 'none', borderRadius: 999,
                    padding: '7px 18px', fontSize: 12, fontWeight: 800, color: '#fff',
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: '0 4px 14px rgba(26,107,60,0.3)',
                    whiteSpace: 'nowrap'
                  }}
                >
                   Đặt ngay
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Render 2: Original Vertical Layout (For Home Map Page) ──
  return (
    <Card 
      onClick={() => onDetailClick?.(id)}
      className="mb-4 border-0 shadow-sm overflow-hidden position-relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ 
        cursor: 'pointer',
        borderRadius: '24px',
        boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.12)' : '0 4px 16px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        border: active ? '2px solid #1a6b3c' : '1px solid rgba(0,0,0,0.06)'
      }}
    >
      <div className="position-relative" style={{ overflow: 'hidden', height: '190px' }}>
        <Card.Img 
          variant="top" 
          src={resolveVenueImage(image, sportType)} 
          style={{ 
            height: '100%', 
            objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
          }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />

        {/* Favorite & Directions Overlay pill buttons */}
        <div 
          className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-2"
          style={{ zIndex: 5 }}
        >
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center shadow-sm hover-scale"
            style={{ 
              width: '38px', 
              height: '38px', 
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            <span className="material-symbols-outlined fs-5" style={{ fontVariationSettings: hovered ? "'FILL' 1" : "'FILL' 0", color: hovered ? '#ef4444' : '#64748b' }}>favorite</span>
          </div>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center shadow-sm hover-scale"
            style={{ 
              width: '38px', 
              height: '38px', 
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              onDirectionsClick?.(lat, lng);
            }}
            title="Tìm đường đi"
          >
            <span className="material-symbols-outlined text-success fs-5" style={{ fontVariationSettings: "'FILL' 1", color: '#1a6b3c' }}>directions</span>
          </div>
        </div>

        {/* Badges on Bottom Image */}
        <div className="position-absolute bottom-0 start-0 m-3 d-flex gap-2">
          {trending && (
            <Badge className="rounded-pill px-3 py-2 text-uppercase fw-bold border-0" style={{ fontSize: '9px', letterSpacing: '0.8px', background: '#c2632a', color: '#ffffff' }}>
              XÁC MINH
            </Badge>
          )}
          <Badge className="rounded-pill px-3 py-2 text-uppercase fw-bold border-0" style={{ fontSize: '9px', letterSpacing: '0.8px', background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', color: '#ffffff' }}>
            SÂN BÃI
          </Badge>
        </div>
      </div>

      <Card.Body className="p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="fw-bold mb-0" style={{ fontSize: '16.5px', letterSpacing: '-0.3px', color: '#0f172a', fontWeight: 800 }}>{name}</h6>
          <div className="d-flex align-items-center gap-1">
            <span className="material-symbols-outlined text-warning fs-6" style={{ fontVariationSettings: "'FILL' 1", color: '#f59e0b' }}>star</span>
            <span className="small fw-bold" style={{ color: '#0f172a' }}>{rating}</span>
            <span className="text-secondary" style={{ fontSize: '11px' }}>(120)</span>
          </div>
        </div>

        <Card.Text className="text-muted small mb-4 d-flex align-items-center gap-1" style={{ fontSize: '12.5px' }}>
          <span className="material-symbols-outlined fs-6" style={{ color: '#94a3b8' }}>location_on</span>
          <span style={{ color: '#64748b' }}>{location}</span>
          {distance && parseFloat(distance) > 0 && (
            <>
              <span style={{ color: '#94a3b8' }}>•</span>
              <span className="text-success fw-bold" title="Khoảng cách đường thẳng" style={{ color: '#1a6b3c' }}>Cách {distance} ↗</span>
            </>
          )}
        </Card.Text>

        <hr className="my-3" style={{ opacity: 0.08 }} />

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Giá chỉ từ</div>
            <div className="fw-bold fs-5" style={{ color: '#1a6b3c', letterSpacing: '-0.5px', fontWeight: 800 }}>
              {price} <span className="small text-muted fw-normal" style={{ fontSize: '12px' }}>/giờ</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button 
              onClick={(e) => { e.stopPropagation(); onBookingClick?.(id); }}
              variant={active ? "success" : "light"} 
              className="rounded-pill px-4 py-2 fw-bold hover-scale border-0"
              style={{ 
                fontSize: '13px', 
                background: active ? '#1a6b3c' : '#f1f5f9', 
                color: active ? '#ffffff' : '#1a6b3c',
                boxShadow: active ? '0 8px 20px rgba(26,107,60,0.3)' : 'none'
              }}
            >
              ⚡ Đặt ngay
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default VenueCard;
