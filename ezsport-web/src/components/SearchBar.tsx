import React from 'react';
import { motion } from 'framer-motion';
import { Form, Button } from 'react-bootstrap';

interface SearchBarProps {
  sport: string;
  setSport: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ sport, setSport, location, setLocation, date, setDate }) => {
  return (
    <motion.div 
      drag
      dragElastic={0.1}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      className="position-absolute bottom-0 start-50 translate-middle-x z-3 mb-5 bg-white rounded-pill shadow-lg d-flex align-items-center p-2 border border-success border-opacity-10 w-75 mw-100 cursor-grab"
      style={{ maxWidth: '750px', touchAction: 'none', backgroundColor: '#ffffff', color: '#2c2f2f' }}
    >

      {/* Drag Handle */}
      <div className="px-2 text-muted opacity-50">
        <span className="material-symbols-outlined fs-5">drag_indicator</span>
      </div>

      <div className="flex-fill d-flex align-items-center px-2 border-end border-light">
        <span className="material-symbols-outlined text-success fs-5 me-2">sports_tennis</span>
        <Form.Control 
          className="bg-transparent border-0 shadow-none fw-bold small p-0" 
          placeholder="Sport" 
          type="text" 
          value={sport}
          onChange={(e) => setSport(e.target.value)}
        />
      </div>
      <div className="flex-fill d-flex align-items-center px-3 border-end border-light">
        <span className="material-symbols-outlined text-success fs-5 me-2">location_on</span>
        <Form.Control 
          className="bg-transparent border-0 shadow-none fw-bold small p-0" 
          placeholder="Location" 
          type="text" 
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>
      <div className="flex-fill d-flex align-items-center px-3">
        <span className="material-symbols-outlined text-success fs-5 me-2">calendar_today</span>
        <Form.Control 
          className="bg-transparent border-0 shadow-none fw-bold small p-0" 
          placeholder="Date" 
          type="text" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <Button 
        variant="success" 
        className="rounded-circle d-flex align-items-center justify-content-center shadow-sm ms-2"
        style={{ width: '48px', height: '48px' }}
      >
        <span className="material-symbols-outlined">search</span>
      </Button>
    </motion.div>
  );
};


export default SearchBar;
