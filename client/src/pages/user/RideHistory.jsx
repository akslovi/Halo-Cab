import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { rideAPI, driverAPI, adminAPI } from '../../services/api';
import { MapPin, Clock, IndianRupee, Star, Car, Bike, AlertCircle, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors = {
  requested: 'badge-info',
  accepted: 'badge-primary',
  arriving: 'badge-primary',
  arrived: 'badge-warning',
  started: 'badge-warning',
  completed: 'badge-success',
  cancelled: 'badge-danger',
};

const RideHistory = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver';

  useEffect(() => {
    fetchRides();
  }, [page, statusFilter]);

  const fetchRides = async () => {
    try {
      let response;
      if (isAdmin) {
        response = await adminAPI.getRides(page, statusFilter);
      } else if (isDriver) {
        response = await driverAPI.getDriverRides(page);
      } else {
        response = await rideAPI.getRideHistory(page);
      }
      setRides(response.data.data.rides);
      setTotalPages(response.data.data.pages || 1);
    } catch (err) {
      toast.error('Failed to load ride history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <div className="loading-text">Loading rides...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          {isAdmin ? 'All Rides' : isDriver ? 'My Rides' : 'My Rides'}
        </h1>
        <p className="page-subtitle">
          {isAdmin ? 'View and manage all rides across the platform' : 'Your recent ride history'}
        </p>
      </div>

      {/* Admin status filter */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
          {['', 'requested', 'accepted', 'arriving', 'arrived', 'started', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {rides.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🚗</div>
          <h3>No rides yet</h3>
          <p>
            {isAdmin
              ? 'No rides match the selected filter.'
              : 'Your ride history will appear here once you book your first ride.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {rides.map((ride) => (
            <div key={ride._id} className="card card-hover animate-slideUp" id={`ride-${ride._id}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontSize: '1.5rem' }}>{ride.vehicleType === 'cab' ? '🚗' : '🏍️'}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {ride.vehicleType === 'cab' ? 'Cab' : 'Bike'} Ride
                    </div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                      {new Date(ride.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <span className={`badge badge-dot ${statusColors[ride.status]}`}>
                  {ride.status}
                </span>
              </div>

              {/* Admin extras: show user & driver names */}
              {isAdmin && (
                <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-3)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  <span>👤 {ride.userId?.name || ride.userId?.email || '—'}</span>
                  <span>🚘 {ride.driverId?.userId?.name || '—'}</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)' }}>
                  <MapPin size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ride.pickup?.address}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)' }}>
                  <MapPin size={14} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ride.drop?.address}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                  <span>{ride.distance} km</span>
                  <span>{ride.duration} min</span>
                  {ride.paymentMethod && (
                    <span style={{ textTransform: 'capitalize' }}>{ride.paymentMethod}</span>
                  )}
                </div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-lg)' }}>
                  ₹{ride.fare?.total}
                </div>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </button>
              <span style={{ padding: 'var(--space-2) var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RideHistory;
