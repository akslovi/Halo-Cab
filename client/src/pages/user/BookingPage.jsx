import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useBooking } from '../../contexts/BookingContext';
import { rideAPI } from '../../services/api';
import MapView from '../../components/map/MapView';
import LocationPicker from '../../components/map/LocationPicker';
import { Car, Bike, Tag, CreditCard, Banknote, Wallet, Clock, AlertTriangle, ChevronRight, Star, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = [
  { id: 'cab', name: 'Cab', emoji: '🚗', desc: 'Comfortable sedan' },
  { id: 'bike', name: 'Bike', emoji: '🏍️', desc: 'Quick & affordable' },
];

const PAYMENT_METHODS = [
  { id: 'cash', name: 'Cash', icon: <Banknote size={16} /> },
  { id: 'card', name: 'Card', icon: <CreditCard size={16} /> },
  { id: 'wallet', name: 'Wallet', icon: <Wallet size={16} /> },
];

const CANCELLATION_REASONS = [
  { id: 'changed_plans', label: 'Changed my mind / plans' },
  { id: 'driver_delayed', label: 'Driver is taking too long to arrive' },
  { id: 'driver_requested', label: 'Driver asked me to cancel' },
  { id: 'wrong_location', label: 'Wrong pickup location selected' },
  { id: 'alternative_transport', label: 'Found alternative transport' },
  { id: 'other', label: 'Other (please specify)' },
];

const BookingPage = () => {
  const { user } = useAuth();
  const { emit } = useSocket();
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReasonSelected, setCancelReasonSelected] = useState('changed_plans');
  const [customCancelReason, setCustomCancelReason] = useState('');

  const {
    pickup, setPickup,
    drop, setDrop,
    vehicleType, setVehicleType,
    paymentMethod, setPaymentMethod,
    couponCode, setCouponCode,
    estimate, setEstimate,
    loading, setLoading,
    booking, setBooking,
    activeRide, setActiveRide,
    driverLocation, setDriverLocation,
    step, setStep,
    resetBooking,
  } = useBooking();

  // Automatically detect user's live location on mount if not already tracking/selected
  useEffect(() => {
    if (activeRide || pickup) return;
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const toastId = toast.loading('Detecting your live location...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          if (data.display_name) {
            address = data.display_name;
          }
        } catch (err) {
          console.error('Reverse geocoding error:', err);
        }

        setPickup({ address, lat, lng });
        toast.success('Live location detected!', { id: toastId });
      },
      (err) => {
        console.error('Geolocation error:', err);
        toast.error('Unable to detect live location. Please select manually.', { id: toastId });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [activeRide]);

  const getEstimate = async () => {
    if (!pickup || !drop) {
      toast.error('Please select pickup and drop locations');
      return;
    }
    setLoading(true);
    try {
      const { data } = await rideAPI.getEstimate({
        pickup, drop, vehicleType, couponCode,
      });
      setEstimate(data.data);
      setStep('estimate');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get estimate');
    } finally {
      setLoading(false);
    }
  };

  const bookRide = async () => {
    setBooking(true);
    try {
      const { data } = await rideAPI.bookRide({
        pickup, drop, vehicleType, paymentMethod, couponCode,
      });
      setActiveRide(data.data.ride);
      toast.success('Ride booked! Finding a driver...');
      setStep('tracking');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book ride');
    } finally {
      setBooking(false);
    }
  };

  const cancelRide = async (reason) => {
    if (!activeRide) return;
    try {
      await rideAPI.cancelRide(activeRide._id, reason);
      toast('Ride cancelled');
      resetBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handleConfirmCancel = async () => {
    let finalReason = '';
    if (cancelReasonSelected === 'other') {
      if (!customCancelReason.trim()) {
        toast.error('Please specify the reason');
        return;
      }
      finalReason = customCancelReason.trim();
    } else {
      const reasonObj = CANCELLATION_REASONS.find(r => r.id === cancelReasonSelected);
      finalReason = reasonObj ? reasonObj.label : 'Cancelled by user';
    }

    await cancelRide(finalReason);
    setShowCancelModal(false);
    setCustomCancelReason('');
    setCancelReasonSelected('changed_plans');
  };

  const rateDriver = async (rating) => {
    if (!activeRide) return;
    try {
      await rideAPI.rateRide(activeRide._id, rating, '');
      toast.success(`Rated ${rating} stars!`);
      resetBooking();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rate');
    }
  };

  const handleMapClick = async (latlng) => {
    const location = {
      address: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
      lat: latlng.lat,
      lng: latlng.lng,
    };

    // Try to reverse geocode for a real address
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await res.json();
      if (data.display_name) {
        location.address = data.display_name;
      }
    } catch {
      // Use coordinate-based address as fallback
    }

    if (!pickup) {
      setPickup(location);
    } else if (!drop) {
      setDrop(location);
    } else {
      // Both are set — update drop to the new location
      setDrop(location);
    }
  };

  const getStatusText = () => {
    if (!activeRide) return 'Finding driver...';
    switch (activeRide.status) {
      case 'requested': return '🔍 Finding nearby drivers...';
      case 'accepted': return '🚗 Driver is on the way to you';
      case 'arriving': return '📍 Driver is arriving';
      case 'arrived': return '✅ Driver has arrived!';
      case 'started': return '🛣️ Ride in progress';
      case 'completed': return '🎉 Ride completed!';
      default: return activeRide.status;
    }
  };

  return (
    <div className="booking-layout">
      <div className="booking-panel">
        {step === 'location' && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                Where to?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
                Book a ride in seconds
              </p>
            </div>

            <LocationPicker
              label="Pickup Location"
              type="pickup"
              value={pickup}
              onChange={setPickup}
              biasLocation={pickup}
            />

            <LocationPicker
              label="Drop Location"
              type="drop"
              value={drop}
              onChange={setDrop}
              biasLocation={pickup || drop}
            />

            <div>
              <label className="form-label" style={{ marginBottom: 'var(--space-3)', display: 'block' }}>
                Vehicle Type
              </label>
              <div className="vehicle-options">
                {VEHICLE_TYPES.map((v) => (
                  <div
                    key={v.id}
                    className={`vehicle-option ${vehicleType === v.id ? 'selected' : ''}`}
                    onClick={() => setVehicleType(v.id)}
                    id={`vehicle-${v.id}`}
                  >
                    <div className="vehicle-emoji">{v.emoji}</div>
                    <div className="vehicle-name">{v.name}</div>
                    <div className="vehicle-price">{v.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Promo Code</label>
              <div className="form-input-icon">
                <Tag size={16} className="icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  id="coupon-input"
                />
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              onClick={getEstimate}
              disabled={!pickup || !drop || loading}
              id="get-estimate-btn"
            >
              {loading ? (
                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                <>Get Fare Estimate <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        )}

        {step === 'estimate' && estimate && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep('location')} style={{ marginBottom: 'var(--space-2)' }}>
                ← Back
              </button>
              <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>Fare Estimate</h2>
            </div>

            <div className="fare-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Distance</div>
                  <div style={{ fontWeight: 700 }}>{estimate.distance} km</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Duration</div>
                  <div style={{ fontWeight: 700 }}>{estimate.duration} min</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Drivers nearby</div>
                  <div style={{ fontWeight: 700, color: estimate.nearbyDriverCount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {estimate.nearbyDriverCount}
                  </div>
                </div>
              </div>

              <div className="fare-row">
                <span>Base Fare</span>
                <span>₹{estimate.fare.baseFare}</span>
              </div>
              <div className="fare-row">
                <span>Distance ({estimate.distance} km)</span>
                <span>₹{estimate.fare.distanceFare}</span>
              </div>
              <div className="fare-row">
                <span>Time ({estimate.duration} min)</span>
                <span>₹{estimate.fare.timeFare}</span>
              </div>
              {estimate.fare.surgeFare > 0 && (
                <div className="fare-row">
                  <span style={{ color: 'var(--warning)' }}>⚡ Surge ({estimate.fare.surgeMultiplier}x)</span>
                  <span style={{ color: 'var(--warning)' }}>+₹{estimate.fare.surgeFare}</span>
                </div>
              )}
              {estimate.fare.discount > 0 && (
                <div className="fare-row">
                  <span className="discount">🎫 Coupon Discount</span>
                  <span className="discount">-₹{estimate.fare.discount}</span>
                </div>
              )}
              <div className="fare-row total">
                <span>Total</span>
                <span>₹{estimate.fare.total}</span>
              </div>
            </div>

            <div>
              <label className="form-label" style={{ marginBottom: 'var(--space-3)', display: 'block' }}>
                Payment Method
              </label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {PAYMENT_METHODS.map((pm) => (
                  <button
                    key={pm.id}
                    className={`btn ${paymentMethod === pm.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                    onClick={() => setPaymentMethod(pm.id)}
                    id={`payment-${pm.id}`}
                    style={{ flex: 1 }}
                  >
                    {pm.icon} {pm.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn btn-success btn-lg w-full"
              onClick={bookRide}
              disabled={booking}
              id="book-ride-btn"
            >
              {booking ? (
                <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
              ) : (
                `Book ${vehicleType === 'cab' ? 'Cab' : 'Bike'} — ₹${estimate.fare.total}`
              )}
            </button>
          </div>
        )}

        {step === 'tracking' && (
          <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div>
              <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                {getStatusText()}
              </h2>
              {activeRide?.otp && activeRide.status !== 'completed' && activeRide.status !== 'started' && (
                <div className="card" style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                    Share this OTP with driver
                  </div>
                  <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, letterSpacing: '0.2em', color: 'var(--primary-light)' }}>
                    {activeRide.otp}
                  </div>
                </div>
              )}
            </div>

            {/* Ride Status Steps */}
            <div className="ride-status-bar" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {['requested', 'accepted', 'arriving', 'arrived', 'started', 'completed'].map((s, i, arr) => {
                const statusIndex = arr.indexOf(activeRide?.status);
                const isCompleted = i < statusIndex;
                const isActive = i === statusIndex;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <div className={`status-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                      <div className="status-dot" />
                      <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`status-line ${isCompleted ? 'completed' : isActive ? 'active' : ''}`}
                        style={{ width: 20 }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Fare */}
            {activeRide?.fare && (
              <div className="fare-card">
                <div className="fare-row total" style={{ borderTop: 'none', paddingTop: 0, marginTop: 0 }}>
                  <span>Total Fare</span>
                  <span>₹{activeRide.fare.total}</span>
                </div>
                <div className="fare-row">
                  <span>Payment</span>
                  <span style={{ textTransform: 'capitalize' }}>{activeRide.paymentMethod}</span>
                </div>
              </div>
            )}

            {/* Completed - Rating */}
            {activeRide?.status === 'completed' && (
              <div className="card" style={{ textAlign: 'center' }}>
                <h3 style={{ marginBottom: 'var(--space-3)' }}>Rate your ride</h3>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => rateDriver(star)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        fontSize: '2rem', transition: 'transform 0.2s',
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      id={`rate-${star}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Cancel / SOS */}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              {activeRide?.status !== 'completed' && activeRide?.status !== 'started' && (
                <button className="btn btn-danger flex-1" onClick={() => setShowCancelModal(true)} id="cancel-ride-btn">
                  Cancel Ride
                </button>
              )}
              {(activeRide?.status === 'started' || activeRide?.status === 'arrived') && (
                <button
                  className="sos-btn"
                  onClick={() => {
                    emit('sos_trigger', { rideId: activeRide._id, location: pickup });
                    toast.error('SOS Alert sent!');
                  }}
                  id="sos-btn"
                >
                  SOS
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="booking-map">
        <MapView
          pickup={pickup}
          drop={drop}
          driverLocation={driverLocation}
          vehicleType={vehicleType}
          onMapClick={step === 'location' ? handleMapClick : undefined}
          height="100%"
        />
      </div>

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)} style={{ zIndex: 1000 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px', width: '90%' }}>
            <div className="modal-header">
              <h3 className="modal-title">Cancel Ride</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCancelModal(false)}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                Please select a reason for cancelling your ride:
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {CANCELLATION_REASONS.map(reason => (
                  <label 
                    key={reason.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-card)',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason.id}
                      checked={cancelReasonSelected === reason.id}
                      onChange={() => setCancelReasonSelected(reason.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-primary)' }}>{reason.label}</span>
                  </label>
                ))}
              </div>

              {cancelReasonSelected === 'other' && (
                <div className="form-group" style={{ marginTop: 'var(--space-2)' }}>
                  <label className="form-label" style={{ fontSize: 'var(--font-xs)', marginBottom: 'var(--space-1)' }}>
                    Specify cancellation reason
                  </label>
                  <textarea
                    className="form-input"
                    placeholder="Describe your reason here..."
                    value={customCancelReason}
                    onChange={(e) => setCustomCancelReason(e.target.value)}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button 
                  className="btn btn-secondary flex-1" 
                  onClick={() => setShowCancelModal(false)}
                >
                  Go Back
                </button>
                <button 
                  className="btn btn-danger flex-1" 
                  onClick={handleConfirmCancel}
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
