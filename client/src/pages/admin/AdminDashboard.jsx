import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';
import { Users, Car, IndianRupee, TrendingUp, Activity, Zap, UserCheck, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Surge Pricing Control Component
const SurgeControl = ({ surgeConfig, onUpdate }) => {
  const [enabled, setEnabled] = useState(surgeConfig?.enabled || false);
  const [multiplier, setMultiplier] = useState(surgeConfig?.multiplier || 1.0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (surgeConfig) {
      setEnabled(surgeConfig.enabled);
      setMultiplier(surgeConfig.multiplier || 1.0);
    }
  }, [surgeConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminAPI.setSurge(enabled, multiplier);
      toast.success(`Surge pricing ${enabled ? 'enabled' : 'disabled'} at ${multiplier}x`);
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error('Failed to update surge pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Zap size={20} style={{ color: 'var(--warning)' }} /> Surge Pricing Control
        </h3>
        <button
          onClick={() => setEnabled(!enabled)}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: enabled ? 'var(--success)' : 'var(--text-muted)',
            transition: 'color 0.2s ease',
          }}
          title={enabled ? 'Disable surge' : 'Enable surge'}
          id="surge-toggle"
        >
          {enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
            Multiplier: <strong style={{ color: enabled ? 'var(--warning)' : 'var(--text-secondary)', fontSize: 'var(--font-lg)' }}>{multiplier}x</strong>
          </div>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={multiplier}
            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            disabled={!enabled}
            style={{
              width: '100%', accentColor: 'var(--warning)',
              opacity: enabled ? 1 : 0.4,
            }}
            id="surge-multiplier"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
            <span>1x</span>
            <span>2x</span>
            <span>3x</span>
          </div>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
          id="save-surge-btn"
        >
          {saving ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : 'Save'}
        </button>
      </div>

      <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
        {enabled
          ? `⚡ Manual surge active — all fares multiplied by ${multiplier}x`
          : '📊 Using automatic time-based surge (peak hours: 8-10 AM, 5-8 PM, 10 PM-12 AM)'}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: res } = await adminAPI.getDashboard();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <div className="loading-text">Loading dashboard...</div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Real-time overview of HaloCab operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-icon primary"><Car size={22} /></div>
          <div>
            <div className="stat-value">{stats.totalRides}</div>
            <div className="stat-label">Total Rides</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><IndianRupee size={22} /></div>
          <div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>₹{(stats.totalRevenue || 0).toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info"><Users size={22} /></div>
          <div>
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><UserCheck size={22} /></div>
          <div>
            <div className="stat-value">{stats.totalDrivers}</div>
            <div className="stat-label">Total Drivers</div>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-icon success"><Activity size={22} /></div>
          <div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.activeRides}</div>
            <div className="stat-label">Active Rides</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon primary"><MapPin size={22} /></div>
          <div>
            <div className="stat-value">{stats.activeDrivers}</div>
            <div className="stat-label">Online Drivers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-value">{stats.todayRides}</div>
            <div className="stat-label">Today's Rides</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><Zap size={22} /></div>
          <div>
            <div className="stat-value" style={{ color: 'var(--warning)' }}>
              {data?.surgeConfig?.currentMultiplier}x
            </div>
            <div className="stat-label">Surge Multiplier</div>
          </div>
        </div>
      </div>

      {/* Surge Pricing Control */}
      <SurgeControl surgeConfig={data?.surgeConfig} onUpdate={fetchDashboard} />

      {/* Charts */}
      <div className="grid grid-2" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700 }}>Revenue (Last 7 Days)</h3>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenueByDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="_id" stroke="#6b6b80" fontSize={11} tickFormatter={(v) => v?.slice(5)} />
                <YAxis stroke="#6b6b80" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f0f0f5' }}
                  formatter={(val) => [`₹${val}`, 'Revenue']}
                />
                <Bar dataKey="total" fill="url(#adminGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="adminGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700 }}>Ride & Revenue Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Completed</span>
              <span className="badge badge-success">{stats.completedRides}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cancelled</span>
              <span className="badge badge-danger">{stats.cancelledRides}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Today's Revenue</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{stats.todayRevenue || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0' }}>
              <span style={{ color: 'var(--text-muted)' }}>Completion Rate</span>
              <span style={{ fontWeight: 700 }}>
                {stats.totalRides > 0 ? ((stats.completedRides / stats.totalRides) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Rides */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700 }}>Recent Rides</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Fare</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentRides?.map((ride) => (
                <tr key={ride._id}>
                  <td>{ride.userId?.name || '—'}</td>
                  <td>{ride.driverId?.userId?.name || '—'}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ride.pickup?.address?.substring(0, 20)} → {ride.drop?.address?.substring(0, 20)}
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{ride.fare?.total}</td>
                  <td>
                    <span className={`badge badge-dot ${
                      ride.status === 'completed' ? 'badge-success' :
                      ride.status === 'cancelled' ? 'badge-danger' :
                      'badge-warning'
                    }`}>
                      {ride.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-xs)' }}>
                    {new Date(ride.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
