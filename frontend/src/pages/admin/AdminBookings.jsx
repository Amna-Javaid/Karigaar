import { useState, useEffect } from 'react';
import { getAllBookings, updateBookingStatus } from '../../services/api';
import toast from 'react-hot-toast';
import './Admin.css';

const STATUSES = ['pending','confirmed','in-progress','completed','cancelled'];
const STATUS_COLOR = {
  pending:'#f59e0b', confirmed:'#3b82f6',
  'in-progress':'#8b5cf6', completed:'#10b981', cancelled:'#ef4444'
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');

  const load = () => {
    setLoading(true);
    getAllBookings()
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateBookingStatus(id, { status });
      toast.success(`Status → ${status}`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter;
    const matchSearch = !search || b.serviceTitle?.toLowerCase().includes(search.toLowerCase())
      || b.user?.name?.toLowerCase().includes(search.toLowerCase())
      || b.city?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      <div className="admin-page-header">
        <h1>Bookings Management</h1>
        <p>{bookings.length} total bookings</p>
      </div>

      <div className="admin-card">
        <div className="admin-card-header" style={{ flexWrap:'wrap', gap:12 }}>
          <h3>All Bookings</h3>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <input className="form-input" style={{ width:200 }} placeholder="Search customer or service..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" style={{ width:160 }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s} style={{ textTransform:'capitalize' }}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Service</th><th>Date & Time</th>
                <th>Amount</th><th>Payment</th><th>Status</th><th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id}>
                  <td style={{ fontFamily:'monospace', fontSize:12 }}>#{b._id?.slice(-6).toUpperCase()}</td>
                  <td>
                    <strong style={{ display:'block' }}>{b.user?.name || 'N/A'}</strong>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{b.user?.email}</span>
                  </td>
                  <td>
                    <strong style={{ display:'block', fontSize:13 }}>{b.serviceTitle}</strong>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{b.hours}h · {b.city}</span>
                  </td>
                  <td>
                    <span style={{ display:'block', fontSize:13 }}>{new Date(b.scheduledDate).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>{b.scheduledTime}</span>
                  </td>
                  <td style={{ fontWeight:700 }}>Rs. {b.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${b.paymentStatus==='paid' ? 'badge-success':'badge-warning'}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: STATUS_COLOR[b.status], fontWeight:700, fontSize:13, textTransform:'capitalize' }}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <select className="status-select"
                      value={b.status}
                      onChange={e => handleStatusChange(b._id, e.target.value)}
                      style={{ color: STATUS_COLOR[b.status] }}
                    >
                      {STATUSES.map(s => <option key={s} value={s} style={{ textTransform:'capitalize' }}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', color:'var(--text-muted)', padding:'40px' }}>No bookings found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
