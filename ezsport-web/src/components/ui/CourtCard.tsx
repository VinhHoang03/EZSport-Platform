import React, { useState } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

interface CourtCardProps {
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

const CourtCard: React.FC<CourtCardProps> = ({ 
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
    const getSlots = () => {
      if (index === 2) {
        return { slots: ['20:00', '21:00'], extra: 'Hết chỗ hôm nay' };
      }
      if (index === 3) {
        return { slots: ['15:00', '16:00', '17:00'], extra: '+8 slots' };
      }
      if (index === 4) {
        return { slots: ['18:00', '19:00'], extra: '+2 slots' };
      }
      return { slots: ['17:00', '18:00', '19:30'], extra: '+4 slots' };
    };

    const { slots, extra } = getSlots();

    return (
      <Card 
        onClick={() => onDirectionsClick?.(lat, lng)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="mb-3 border-0 shadow-sm overflow-hidden"
        style={{ 
          cursor: 'pointer',
          borderRadius: '24px',
          background: '#ffffff',
          border: active ? '2px solid #1a6b3c' : '1px solid rgba(0,0,0,0.04)',
          boxShadow: hovered ? '0 12px 28px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.03)',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        <div className="d-flex p-3 gap-3 flex-column flex-sm-row align-items-stretch">
          
          {/* Left Side: Large Image with Badge */}
          <div 
            className="position-relative overflow-hidden flex-shrink-0"
            style={{ 
              width: '180px', 
              height: '130px', 
              borderRadius: '16px',
              background: '#f1f5f9'
            }}
          >
            <img 
              src={resolveCourtImage(image, sportType)} 
              alt={name}
              className="w-100 h-100 object-fit-cover"
              style={{
                objectFit: 'cover',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.4s ease'
              }}
            />
            {/* Index Marker pill */}
            <div 
              className="position-absolute top-0 start-0 m-2 px-2 py-1 text-white rounded-pill fw-bold"
              style={{ 
                background: '#15803d', 
                fontSize: '10px', 
                letterSpacing: '0.5px' 
              }}
            >
              Mã {index}
            </div>
          </div>

          {/* Right Side: Court Info and Booking Button */}
          <div className="d-flex flex-column flex-grow-1 justify-content-between gap-2">
            
            {/* Top Line: Tags and Price */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex gap-1.5 flex-wrap">
                {tags.map((tag) => (
                  <Badge 
                    key={tag}
                    className="px-2 py-1 text-uppercase fw-bold border-0"
                    style={{ 
                      fontSize: '9px', 
                      letterSpacing: '0.5px',
                      background: tag === 'BADMINTON' ? '#e0f2fe' : '#dcfce7',
                      color: tag === 'BADMINTON' ? '#0369a1' : '#15803d'
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div style={{ fontSize: '15px', color: '#15803d', fontWeight: '800', letterSpacing: '-0.3px' }}>
                {formattedPrice}<span className="text-muted fw-normal" style={{ fontSize: '11px' }}>/giờ</span>
              </div>
            </div>

            {/* Second Line: Court Name */}
            <h6 className="fw-bold text-dark m-0" style={{ fontSize: '16px', fontWeight: '800', lineHeight: '1.2' }}>
              {name}
            </h6>

            {/* Third Line: Rating and Address */}
            <div className="d-flex flex-column gap-1">
              <div className="d-flex align-items-center gap-1 text-secondary" style={{ fontSize: '12px' }}>
                <span className="material-symbols-outlined text-warning" style={{ fontVariationSettings: "'FILL' 1", fontSize: '16px', color: '#f59e0b' }}>star</span>
                <span className="fw-bold text-dark">{rating}</span>
                <span>(120 đánh giá)</span>
              </div>
              
              <div className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '12.5px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#94a3b8' }}>location_on</span>
                <span className="text-truncate" style={{ maxWidth: '200px' }}>{location}</span>
                <span className="text-success fw-bold">({distance})</span>
              </div>
            </div>

            {/* Fourth Line: Time Slots and Circular Booking Button */}
            <div className="d-flex justify-content-between align-items-center mt-1">
              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                {slots.map((s) => (
                  <div 
                    key={s}
                    onClick={(e) => { e.stopPropagation(); onBookingClick?.(id); }}
                    className="px-2.5 py-1.5 rounded-3 text-success fw-semibold hover-scale"
                    style={{ 
                      background: '#f1f5f9', 
                      fontSize: '11.5px',
                      color: '#15803d',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer'
                    }}
                    title={`Đặt ngay lịch ${s} (Khách quen)`}
                  >
                    {s}
                  </div>
                ))}
                {extra && (
                  <span 
                    style={{ 
                      fontSize: '11px', 
                      color: extra.includes('Hết') ? '#ef4444' : '#64748b',
                      fontWeight: extra.includes('Hết') ? '700' : '500',
                      marginLeft: '4px'
                    }}
                  >
                    {extra}
                  </span>
                )}
              </div>

              {/* Pill Green Button "Xem chi tiết" */}
              <div 
                onClick={(e) => { e.stopPropagation(); onDetailClick?.(id); }}
                className="rounded-pill d-flex align-items-center justify-content-center border-0 flex-shrink-0 px-4 py-2"
                style={{
                  background: active ? '#1a6b3c' : '#f0faf4',
                  color: active ? '#ffffff' : '#1a6b3c',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transform: hovered ? 'scale(1.02)' : 'scale(1)',
                  transition: 'all 0.25s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Xem chi tiết</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', marginLeft: '4px', fontWeight: '600' }}>arrow_right_alt</span>
              </div>

            </div>

          </div>

        </div>
      </Card>
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
          src={resolveCourtImage(image, sportType)} 
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
          <span style={{ color: '#94a3b8' }}>•</span>
          <span className="text-success fw-bold" style={{ color: '#1a6b3c' }}>Cách {distance}</span>
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

export default CourtCard;
