import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapController from '../map/MapController';
import RoutingMachine from '../map/RoutingMachine';
import GoogleLayer from '../map/GoogleLayer';
import { motion } from 'framer-motion';
// Fix for default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const createCustomIcon = (emoji: string, price: string) => {
  return L.divIcon({
    html: `
      <div class="custom-pin">
        <div class="pin-price">${price} ₫</div>
        <div class="pin-circle">${emoji}</div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [60, 60],
    iconAnchor: [30, 60],
  });
};

interface CourtLocation {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
  price: string;
  emoji: string;
  distance?: string;
}

interface MapComponentProps {
  courts?: CourtLocation[];
  venues?: CourtLocation[];
  onLocationFound?: (lat: number, lng: number) => void;
  userLocation?: { lat: number, lng: number } | null;
  routingDestination?: { lat: number, lng: number } | null;
  routeSummary?: { distance: number, time: number } | null;
  onClearRoute?: () => void;
  onDirectionsClick?: (lat: number, lng: number) => void;
  onRouteInfo?: (distance: number, time: number) => void;
  isNavigating?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  courts, venues, onLocationFound, userLocation, routingDestination, routeSummary, onClearRoute, onDirectionsClick, onRouteInfo, isNavigating
}) => {
  const daNangCenter: [number, number] = [16.0544, 108.2022];
  const [map, setMap] = useState<L.Map | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const prevNavigating = useRef(isNavigating);
  const locations = courts ?? venues ?? [];

  // Fix: when layout changes (col-8 <-> col-12), invalidate map size after CSS transition
  useEffect(() => {
    if (!map) return;
    if (prevNavigating.current !== isNavigating) {
      prevNavigating.current = isNavigating;
      // Wait for Bootstrap col transition (0.3s) then invalidate
      const t = setTimeout(() => map.invalidateSize(), 350);
      return () => clearTimeout(t);
    }
  }, [map, isNavigating]);

  // Fit bounds to show full route when route is ready
  useEffect(() => {
    if (!map || !userLocation || !routingDestination) return;
    const bounds = L.latLngBounds(
      [userLocation.lat, userLocation.lng],
      [routingDestination.lat, routingDestination.lng]
    );
    // Small delay to let route draw first
    const t = setTimeout(() => map.fitBounds(bounds, { padding: [60, 60] }), 400);
    return () => clearTimeout(t);
  }, [map, routingDestination]); // only when destination changes

  const handleLocate = () => {
    if (map) {
      if (userLocation) {
        map.flyTo([userLocation.lat, userLocation.lng], 15);
      } else {
        map.locate({ 
          setView: true, 
          maxZoom: 15
        });
        
        // Trigger browser geolocation API as backup and auto center
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              if (onLocationFound) {
                onLocationFound(lat, lng);
              }
              map.flyTo([lat, lng], 15);
            },
            (err) => console.warn('Geolocation error:', err),
            { enableHighAccuracy: true, timeout: 10000 }
          );
        }
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} phút`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hrs} giờ ${remainingMins} phút`;
  };

  const formatDistance = (meters: number) => {
    return (meters / 1000).toFixed(1) + ' km';
  };

  return (
    <div className="position-relative h-100 w-100">
      <MapContainer
        key="google-map-danang"
        center={daNangCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', background: '#fff' }}
        zoomControl={false}
        scrollWheelZoom={true}
        ref={setMap}
      >
        <GoogleLayer type={mapType} traffic={showTraffic} />
        
        <MapController onLocationFound={onLocationFound} />
        
        {userLocation && routingDestination && (
          <RoutingMachine 
            userLocation={[userLocation.lat, userLocation.lng]} 
            destination={[routingDestination.lat, routingDestination.lng]} 
            onRouteInfo={onRouteInfo}
          />
        )}

        {/* Route is drawn directly by RoutingMachine as a Leaflet Polyline */}

        {locations.map(court => (
          <Marker
            key={court.id}
            position={[court.lat, court.lng]}
            icon={createCustomIcon(court.emoji, court.price)}
          >
            <Popup className="custom-popup">
              <div className="text-center p-1">
                <div className="fw-bold small">{court.name}</div>
                <div className="text-success fw-bold small">{court.price} ₫/hr</div>
                {court.distance && <div className="text-muted" style={{ fontSize: '10px' }}>{court.distance} away</div>}
                <hr className="my-1 opacity-25" />
                <button 
                  className="btn btn-sm btn-success w-100 mt-1 d-flex align-items-center justify-content-center gap-1 py-1"
                  style={{ fontSize: '10px' }}
                  onClick={() => onDirectionsClick?.(court.lat, court.lng)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>directions</span>
                  Chỉ đường
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Type Switcher */}
      <motion.div 
        drag
        dragMomentum={false}
        className="position-absolute m-4 d-flex flex-column gap-2" 
        style={{ zIndex: 1100, right: 0, top: 0, cursor: 'grab' }}
        whileDrag={{ cursor: 'grabbing', scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      >
        <div className="bg-white p-1 rounded-4 shadow border d-flex flex-column" style={{ pointerEvents: 'auto' }}>
          {/* Drag Handle */}
          <div className="w-100 d-flex justify-content-center pt-1 pb-2" style={{ opacity: 0.3 }}>
            <div style={{ width: '32px', height: '4px', background: '#94a3b8', borderRadius: '4px' }} />
          </div>
          
          <button 
            className={`btn btn-sm border-0 d-flex align-items-center gap-2 px-3 py-2 ${mapType === 'roadmap' ? 'text-success fw-bold bg-light' : 'text-muted'}`}
            onClick={() => setMapType('roadmap')}
          >
            <span className="material-symbols-outlined fs-5">map</span>
            Bản đồ
          </button>
          <button 
            className={`btn btn-sm border-0 d-flex align-items-center gap-2 px-3 py-2 ${mapType === 'satellite' ? 'text-success fw-bold bg-light' : 'text-muted'}`}
            onClick={() => setMapType('satellite')}
          >
            <span className="material-symbols-outlined fs-5">satellite</span>
            Vệ tinh
          </button>
          <hr className="my-1 opacity-10" />
          <button 
            className={`btn btn-sm border-0 d-flex align-items-center gap-2 px-3 py-2 ${showTraffic ? 'text-success fw-bold bg-light' : 'text-muted'}`}
            onClick={() => setShowTraffic(!showTraffic)}
          >
            <span className="material-symbols-outlined fs-5">traffic</span>
            Giao thông
          </button>
        </div>
      </motion.div>

      {/* Routing Overlay - Google Maps Style */}
      {routingDestination && (
        <div 
          className="position-absolute top-0 start-50 translate-middle-x mt-3 w-75 bg-white shadow-lg rounded-4 p-3 d-flex align-items-center justify-content-between animate__animated animate__fadeInDown"
          style={{ zIndex: 1100, border: '1px solid rgba(0,0,0,0.1)' }}
        >
          <div className="d-flex align-items-center gap-3">
            <div className="bg-success bg-opacity-10 p-2 rounded-circle">
              <span className="material-symbols-outlined text-success">navigation</span>
            </div>
            <div>
              <div className="fw-bold text-dark">
                {!userLocation 
                  ? 'Đang lấy vị trí của bạn...' 
                  : routeSummary 
                    ? `${formatTime(routeSummary.time)} (${formatDistance(routeSummary.distance)})` 
                    : 'Đang tính toán tuyến đường...'}
              </div>
              <div className="text-muted small">
                {!userLocation 
                  ? 'Vui lòng cho phép truy cập vị trí' 
                  : `Đến ${locations.find(c => (c.lat === routingDestination.lat && c.lng === routingDestination.lng))?.name || 'sân đã chọn'}`}
              </div>
            </div>
          </div>
          <button
            onClick={onClearRoute}
            className="btn btn-outline-danger rounded-pill px-4 fw-bold d-flex align-items-center gap-2 border-2"
          >
            <span className="material-symbols-outlined fs-5">close</span>
            Hủy
          </button>
        </div>
      )}

      {/* Floating Buttons */}
      <div 
        className="position-fixed d-flex flex-column gap-3" 
        style={{ 
          zIndex: 9999, 
          bottom: '180px', 
          right: '24px' 
        }}
      >
        <button
          onClick={handleLocate}
          style={{ 
            width: '56px', 
            height: '56px', 
            backgroundColor: 'white', 
            border: '2px solid #16a34a', 
            boxShadow: '0 10px 25px -5px rgba(22, 163, 74, 0.3), 0 8px 10px -6px rgba(22, 163, 74, 0.3)',
            cursor: 'pointer'
          }}
          className="btn rounded-circle d-flex align-items-center justify-content-center hover-bg-light transition-all"
          title="Vị trí của tôi"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '30px', color: '#16a34a', fontWeight: 'bold' }}>my_location</span>
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
