import React, { useState } from 'react';
import { Col, Form, Pagination } from 'react-bootstrap';
import CourtCard from '../ui/CourtCard';
import FilterBar from './FilterBar';

interface Court {
  id: number;
  name: string;
  image: string;
  rating: number;
  location: string;
  distance: string;
  price: string;
  trending: boolean;
  active: boolean;
  lat: number;
  lng: number;
  sportType?: string;
}

interface CourtListProps {
  courts: Court[];
  layout?: 'vertical' | 'horizontal';
  currentLocationName?: string;
  onFilterClick?: () => void;
  onDirectionsClick?: (lat: number, lng: number) => void;
  onDetailClick?: (id: number) => void;
  onBookingClick?: (id: number) => void;
}

const CourtList: React.FC<CourtListProps> = ({ 
  courts, 
  layout = 'vertical', 
  currentLocationName,
  onFilterClick, 
  onDirectionsClick,
  onDetailClick,
  onBookingClick
}) => {
  const [sortBy, setSortBy] = useState('Gần tôi nhất');
  const [viewMode, setViewMode] = useState<'list' | 'split'>('split');
  const [activePage, setActivePage] = useState(1);

  // ── Render 1: Original Vertical Simple List (For Home Map Page) ──
  if (layout === 'vertical') {
    return (
      <Col md={4} className="h-100 d-flex flex-column bg-white border-end">
        <FilterBar count={courts.length} onFilterClick={onFilterClick} />

        <div className="flex-grow-1 overflow-auto px-4 pb-5 custom-scrollbar">
          {courts.map((court) => (
            <CourtCard 
              key={court.id} 
              {...court} 
              layout="vertical"
              onDirectionsClick={onDirectionsClick}
              onDetailClick={onDetailClick}
              onBookingClick={onBookingClick}
            />
          ))}
        </div>
      </Col>
    );
  }

  // ── Render 2: Horizontal Detailed List (For Discovery Page) ──
  return (
    <Col md={7} className="h-100 d-flex flex-column bg-white border-end" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Search & Filter Header ── */}
      <div className="p-4 border-bottom" style={{ background: '#ffffff' }}>
        
        {/* Row 1: Heading, Sort dropdown, and View Toggle */}
        <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-3">
          <div>
            <h5 className="fw-bold mb-1" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Tìm thấy {courts.length} sân
            </h5>
            <div className="text-muted d-flex align-items-center gap-1.5" style={{ fontSize: '13px', fontWeight: '500' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#94a3b8' }}>location_on</span>
              <span>Gần vị trí của bạn tại </span>
              <span style={{ color: '#0f172a', fontWeight: '700' }}>{currentLocationName || 'Đà Nẵng, Việt Nam'}</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Sort Dropdown */}
            <Form.Select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-0 shadow-sm rounded-pill px-3 py-1.5"
              style={{ 
                fontSize: '13.5px', 
                fontWeight: '600', 
                background: '#f8fafc',
                color: '#334155',
                width: '140px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}
            >
              <option>Gần tôi nhất</option>
              <option>Giá thấp nhất</option>
              <option>Đánh giá cao nhất</option>
            </Form.Select>

            {/* List / Map View togglers */}
            <div 
              className="d-flex align-items-center rounded-pill p-1 shadow-sm"
              style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}
            >
              <div 
                onClick={() => setViewMode('list')}
                className="rounded-circle d-flex align-items-center justify-content-center cursor-pointer"
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  background: viewMode === 'list' ? '#ffffff' : 'transparent',
                  color: viewMode === 'list' ? '#1a6b3c' : '#64748b',
                  boxShadow: viewMode === 'list' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>menu</span>
              </div>
              <div 
                onClick={() => setViewMode('split')}
                className="rounded-circle d-flex align-items-center justify-content-center cursor-pointer"
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  background: viewMode === 'split' ? '#ffffff' : 'transparent',
                  color: viewMode === 'split' ? '#1a6b3c' : '#64748b',
                  boxShadow: viewMode === 'split' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>map</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Court List Scroll Container ── */}
      <div 
        className="flex-grow-1 overflow-auto px-4 py-3 custom-scrollbar" 
        style={{ background: '#f8fafc' }}
      >
        {courts.map((court, i) => (
          <CourtCard 
            key={court.id} 
            {...court} 
            index={i + 1}
            layout="horizontal"
            onDirectionsClick={onDirectionsClick}
            onDetailClick={onDetailClick}
            onBookingClick={onBookingClick}
          />
        ))}

        {/* ── Pagination ── */}
        <div className="d-flex justify-content-center mt-4 mb-3">
          <Pagination className="m-0 gap-1" style={{ userSelect: 'none' }}>
            <Pagination.Item 
              active={activePage === 1} 
              onClick={() => setActivePage(1)}
              linkStyle={{
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13.5px',
                fontWeight: '700',
                background: activePage === 1 ? '#1a6b3c' : 'transparent',
                color: activePage === 1 ? '#ffffff' : '#64748b'
              }}
            >
              1
            </Pagination.Item>
            <Pagination.Item 
              active={activePage === 2} 
              onClick={() => setActivePage(2)}
              linkStyle={{
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13.5px',
                fontWeight: '700',
                background: activePage === 2 ? '#1a6b3c' : 'transparent',
                color: activePage === 2 ? '#ffffff' : '#64748b'
              }}
            >
              2
            </Pagination.Item>
            <Pagination.Item 
              active={activePage === 3} 
              onClick={() => setActivePage(3)}
              linkStyle={{
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13.5px',
                fontWeight: '700',
                background: activePage === 3 ? '#1a6b3c' : 'transparent',
                color: activePage === 3 ? '#ffffff' : '#64748b'
              }}
            >
              3
            </Pagination.Item>
            <Pagination.Ellipsis 
              linkStyle={{
                border: 'none',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8'
              }}
            />
            <Pagination.Item 
              active={activePage === 12} 
              onClick={() => setActivePage(12)}
              linkStyle={{
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13.5px',
                fontWeight: '700',
                background: activePage === 12 ? '#1a6b3c' : 'transparent',
                color: activePage === 12 ? '#ffffff' : '#64748b'
              }}
            >
              12
            </Pagination.Item>
          </Pagination>
        </div>

      </div>

    </Col>
  );
};

export default CourtList;
