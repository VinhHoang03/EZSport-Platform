import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row } from 'react-bootstrap';
import CourtList from '../../../components/player/VenueList';
import LeftFilterSidebar from '../../../components/player/LeftFilterSidebar';
import api from '../../../api/api';

// Haversine formula — same as App.tsx
const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1) + ' km';
};

interface Court {
  id: string;
  _id: string;
  name: string;
  image: string;
  rating: number;
  location: string;
  distance: string;
  price: string;
  emoji: string;
  trending: boolean;
  active: boolean;
  lat: number;
  lng: number;
  sportType?: string;
}

const VenuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  // User GPS location
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);



  // Filter states
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);

  // Auto-request GPS on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('[VenuesPage] Geolocation error:', err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await api.get('/venues');
        const formatted: Court[] = response.data.data.map((court: any) => ({
          ...court,
          id: court._id,
          emoji: court.emoji || '🏟️',
          distance: '-- km',
          trending: false,
          active: court.isActive ?? true,
        }));
        setCourts(formatted);
      } catch (error) {
        console.error('VenuesPage: Error fetching courts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, []);

  // Recalculate distances whenever user location or courts change
  const courtsWithDistance = courts.map(court => ({
    ...court,
    distance: userLocation
      ? calcDistance(userLocation.lat, userLocation.lng, court.lat, court.lng)
      : court.distance,
  }));



  // Apply filters on courts WITH real distances
  const filteredCourts = courtsWithDistance.filter(court => {
    if (selectedSports.length > 0) {
      const lowerSport = (court.sportType || '').toLowerCase();
      const match = selectedSports.some(s => {
        const ls = s.toLowerCase();
        return lowerSport.includes(ls) ||
          (ls === 'cầu lông' && lowerSport.includes('badminton')) ||
          (ls === 'bóng đá' && lowerSport.includes('soccer'));
      });
      if (!match) return false;
    }
    // Filter by distance (only when we have user GPS)
    if (userLocation && court.lat && court.lng) {
      const dist = parseFloat(calcDistance(userLocation.lat, userLocation.lng, court.lat, court.lng));
      if (dist > maxDistance) return false;
    }
    // Extract the FIRST number from price string (e.g. "150.000 - 200.000 VNĐ/Giờ" → 150000)
    const firstNumStr = (court.price || '').replace(/\./g, '').replace(/,/g, '').match(/\d+/)?.[0] || '0';
    const priceNum = parseInt(firstNumStr, 10) || 0;
    if (priceMin) {
      // Strip Vietnamese thousands separators (dots/commas) from user input
      const cleanMin = priceMin.replace(/\./g, '').replace(/,/g, '');
      const minVal = parseInt(cleanMin, 10);
      const normalizedMin = minVal > 0 && minVal < 10000 ? minVal * 1000 : minVal;
      if (priceNum < normalizedMin) return false;
    }
    if (priceMax) {
      const cleanMax = priceMax.replace(/\./g, '').replace(/,/g, '');
      const maxVal = parseInt(cleanMax, 10);
      const normalizedMax = maxVal > 0 && maxVal < 10000 ? maxVal * 1000 : maxVal;
      if (priceNum > normalizedMax) return false;
    }
    if (court.rating < minRating) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile layout: stacked vertically (accordion filter on top, list below) ── */}
      <div className="d-flex flex-column d-md-none h-100 overflow-auto bg-white">
        <LeftFilterSidebar
          collapsible
          selectedSports={selectedSports}
          onSportsChange={setSelectedSports}
          maxDistance={maxDistance}
          onDistanceChange={setMaxDistance}
          priceMin={priceMin}
          priceMax={priceMax}
          onPriceMinChange={setPriceMin}
          onPriceMaxChange={setPriceMax}
          selectedAmenities={selectedAmenities}
          onAmenitiesChange={setSelectedAmenities}
          minRating={minRating}
          onRatingChange={setMinRating}
          onApplyFilters={() => {}}
          onResetFilters={() => {
            setSelectedSports([]);
            setMaxDistance(15);
            setPriceMin('');
            setPriceMax('');
            setSelectedAmenities([]);
            setMinRating(0);
          }}
        />
        <div style={{ flex: 1 }}>
          <CourtList
            venues={filteredCourts}
            layout="horizontal"
            currentLocationName={userLocation ? 'Vị trí của bạn' : 'Đà Nẵng, Việt Nam'}
            onDetailClick={(id) => navigate(`/venues/${id}`)}
            onBookingClick={(id) => navigate(`/venues/${id}`)}
          />
        </div>
      </div>

      {/* ── Desktop layout: left sidebar + right list ── */}
      <div className="d-none d-md-flex h-100 overflow-hidden">
        <div className="h-100 flex-shrink-0 border-end bg-white" style={{ width: '280px' }}>
          <div className="h-100 overflow-auto">
            <LeftFilterSidebar
              selectedSports={selectedSports}
              onSportsChange={setSelectedSports}
              maxDistance={maxDistance}
              onDistanceChange={setMaxDistance}
              priceMin={priceMin}
              priceMax={priceMax}
              onPriceMinChange={setPriceMin}
              onPriceMaxChange={setPriceMax}
              selectedAmenities={selectedAmenities}
              onAmenitiesChange={setSelectedAmenities}
              minRating={minRating}
              onRatingChange={setMinRating}
              onApplyFilters={() => {}}
              onResetFilters={() => {
                setSelectedSports([]);
                setMaxDistance(15);
                setPriceMin('');
                setPriceMax('');
                setSelectedAmenities([]);
                setMinRating(0);
              }}
            />
          </div>
        </div>
        <div className="flex-grow-1 h-100 overflow-hidden">
          <Row className="h-100 g-0">
            <CourtList
              venues={filteredCourts}
              layout="horizontal"
              currentLocationName={userLocation ? 'Vị trí của bạn' : 'Đà Nẵng, Việt Nam'}
              onDetailClick={(id) => navigate(`/venues/${id}`)}
              onBookingClick={(id) => navigate(`/venues/${id}`)}
            />
          </Row>
        </div>
      </div>
    </>
  );
};

export default VenuesPage;

