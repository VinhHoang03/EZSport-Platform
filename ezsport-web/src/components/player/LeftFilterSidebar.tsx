import React, { useState, useEffect } from 'react';
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
  /** When true, adds a toggle header so the content can be collapsed (used on mobile) */
  collapsible?: boolean;
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
  collapsible = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

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

  // Count active filters
  const activeFilterCount =
    selectedSports.length +
    (priceMin ? 1 : 0) +
    (priceMax ? 1 : 0) +
    selectedAmenities.length +
    (minRating > 0 ? 1 : 0) +
    (maxDistance < 15 ? 1 : 0);

  const filterBody = (
    <div className="d-flex flex-column gap-4">
      {/* ── Loại Sân ── */}
      <div>
        <h6 className="fw-bold mb-3" style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Loại sân</h6>
        <div className="d-flex flex-column gap-2">
          {sportsList.map((sport) => {
            const isChecked = selectedSports.includes(sport.value);
            return (
              <div
                key={sport.id}
                onClick={() => handleSportToggle(sport.value)}
                className="d-flex align-items-center gap-3"
                style={{ cursor: 'pointer' }}
              >
                <div style={{
                  width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                  border: isChecked ? 'none' : '2px solid #cbd5e1',
                  background: isChecked ? '#1a6b3c' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  {isChecked && (
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>check</span>
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

      <hr className="my-0" style={{ opacity: 0.08 }} />

      {/* ── Khoảng cách ── */}
      <div>
        <h6 className="fw-bold mb-3" style={{ fontSize: '15px', fontWeight: 800 }}>Khoảng cách</h6>
        <Form.Range value={maxDistance} min={0} max={15} onChange={(e) => onDistanceChange(Number(e.target.value))} style={{ accentColor: '#1a6b3c' }} />
        <div className="d-flex justify-content-between mt-2 text-muted" style={{ fontSize: '12.5px', fontWeight: '500' }}>
          <span>0km</span>
          <span style={{ color: '#1a6b3c', fontWeight: '700' }}>{maxDistance}km</span>
          <span>15km</span>
        </div>
      </div>

      <hr className="my-0" style={{ opacity: 0.08 }} />

      {/* ── Giá/Giờ ── */}
      <div>
        <h6 className="fw-bold mb-3" style={{ fontSize: '15px', fontWeight: 800 }}>Giá/giờ</h6>
        <div className="d-flex align-items-center gap-2">
          <Form.Control
            type="text"
            inputMode="numeric"
            placeholder="VD: 100.000"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', textAlign: 'center' }}
          />
          <span className="text-muted" style={{ fontSize: '12px' }}>-</span>
          <Form.Control
            type="text"
            inputMode="numeric"
            placeholder="VD: 200.000"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '14px', textAlign: 'center' }}
          />
        </div>
      </div>

      <hr className="my-0" style={{ opacity: 0.08 }} />

      {/* ── Tiện ích ── */}
      <div>
        <h6 className="fw-bold mb-3" style={{ fontSize: '15px', fontWeight: 800 }}>Tiện ích</h6>
        <div className="d-flex flex-column gap-2">
          {amenitiesList.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity.id);
            return (
              <div key={amenity.id} onClick={() => handleAmenityToggle(amenity.id)} className="d-flex align-items-center gap-3" style={{ cursor: 'pointer' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
                  border: isChecked ? 'none' : '2px solid #cbd5e1',
                  background: isChecked ? '#1a6b3c' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  {isChecked && (
                    <span className="material-symbols-outlined text-white" style={{ fontSize: '16px' }}>check</span>
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

      <hr className="my-0" style={{ opacity: 0.08 }} />

      {/* ── Đánh giá ── */}
      <div>
        <h6 className="fw-bold mb-3" style={{ fontSize: '15px', fontWeight: 800 }}>Đánh giá</h6>
        <div className="d-flex flex-column gap-2">
          {[5, 4, 3].map((stars) => {
            const isSelected = minRating === stars;
            return (
              <div key={stars} onClick={() => onRatingChange(isSelected ? 0 : stars)} className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                <div className="d-flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1", color: s <= stars ? '#f59e0b' : '#e2e8f0', fontSize: '18px' }}>
                      star
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: isSelected ? '700' : '400' }}>trở lên</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="d-flex flex-column gap-2 mt-auto">
        <Button onClick={onApplyFilters} className="w-100 border-0 fw-bold py-2 rounded-3"
          style={{ background: '#1a6b3c', color: '#ffffff', fontSize: '14.5px' }}>
          Áp dụng bộ lọc
        </Button>
        <Button onClick={onResetFilters} variant="link" className="w-100 text-decoration-none fw-semibold py-1 text-secondary"
          style={{ fontSize: '13.5px' }}>
          Đặt lại
        </Button>
      </div>
    </div>
  );

  // ── Collapsible mode (mobile): toggle button + dropdown content ──
  if (collapsible) {
    return (
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', borderBottom: isOpen ? '1px solid #e2e8f0' : 'none' }}>
        {/* Toggle button / header */}
        <button
          onClick={() => setIsOpen(prev => !prev)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: '#fff',
            border: 'none',
            borderBottom: '1px solid #e2e8f0',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#1a6b3c' }}>tune</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Bộ lọc tìm kiếm</span>
            {activeFilterCount > 0 && (
              <span style={{
                background: '#1a6b3c', color: '#fff', borderRadius: '999px',
                padding: '1px 8px', fontSize: '11px', fontWeight: 700,
              }}>
                {activeFilterCount}
              </span>
            )}
          </div>
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: '22px', color: '#64748b',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease',
            }}
          >
            keyboard_arrow_down
          </span>
        </button>

        {/* Collapsible content */}
        <div style={{
          overflow: 'hidden',
          maxHeight: isOpen ? '2000px' : '0px',
          transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          <div style={{ padding: '20px 16px 8px 16px' }}>
            {filterBody}
          </div>
        </div>
      </div>
    );
  }

  // ── Default mode (desktop): always-visible sidebar ──
  return (
    <div
      className="p-4 border-end h-100 overflow-auto bg-white"
      style={{
        fontFamily: "'Inter', sans-serif",
        width: '100%',
        boxSizing: 'border-box',
        borderColor: '#e2e8f0',
        userSelect: 'none',
      }}
    >
      {filterBody}
    </div>
  );
};

export default LeftFilterSidebar;
