import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { rideAPI } from '../services/api';
import toast from 'react-hot-toast';

const BookingContext = createContext(null);

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
};

export const BookingProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { on } = useSocket();

  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [vehicleType, setVehicleType] = useState('cab');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [couponCode, setCouponCode] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [step, setStep] = useState('location'); // location, estimate, tracking

  const resetBooking = () => {
    setStep('location');
    setActiveRide(null);
    setEstimate(null);
    setDriverLocation(null);
    setPickup(null);
    setDrop(null);
    setCouponCode('');
  };

  // Reset booking state when user logs out, and load active ride on login/refresh
  useEffect(() => {
    if (!isAuthenticated) {
      resetBooking();
    } else if (user?.role === 'user') {
      const fetchActiveRide = async () => {
        try {
          const { data } = await rideAPI.getRideHistory(1);
          const rides = data?.data?.rides;
          if (rides && rides.length > 0) {
            const latestRide = rides[0];
            if (['requested', 'accepted', 'arriving', 'arrived', 'started'].includes(latestRide.status)) {
              setActiveRide(latestRide);
              setPickup(latestRide.pickup);
              setDrop(latestRide.drop);
              setVehicleType(latestRide.vehicleType);
              setPaymentMethod(latestRide.paymentMethod);
              setStep('tracking');
              if (latestRide.driverId?.currentLocation?.coordinates) {
                setDriverLocation({
                  lat: latestRide.driverId.currentLocation.coordinates[1],
                  lng: latestRide.driverId.currentLocation.coordinates[0],
                });
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch active ride:', err);
        }
      };
      fetchActiveRide();
    }
  }, [isAuthenticated, user]);

  // Listen for socket events
  useEffect(() => {
    if (!on || !isAuthenticated || user?.role !== 'user') return;

    const unsub1 = on('ride_accepted', (data) => {
      toast.success('Driver found! Your ride is on the way.');
      setActiveRide(data.ride);
      if (data.driver?.location) {
        setDriverLocation({
          lat: data.driver.location[1] || data.driver.location.lat,
          lng: data.driver.location[0] || data.driver.location.lng,
        });
      }
      setStep('tracking');
    });

    const unsub2 = on('driver_location', (data) => {
      setDriverLocation({ lat: data.lat, lng: data.lng });
    });

    const unsub3 = on('ride_status_update', (data) => {
      setActiveRide((prev) => prev ? { ...prev, status: data.status } : prev);
      if (data.message) toast(data.message, { icon: '📍' });
    });

    const unsub4 = on('ride_completed', (data) => {
      toast.success('Ride completed! Please rate your driver.');
      setActiveRide(data.ride);
    });

    const unsub5 = on('ride_cancelled', () => {
      toast.error('Ride has been cancelled');
      resetBooking();
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
    };
  }, [on, isAuthenticated, user]);

  return (
    <BookingContext.Provider
      value={{
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
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
