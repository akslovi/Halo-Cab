import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { driverAPI } from '../../services/api';
import MapView from '../../components/map/MapView';
import { Power, MapPin, Clock, IndianRupee, Star, Navigation, Phone, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const { user, driverProfile, setDriverProfile } = useAuth();
  const { on, emit, connected } = useSocket();

  const [isOnline, setIsOnline] = useState(driverProfile?.isOnline || false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [rideRequest, setRideRequest] = useState(null);
  const [activeRide, setActiveRide] = useState(null);
  const [requestTimer, setRequestTimer] = useState(30);
  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState(driverProfile?.earnings || {});

  // Get current location
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCurrentLocation(loc);
        if (isOnline && connected) {
          emit('update_location', loc);
        }
      },
      (err) => console.error('Location error:', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isOnline, connected, emit]);

  // Listen for ride requests
  useEffect(() => {
    if (!on) return;
    const unsub1 = on('ride_request', (data) => {
      setRideRequest(data);
      setRequestTimer(30);
      toast('New ride request!', { icon: '🔔' });
    });

    const unsub2 = on('ride_confirmed', (data) => {
      setActiveRide(data.ride);
      setRideRequest(null);
      toast.success('Ride confirmed!');
    });

    const unsub3 = on('ride_cancelled', (data) => {
      toast.error('Ride was cancelled by user');
      setActiveRide(null);
      setRideRequest(null);
    });

    return () => { unsub1(); unsub2(); unsub3(); };
  }, [on]);

  // Request timer countdown
  useEffect(() => {
    if (!rideRequest || requestTimer <= 0) {
      if (requestTimer <= 0 && rideRequest) {
        handleRejectRide();
      }
      return;
    }
    const interval = setInterval(() => {
      setRequestTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [rideRequest, requestTimer]);

  const toggleOnline = async () => {
    try {
      const { data } = await driverAPI.toggleOnline();
      setIsOnline(data.data.isOnline);
      toast.success(data.data.isOnline ? 'You are now online!' : 'You are now offline');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleAcceptRide = async () => {
    if (!rideRequest) return;
    setLoading(true);
    try {
      const rideId = rideRequest.ride?._id || rideRequest.rideId;
      const { data } = await driverAPI.acceptRide(rideId);
      setActiveRide(data.data.ride);
      setRideRequest(null);
      toast.success('Ride accepted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept ride');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRide = async () => {
    if (!rideRequest) return;
    try {
      const rideId = rideRequest.ride?._id || rideRequest.rideId;
      await driverAPI.rejectRide(rideId);
    } catch {} 
    setRideRequest(null);
    setRequestTimer(30);
  };

  const handleUpdateStatus = async (action) => {
    if (!activeRide) return;
    setLoading(true);
    try {
      let response;
      switch (action) {
        case 'arriving':
          response = await driverAPI.arrivingRide(activeRide._id);
          break;
        case 'arrived':
          response = await driverAPI.arrivedRide(activeRide._id);
          break;
        case 'start':
          if (!otpInput) { toast.error('Enter ride OTP'); setLoading(false); return; }
          response = await driverAPI.startRide(activeRide._id, otpInput);
          break;
        case 'complete':
          response = await driverAPI.completeRide(activeRide._id);
          break;
      }
      if (response?.data?.data?.ride) {
        setActiveRide(response.data.data.ride);
      }
      if (action === 'complete') {
        toast.success('Ride completed! 🎉');
        setActiveRide(null);
        setOtpInput('');
        fetchEarnings();
      } else {
        toast.success(`Status updated: ${action}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const { data } = await driverAPI.getEarnings();
      setEarnings(data.data.earnings);
    } catch {}
  };

  useEffect(() => { fetchEarnings(); }, []);

  const kycPending = !driverProfile || driverProfile.kyc?.status !== 'approved';

  return (
    <div className="driver-layout">
      <div className="driver-sidebar" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>
              Hey, {user?.name?.split(' ')[0]} 👋
            </h2>
            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </p>
          </div>
          <button
            className={`online-toggle ${isOnline ? 'active' : ''}`}
            onClick={toggleOnline}
            disabled={kycPending}
            title={kycPending ? 'KYC approval required' : 'Toggle online/offline'}
            id="online-toggle"
          />
        </div>

        {/* KYC Warning */}
        {kycPending && (
          <div className="card" style={{ background: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', color: 'var(--warning)' }}>
              <AlertTriangle size={18} />
              <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>
                {driverProfile?.kyc?.status === 'pending' ? 'KYC under review' : 'Complete KYC to start driving'}
              </span>
            </div>
          </div>
        )}

        {/* Earnings Quick View */}
        <div className="grid grid-3" style={{ gap: 'var(--space-3)' }}>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Today</div>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800, color: 'var(--success)' }}>
              ₹{earnings?.today || 0}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Week</div>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>
              ₹{earnings?.week || 0}
            </div>
          </div>
          <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Total</div>
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: 800 }}>
              ₹{earnings?.total || 0}
            </div>
          </div>
        </div>

        {/* Active Ride Info */}
        {activeRide && (
          <div className="card-glass animate-slideUp">
            <h3 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-base)', fontWeight: 700 }}>
              Active Ride — <span style={{ color: 'var(--primary-light)', textTransform: 'capitalize' }}>{activeRide.status}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)' }}>
                <MapPin size={14} style={{ color: 'var(--success)' }} />
                <span>{activeRide.pickup?.address?.substring(0, 40)}...</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)' }}>
                <MapPin size={14} style={{ color: 'var(--danger)' }} />
                <span>{activeRide.drop?.address?.substring(0, 40)}...</span>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              <span>Fare: <strong style={{ color: 'var(--text-primary)' }}>₹{activeRide.fare?.total}</strong></span>
              <span>{activeRide.distance} km • {activeRide.duration} min</span>
            </div>

            {/* Ride OTP input for starting ride */}
            {activeRide.status === 'arrived' && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter ride OTP"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value)}
                  maxLength={4}
                  style={{ textAlign: 'center', letterSpacing: '0.3em', fontWeight: 700, fontSize: 'var(--font-xl)' }}
                  id="otp-input"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {activeRide.status === 'accepted' && (
                <button className="btn btn-primary flex-1" onClick={() => handleUpdateStatus('arriving')} disabled={loading}>
                  <Navigation size={16} /> On My Way
                </button>
              )}
              {activeRide.status === 'arriving' && (
                <button className="btn btn-primary flex-1" onClick={() => handleUpdateStatus('arrived')} disabled={loading}>
                  <MapPin size={16} /> I've Arrived
                </button>
              )}
              {activeRide.status === 'arrived' && (
                <button className="btn btn-success flex-1" onClick={() => handleUpdateStatus('start')} disabled={loading}>
                  <CheckCircle size={16} /> Start Ride
                </button>
              )}
              {activeRide.status === 'started' && (
                <button className="btn btn-success flex-1" onClick={() => handleUpdateStatus('complete')} disabled={loading}>
                  <CheckCircle size={16} /> Complete Ride
                </button>
              )}
            </div>
          </div>
        )}

        {!activeRide && isOnline && !rideRequest && (
          <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>🔍</div>
            <p style={{ color: 'var(--text-muted)' }}>Waiting for ride requests...</p>
          </div>
        )}
      </div>

      <div className="driver-map" style={{ position: 'relative' }}>
        <MapView
          pickup={activeRide?.pickup || null}
          drop={activeRide?.drop || null}
          driverLocation={currentLocation}
          vehicleType={driverProfile?.vehicleType || 'cab'}
          height="100%"
        />

        {/* Ride Request Popup */}
        {rideRequest && (
          <div className="ride-request-popup">
            <div className="request-timer">
              <div
                className="request-timer-bar"
                style={{ width: `${(requestTimer / 30) * 100}%` }}
              />
            </div>

            <h3 style={{ marginBottom: 'var(--space-3)', fontWeight: 700 }}>
              🔔 New Ride Request
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <MapPin size={14} style={{ color: 'var(--success)' }} />
                <span>{rideRequest.pickup?.address?.substring(0, 50)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <MapPin size={14} style={{ color: 'var(--danger)' }} />
                <span>{rideRequest.drop?.address?.substring(0, 50)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--font-lg)' }}>
                ₹{rideRequest.ride?.fare?.total}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                {rideRequest.ride?.distance} km • {rideRequest.ride?.duration} min
              </span>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button className="btn btn-danger flex-1" onClick={handleRejectRide} id="reject-ride-btn">
                <XCircle size={16} /> Reject
              </button>
              <button className="btn btn-success flex-1" onClick={handleAcceptRide} disabled={loading} id="accept-ride-btn">
                <CheckCircle size={16} /> Accept ({requestTimer}s)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;
