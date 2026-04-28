import { useEffect, useRef, useCallback, useState } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Polyline,
  InfoWindow,
} from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 22.5937, lng: 78.9629 }; // Center of India

interface MapProps {
  shipmentLocation: { lat: number; lng: number } | null;
  route: { lat: number; lng: number }[];
  origin?: { lat: number; lng: number; name?: string };
  destination?: { lat: number; lng: number; name?: string };
}

const mapStyles = [
  {
    featureType: 'water',
    stylers: [{ color: '#c9d6df' }],
  },
  {
    featureType: 'landscape',
    stylers: [{ color: '#f0f4f8' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fcd34d' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#f59e0b' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'poi',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'transit',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#c0c0c0' }],
  },
];

function ActualMap({ shipmentLocation, route, origin, destination }: MapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<'origin' | 'destination' | 'shipment' | null>(null);

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      // Fit bounds to show the full route
      if (route.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        route.forEach((point) => bounds.extend(point));
        if (shipmentLocation) bounds.extend(shipmentLocation);
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
    },
    [route, shipmentLocation]
  );

  // Re-fit bounds when route changes (new shipment selected)
  useEffect(() => {
    if (mapRef.current && route.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      route.forEach((point) => bounds.extend(point));
      if (shipmentLocation) bounds.extend(shipmentLocation);
      mapRef.current.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }
  }, [route]);

  const originPos = origin || (route.length > 0 ? route[0] : null);
  const destPos = destination || (route.length > 1 ? route[route.length - 1] : null);

  return (
    <div className="w-full h-full relative z-0">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={6}
        center={shipmentLocation || defaultCenter}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          styles: mapStyles,
        }}
      >
        {/* Route Polyline — draw the full route path */}
        {route.length > 1 && (
          <>
            {/* Shadow polyline for depth */}
            <Polyline
              path={route}
              options={{
                strokeColor: '#1e40af',
                strokeOpacity: 0.15,
                strokeWeight: 8,
              }}
            />
            {/* Main route line */}
            <Polyline
              path={route}
              options={{
                strokeColor: '#3b82f6',
                strokeOpacity: 0.9,
                strokeWeight: 4,
                icons: [
                  {
                    icon: {
                      path: 'M 0,-0.5 0,0.5',
                      strokeOpacity: 1,
                      strokeColor: '#60a5fa',
                      scale: 3,
                    },
                    offset: '0',
                    repeat: '15px',
                  },
                ],
              }}
            />
          </>
        )}

        {/* Origin marker — green */}
        {originPos && (
          <Marker
            position={originPos}
            onClick={() => setSelectedMarker('origin')}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#22c55e',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
          >
            {selectedMarker === 'origin' && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div className="px-2 py-1">
                  <p className="font-semibold text-sm text-green-700">📦 Origin</p>
                  <p className="text-xs text-gray-600">{origin?.name || 'Start Point'}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Destination marker — red */}
        {destPos && (
          <Marker
            position={destPos}
            onClick={() => setSelectedMarker('destination')}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#ef4444',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            }}
          >
            {selectedMarker === 'destination' && (
              <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                <div className="px-2 py-1">
                  <p className="font-semibold text-sm text-red-700">📍 Destination</p>
                  <p className="text-xs text-gray-600">{destination?.name || 'End Point'}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Current shipment location — pulsing blue */}
        {shipmentLocation && (
          <>
            {/* Pulse ring */}
            <Marker
              position={shipmentLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 18,
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
                strokeColor: '#3b82f6',
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
              clickable={false}
            />
            {/* Main dot */}
            <Marker
              position={shipmentLocation}
              onClick={() => setSelectedMarker('shipment')}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#3b82f6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              }}
            >
              {selectedMarker === 'shipment' && (
                <InfoWindow onCloseClick={() => setSelectedMarker(null)}>
                  <div className="px-2 py-1">
                    <p className="font-semibold text-sm text-blue-700">🚛 In Transit</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {shipmentLocation.lat.toFixed(4)}, {shipmentLocation.lng.toFixed(4)}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          </>
        )}
      </GoogleMap>
    </div>
  );
}

export default function MapComponent({ shipmentLocation, route, origin, destination }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const isInvalidKey = !apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE';

  if (isInvalidKey) {
    return (
      <div className="w-full h-full bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-blue-100 rounded-full mb-4 shadow-sm">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2 tracking-tight">API Key Required</h3>
        <p className="text-gray-500 max-w-sm mb-6 text-sm leading-relaxed">
          Google Maps requires a valid API key. Add it to your <code className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">frontend/.env</code> file as <code className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">VITE_GOOGLE_MAPS_API_KEY</code>.
        </p>
      </div>
    );
  }

  if (loadError) return <div className="p-4 text-red-500 font-medium z-0 flex items-center justify-center h-full">Map failed to load. Check API Key.</div>;
  if (!isLoaded) return (
    <div className="p-4 text-gray-400 font-medium z-0 flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span>Loading Maps...</span>
      </div>
    </div>
  );

  return <ActualMap shipmentLocation={shipmentLocation} route={route} origin={origin} destination={destination} />;
}
