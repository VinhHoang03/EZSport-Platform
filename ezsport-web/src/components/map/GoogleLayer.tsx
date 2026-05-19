import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface GoogleLayerProps {
  type?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
  traffic?: boolean;
}

// Map Google map types to tile layer URL parameters
const getGoogleTileUrl = (type: string) => {
  const lyrs: Record<string, string> = {
    roadmap: 'm',
    satellite: 's',
    hybrid: 'y',
    terrain: 'p',
  };
  const lyr = lyrs[type] || 'm';
  return `https://mt{s}.google.com/vt/lyrs=${lyr}&x={x}&y={y}&z={z}`;
};

const GoogleLayer = ({ type = 'roadmap' }: GoogleLayerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const tileLayer = L.tileLayer(getGoogleTileUrl(type), {
      maxZoom: 21,
      subdomains: ['0', '1', '2', '3'],
      attribution: '&copy; <a href="https://maps.google.com">Google Maps</a>',
    });

    tileLayer.addTo(map);

    return () => {
      map.removeLayer(tileLayer);
    };
  }, [map, type]);

  return null;
};

export default GoogleLayer;
