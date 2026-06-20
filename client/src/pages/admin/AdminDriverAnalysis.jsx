import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Search, MapPin, Activity, Users, Map, RefreshCw, X, SlidersHorizontal, Shield, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDriverAnalysis = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ drivers: [], analysis: [], filters: { states: [], cities: [], districts: [] } });
  
  // Filter states
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  // Custom dropdown autocomplete suggest open states
  const [showStateSuggest, setShowStateSuggest] = useState(false);
  const [showCitySuggest, setShowCitySuggest] = useState(false);
  const [showDistrictSuggest, setShowDistrictSuggest] = useState(false);

  useEffect(() => {
    fetchAnalysis();
  }, [selectedState, selectedCity, selectedDistrict]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const { data: res } = await adminAPI.getDriverAnalysis(selectedState, selectedCity, selectedDistrict);
      setData(res.data);
    } catch {
      toast.error('Failed to load driver analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedState('');
    setSelectedCity('');
    setSelectedDistrict('');
    toast.success('Filters cleared');
  };

  // KPI Calculations
  const totalRegions = data.analysis.length;
  const totalDriversCount = data.analysis.reduce((acc, curr) => acc + curr.totalRegistered, 0);
  const totalOnlineCount = data.analysis.reduce((acc, curr) => acc + curr.totalOnline, 0);

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Regional Driver Analysis</h1>
          <p className="page-subtitle">Track regional registrations and real-time online drivers by State, District, and City</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAnalysis} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
          <div className="icon-container" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', padding: 'var(--space-3)', borderRadius: '12px' }}>
            <Map size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Covered Cities</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 'var(--space-1)' }}>{totalRegions}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
          <div className="icon-container" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: 'var(--space-3)', borderRadius: '12px' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Total Registered Drivers</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 'var(--space-1)' }}>{totalDriversCount}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-5)' }}>
          <div className="icon-container" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: 'var(--space-3)', borderRadius: '12px', position: 'relative' }}>
            <Activity size={24} />
            {totalOnlineCount > 0 && (
              <span style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 6px #10b981' }} />
            )}
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Real-time Online</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: 'var(--space-1)', color: '#10b981' }}>{totalOnlineCount}</div>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', fontWeight: 600, fontSize: 'var(--font-sm)' }}>
          <SlidersHorizontal size={16} style={{ color: '#6366f1' }} />
          Region filters
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
          {/* State Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 200, position: 'relative', marginBottom: 0 }}>
            <label className="form-label">State</label>
            <div className="form-input-icon">
              <MapPin size={16} className="icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Type or select State..."
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                onFocus={() => setShowStateSuggest(true)}
                onBlur={() => setTimeout(() => setShowStateSuggest(false), 200)}
                id="filter-state"
              />
              {selectedState && (
                <button onClick={() => setSelectedState('')} style={{ position: 'absolute', right: 12, top: '35%', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {showStateSuggest && data.filters?.states?.length > 0 && (
              <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', maxHeight: 200, overflowY: 'auto', marginTop: '4px' }}>
                {data.filters.states.filter(s => s.toLowerCase().includes(selectedState.toLowerCase())).map(s => (
                  <div key={s} onMouseDown={() => setSelectedState(s)} style={{ padding: '10px 14px', cursor: 'pointer' }} className="dropdown-item">
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* District Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 200, position: 'relative', marginBottom: 0 }}>
            <label className="form-label">District</label>
            <div className="form-input-icon">
              <MapPin size={16} className="icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Type or select District..."
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                onFocus={() => setShowDistrictSuggest(true)}
                onBlur={() => setTimeout(() => setShowDistrictSuggest(false), 200)}
                id="filter-district"
              />
              {selectedDistrict && (
                <button onClick={() => setSelectedDistrict('')} style={{ position: 'absolute', right: 12, top: '35%', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {showDistrictSuggest && data.filters?.districts?.length > 0 && (
              <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', maxHeight: 200, overflowY: 'auto', marginTop: '4px' }}>
                {data.filters.districts.filter(d => d.toLowerCase().includes(selectedDistrict.toLowerCase())).map(d => (
                  <div key={d} onMouseDown={() => setSelectedDistrict(d)} style={{ padding: '10px 14px', cursor: 'pointer' }} className="dropdown-item">
                    {d}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* City Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 200, position: 'relative', marginBottom: 0 }}>
            <label className="form-label">City</label>
            <div className="form-input-icon">
              <Search size={16} className="icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Type or select City..."
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                onFocus={() => setShowCitySuggest(true)}
                onBlur={() => setTimeout(() => setShowCitySuggest(false), 200)}
                id="filter-city"
              />
              {selectedCity && (
                <button onClick={() => setSelectedCity('')} style={{ position: 'absolute', right: 12, top: '35%', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </div>
            {showCitySuggest && data.filters?.cities?.length > 0 && (
              <div className="dropdown-menu" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', maxHeight: 200, overflowY: 'auto', marginTop: '4px' }}>
                {data.filters.cities.filter(c => c.toLowerCase().includes(selectedCity.toLowerCase())).map(c => (
                  <div key={c} onMouseDown={() => setSelectedCity(c)} style={{ padding: '10px 14px', cursor: 'pointer' }} className="dropdown-item">
                    {c}
                  </div>
                ))}
              </div>
            )}
          </div>

          {(selectedState || selectedCity || selectedDistrict) && (
            <button className="btn btn-secondary btn-sm" onClick={handleClearFilters} style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
        {/* Aggregated Regional Analysis Table */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Map size={18} style={{ color: '#6366f1' }} />
            Registration & Online Driver Dashboard by City
          </h2>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>District</th>
                  <th>State</th>
                  <th style={{ textAlign: 'center' }}>Total Registered</th>
                  <th style={{ textAlign: 'center' }}>Real-time Online</th>
                  <th>Online Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.analysis.map((reg, index) => {
                  const rate = reg.totalRegistered > 0 ? Math.round((reg.totalOnline / reg.totalRegistered) * 100) : 0;
                  return (
                    <tr key={index}>
                      <td style={{ fontWeight: 600, color: '#f0f0f5' }}>{reg.city}</td>
                      <td>{reg.district}</td>
                      <td>
                        <span style={{ fontSize: 'var(--font-sm)', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
                          {reg.state}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{reg.totalRegistered}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${reg.totalOnline > 0 ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-block', width: '36px', textAlign: 'center' }}>
                          {reg.totalOnline}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${rate}%`, height: '100%', background: rate > 50 ? '#10b981' : rate > 0 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: 'var(--font-xs)', fontWeight: 600 }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {data.analysis.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-6)' }}>
                      {loading ? 'Loading regional stats...' : 'No regions matched your criteria'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Matching Drivers Detail List */}
        <div className="card" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} style={{ color: '#6366f1' }} />
            Matched Regional Drivers ({data.drivers.length})
          </h2>
          
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Vehicle Detail</th>
                  <th>Region Address</th>
                  <th>KYC Status</th>
                  <th>Online Status</th>
                  <th>Acc status</th>
                </tr>
              </thead>
              <tbody>
                {data.drivers.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{d.userId?.name || '—'}</div>
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>{d.userId?.email}</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--font-sm)' }}>
                        {d.vehicle?.make} {d.vehicle?.model}
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                          {d.vehicle?.plateNumber} • {d.vehicleType === 'cab' ? '🚗 Cab' : '🏍️ Bike'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 'var(--font-sm)' }}>
                        {d.address?.city}, {d.address?.district}
                        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                          {d.address?.state}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-dot ${
                        d.kyc?.status === 'approved' ? 'badge-success' :
                        d.kyc?.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {d.kyc?.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${d.isOnline ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                        {d.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${d.userId?.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {d.userId?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {data.drivers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-6)' }}>
                      {loading ? 'Loading driver data...' : 'No drivers match the regional filters'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDriverAnalysis;
