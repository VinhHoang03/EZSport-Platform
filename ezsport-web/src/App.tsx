import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import SearchBar from './components/shared/SearchBar';
import MapComponent from './components/shared/MapComponent';
import Navigation from './components/shared/Navigation';
import CourtList from './components/player/CourtList';
import LeftFilterSidebar from './components/player/LeftFilterSidebar';
import NavigationPanel from './components/shared/NavigationPanel';
import api from './api/api';
import AddCourtModal from './components/player/AddCourtModal';
import { LandingPage } from './components/shared/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { useAuth } from './context/AuthContext';
import { CourtDetail } from './components/player/CourtDetail';
import { CheckoutPage } from './components/player/CheckoutPage';
import { BookingSuccessPage } from './components/player/BookingSuccessPage';
import { ProfilePage } from './components/player/ProfilePage';
import { OwnerDashboard } from './components/owner/OwnerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { PlaymatesPage } from './components/player/PlaymatesPage';
import { AIChatbot } from './components/shared/AIChatbot';
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
  const { isAuthenticated, user } = useAuth();

  // Detect reset-password route from URL path — now handled by router
  const [currentPage, setCurrentPage] = useState<'landing' | 'app' | 'auth' | 'venues' | 'court-detail' | 'checkout' | 'booking-success' | 'profile' | 'owner-dashboard' | 'admin-dashboard' | 'playmates'>('landing');
  const [selectedCourtId, setSelectedCourtId] = useState<number | string | null>(null);

  // Redirect on page change: if authenticated and on a guest-only page, send to the right home
  useEffect(() => {
    if (isAuthenticated && (currentPage === 'landing' || currentPage === 'auth')) {
      if (user?.role === 'admin') {
        setCurrentPage('admin-dashboard');
      } else if (user?.role === 'owner') {
        setCurrentPage('owner-dashboard');
      } else {
        setCurrentPage('app');
      }
    }
  }, [isAuthenticated, currentPage, user]);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [authInitialAccountType, setAuthInitialAccountType] = useState<'player' | 'owner' | 'shop'>('player');

  // Smart logo click: if logged in, go to correct home for role. If not, go to landing.
  const handleLogoClick = () => {
    if (!isAuthenticated) {
      setCurrentPage('landing');
    } else if (user?.role === 'admin') {
      setCurrentPage('admin-dashboard');
    } else if (user?.role === 'owner') {
      setCurrentPage('owner-dashboard');
    } else {
      setCurrentPage('app');
    }
  };
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
      const formattedCourts = response.data.data.map((court: any) => ({
        ...court,
        id: court._id, // Map MongoDB _id to frontend id
      }));
      setCourts(formattedCourts);
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

  const handleCheckIn = async () => {
    if (!routingDestination || !userLocation) return;

    // Tìm ID của sân đang dẫn đường
    const currentCourt = processedCourts.find(c => c.lat === routingDestination.lat && c.lng === routingDestination.lng);
    if (!currentCourt) return;

    try {
      const response = await api.post(`/courts/${currentCourt._id}/check-in`, {
        userLat: userLocation.lat,
        userLng: userLocation.lng
      });

      alert(`🎉 Chúc mừng! Bạn đã nhận được ${response.data.pointsEarned} điểm tích lũy.\nTổng điểm hiện tại: ${response.data.totalPoints}`);
      handleClearRoute();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi check-in');
    }
  };

  // Calculate dynamic distances based on user location
  const processedCourts = courts.map(court => ({
    ...court,
    distance: userLocation
      ? `${calculateDistance(userLocation.lat, userLocation.lng, court.lat, court.lng)} km`
      : (court.distance || '0.0 km'),
  }));

  // States for Left Filter Sidebar
  const [selectedSports, setSelectedSports] = useState<string[]>(['Pickleball']); // default checked Pickleball like the mockup
  const [maxDistance, setMaxDistance] = useState<number>(8); // default max distance 8km
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(4); // default 4 stars

  // Apply all vertical filters dynamically
  const filteredCourts = processedCourts.filter(court => {
    // 1. Filter by Sport Type
    if (selectedSports.length > 0) {
      const lowerSport = (court.sportType || '').toLowerCase();
      const match = selectedSports.some(sportVal => {
        const lowerVal = sportVal.toLowerCase();
        return lowerSport.includes(lowerVal) || 
               (lowerVal === 'cầu lông' && lowerSport.includes('badminton')) ||
               (lowerVal === 'bóng đá' && lowerSport.includes('football'));
      });
      if (!match) return false;
    }

    // 2. Filter by Distance
    if (userLocation) {
      const dist = parseFloat(calculateDistance(userLocation.lat, userLocation.lng, court.lat, court.lng));
      if (dist > maxDistance) return false;
    }

    // 3. Filter by Price Min / Max
    const priceNum = parseInt((court.price || '').replace(/[^0-9]/g, ''), 10) || 0;
    if (priceMin && priceNum < parseInt(priceMin, 10)) return false;
    if (priceMax && priceNum > parseInt(priceMax, 10)) return false;

    // 4. Filter by Rating
    if (court.rating < minRating) return false;

    return true;
  });

  const isNavigating = !!routingDestination;

  if (currentPage === 'landing') {
    return (
      <LandingPage 
        onExplore={() => setCurrentPage('venues')} 
        onLogin={() => {
          setAuthInitialMode('login');
          setAuthInitialAccountType('player');
          setCurrentPage('auth');
        }} 
        onRegisterVenue={() => {
          setAuthInitialMode('register');
          setAuthInitialAccountType('owner');
          setCurrentPage('auth');
        }}
        courts={courts}
      />
    );
  }

  if (currentPage === 'auth') {
    return (
      <AuthPage 
        onBackToLanding={() => setCurrentPage('landing')} 
        onSuccess={(role?: string) => {
          if (role === 'admin') {
            setCurrentPage('admin-dashboard');
          } else if (role === 'owner') {
            setCurrentPage('owner-dashboard');
          } else {
            setCurrentPage('venues');
          }
        }}
        initialMode={authInitialMode}
        initialAccountType={authInitialAccountType}
      />
    );
  }

  // ── Render 1: Dedicated 3-Column Split Discovery View (Venues Page) ──
  // Shared top navigation header spans 100% viewport width, with the 3 columns sitting underneath it.
  if (currentPage === 'venues') {
    return (
      <div className="vh-100 vw-100 d-flex flex-column overflow-hidden bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
        
        {/* Shared Top Navigation Header */}
        <Navigation 
          onAddCourtClick={() => setShowAddModal(true)} 
          onLogoClick={handleLogoClick} 
          onLoginClick={() => {
            setAuthInitialMode('login');
            setAuthInitialAccountType('player');
            setCurrentPage('auth');
          }}
          onRegisterOwnerClick={() => {
            setAuthInitialMode('register');
            setAuthInitialAccountType('owner');
            setCurrentPage('auth');
          }}
          onPageChange={(page) => setCurrentPage(page)}
          currentPage={currentPage}
        />

        {/* 3-Column Split Discovery Layout (Underneath Header) */}
        <div className="w-100 d-flex overflow-hidden flex-grow-1" style={{ height: 'calc(100vh - 93px)' }}>
          
          {/* Column 1: Left Filter Sidebar */}
          <div 
            className="h-100 flex-shrink-0 d-flex flex-column border-end bg-white" 
            style={{ width: '280px', borderColor: '#e2e8f0' }}
          >
            {/* Scrollable Filters List */}
            <div className="flex-grow-1 overflow-auto">
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

          {/* Right Content Pane: Results List + Map Component */}
          <div className="flex-grow-1 h-100 d-flex flex-column overflow-hidden">
            
            {/* Bottom Split Results List and Map Panel */}
            <div className="flex-grow-1 w-100 overflow-hidden">
              <Row className="h-100 g-0">
                
                {/* Cột giữa: Results List */}
                <CourtList
                  courts={filteredCourts}
                  layout="horizontal"
                  currentLocationName={location}
                  onDirectionsClick={(lat, lng) => {
                    const court = processedCourts.find(c => c.lat === lat && c.lng === lng);
                    handleDirections(lat, lng, court?.name);
                  }}
                  onDetailClick={(id) => {
                    setSelectedCourtId(id);
                    setCurrentPage('court-detail');
                  }}
                  onBookingClick={(id) => {
                    setSelectedCourtId(id);
                    setCurrentPage('checkout');
                  }}
                />

                {/* Cột phải: Map Component */}
                <Col md={5} className="h-100 position-relative bg-light">
                  <div className="position-absolute h-100 w-100">
                    <MapComponent
                      courts={filteredCourts}
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

                  {/* Search this area button */}
                  <div className="position-absolute start-50 translate-middle-x" style={{ bottom: '24px', zIndex: 1000 }}>
                    <Button 
                      variant="white" 
                      className="rounded-pill shadow-lg fw-bold px-4 py-3 d-flex align-items-center gap-2 border"
                      style={{
                        background: '#ffffff',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px'
                      }}
                    >
                      <span className="material-symbols-outlined text-success" style={{ color: '#1a6b3c' }}>explore</span>
                      Tìm quanh đây
                    </Button>
                  </div>
                </Col>

              </Row>
            </div>

          </div>

        </div>
        
        <AIChatbot
          onDirectionsClick={handleDirections}
          onDetailClick={(id) => {
            setSelectedCourtId(id);
            setCurrentPage('court-detail');
          }}
          onBookingClick={(id) => {
            setSelectedCourtId(id);
            setCurrentPage('checkout');
          }}
          onLocationFound={handleLocationSelect}
          setCurrentPage={setCurrentPage}
        />
      </div>
    );
  }

  if (currentPage === 'court-detail') {
    return (
      <CourtDetail 
        courtId={selectedCourtId || 1} 
        onBackClick={() => setCurrentPage('venues')} 
        onConfirmBooking={() => setCurrentPage('checkout')}
        onPageChange={(page) => setCurrentPage(page)}
        onLogoClick={handleLogoClick}
      />
    );
  }

  if (currentPage === 'checkout') {
    return (
      <CheckoutPage 
        courtId={selectedCourtId || 1} 
        onBackClick={() => setCurrentPage('court-detail')} 
        onSuccessClick={() => setCurrentPage('booking-success')}
        onPageChange={(page) => setCurrentPage(page)}
        onLogoClick={handleLogoClick}
      />
    );
  }

  if (currentPage === 'booking-success') {
    return (
      <BookingSuccessPage 
        onGoHome={() => setCurrentPage('venues')}
        onViewMyBookings={() => setCurrentPage('profile')}
      />
    );
  }

  if (currentPage === 'profile') {
    return (
      <ProfilePage 
        onGoHome={() => setCurrentPage('venues')}
        onFindCourts={() => setCurrentPage('venues')}
        onPageChange={(page) => setCurrentPage(page)}
        onLogoClick={handleLogoClick}
      />
    );
  }

  if (currentPage === 'playmates') {
    return (
      <PlaymatesPage 
        onPageChange={(page) => setCurrentPage(page)}
        onLogoClick={handleLogoClick}
      />
    );
  }

  if (currentPage === 'owner-dashboard') {
    return (
      <OwnerDashboard 
        onGoHome={() => setCurrentPage('landing')}
      />
    );
  }

  if (currentPage === 'admin-dashboard') {
    return (
      <AdminDashboard 
        onGoHome={() => setCurrentPage('landing')}
      />
    );
  }

  // ── Render 2: Original 2-Column Map Dashboard (App Home Page) ──
  return (
    <div className="vh-100 d-flex flex-column bg-white">
      <Navigation 
        onAddCourtClick={() => setShowAddModal(true)} 
        onLogoClick={handleLogoClick} 
        onLoginClick={() => {
          setAuthInitialMode('login');
          setAuthInitialAccountType('player');
          setCurrentPage('auth');
        }}
        onRegisterOwnerClick={() => {
          setAuthInitialMode('register');
          setAuthInitialAccountType('owner');
          setCurrentPage('auth');
        }}
        onPageChange={(page) => setCurrentPage(page)}
        currentPage={currentPage}
      />

      <Container fluid className="flex-grow-1 overflow-hidden p-0">
        <Row className="h-100 g-0">
          {currentPage === 'app' && !isNavigating && (
            <CourtList
              courts={processedCourts}
              layout="vertical"
              currentLocationName={location}
              onFilterClick={() => setCurrentPage('venues')} // Click "Bộ lọc" goes to Venues discovery page!
              onDirectionsClick={(lat, lng) => {
                const court = processedCourts.find(c => c.lat === lat && c.lng === lng);
                handleDirections(lat, lng, court?.name);
              }}
              onDetailClick={(id) => {
                setSelectedCourtId(id);
                setCurrentPage('court-detail');
              }}
              onBookingClick={(id) => {
                setSelectedCourtId(id);
                setCurrentPage('checkout');
              }}
            />
          )}

          <Col 
            md={isNavigating ? 12 : 8} 
            className="h-100 position-relative bg-light" 
            style={{ transition: 'all 0.3s ease' }} 
            id="map-col"
          >
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
              <div 
                className="position-absolute start-50 translate-middle-x" 
                style={{ 
                  bottom: '90px', 
                  zIndex: 1000,
                  transition: 'bottom 0.3s ease'
                }}
              >
                <Button 
                  variant="white" 
                  className="rounded-pill shadow-lg fw-bold px-4 py-3 d-flex align-items-center gap-2 border"
                  style={{
                    background: '#ffffff',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    fontSize: '13.5px'
                  }}
                >
                  <span className="material-symbols-outlined text-success" style={{ color: '#1a6b3c' }}>explore</span>
                  Tìm quanh đây
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
                onCheckIn={handleCheckIn}
                isMinimized={navMinimized}
                onToggleMinimize={() => setNavMinimized(prev => !prev)}
              />
            )}

            {/* Search bar — hide while navigating on App view */}
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

      <AIChatbot
        onDirectionsClick={handleDirections}
        onDetailClick={(id) => {
          setSelectedCourtId(id);
          setCurrentPage('court-detail');
        }}
        onBookingClick={(id) => {
          setSelectedCourtId(id);
          setCurrentPage('checkout');
        }}
        onLocationFound={handleLocationSelect}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default App;
