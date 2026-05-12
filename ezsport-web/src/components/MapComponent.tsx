import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapController from './map/MapController';

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
  id: number;
  name: string;
  lat: number;
  lng: number;
  price: string;
  emoji: string;
  distance?: string;
}

interface MapComponentProps {
  courts: CourtLocation[];
  onLocationFound?: (lat: number, lng: number) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ courts, onLocationFound }) => {
  const daNangCenter: [number, number] = [16.0544, 108.2022];
  const [map, setMap] = useState<L.Map | null>(null);

  const handleLocate = () => {
    if (map) {
      map.locate();
    }
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
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
          maxZoom={20}
        />
        <MapController onLocationFound={onLocationFound} />
        {courts.map(court => (
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
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Locate Button */}
      <div 
        className="position-absolute bottom-0 end-0 m-4" 
        style={{ zIndex: 1100, marginBottom: '100px' }}
      >
        <button
          onClick={handleLocate}
          style={{ width: '50px', height: '50px', backgroundColor: 'white' }}
          className="btn shadow-lg rounded-circle d-flex align-items-center justify-content-center border hover-bg-light"
          title="Vị trí của tôi"
        >
          <span className="material-symbols-outlined text-success" style={{ fontSize: '28px' }}>my_location</span>
        </button>
      </div>
    </div>
  );
};

export default MapComponent;
