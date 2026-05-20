import { useState, useEffect } from 'react';
import { getProviderBookings, updateBookingStatus } from '../../services/api';
import toast from 'react-hot-toast';
import { Zap, ShoppingCart, ChevronUp, ChevronDown, MapPin, Calendar, Clock, Clock2, User, AlertCircle, CheckCircle, Checkmark, Home, Mail, BookOpen, Wrench, Phone } from '../../components/Icons';
import './Provider.css';

const STATUSES = ['pending','confirmed','in-progress','completed','cancelled'];
const STATUS_COLOR = {
  pending: '#f59e0b', confirmed: '#3b82f6',
  'in-progress': '#8b5cf6', completed: '#10b981', cancelled: '#ef4444'
};

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getProviderBookings()
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      if (selected?._id === id) setSelected(p => ({ ...p, status }));
      toast.success(`Status updated → ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const filtered = bookings.filter(b => filter === 'all' || b.status === filter);

  return (
    <div>
      <div className="provider-page-header">
        <h1>My Bookings</h1>
        <p>{bookings.length} total bookings for your services</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            style={{ textTransform: 'capitalize' }}>
            {s} {s !== 'all' && <span style={{ opacity: 0.7 }}>({bookings.filter(b => b.status === s).length})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="provider-card">
          <div className="provider-empty">
            <div className="icon"><AlertCircle size={48} color="#f97316" /></div>
            <h3>No bookings found</h3>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(b => (
            <div key={b._id} className="provider-card" style={{ cursor: 'pointer' }} onClick={() => setSelected(b)}>
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <img
                  src={b.serviceImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&auto=format'}
                  alt="" style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 3 }}>{b.serviceCategory}</div>
                  <strong style={{ fontSize: 15 }}>{b.serviceTitle}</strong>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><User size={14} color="var(--primary)" /> {b.user?.name}</span>
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Phone size={14} color="var(--primary)" /> {b.user?.phone || 'N/A'}</span>
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Calendar size={14} color="var(--primary)" /> {new Date(b.scheduledDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Clock size={14} color="var(--primary)" /> {b.scheduledTime}</span>
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><Clock2 size={14} color="var(--primary)" /> {b.hours}h</span>
                    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}><MapPin size={14} color="var(--primary)" /> {b.city}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span style={{ color: STATUS_COLOR[b.status], background: STATUS_COLOR[b.status] + '18', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, textTransform: 'capitalize' }}>
                    {b.status}
                  </span>
                  <strong style={{ fontSize: 16, color: 'var(--primary)' }}>Rs. {b.totalAmount?.toLocaleString()}</strong>
                  <select className="booking-status-select" value={b.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleStatus(b._id, e.target.value)}
                    style={{ color: STATUS_COLOR[b.status] }}>
                    {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  ['Service',    selected.serviceTitle],
                  ['Customer',   selected.user?.name],
                  ['Phone',      selected.user?.phone || 'N/A'],
                  ['Email',      selected.user?.email],
                  ['Date',       new Date(selected.scheduledDate).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
                  ['Time',       selected.scheduledTime],
                  ['Duration',   `${selected.hours} hour${selected.hours > 1 ? 's' : ''}`],
                  ['City',       selected.city],
                  ['Address',    selected.address],
                  ['Payment',    selected.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'],
                  ['Total',      `Rs. ${selected.totalAmount?.toLocaleString()}`],
                  ['Status',     selected.status],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: 'var(--bg)', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>{label}</div>
                    <strong style={{ fontSize: 14 }}>{val}</strong>
                  </div>
                ))}
                {selected.notes && (
                  <div style={{ gridColumn: '1/-1', background: 'var(--bg)', padding: 12, borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>Notes</div>
                    <strong style={{ fontSize: 14 }}>{selected.notes}</strong>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 8 }}>
                <label className="form-label">Update Status</label>
                <select className="form-select" value={selected.status}
                  onChange={e => { handleStatus(selected._id, e.target.value); setSelected(p => ({ ...p, status: e.target.value })); }}>
                  {STATUSES.map(s => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
