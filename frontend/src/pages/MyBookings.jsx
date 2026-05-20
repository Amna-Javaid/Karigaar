import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getMyBookings, cancelBooking } from '../services/api';
import { BookOpen, AlertCircle, User, Clock2, Calendar, Clock, MapPin } from '../components/Icons';
import toast from 'react-hot-toast';
import './MyBookings.css';

const STATUS_STYLE = {
  pending:      { color: '#f59e0b', bg: 'rgba(245,158,11,.1)',  label: 'Pending'      },
  confirmed:    { color: '#3b82f6', bg: 'rgba(59,130,246,.1)',  label: 'Confirmed'    },
  'in-progress':{ color: '#8b5cf6', bg: 'rgba(139,92,246,.1)',  label: 'In Progress'  },
  completed:    { color: '#10b981', bg: 'rgba(16,185,129,.1)',  label: 'Completed'    },
  cancelled:    { color: '#ef4444', bg: 'rgba(239,68,68,.1)',   label: 'Cancelled'    },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate                = useNavigate();

  const load = () => {
    setLoading(true);
    getMyBookings()
      .then(r => setBookings(r.data))
      .catch(() => toast.error('Could not load bookings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="container">
          <h1 style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <BookOpen size={32} color="white" />
            My Bookings
          </h1>
          <p>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><AlertCircle size={48} color="#f97316" /></div>
            <h3>No bookings yet</h3>
            <p>Browse services and make your first booking</p>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}>Browse Services</button>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(b => {
              const s = STATUS_STYLE[b.status] || STATUS_STYLE.pending;
              return (
                <div key={b._id} className="booking-row">
                  <img
                    src={b.serviceImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=120&auto=format'}
                    alt={b.serviceTitle}
                    className="booking-img"
                  />
                  <div className="booking-info">
                    <span className="booking-cat">{b.serviceCategory}</span>
                    <h3>{b.serviceTitle}</h3>
                    <div className="booking-meta">
                      <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><User size={14} color="#f97316" /> {b.providerName}</span>
                      <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><Clock2 size={14} color="#f97316" /> {b.hours} hr{b.hours > 1 ? 's' : ''}</span>
                      <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><Calendar size={14} color="#f97316" /> {new Date(b.scheduledDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><Clock size={14} color="#f97316" /> {b.scheduledTime}</span>
                      <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><MapPin size={14} color="#f97316" /> {b.city}</span>
                    </div>
                  </div>
                  <div className="booking-right">
                    <span className="booking-status-badge" style={{ color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                    <div className="booking-amount">Rs. {b.totalAmount?.toLocaleString()}</div>
                    <div className="booking-actions-row">
                      <button className="btn btn-outline btn-sm" onClick={() => navigate(`/booking/${b._id}`)}>
                        Track →
                      </button>
                      {['pending', 'confirmed'].includes(b.status) && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b._id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
