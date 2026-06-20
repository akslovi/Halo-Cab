import { useState, useEffect } from 'react';
import { driverAPI } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { IndianRupee, TrendingUp, Car, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const DriverEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const { data: res } = await driverAPI.getEarnings();
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load earnings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner spinner-lg" />
        <div className="loading-text">Loading earnings...</div>
      </div>
    );
  }

  // Generate last 7 days mock chart data from recent rides
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dayRides = data?.recentRides?.filter((r) => {
      const rideDate = new Date(r.completedAt || r.createdAt);
      return rideDate.toDateString() === d.toDateString();
    }) || [];
    chartData.push({
      day: dayStr,
      earnings: dayRides.reduce((sum, r) => sum + (r.fare?.total || 0), 0),
      rides: dayRides.length,
    });
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Earnings Dashboard</h1>
        <p className="page-subtitle">Track your income and performance</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
        <div className="stat-card">
          <div className="stat-icon success"><IndianRupee size={22} /></div>
          <div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>₹{data?.earnings?.today || 0}</div>
            <div className="stat-label">Today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon primary"><TrendingUp size={22} /></div>
          <div>
            <div className="stat-value">₹{data?.earnings?.week || 0}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning"><IndianRupee size={22} /></div>
          <div>
            <div className="stat-value">₹{data?.earnings?.total || 0}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info"><Star size={22} /></div>
          <div>
            <div className="stat-value">{data?.rating?.average || '—'}</div>
            <div className="stat-label">Rating ({data?.rating?.count || 0} reviews)</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
        <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700 }}>Weekly Earnings</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#6b6b80" fontSize={12} />
              <YAxis stroke="#6b6b80" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: '#1a1a2e',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#f0f0f5',
                }}
              />
              <Bar dataKey="earnings" fill="url(#gradient)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700 }}>Recent Completed Rides</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>From → To</th>
                <th>Distance</th>
                <th>Fare</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentRides?.map((ride) => (
                <tr key={ride._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(ride.completedAt || ride.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ride.pickup?.address?.substring(0, 25)} → {ride.drop?.address?.substring(0, 25)}
                  </td>
                  <td>{ride.distance} km</td>
                  <td style={{ fontWeight: 600 }}>₹{ride.fare?.total}</td>
                </tr>
              ))}
              {(!data?.recentRides || data.recentRides.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    No rides yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;
