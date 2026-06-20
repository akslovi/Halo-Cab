import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { CheckCircle, XCircle, Clock, Car, Bike, Star, Filter, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kycFilter, setKycFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchDrivers(); }, [page, kycFilter]);

  const fetchDrivers = async () => {
    try {
      const { data } = await adminAPI.getDrivers(page, kycFilter);
      setDrivers(data.data.drivers);
      setTotalPages(data.data.pages);
    } catch { toast.error('Failed to load drivers'); }
    finally { setLoading(false); }
  };

  const handleKYC = async (id, status) => {
    try {
      const reason = status === 'rejected' ? rejectReason : '';
      const { data } = await adminAPI.updateDriverKYC(id, status, reason);
      setDrivers(prev => prev.map(d => d._id === id ? data.data.driver : d));
      toast.success(`Driver KYC ${status}`);
      setRejectModal(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update KYC');
    }
  };

  const toggleActive = async (userId, driverId) => {
    try {
      const { data } = await adminAPI.toggleUserActive(userId);
      setDrivers(prev => prev.map(d => {
        if (d.userId?._id === userId) {
          return { ...d, userId: { ...d.userId, isActive: data.data.user.isActive } };
        }
        return d;
      }));
      toast.success(`Driver account ${data.data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update driver account status');
    }
  };

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">Driver Management</h1>
        <p className="page-subtitle">Review KYC and manage driver accounts</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
        {['', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${kycFilter === f ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setKycFilter(f); setPage(1); }}
          >
            {f === '' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Type</th>
              <th>KYC Status</th>
              <th>Rating</th>
              <th>Rides</th>
              <th>Online</th>
              <th>Acc Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d._id}>
                <td>
                  <div>
                    <div style={{ fontWeight: 600 }}>{d.userId?.name || '—'}</div>
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{d.userId?.phone}</div>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: 'var(--font-sm)' }}>
                    {d.vehicle?.make} {d.vehicle?.model}
                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                      {d.vehicle?.plateNumber} • {d.vehicle?.color}
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '1.2rem' }}>{d.vehicleType === 'cab' ? '🚗' : '🏍️'}</span>
                </td>
                <td>
                  <span className={`badge badge-dot ${
                    d.kyc?.status === 'approved' ? 'badge-success' :
                    d.kyc?.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {d.kyc?.status}
                  </span>
                </td>
                <td>⭐ {d.rating?.average} ({d.rating?.count})</td>
                <td>{d.totalRides || 0}</td>
                <td>
                  <span className={`badge badge-dot ${d.isOnline ? 'badge-success' : 'badge-danger'}`}>
                    {d.isOnline ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-dot ${d.userId?.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {d.userId?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                    {d.kyc?.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleKYC(d._id, 'approved')}
                          id={`approve-${d._id}`}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => setRejectModal(d._id)}
                          id={`reject-${d._id}`}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                    {d.kyc?.status === 'approved' && (
                      <span style={{ color: 'var(--success)', fontSize: 'var(--font-sm)', fontWeight: 500 }}>✓ Verified KYC</span>
                    )}
                    {d.kyc?.status === 'rejected' && (
                      <span style={{ color: 'var(--danger)', fontSize: 'var(--font-xs)', fontWeight: 500 }}>
                        ❌ KYC Rejected: {d.kyc?.rejectionReason || 'Rejected'}
                      </span>
                    )}
                    
                    {d.userId && (
                      <button
                        className={`btn btn-sm ${d.userId.isActive ? 'btn-danger' : 'btn-success'}`}
                        style={{ marginTop: 'var(--space-1)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => toggleActive(d.userId._id, d._id)}
                        id={`toggle-driver-${d._id}`}
                      >
                        {d.userId.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        {d.userId.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Reject KYC</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setRejectModal(null)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for rejection</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Enter reason..."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                id="reject-reason"
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn-secondary flex-1" onClick={() => setRejectModal(null)}>Cancel</button>
              <button className="btn btn-danger flex-1" onClick={() => handleKYC(rejectModal, 'rejected')}>
                Reject Driver
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ padding: 'var(--space-2)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>{page}/{totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminDrivers;
