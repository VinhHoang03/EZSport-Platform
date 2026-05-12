import React, { useState, useEffect } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
  onLocationFound?: (lat: number, lng: number) => void;
}

const MapController: React.FC<MapControllerProps> = ({ onLocationFound }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
    locationfound(e) {
      setUserLocation(e.latlng);
      map.flyTo(e.latlng, 15);
      if (onLocationFound) {
        onLocationFound(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return (
    <>
      {/* Click Position Marker */}
      {position && (
        <Marker position={position}>
          <Popup>Vị trí bạn vừa chọn!</Popup>
        </Marker>
      )}

      {/* User Current Location Marker */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={L.divIcon({
            className: 'user-location-marker',
            html: '<div class="user-pulse"></div>',
            iconSize: [20, 20]
          })}
        >
          <Popup>Bạn đang ở đây!</Popup>
        </Marker>
      )}
    </>
  );
};

export default MapController;
