import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import MapView from '../../components/map/MapView';
import { useSocket } from '../../contexts/SocketContext';
import { Activity, MapPin, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLiveMap = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [driverLocs, setDriverLocs] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);
  const { on } = useSocket();

  useEffect(() => {
    fetchLiveRides();
    const interval = setInterval(fetchLiveRides, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!on) return;
    const unsub = on('driver_location_update', (data) => {
      setDriverLocs(prev => {
        const idx = prev.findIndex(d => d.driverId === data.driverId);
        const loc = { driverId: data.driverId, lat: data.lat, lng: data.lng, name: `Driver` };
        if (idx >= 0) {
          const newLocs = [...prev];
          newLocs[idx] = loc;
          return newLocs;
        }
        return [...prev, loc];
      });
    });
    return unsub;
  }, [on]);

  const fetchLiveRides = async () => {
    try {
      const { data } = await adminAPI.getLiveRides();
      setRides(data.data.rides);
    } catch { }
    finally { setLoading(false); }
  };

  const statusColors = {
    requested: '#3b82f6',
    accepted: '#6366f1',
    arriving: '#8b5cf6',
    arrived: '#f59e0b',
    started: '#10b981',
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 57px)' }}>
      {/* Sidebar */}
      <div style={{
        width: 360, background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)',
        overflowY: 'auto', padding: 'var(--space-4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-lg)', fontWeight: 700 }}>
            <Activity size={18} style={{ color: 'var(--primary)' }} /> Live Rides
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={fetchLiveRides}>
            <RefreshCw size={14} />
          </button>
        </div>

        <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
          {rides.length} active ride{rides.length !== 1 ? 's' : ''}
        </div>

        {rides.map(ride => (
          <div
            key={ride._id}
            className="card card-hover"
            style={{ marginBottom: 'var(--space-3)', cursor: 'pointer', padding: 'var(--space-4)', borderLeft: `3px solid ${statusColors[ride.status] || '#6b6b80'}` }}
            onClick={() => setSelectedRide(ride)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                {ride.userId?.name || 'Unknown'}
              </span>
              <span className="badge badge-sm" style={{
                background: statusColors[ride.status] + '20',
                color: statusColors[ride.status],
                fontSize: '0.65rem',
              }}>
                {ride.status}
              </span>
            </div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
              <div>📍 {ride.pickup?.address?.substring(0, 30)}...</div>
              <div>🏁 {ride.drop?.address?.substring(0, 30)}...</div>
            </div>
            <div style={{ fontSize: 'var(--font-xs)', marginTop: 'var(--space-2)', display: 'flex', justifyContent: 'space-between' }}>
              <span>₹{ride.fare?.total}</span>
              <span>{ride.distance} km</span>
            </div>
          </div>
        ))}

        {rides.length === 0 && (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <p>No active rides right now</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapView
          pickup={selectedRide?.pickup || null}
          drop={selectedRide?.drop || null}
          driverLocations={driverLocs}
          height="100%"
        />
      </div>
    </div>
  );
};

export default AdminLiveMap;
