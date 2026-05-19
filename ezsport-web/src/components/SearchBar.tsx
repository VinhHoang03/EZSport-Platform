import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Form, Button } from 'react-bootstrap';

interface SearchBarProps {
  sport: string;
  setSport: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  date: string;
  setDate: (val: string) => void;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  sport, setSport, location, setLocation, date, setDate, onLocationSelect 
}) => {
  const autocompleteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const initAutocomplete = () => {
      if (!autocompleteRef.current) return;
      if (!window.google?.maps?.places) return; // API not loaded yet

      const autocomplete = new google.maps.places.Autocomplete(autocompleteRef.current, {
        componentRestrictions: { country: "VN" },
        fields: ["address_components", "geometry", "formatted_address"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || "";

          setLocation(address);
          if (onLocationSelect) {
            onLocationSelect(lat, lng, address);
          }
        }
      });

      clearInterval(intervalId); // stop polling once initialized
    };

    // Try immediately, then poll every 200ms until Google Maps is ready
    initAutocomplete();
    intervalId = setInterval(initAutocomplete, 200);

    return () => clearInterval(intervalId);
  }, [onLocationSelect]);

  return (
    <motion.div 
      drag
      dragElastic={0.1}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      className="position-absolute bottom-0 start-50 translate-middle-x z-3 mb-5 rounded-pill shadow-lg d-flex align-items-center p-2 border cursor-grab"
      style={{ 
        maxWidth: '780px', 
        width: '85%',
        touchAction: 'none', 
        backgroundColor: 'rgba(255, 255, 255, 0.90)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        color: '#0f172a',
        borderColor: 'rgba(26,107,60,0.15)',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.15)'
      }}
    >

      {/* Drag Handle */}
      <div className="px-2 text-muted opacity-50" style={{ cursor: 'grab' }}>
        <span className="material-symbols-outlined fs-5" style={{ color: '#64748b' }}>drag_indicator</span>
      </div>

      <div className="flex-fill d-flex align-items-center px-3 border-end" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <span className="material-symbols-outlined fs-5 me-2" style={{ color: '#1a6b3c' }}>sports_tennis</span>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Môn thể thao</div>
          <Form.Control 
            className="bg-transparent border-0 shadow-none fw-bold small p-0" 
            placeholder="Pickleball, Cầu lông..." 
            type="text" 
            value={sport}
            onChange={(e) => setSport(e.target.value)}
            style={{ fontSize: '13.5px', color: '#0f172a' }}
          />
        </div>
      </div>
      <div className="flex-fill d-flex align-items-center px-3 border-end" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
        <span className="material-symbols-outlined fs-5 me-2" style={{ color: '#1a6b3c' }}>location_on</span>
        <div style={{ width: '100%' }}>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Địa điểm</div>
          <Form.Control 
            ref={autocompleteRef}
            className="bg-transparent border-0 shadow-none fw-bold small p-0" 
            placeholder="Địa chỉ, quận..." 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ fontSize: '13.5px', color: '#0f172a' }}
          />
        </div>
      </div>
      <div className="flex-fill d-flex align-items-center px-3">
        <span className="material-symbols-outlined fs-5 me-2" style={{ color: '#1a6b3c' }}>calendar_today</span>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Ngày đặt</div>
          <Form.Control 
            className="bg-transparent border-0 shadow-none fw-bold small p-0" 
            placeholder="Hôm nay" 
            type="text" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ fontSize: '13.5px', color: '#0f172a' }}
          />
        </div>
      </div>
      <Button 
        variant="success" 
        className="rounded-circle d-flex align-items-center justify-content-center shadow-sm ms-2 hover-scale border-0"
        style={{ 
          width: '46px', 
          height: '46px', 
          background: '#1a6b3c',
          boxShadow: '0 8px 20px rgba(26,107,60,0.3)'
        }}
      >
        <span className="material-symbols-outlined fs-5" style={{ color: 'white' }}>search</span>
      </Button>
    </motion.div>
  );
};

export default SearchBar;

