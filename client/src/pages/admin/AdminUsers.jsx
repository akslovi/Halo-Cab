import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Search, UserCheck, UserX, Mail, Phone } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    try {
      const { data } = await adminAPI.getUsers(page, search);
      setUsers(data.data.users);
      setTotalPages(data.data.pages);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      const { data } = await adminAPI.toggleUserActive(id);
      setUsers((prev) => prev.map((u) => (u._id === id ? data.data.user : u)));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="page" style={{ maxWidth: '100%' }}>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage registered users</p>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div className="form-input-icon" style={{ maxWidth: 400 }}>
          <Search size={16} className="icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            id="search-users"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Wallet</th>
              <th>Verified</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                      {user.name?.charAt(0)}
                    </div>
                    {user.name}
                  </div>
                </td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>₹{user.wallet?.balance || 0}</td>
                <td>
                  <span className={`badge ${user.isVerified ? 'badge-success' : 'badge-warning'}`}>
                    {user.isVerified ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-dot ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-xs)' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => toggleActive(user._id)}
                    id={`toggle-user-${user._id}`}
                  >
                    {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  {loading ? 'Loading...' : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
          <span style={{ padding: 'var(--space-2) var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
            {page} / {totalPages}
          </span>
          <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
