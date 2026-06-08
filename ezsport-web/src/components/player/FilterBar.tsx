import React from 'react';
import { Button } from 'react-bootstrap';

interface FilterBarProps {
  count: number;
  onFilterClick?: () => void;
  currentLocationName?: string;
  selectedSports?: string[];
  onSportToggle?: (sport: string) => void;
}

const SPORTS = [
  { key: 'all',        label: 'Tất cả',     icon: 'sports' },
  { key: 'pickleball', label: 'Pickleball',  icon: 'sports_tennis' },
  { key: 'badminton',  label: 'Cầu lông',    icon: 'sports_cricket' },
  { key: 'football',   label: 'Bóng đá',     icon: 'sports_soccer' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  count,
  onFilterClick,
  currentLocationName,
  selectedSports = [],
  onSportToggle,
}) => {
  const isAllActive = selectedSports.length === 0;

  return (
    <div className="px-4 pt-4 pb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header row */}
      <div className="d-flex justify-content-between align-items-start mb-1">
        <div>
          <h5 className="fw-bold mb-0" style={{ letterSpacing: '-0.5px', color: '#0f172a', fontWeight: 800, fontSize: '16px' }}>
            Tìm thấy {count} sân
          </h5>
          {currentLocationName && (
            <div className="d-flex align-items-center gap-1 mt-1" style={{ fontSize: '12px', color: '#94a3b8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>location_on</span>
              <span>Gần <span style={{ color: '#0f172a', fontWeight: 600 }}>{currentLocationName}</span></span>
            </div>
          )}
        </div>

        <Button
          variant="outline-success"
          className="rounded-pill d-flex align-items-center gap-1 shadow-sm flex-shrink-0"
          style={{
            borderColor: '#1a6b3c',
            color: '#1a6b3c',
            fontWeight: 600,
            fontSize: '12px',
            padding: '6px 14px',
            background: 'transparent',
          }}
          onClick={onFilterClick}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>tune</span>
          Bộ lọc
        </Button>
      </div>

      {/* Sport filter pills — multi-select */}
      <div className="d-flex gap-2 overflow-auto pb-1 mt-3 custom-scrollbar" style={{ whiteSpace: 'nowrap' }}>
        {SPORTS.map((sport) => {
          const active = sport.key === 'all' ? isAllActive : selectedSports.includes(sport.key);
          return (
            <button
              key={sport.key}
              onClick={() => onSportToggle?.(sport.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: active ? 'none' : '1.5px solid #e2e8f0',
                background: active ? '#1a6b3c' : '#ffffff',
                color: active ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: active ? '0 2px 8px rgba(26,107,60,0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{sport.icon}</span>
              {sport.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBar;
