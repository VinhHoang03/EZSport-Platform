import React from 'react';
import { Col } from 'react-bootstrap';
import CourtCard from './CourtCard';
import FilterBar from './sidebar/FilterBar';

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
  emoji: string;
}

interface CourtListProps {
  courts: Court[];
  onFilterClick?: () => void;
}

const CourtList: React.FC<CourtListProps> = ({ courts, onFilterClick }) => {
  return (
    <Col md={4} className="h-100 d-flex flex-column bg-white border-end">
      <FilterBar count={courts.length} onFilterClick={onFilterClick} />

      <div className="flex-grow-1 overflow-auto px-4 pb-5 custom-scrollbar">
        {courts.map((court) => (
          <CourtCard 
            key={court.id} 
            {...court} 
          />
        ))}
      </div>
    </Col>
  );
};

export default CourtList;
