import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { driverAPI } from '../../services/api';
import { Car, Bike, FileText, Camera, Shield, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const DriverKYC = () => {
  const { driverProfile, setDriverProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    vehicleType: driverProfile?.vehicleType || 'cab',
    vehicle: {
      make: driverProfile?.vehicle?.make || '',
      model: driverProfile?.vehicle?.model || '',
      year: driverProfile?.vehicle?.year || new Date().getFullYear(),
      color: driverProfile?.vehicle?.color || '',
      plateNumber: driverProfile?.vehicle?.plateNumber || '',
    },
    kyc: {
      drivingLicense: driverProfile?.kyc?.drivingLicense || '',
      registrationCert: driverProfile?.kyc?.registrationCert || '',
      insurance: driverProfile?.kyc?.insurance || '',
      profilePhoto: driverProfile?.kyc?.profilePhoto || '',
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await driverAPI.submitKYC(form);
      setDriverProfile(data.data.driver);
      toast.success('KYC submitted successfully! Awaiting review.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setLoading(false);
    }
  };

  const updateVehicle = (field, value) => {
    setForm({ ...form, vehicle: { ...form.vehicle, [field]: value } });
  };

  const updateKYC = (field, value) => {
    setForm({ ...form, kyc: { ...form.kyc, [field]: value } });
  };

  const kycStatus = driverProfile?.kyc?.status;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Driver KYC</h1>
        <p className="page-subtitle">Submit your vehicle and identity details to start driving</p>
      </div>

      {/* KYC Status Banner */}
      {kycStatus && (
        <div
          className="card animate-fadeIn"
          style={{
            marginBottom: 'var(--space-6)',
            background: kycStatus === 'approved' ? 'var(--success-bg)' : kycStatus === 'rejected' ? 'var(--danger-bg)' : 'var(--warning-bg)',
            border: `1px solid ${kycStatus === 'approved' ? 'rgba(16,185,129,0.3)' : kycStatus === 'rejected' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {kycStatus === 'approved' && <CheckCircle size={24} style={{ color: 'var(--success)' }} />}
            {kycStatus === 'pending' && <Clock size={24} style={{ color: 'var(--warning)' }} />}
            {kycStatus === 'rejected' && <XCircle size={24} style={{ color: 'var(--danger)' }} />}
            <div>
              <div style={{ fontWeight: 700, marginBottom: 'var(--space-1)' }}>
                {kycStatus === 'approved' && 'KYC Approved ✓'}
                {kycStatus === 'pending' && 'KYC Under Review'}
                {kycStatus === 'rejected' && 'KYC Rejected'}
              </div>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
                {kycStatus === 'approved' && 'You are approved to go online and accept rides.'}
                {kycStatus === 'pending' && 'Your documents are being reviewed. This usually takes 24-48 hours.'}
                {kycStatus === 'rejected' && (driverProfile?.kyc?.rejectionReason || 'Please update your details and resubmit.')}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 700 }}>
        {/* Vehicle Type */}
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Car size={20} style={{ color: 'var(--primary-light)' }} /> Vehicle Type
          </h3>
          <div className="vehicle-options">
            <div
              className={`vehicle-option ${form.vehicleType === 'cab' ? 'selected' : ''}`}
              onClick={() => setForm({ ...form, vehicleType: 'cab' })}
              id="kyc-vehicle-cab"
            >
              <div className="vehicle-emoji">🚗</div>
              <div className="vehicle-name">Cab</div>
              <div className="vehicle-price">4-wheel vehicle</div>
            </div>
            <div
              className={`vehicle-option ${form.vehicleType === 'bike' ? 'selected' : ''}`}
              onClick={() => setForm({ ...form, vehicleType: 'bike' })}
              id="kyc-vehicle-bike"
            >
              <div className="vehicle-emoji">🏍️</div>
              <div className="vehicle-name">Bike</div>
              <div className="vehicle-price">2-wheel vehicle</div>
            </div>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Shield size={20} style={{ color: 'var(--primary-light)' }} /> Vehicle Details
          </h3>
          <div className="grid grid-2" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Make / Brand</label>
              <input
                type="text" className="form-input" placeholder="e.g. Maruti, Honda"
                value={form.vehicle.make} onChange={(e) => updateVehicle('make', e.target.value)}
                required id="kyc-make"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input
                type="text" className="form-input" placeholder="e.g. Swift, Activa"
                value={form.vehicle.model} onChange={(e) => updateVehicle('model', e.target.value)}
                required id="kyc-model"
              />
            </div>
          </div>
          <div className="grid grid-3" style={{ gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="number" className="form-input" placeholder="2023" min="2000" max="2030"
                value={form.vehicle.year} onChange={(e) => updateVehicle('year', parseInt(e.target.value))}
                required id="kyc-year"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <input
                type="text" className="form-input" placeholder="e.g. White, Silver"
                value={form.vehicle.color} onChange={(e) => updateVehicle('color', e.target.value)}
                required id="kyc-color"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Plate Number</label>
              <input
                type="text" className="form-input" placeholder="e.g. KA01AB1234"
                value={form.vehicle.plateNumber} onChange={(e) => updateVehicle('plateNumber', e.target.value.toUpperCase())}
                required id="kyc-plate"
              />
            </div>
          </div>
        </div>

        {/* KYC Documents */}
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileText size={20} style={{ color: 'var(--primary-light)' }} /> Documents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Driving License Number</label>
              <input
                type="text" className="form-input" placeholder="Enter your DL number"
                value={form.kyc.drivingLicense} onChange={(e) => updateKYC('drivingLicense', e.target.value)}
                required id="kyc-dl"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle Registration Certificate (RC)</label>
              <input
                type="text" className="form-input" placeholder="Enter your RC number"
                value={form.kyc.registrationCert} onChange={(e) => updateKYC('registrationCert', e.target.value)}
                required id="kyc-rc"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Insurance Policy Number (Optional)</label>
              <input
                type="text" className="form-input" placeholder="Enter insurance number"
                value={form.kyc.insurance} onChange={(e) => updateKYC('insurance', e.target.value)}
                id="kyc-insurance"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading || kycStatus === 'approved'}
          id="submit-kyc-btn"
        >
          {loading ? (
            <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          ) : kycStatus === 'approved' ? (
            <><CheckCircle size={18} /> Already Approved</>
          ) : kycStatus === 'pending' ? (
            <><Clock size={18} /> Resubmit KYC</>
          ) : (
            <>Submit KYC <ChevronRight size={18} /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default DriverKYC;
