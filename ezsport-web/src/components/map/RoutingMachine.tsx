import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// Google API Key is loaded via index.html script tag for SDK usage


interface RoutingMachineProps {
  userLocation: [number, number];
  destination: [number, number];
  onRouteInfo?: (distance: number, time: number) => void;
}

// Decode Google's encoded polyline format into lat/lng pairs
function decodePolyline(encoded: string): L.LatLng[] {
  const points: L.LatLng[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, byte: number;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push(L.latLng(lat / 1e5, lng / 1e5));
  }
  return points;
}

const RoutingMachine = ({ userLocation, destination, onRouteInfo }: RoutingMachineProps) => {
  const map = useMap();
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const casingLayerRef = useRef<L.Polyline | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const prevOriginRef = useRef<string>('');
  const prevDestRef = useRef<string>('');

  useEffect(() => {
    if (!map || !userLocation || !destination) return;

    const originKey = `${userLocation[0].toFixed(5)},${userLocation[1].toFixed(5)}`;
    const destKey = `${destination[0].toFixed(5)},${destination[1].toFixed(5)}`;

    if (originKey === prevOriginRef.current && destKey === prevDestRef.current) return;
    prevOriginRef.current = originKey;
    prevDestRef.current = destKey;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchRoute = async () => {
      const [oLat, oLng] = userLocation;
      const [dLat, dLng] = destination;

      const tryGoogleSDK = () => {
        return new Promise<boolean>((resolve) => {
          if (!window.google?.maps?.DirectionsService) {
            console.warn('Google Maps SDK not loaded yet');
            resolve(false);
            return;
          }

          const directionsService = new google.maps.DirectionsService();
          directionsService.route(
            {
              origin: new google.maps.LatLng(oLat, oLng),
              destination: new google.maps.LatLng(dLat, dLng),
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result && result.routes.length > 0) {
                const route = result.routes[0];
                const leg = route.legs[0];
                const coords = route.overview_path.map(p => L.latLng(p.lat(), p.lng()));
                drawRoute(coords, leg.distance?.value || 0, leg.duration?.value || 0);
                resolve(true);
              } else {
                console.warn('Google SDK Directions failed:', status);
                resolve(false);
              }
            }
          );
          
          // Force timeout for Google SDK after 5s
          setTimeout(() => resolve(false), 5000);
        });
      };

      const tryOSRM = async () => {
        try {
          const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=polyline`;
          // Use a fresh controller for fallback to avoid signal inheritance issues
          const fallbackController = new AbortController();
          const res = await fetch(osrmUrl, { signal: fallbackController.signal });
          const osrmData = await res.json();
          if (osrmData.code === 'Ok' && osrmData.routes?.length > 0) {
            const path = decodePolyline(osrmData.routes[0].geometry);
            drawRoute(path, osrmData.routes[0].distance, osrmData.routes[0].duration);
            return true;
          }
        } catch (e) {
          console.error('OSRM also failed:', e);
        }
        return false;
      };

      const success = await tryGoogleSDK();
      if (!success) {
        console.log('Falling back to OSRM...');
        await tryOSRM();
      }
    };

    fetchRoute();
  }, [map, userLocation, destination, onRouteInfo]);

  const drawRoute = (path: L.LatLng[], distance: number, time: number) => {
    if (casingLayerRef.current) { map.removeLayer(casingLayerRef.current); casingLayerRef.current = null; }
    if (routeLayerRef.current) { map.removeLayer(routeLayerRef.current); routeLayerRef.current = null; }

    const casing = L.polyline(path, {
      color: '#ffffff',
      weight: 11,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
    });

    const route = L.polyline(path, {
      color: '#1a73e8',
      weight: 7,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    });

    casing.addTo(map);
    route.addTo(map);
    casingLayerRef.current = casing;
    routeLayerRef.current = route;

    map.fitBounds(route.getBounds(), { padding: [60, 60], animate: true });

    if (onRouteInfo) {
      onRouteInfo(distance, time);
    }
  };

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (casingLayerRef.current) map?.removeLayer(casingLayerRef.current);
      if (routeLayerRef.current) map?.removeLayer(routeLayerRef.current);
    };
  }, [map]);

  return null;
};

export default RoutingMachine;
