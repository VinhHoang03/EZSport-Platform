import React, { useState } from 'react';
import { Col, Form, Pagination } from 'react-bootstrap';
import VenueCard from '../ui/VenueCard';
import FilterBar from './FilterBar';

interface Venue {
  id: number | string;
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
  sportTypes?: string[];
}

interface VenueListProps {
  venues: Venue[];
  layout?: 'vertical' | 'horizontal';
  currentLocationName?: string;
  onFilterClick?: () => void;
  onDirectionsClick?: (lat: number, lng: number) => void;
  onDetailClick?: (id: number | string) => void;
  onBookingClick?: (id: number | string) => void;
}

const VenueList: React.FC<VenueListProps> = ({ 
  venues, 
  layout = 'vertical', 
  currentLocationName,
  onFilterClick, 
  onDirectionsClick,
  onDetailClick,
  onBookingClick
}) => {
  const [sortBy, setSortBy] = useState('Gần tôi nhất');
  const [activePage, setActivePage] = useState(1);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const toggleSport = (key: string) => {
    if (key === 'all') { setSelectedSports([]); return; }
    setSelectedSports(prev =>
      prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
    );
  };

  // ── Render 1: Original Vertical Simple List (For Home Map Page) ──
  if (layout === 'vertical') {
    const filtered = selectedSports.length === 0
      ? venues
      : venues.filter(v =>
          (v.sportTypes ?? []).some(s =>
            selectedSports.some(sel => s.toLowerCase().includes(sel))
          )
        );

    return (
      <Col md={4} className="h-100 d-flex flex-column bg-white border-end">
        <FilterBar
          count={filtered.length}
          onFilterClick={onFilterClick}
          currentLocationName={currentLocationName}
          selectedSports={selectedSports}
          onSportToggle={toggleSport}
        />

        <div className="flex-grow-1 overflow-auto px-4 pb-5 custom-scrollbar">
          {filtered.map((venue) => (
            <VenueCard 
              key={venue.id} 
              {...venue} 
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
  // Sort and Paginate for Discovery list
  const sortedVenues = [...venues].sort((a, b) => {
    if (sortBy === 'Giá thấp nhất') {
      const priceA = parseInt((a.price || '').replace(/[^0-9]/g, ''), 10) || 0;
      const priceB = parseInt((b.price || '').replace(/[^0-9]/g, ''), 10) || 0;
      return priceA - priceB;
    }
    if (sortBy === 'Đánh giá cao nhất') {
      return (b.rating || 0) - (a.rating || 0);
    }
    if (sortBy === 'Gần tôi nhất') {
      const distA = parseFloat((a.distance || '').replace(/[^0-9.]/g, '')) || 999999;
      const distB = parseFloat((b.distance || '').replace(/[^0-9.]/g, '')) || 999999;
      return distA - distB;
    }
    return 0;
  });

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(sortedVenues.length / ITEMS_PER_PAGE);
  const safeActivePage = Math.min(activePage, totalPages || 1);
  const paginatedVenues = sortedVenues.slice((safeActivePage - 1) * ITEMS_PER_PAGE, safeActivePage * ITEMS_PER_PAGE);

  return (
    <Col md={12} className="h-100 d-flex flex-column bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Search & Filter Header ── */}
      <div className="p-4 border-bottom" style={{ background: '#ffffff' }}>
        
        {/* Row 1: Heading, Sort dropdown, and View Toggle */}
        <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-3">
          <div>
            <h5 className="fw-bold mb-1" style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
              Tìm thấy {venues.length} sân
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
              onChange={(e) => { setSortBy(e.target.value); setActivePage(1); }}
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
          </div>
        </div>

      </div>

      {/* ── Venue List Scroll Container ── */}
      <div 
        className="flex-grow-1 overflow-auto px-4 py-3 custom-scrollbar" 
        style={{ background: '#f8fafc' }}
      >
        {paginatedVenues.map((venue, i) => (
          <VenueCard 
            key={venue.id} 
            {...venue} 
            index={(safeActivePage - 1) * ITEMS_PER_PAGE + i + 1}
            layout="horizontal"
            onDirectionsClick={onDirectionsClick}
            onDetailClick={onDetailClick}
            onBookingClick={onBookingClick}
          />
        ))}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4 mb-3">
            <Pagination className="m-0 gap-1" style={{ userSelect: 'none' }}>
              <Pagination.First
                disabled={safeActivePage === 1}
                onClick={() => setActivePage(1)}
                linkStyle={{
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: safeActivePage === 1 ? '#cbd5e1' : '#64748b',
                  background: 'transparent'
                }}
              />
              <Pagination.Prev
                disabled={safeActivePage === 1}
                onClick={() => setActivePage(safeActivePage - 1)}
                linkStyle={{
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: safeActivePage === 1 ? '#cbd5e1' : '#64748b',
                  background: 'transparent'
                }}
              />
              {Array.from({ length: totalPages }).map((_, idx) => {
                const p = idx + 1;
                const isCurrent = p === safeActivePage;
                return (
                  <Pagination.Item 
                    key={p}
                    active={isCurrent} 
                    onClick={() => setActivePage(p)}
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
                      background: isCurrent ? '#1a6b3c' : 'transparent',
                      color: isCurrent ? '#ffffff' : '#64748b'
                    }}
                  >
                    {p}
                  </Pagination.Item>
                );
              })}
              <Pagination.Next
                disabled={safeActivePage === totalPages}
                onClick={() => setActivePage(safeActivePage + 1)}
                linkStyle={{
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: safeActivePage === totalPages ? '#cbd5e1' : '#64748b',
                  background: 'transparent'
                }}
              />
              <Pagination.Last
                disabled={safeActivePage === totalPages}
                onClick={() => setActivePage(totalPages)}
                linkStyle={{
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: safeActivePage === totalPages ? '#cbd5e1' : '#64748b',
                  background: 'transparent'
                }}
              />
            </Pagination>
          </div>
        )}

      </div>

    </Col>
  );
};

export default VenueList;
