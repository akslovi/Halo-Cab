import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Plus, Ticket, Calendar, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'percentage',
    discountValue: '', minRideAmount: '', maxDiscount: '',
    validFrom: '', validTo: '', usageLimit: 100,
  });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await adminAPI.getCoupons();
      setCoupons(data.data.coupons);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await adminAPI.createCoupon({
        ...form,
        discountValue: Number(form.discountValue),
        minRideAmount: Number(form.minRideAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 500,
        usageLimit: Number(form.usageLimit),
      });
      setCoupons(prev => [data.data.coupon, ...prev]);
      toast.success('Coupon created!');
      setShowForm(false);
      setForm({ code: '', description: '', discountType: 'percentage', discountValue: '', minRideAmount: '', maxDiscount: '', validFrom: '', validTo: '', usageLimit: 100 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    }
  };

  const toggleCoupon = async (id, isActive) => {
    try {
      const { data } = await adminAPI.updateCoupon(id, { isActive: !isActive });
      setCoupons(prev => prev.map(c => c._id === id ? data.data.coupon : c));
      toast.success(`Coupon ${!isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update coupon'); }
  };

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 className="page-title">Coupon Management</h1>
          <p className="page-subtitle">Create and manage promotional codes</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="create-coupon-btn">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="card animate-slideUp" style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)', fontWeight: 700 }}>New Coupon</h3>
          <form onSubmit={handleCreate}>
            <div className="grid grid-3" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Code</label>
                <input className="form-input" placeholder="e.g. SAVE20" value={form.code}
                  onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} required id="coupon-code" />
              </div>
              <div className="form-group">
                <label className="form-label">Discount Type</label>
                <select className="form-select" value={form.discountType}
                  onChange={e => setForm({...form, discountType: e.target.value})} id="discount-type">
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Discount Value</label>
                <input type="number" className="form-input" placeholder={form.discountType === 'percentage' ? '20' : '100'}
                  value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-3" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Min Ride Amount (₹)</label>
                <input type="number" className="form-input" placeholder="0" value={form.minRideAmount}
                  onChange={e => setForm({...form, minRideAmount: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Discount (₹)</label>
                <input type="number" className="form-input" placeholder="500" value={form.maxDiscount}
                  onChange={e => setForm({...form, maxDiscount: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Usage Limit</label>
                <input type="number" className="form-input" value={form.usageLimit}
                  onChange={e => setForm({...form, usageLimit: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-2" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="form-group">
                <label className="form-label">Valid From</label>
                <input type="date" className="form-input" value={form.validFrom}
                  onChange={e => setForm({...form, validFrom: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Valid To</label>
                <input type="date" className="form-input" value={form.validTo}
                  onChange={e => setForm({...form, validTo: e.target.value})} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Coupon description" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} required />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" id="save-coupon-btn">Create Coupon</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Description</th>
              <th>Discount</th>
              <th>Min Amount</th>
              <th>Usage</th>
              <th>Valid Period</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c._id}>
                <td><span style={{ fontWeight: 700, color: 'var(--primary-light)', fontFamily: 'monospace' }}>{c.code}</span></td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</td>
                <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                <td>₹{c.minRideAmount}</td>
                <td>{c.usedCount}/{c.usageLimit}</td>
                <td style={{ fontSize: 'var(--font-xs)', whiteSpace: 'nowrap' }}>
                  {new Date(c.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — {new Date(c.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </td>
                <td>
                  <span className={`badge badge-dot ${c.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${c.isActive ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => toggleCoupon(c._id, c.isActive)}
                  >
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoupons;
