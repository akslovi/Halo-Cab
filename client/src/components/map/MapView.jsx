import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useMemo, useState, useRef } from 'react';
import L from 'leaflet';
import { useTheme } from '../../contexts/ThemeContext';

// Custom marker icons
const createIcon = (color, size = 30) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const pickupIcon = createIcon('#10b981');
const dropIcon = createIcon('#ef4444');
const driverIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 36px; height: 36px;
    background: #6366f1;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(99,102,241,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  ">🚗</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const bikeDriverIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 36px; height: 36px;
    background: #8b5cf6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 12px rgba(139,92,246,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  ">🏍️</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Component to recenter map when bounds change
const FitBounds = ({ pickup, drop, driverLocation }) => {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (pickup) points.push([pickup.lat, pickup.lng]);
    if (drop) points.push([drop.lat, drop.lng]);
    if (driverLocation) points.push([driverLocation.lat, driverLocation.lng]);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true, duration: 1 });
    } else if (points.length === 1) {
      map.setView(points[0], 14, { animate: true });
    }
  }, [pickup, drop, driverLocation, map]);

  return null;
};

// TrackingMarker for smooth real-time animation of driver movement
const TrackingMarker = ({ position, icon, popupText }) => {
  const markerRef = useRef(null);
  const [initialPos, setInitialPos] = useState(position);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;

    let animationFrameId;
    const startLatLng = marker.getLatLng();
    const startLat = startLatLng.lat;
    const startLng = startLatLng.lng;
    const endLat = position[0];
    const endLng = position[1];

    if (startLat === endLat && startLng === endLng) return;

    const dist = Math.sqrt(Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2));
    if (dist > 0.1) { // Large jump, teleport
      setInitialPos(position);
      marker.setLatLng([endLat, endLng]);
      return;
    }

    const startTime = performance.now();
    const duration = 2000; // 2 seconds for smooth transition between socket events

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const lat = startLat + (endLat - startLat) * progress;
      const lng = startLng + (endLng - startLng) * progress;
      
      marker.setLatLng([lat, lng]);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [position[0], position[1]]);

  return (
    <Marker ref={markerRef} position={initialPos} icon={icon}>
      {popupText && <Popup>{popupText}</Popup>}
    </Marker>
  );
};

// Click handler for map
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

const MapView = ({
  pickup,
  drop,
  driverLocation,
  driverLocations = [],
  vehicleType = 'cab',
  onMapClick,
  height = '100%',
  style = {},
  showRoute = true,
  interactive = true,
}) => {
  const { theme } = useTheme();
  const center = pickup
    ? [pickup.lat, pickup.lng]
    : [12.9716, 77.5946]; // Default: Bangalore

  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    if (!pickup || !drop || !showRoute) {
      setRouteCoords([]);
      return;
    }

    // Initialize with direct straight line first as fallback/instant visual feedback
    setRouteCoords([
      [pickup.lat, pickup.lng],
      [drop.lat, drop.lng],
    ]);

    let active = true;
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${drop.lng},${drop.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('OSRM API returned non-200');
        const data = await res.json();
        
        if (active && data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map((coord) => [coord[1], coord[0]]);
          setRouteCoords(coords);
        }
      } catch (err) {
        console.error('Failed to fetch road routing, using straight line:', err);
      }
    };

    fetchRoute();

    return () => {
      active = false;
    };
  }, [pickup?.lat, pickup?.lng, drop?.lat, drop?.lng, showRoute]);

  return (
    <div className={`map-container ${theme === 'light' ? 'light-theme-map' : ''}`} style={{ height, ...style }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <FitBounds pickup={pickup} drop={drop} driverLocation={driverLocation} />

        {onMapClick && <MapClickHandler onMapClick={onMapClick} />}

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>
              <strong>Pickup</strong>
              <br />
              {pickup.address || 'Pickup location'}
            </Popup>
          </Marker>
        )}

        {drop && (
          <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
            <Popup>
              <strong>Drop</strong>
              <br />
              {drop.address || 'Drop location'}
            </Popup>
          </Marker>
        )}

        {driverLocation && (
          <TrackingMarker
            position={[driverLocation.lat, driverLocation.lng]}
            icon={vehicleType === 'bike' ? bikeDriverIcon : driverIcon}
            popupText="Your Driver"
          />
        )}

        {driverLocations.map((dl, i) => (
          <TrackingMarker
            key={i}
            position={[dl.lat, dl.lng]}
            icon={dl.vehicleType === 'bike' ? bikeDriverIcon : driverIcon}
            popupText={dl.name || `Driver ${i + 1}`}
          />
        ))}

        {routeCoords.length > 0 && (
          <>
            {/* Ambient route shadow / outline */}
            <Polyline
              positions={routeCoords}
              color="#3b82f6"
              weight={8}
              opacity={0.3}
            />
            {/* Core route line */}
            <Polyline
              positions={routeCoords}
              color="#2563eb"
              weight={5}
              opacity={0.9}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
};

export { pickupIcon, dropIcon, driverIcon, bikeDriverIcon };
export default MapView;
