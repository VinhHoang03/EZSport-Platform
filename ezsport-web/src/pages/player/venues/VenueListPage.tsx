import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row } from 'react-bootstrap';
import CourtList from '../../../components/player/VenueList';
import LeftFilterSidebar from '../../../components/player/LeftFilterSidebar';
import MapComponent from '../../../components/shared/MapComponent';
import api from '../../../api/api';

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

  // Filter states
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(3);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await api.get('/venues');
        const formatted: Court[] = response.data.data.map((court: any) => ({
          ...court,
          id: court._id,
          emoji: court.emoji || '🏟️',
          distance: '0.0 km',
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

  // Apply filters
  const filteredCourts = courts.filter(court => {
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
    const priceNum = parseInt((court.price || '').replace(/[^0-9]/g, ''), 10) || 0;
    if (priceMin && priceNum < parseInt(priceMin, 10)) return false;
    if (priceMax && priceNum > parseInt(priceMax, 10)) return false;
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
    <div className="d-flex h-100 overflow-hidden">
      {/* Left Filter Sidebar */}
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
              setMinRating(3);
            }}
          />
        </div>
      </div>

      {/* Court List + Map */}
      <div className="flex-grow-1 h-100 overflow-hidden">
        <Row className="h-100 g-0">
          <CourtList
            venues={filteredCourts}
            layout="horizontal"
            currentLocationName="Đà Nẵng, Việt Nam"
            onDetailClick={(id) => navigate(`/venues/${id}`)}
            onBookingClick={(id) => navigate(`/booking/${id}`)}
            onDirectionsClick={() => {}}
          />
          <div className="col-md-5 h-100 position-relative bg-light">
            <div className="position-absolute h-100 w-100">
              <MapComponent
                courts={filteredCourts}
                onLocationFound={() => {}}
                userLocation={null}
                routingDestination={null}
                routeSummary={null}
                onClearRoute={() => {}}
                onDirectionsClick={() => {}}
                onRouteInfo={() => {}}
                isNavigating={false}
              />
            </div>
          </div>
        </Row>
      </div>
    </div>
  );
};

export default VenuesPage;
