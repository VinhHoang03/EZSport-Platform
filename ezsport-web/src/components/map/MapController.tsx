import React, { useState, useEffect } from 'react';
import { Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface MapControllerProps {
  onLocationFound?: (lat: number, lng: number) => void;
}

const MapController: React.FC<MapControllerProps> = ({ onLocationFound }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  const [hasCentered, setHasCentered] = useState(false);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
    locationfound(e) {
      // Only update if position changed significantly (>20m) to avoid re-routing flicker
      if (userLocation) {
        const dist = e.latlng.distanceTo(userLocation);
        if (dist < 20) return; // ignore small GPS jitter
      }

      setUserLocation(e.latlng);
      
      // Only flyTo on the very first location fix to avoid jumping while moving
      if (!hasCentered) {
        map.flyTo(e.latlng, 15);
        setHasCentered(true);
      }
      
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
