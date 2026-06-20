import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { User, Mail, Phone, Wallet, MapPin, Star, Shield, Car, Save, Edit3, CheckCircle, Clock, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, driverProfile, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const kycStatusIcon = {
    approved: <CheckCircle size={16} style={{ color: 'var(--success)' }} />,
    pending: <Clock size={16} style={{ color: 'var(--warning)' }} />,
    rejected: <XCircle size={16} style={{ color: 'var(--danger)' }} />,
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      <div className="grid grid-2" style={{ maxWidth: 900, gap: 'var(--space-6)' }}>
        {/* Profile Info Card */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
              <div className="avatar avatar-xl">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h2 style={{ fontSize: 'var(--font-2xl)', fontWeight: 800 }}>{user?.name}</h2>
                <span className={`badge ${user?.role === 'admin' ? 'badge-primary' : user?.role === 'driver' ? 'badge-warning' : 'badge-info'}`}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </span>
              </div>
            </div>
            {!editing ? (
              <button className="btn btn-secondary" onClick={() => setEditing(true)} id="edit-profile-btn">
                <Edit3 size={16} /> Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setForm({ name: user?.name, phone: user?.phone }); }}>
                  Cancel
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={loading} id="save-profile-btn">
                  <Save size={14} /> Save
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">
                <User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  id="profile-name"
                />
              ) : (
                <div style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--font-base)' }}>
                  {user?.name}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Email
              </label>
              <div style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--font-base)' }}>
                {user?.email}
                {user?.isVerified && (
                  <CheckCircle size={14} style={{ color: 'var(--success)', marginLeft: '0.5rem', display: 'inline', verticalAlign: 'middle' }} />
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem' }} />
                Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  className="form-input"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  id="profile-phone"
                />
              ) : (
                <div style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', fontSize: 'var(--font-base)' }}>
                  {user?.phone}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div className="stat-icon success">
              <Wallet size={22} />
            </div>
            <h3 style={{ fontWeight: 700 }}>Wallet</h3>
          </div>
          <div style={{ fontSize: 'var(--font-3xl)', fontWeight: 900, color: 'var(--success)', marginBottom: 'var(--space-2)' }}>
            ₹{user?.wallet?.balance || 0}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            Available Balance
          </div>
        </div>

        {/* Account Status Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div className="stat-icon primary">
              <Shield size={22} />
            </div>
            <h3 style={{ fontWeight: 700 }}>Account</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span className={`badge badge-dot ${user?.isActive ? 'badge-success' : 'badge-danger'}`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Verified</span>
              <span className={`badge ${user?.isVerified ? 'badge-success' : 'badge-warning'}`}>
                {user?.isVerified ? 'Yes' : 'No'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Joined</span>
              <span style={{ color: 'var(--text-secondary)' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Driver Details (only for drivers) */}
        {user?.role === 'driver' && driverProfile && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              <div className="stat-icon warning">
                <Car size={22} />
              </div>
              <h3 style={{ fontWeight: 700 }}>Driver Profile</h3>
            </div>

            <div className="grid grid-3" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>KYC Status</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                  {kycStatusIcon[driverProfile.kyc?.status] || null}
                  <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>
                    {driverProfile.kyc?.status || 'Not Submitted'}
                  </span>
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Rating</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-xl)' }}>
                  ⭐ {driverProfile.rating?.average || '5.0'} <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>({driverProfile.rating?.count || 0})</span>
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>Total Rides</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-xl)' }}>
                  {driverProfile.totalRides || 0}
                </div>
              </div>
            </div>

            {driverProfile.vehicle && (
              <div style={{ padding: 'var(--space-4)', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)', marginBottom: 'var(--space-3)', color: 'var(--text-muted)' }}>Vehicle Details</div>
                <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', fontSize: 'var(--font-sm)' }}>
                  <span><strong>Type:</strong> {driverProfile.vehicleType === 'cab' ? '🚗 Cab' : '🏍️ Bike'}</span>
                  <span><strong>Make:</strong> {driverProfile.vehicle.make}</span>
                  <span><strong>Model:</strong> {driverProfile.vehicle.model}</span>
                  <span><strong>Color:</strong> {driverProfile.vehicle.color}</span>
                  <span><strong>Plate:</strong> {driverProfile.vehicle.plateNumber}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Addresses */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div className="stat-icon info">
              <MapPin size={22} />
            </div>
            <h3 style={{ fontWeight: 700 }}>Saved Addresses</h3>
          </div>
          {user?.savedAddresses && user.savedAddresses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {user.savedAddresses.map((addr, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <MapPin size={16} style={{ color: 'var(--primary-light)', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{addr.title}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{addr.address}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
              No saved addresses yet. They'll appear here as you use the app.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
