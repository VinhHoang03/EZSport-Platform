import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

interface LeftFilterSidebarProps {
  selectedSports: string[];
  onSportsChange: (sports: string[]) => void;
  maxDistance: number;
  onDistanceChange: (distance: number) => void;
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (val: string) => void;
  onPriceMaxChange: (val: string) => void;
  selectedAmenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
}

const LeftFilterSidebar: React.FC<LeftFilterSidebarProps> = ({
  selectedSports,
  onSportsChange,
  maxDistance,
  onDistanceChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
  selectedAmenities,
  onAmenitiesChange,
  minRating,
  onRatingChange,
  onApplyFilters,
  onResetFilters,
}) => {
  const sportsList = [
    { id: 'badminton', label: 'Cầu lông', value: 'Cầu lông' },
    { id: 'pickleball', label: 'Pickleball', value: 'Pickleball' },
    { id: 'football', label: 'Bóng đá', value: 'Bóng đá' },
  ];

  const amenitiesList = [
    { id: 'wifi', label: 'Wifi miễn phí' },
    { id: 'parking', label: 'Bãi đỗ xe' },
    { id: 'changing', label: 'Phòng thay đồ' },
    { id: 'water', label: 'Nước uống' },
  ];

  const handleSportToggle = (sportValue: string) => {
    if (selectedSports.includes(sportValue)) {
      onSportsChange(selectedSports.filter((s) => s !== sportValue));
    } else {
      onSportsChange([...selectedSports, sportValue]);
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    if (selectedAmenities.includes(amenityId)) {
      onAmenitiesChange(selectedAmenities.filter((a) => a !== amenityId));
    } else {
      onAmenitiesChange([...selectedAmenities, amenityId]);
    }
  };

  return (
    <div 
      className="p-4 border-end h-100 overflow-auto bg-white d-flex flex-column gap-4" 
      style={{ 
        fontFamily: "'Inter', sans-serif", 
        width: '100%', 
        boxSizing: 'border-box',
        borderColor: '#e2e8f0',
        userSelect: 'none'
      }}
    >
      {/* ── Loại Sân ── */}
      <div>
        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Loại sân</h6>
        <div className="d-flex flex-column gap-2">
          {sportsList.map((sport) => {
            const isChecked = selectedSports.includes(sport.value);
            return (
              <div 
                key={sport.id} 
                onClick={() => handleSportToggle(sport.value)}
                className="d-flex align-items-center gap-3 cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '5px',
                    border: isChecked ? 'none' : '2px solid #cbd5e1',
                    background: isChecked ? '#1a6b3c' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isChecked && (
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '16px', fontWeight: 'bold' }}>check</span>
                  )}
                </div>
                <span style={{ fontSize: '14.5px', color: isChecked ? '#0f172a' : '#475569', fontWeight: isChecked ? '600' : '400' }}>
                  {sport.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="my-1" style={{ opacity: 0.08, borderTop: '1px solid #000' }} />

      {/* ── Khoảng cách ── */}
      <div>
        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '15px', fontWeight: 800 }}>Khoảng cách</h6>
        <Form.Range 
          value={maxDistance} 
          min={0}
          max={15}
          onChange={(e) => onDistanceChange(Number(e.target.value))}
          style={{ accentColor: '#1a6b3c' }}
        />
        <div className="d-flex justify-content-between mt-2 text-muted" style={{ fontSize: '12.5px', fontWeight: '500' }}>
          <span>0km</span>
          <span style={{ color: '#1a6b3c', fontWeight: '700' }}>{maxDistance}km</span>
          <span>15km</span>
        </div>
      </div>

      <hr className="my-1" style={{ opacity: 0.08, borderTop: '1px solid #000' }} />

      {/* ── Giá/Giờ ── */}
      <div>
        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '15px', fontWeight: 800 }}>Giá/giờ</h6>
        <div className="d-flex align-items-center gap-2">
          <Form.Control 
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            style={{ 
              background: '#f1f5f9', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '8px 12px',
              fontSize: '14px',
              textAlign: 'center' 
            }}
          />
          <span className="text-muted" style={{ fontSize: '12px' }}>-</span>
          <Form.Control 
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            style={{ 
              background: '#f1f5f9', 
              border: 'none', 
              borderRadius: '8px', 
              padding: '8px 12px',
              fontSize: '14px',
              textAlign: 'center' 
            }}
          />
        </div>
      </div>

      <hr className="my-1" style={{ opacity: 0.08, borderTop: '1px solid #000' }} />

      {/* ── Tiện ích ── */}
      <div>
        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '15px', fontWeight: 800 }}>Tiện ích</h6>
        <div className="d-flex flex-column gap-2">
          {amenitiesList.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity.id);
            return (
              <div 
                key={amenity.id} 
                onClick={() => handleAmenityToggle(amenity.id)}
                className="d-flex align-items-center gap-3 cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                <div 
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '5px',
                    border: isChecked ? 'none' : '2px solid #cbd5e1',
                    background: isChecked ? '#1a6b3c' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isChecked && (
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '16px', fontWeight: 'bold' }}>check</span>
                  )}
                </div>
                <span style={{ fontSize: '14.5px', color: isChecked ? '#0f172a' : '#475569', fontWeight: isChecked ? '600' : '400' }}>
                  {amenity.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="my-1" style={{ opacity: 0.08, borderTop: '1px solid #000' }} />

      {/* ── Đánh giá ── */}
      <div>
        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '15px', fontWeight: 800 }}>Đánh giá</h6>
        <div className="d-flex flex-column gap-2">
          {[5, 4, 3].map((stars) => {
            const isSelected = minRating === stars;
            return (
              <div 
                key={stars}
                onClick={() => onRatingChange(stars)}
                className="d-flex align-items-center gap-2 cursor-pointer"
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex gap-1" style={{ color: '#e2e8f0' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span 
                      key={s} 
                      className="material-symbols-outlined" 
                      style={{ 
                        fontVariationSettings: "'FILL' 1", 
                        color: s <= stars ? '#f59e0b' : '#e2e8f0',
                        fontSize: '18px'
                      }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: isSelected ? '700' : '400' }}>
                  trở lên
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="d-flex flex-column gap-2 mt-auto">
        <Button 
          onClick={onApplyFilters}
          className="w-100 border-0 fw-bold py-2 rounded-3"
          style={{ background: '#1a6b3c', color: '#ffffff', fontSize: '14.5px' }}
        >
          Áp dụng bộ lọc
        </Button>
        <Button 
          onClick={onResetFilters}
          variant="link"
          className="w-100 text-decoration-none fw-semibold py-1 text-secondary"
          style={{ fontSize: '13.5px' }}
        >
          Đặt lại
        </Button>
      </div>
    </div>
  );
};

export default LeftFilterSidebar;
