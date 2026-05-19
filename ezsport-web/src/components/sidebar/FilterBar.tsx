import React from 'react';
import { Button, Badge } from 'react-bootstrap';

interface FilterBarProps {
  count: number;
  onFilterClick?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ count, onFilterClick }) => {
  return (
    <div className="p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px', color: '#0f172a', fontWeight: 800 }}>
          Tìm thấy {count} sân
        </h5>
        <Button 
          variant="outline-success" 
          className="rounded-pill px-3 py-2 small d-flex align-items-center gap-2 border shadow-sm hover-scale"
          style={{ borderColor: '#1a6b3c', color: '#1a6b3c', fontWeight: 600, fontSize: '13px', background: 'transparent' }}
          onClick={onFilterClick}
        >
          <span className="material-symbols-outlined fs-6" style={{ fontVariationSettings: "'wght' 600" }}>tune</span>
          Bộ lọc
        </Button>
      </div>
      <div className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar" style={{ whiteSpace: 'nowrap' }}>
        {[
          { en: 'All Courts', vi: 'Tất cả sân' },
          { en: 'Pickleball', vi: 'Pickleball' },
          { en: 'Badminton', vi: 'Cầu lông' },
          { en: 'Tennis', vi: 'Tennis' },
          { en: 'Padel', vi: 'Padel' }
        ].map((cat, i) => (
          <Badge 
            key={cat.en}
            pill 
            bg={i === 0 ? "success" : "light"} 
            className={`px-3 py-2 cursor-pointer shadow-sm ${i === 0 ? '' : 'text-secondary border'}`}
            style={{ 
              fontSize: '12px', 
              fontWeight: 700, 
              background: i === 0 ? '#1a6b3c' : 'rgba(255,255,255,0.8)', 
              color: i === 0 ? '#ffffff' : '#475569',
              border: i === 0 ? 'none' : '1px solid #e2e8f0',
              padding: '8px 16px'
            }}
          >
            {cat.vi}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;

