import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import SearchBar from './components/SearchBar';
import MapComponent from './components/MapComponent';
import Navigation from './components/Navigation';
import CourtList from './components/CourtList';
import NavigationPanel from './components/NavigationPanel';
import api from './api/api';
import AddCourtModal from './components/AddCourtModal';

// Haversine formula to calculate distance between two coordinates in KM
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
};

const App: React.FC = () => {
  const [sport, setSport] = useState('Pickleball');
  const [location, setLocation] = useState('Da Nang, Vietnam');
  const [date, setDate] = useState('Sat, 24 Aug');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routingDestination, setRoutingDestination] = useState<{ lat: number; lng: number } | null>(null);
  const [routeSummary, setRouteSummary] = useState<{ distance: number; time: number } | null>(null);
  const [destinationName, setDestinationName] = useState('');
  const [navMinimized, setNavMinimized] = useState(false); // navigation panel minimized state

  const [courts, setCourts] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchCourts = async () => {
    try {
      const response = await api.get('/courts');
      setCourts(response.data.data);
    } catch (error) {
      console.error('Error fetching courts:', error);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleDirections = useCallback((lat: number, lng: number, name?: string) => {
    setRoutingDestination({ lat, lng });
    setDestinationName(name || 'sân đã chọn');
    setRouteSummary(null);
    setNavMinimized(false);

    // Auto-request GPS if we don't have user location yet
    if (!userLocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          (err) => console.warn('Geolocation error:', err),
          { enableHighAccuracy: true, timeout: 10000 }
        );
      }
    }
  }, [userLocation]);

  const handleLocationSelect = useCallback((lat: number, lng: number, address?: string) => {
    if (address) setLocation(address);
    setUserLocation({ lat, lng });
  }, []);

  const handleClearRoute = useCallback(() => {
    setRoutingDestination(null);
    setRouteSummary(null);
    setDestinationName('');
    setNavMinimized(false);
  }, []);

  const handleRouteInfo = useCallback((distance: number, time: number) => {
    setRouteSummary({ distance, time });
  }, []);

  // Calculate dynamic distances based on user location
  const processedCourts = courts.map(court => ({
    ...court,
    distance: userLocation
      ? `${calculateDistance(userLocation.lat, userLocation.lng, court.lat, court.lng)} km`
      : (court.distance || '0.0 km'),
  }));

  const isNavigating = !!routingDestination;

  return (
    <div className="vh-100 d-flex flex-column bg-white">
      <Navigation onAddCourtClick={() => setShowAddModal(true)} />

      <Container fluid className="flex-grow-1 overflow-hidden p-0">
        <Row className="h-100 g-0">
          {/* Hide court list while navigating for more map space */}
          {!isNavigating && (
            <CourtList
              courts={processedCourts}
              onDirectionsClick={(lat, lng) => {
                const court = processedCourts.find(c => c.lat === lat && c.lng === lng);
                handleDirections(lat, lng, court?.name);
              }}
            />
          )}

          <Col md={isNavigating ? 12 : 8} className="h-100 position-relative bg-light" style={{ transition: 'all 0.3s ease' }} id="map-col">
            <div className="position-absolute h-100 w-100">
              <MapComponent
                courts={processedCourts}
                onLocationFound={handleLocationSelect}
                userLocation={userLocation}
                routingDestination={routingDestination}
                routeSummary={routeSummary}
                onClearRoute={handleClearRoute}
                onDirectionsClick={(lat, lng) => {
                  const court = processedCourts.find(c => c.lat === lat && c.lng === lng);
                  handleDirections(lat, lng, court?.name);
                }}
                onRouteInfo={handleRouteInfo}
                isNavigating={isNavigating}
              />
            </div>

            {/* Search this area button — hide while navigating */}
            {!isNavigating && (
              <div className="position-absolute top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 1000 }}>
                <Button variant="white" className="rounded-pill shadow-lg fw-bold px-4 py-3 d-flex align-items-center gap-2 border">
                  <span className="material-symbols-outlined text-success">refresh</span>
                  Search this area
                </Button>
              </div>
            )}

            {/* Navigation panel — shown while navigating */}
            {isNavigating && routeSummary && (
              <NavigationPanel
                destination={destinationName}
                distance={routeSummary.distance}
                time={routeSummary.time}
                onCancel={handleClearRoute}
                isMinimized={navMinimized}
                onToggleMinimize={() => setNavMinimized(prev => !prev)}
              />
            )}

            {/* Search bar — hide while navigating */}
            {!isNavigating && (
              <div className="position-absolute bottom-0 start-0 w-100" style={{ zIndex: 1001 }}>
                <SearchBar
                  sport={sport} setSport={setSport}
                  location={location} setLocation={setLocation}
                  date={date} setDate={setDate}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
            )}
          </Col>
        </Row>
      </Container>

      <AddCourtModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={fetchCourts}
      />
    </div>
  );
};

export default App;
