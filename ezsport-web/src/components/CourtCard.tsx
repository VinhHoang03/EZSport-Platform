import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

interface CourtCardProps {
  id: number;
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
  onDirectionsClick?: (lat: number, lng: number) => void;
}

const CourtCard: React.FC<CourtCardProps> = ({ 
  name, image, rating, location, distance, price, trending, active, lat, lng, onDirectionsClick 
}) => {
  return (
    <Card 
      className={`mb-4 border-0 shadow-sm rounded-4 overflow-hidden position-relative ${active ? 'border border-primary border-2' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      <div className="position-relative">
        <Card.Img variant="top" src={image} style={{ height: '200px', objectFit: 'cover' }} />
        <div 
          className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-2"
          style={{ zIndex: 5 }}
        >
          <div 
            className="bg-white bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: '40px', height: '40px' }}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: active ? '#006b1b' : '#595c5c' }}>favorite</span>
          </div>
          <div 
            className="bg-white bg-opacity-75 rounded-circle d-flex align-items-center justify-content-center shadow-sm hover-bg-light"
            style={{ width: '40px', height: '40px' }}
            onClick={(e) => {
              e.stopPropagation();
              onDirectionsClick?.(lat, lng);
            }}
            title="Tìm đường đi"
          >
            <span className="material-symbols-outlined text-success" style={{ fontVariationSettings: "'FILL' 1" }}>directions</span>
          </div>
        </div>
        {trending && (
          <div className="position-absolute bottom-0 start-0 m-3">
            <Badge bg="success" className="rounded-pill px-3 py-2 text-uppercase fw-bold" style={{ fontSize: '10px', letterSpacing: '1px' }}>
              Trending
            </Badge>
          </div>
        )}
      </div>
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h5 className="fw-bold mb-0" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{name}</h5>
          <div className="d-flex align-items-center gap-1">
            <span className="material-symbols-outlined text-warning fs-6" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="small fw-bold">{rating}</span>
          </div>
        </div>
        <Card.Text className="text-muted small mb-4 d-flex align-items-center gap-1">
          <span className="material-symbols-outlined fs-6">location_on</span>
          {location} • <span className="text-success fw-bold">{distance} away</span>
        </Card.Text>
        <hr className="opacity-10" />
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <div className="text-muted" style={{ fontSize: '12px' }}>Starts from</div>
            <div className="fw-bold text-success fs-5">
              {price} <span className="small text-muted fw-normal" style={{ fontSize: '12px' }}>₫/hr</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant={active ? "success" : "light"} 
              className={`rounded-3 px-3 py-2 fw-bold ${!active ? 'text-success' : ''}`}
            >
              Book Now
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CourtCard;
