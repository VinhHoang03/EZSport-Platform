import React from 'react';
import { Button, Badge } from 'react-bootstrap';

interface FilterBarProps {
  count: number;
  onFilterClick?: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ count, onFilterClick }) => {
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">{count} courts found in Da Nang</h5>
        <Button 
          variant="outline-success" 
          className="rounded-pill px-3 py-1 small d-flex align-items-center gap-2"
          onClick={onFilterClick}
        >
          <span className="material-symbols-outlined fs-6">tune</span>
          Filters
        </Button>
      </div>
      <div className="d-flex gap-2 overflow-auto pb-2 custom-scrollbar">
        {['Pickleball', 'Football', 'Badminton', 'Tennis'].map((cat, i) => (
          <Badge 
            key={cat}
            pill 
            bg={i === 0 ? "success" : "light"} 
            className={`px-3 py-2 cursor-pointer ${i === 0 ? '' : 'text-muted border'}`}
          >
            {cat}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;
