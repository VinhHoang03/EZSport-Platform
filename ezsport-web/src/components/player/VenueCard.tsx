/**
 * VenueCard — wraps CourtCard and adds two new layouts:
 *   - "grid"    : square card for grid view (replaces vertical in discovery context)
 *   - "compact" : slim row for map sidebar / list-only view
 *
 * Existing "vertical" and "horizontal" layouts from CourtCard are still available
 * by passing them through directly.
 */
import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import CourtCard from '../ui/VenueCard';

export interface VenueCardProps {
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
  index?: number;
  layout?: 'vertical' | 'horizontal' | 'grid' | 'compact';
  onDirectionsClick?: (lat: number, lng: number) => void;
  onDetailClick?: (id: number | string) => void;
  onBookingClick?: (id: number | string) => void;
}

const resolveImage = (imgUrl: string, sportType?: string) => {
  const sport = (sportType || '').toLowerCase();
  if (!imgUrl || imgUrl.includes('unsplash') || imgUrl.includes('placeholder')) {
    if (sport.includes('pickleball')) return '/images/pickleball.png';
    if (sport.includes('badminton') || sport.includes('cầu lông')) return '/images/badminton.png';
    if (sport.includes('football') || sport.includes('bóng đá')) return '/images/football.png';
    return '/images/pickleball.png';
  }
  return imgUrl;
};

// ── Grid layout: square card for 2-3 column grid ──
const GridCard: React.FC<VenueCardProps> = ({ id, name, image, rating, location, distance, price, active, sportType, onDetailClick, onBookingClick }) => {
  const [hovered, setHovered] = useState(false);
  const formattedPrice = price.includes('đ') ? price : `${price}đ`;

  return (
    <Card
      className="border-0 shadow-sm h-100"
      style={{
        borderRadius: '20px',
        cursor: 'pointer',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? '0 12px 28px rgba(0,0,0,0.1)' : '0 4px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.25s ease',
        border: active ? '2px solid #16a34a' : '1px solid rgba(0,0,0,0.06)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onDetailClick?.(id)}
    >
      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
        <img
          src={resolveImage(image, sportType)}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.4s ease' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%)' }} />
        <div className="position-absolute bottom-0 start-0 m-2 d-flex align-items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>star</span>
          <span style={{ fontSize: '12px', color: '#fff', fontWeight: 700 }}>{rating}</span>
        </div>
      </div>
      <Card.Body className="p-3">
        <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '14px' }}>{name}</h6>
        <p className="text-muted mb-2 text-truncate" style={{ fontSize: '11px' }}>
          <span className="material-symbols-outlined align-middle me-1" style={{ fontSize: '12px' }}>location_on</span>
          {location} · <span className="text-success fw-semibold">{distance}</span>
        </p>
        <div className="d-flex justify-content-between align-items-center">
          <span style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a' }}>
            {formattedPrice}<span className="text-muted fw-normal" style={{ fontSize: '10px' }}>/h</span>
          </span>
          <Button
            size="sm"
            variant="success"
            className="rounded-pill fw-bold border-0"
            style={{ fontSize: '11px', padding: '4px 12px' }}
            onClick={(e) => { e.stopPropagation(); onBookingClick?.(id); }}
          >
            Đặt ngay
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

// ── Compact layout: slim horizontal row for sidebar ──
const CompactCard: React.FC<VenueCardProps> = ({ id, name, image, rating, location, distance, price, sportType, onDetailClick, onBookingClick }) => {
  const [hovered, setHovered] = useState(false);
  const formattedPrice = price.includes('đ') ? price : `${price}đ`;

  return (
    <div
      className="d-flex align-items-center gap-3 p-2 rounded-3 mb-2"
      style={{
        cursor: 'pointer',
        background: hovered ? '#f0fdf4' : '#fff',
        border: '1px solid #e5e7eb',
        transition: 'background 0.2s ease',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onDetailClick?.(id)}
    >
      <img
        src={resolveImage(image, sportType)}
        alt={name}
        style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
      />
      <div className="flex-grow-1 overflow-hidden">
        <p className="fw-bold mb-0 text-truncate" style={{ fontSize: '13px' }}>{name}</p>
        <p className="text-muted mb-0 text-truncate" style={{ fontSize: '11px' }}>{location}</p>
        <div className="d-flex align-items-center gap-2 mt-1">
          <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>{formattedPrice}/h</span>
          <span style={{ fontSize: '11px', color: '#6b7280' }}>· {distance}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '12px', color: '#fbbf24', fontVariationSettings: "'FILL' 1" }}>star</span>
          <span style={{ fontSize: '11px', fontWeight: 600 }}>{rating}</span>
        </div>
      </div>
      <Button
        size="sm"
        variant="outline-success"
        className="rounded-pill fw-semibold flex-shrink-0 border-0"
        style={{ fontSize: '11px', padding: '4px 10px', background: '#f0fdf4' }}
        onClick={(e) => { e.stopPropagation(); onBookingClick?.(id); }}
      >
        Đặt
      </Button>
    </div>
  );
};

// ── Main export: routes to the right layout ──
const VenueCard: React.FC<VenueCardProps> = (props) => {
  if (props.layout === 'grid') return <GridCard {...props} />;
  if (props.layout === 'compact') return <CompactCard {...props} />;
  // Fall through to CourtCard for vertical / horizontal
  return <CourtCard {...props} layout={props.layout as 'vertical' | 'horizontal'} />;
};

export default VenueCard;
