import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProviderStats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  ClipboardList, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Wrench, 
  Star 
} from '../../components/Icons';
import './Provider.css';

const STATUS_COLOR = {
  pending: '#f59e0b', confirmed: '#3b82f6',
  'in-progress': '#8b5cf6', completed: '#10b981', cancelled: '#ef4444'
};

export default function ProviderDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const { user }              = useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    getProviderStats()
      .then(r => setStats(r.data))
      .catch(() => toast.error('Could not load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <div className="provider-page-header">
        <h1>Welcome, {user?.businessName || user?.name}!</h1>
        <p>Here's your service provider dashboard overview.</p>
      </div>

      {!user?.isVerified && (
        <div className="alert alert-info" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={20} color="var(--primary)" />
          <span><strong>Your account is pending verification.</strong> Once admin verifies you, your services will appear to customers.</span>
        </div>
      )}

      {/* Stats */}
      <div className="provider-stats">
        <div className="pstat-card">
          <div className="pstat-icon-modern">
            <ClipboardList size={24} color="var(--primary)" />
          </div>
          <div><div className="pstat-label">Total Bookings</div><div className="pstat-value">{stats?.totalBookings || 0}</div></div>
        </div>
        <div className="pstat-card">
          <div className="pstat-icon-modern">
            <Clock size={24} color="var(--primary)" />
          </div>
          <div><div className="pstat-label">Pending</div><div className="pstat-value">{stats?.pendingBookings || 0}</div></div>
        </div>
        <div className="pstat-card">
          <div className="pstat-icon-modern">
            <ShieldCheck size={24} color="var(--primary)" />
          </div>
          <div><div className="pstat-label">Completed</div><div className="pstat-value">{stats?.completedBookings || 0}</div></div>
        </div>
        <div className="pstat-card">
          <div className="pstat-icon-modern">
            <DollarSign size={24} color="var(--primary)" />
          </div>
          <div><div className="pstat-label">Total Earnings</div><div className="pstat-value" style={{ fontSize: 20 }}>Rs. {stats?.totalRevenue?.toLocaleString() || 0}</div></div>
        </div>
      </div>

      <div className="provider-grid-2">
        {/* Recent Bookings */}
        <div className="provider-card">
          <div className="provider-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--primary)" />
              <span>Recent Bookings</span>
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/provider/bookings')}>View All</button>
          </div>
          {stats?.recentBookings?.length === 0 ? (
            <div className="provider-empty">
              <div className="icon"><ClipboardList size={40} color="var(--text-light)" /></div>
              <h3>No bookings yet</h3>
            </div>
          ) : (
            <table className="provider-table">
              <thead><tr><th>Customer</th><th>Service</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {stats?.recentBookings?.map(b => (
                  <tr key={b._id}>
                    <td><strong>{b.user?.name}</strong><br /><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.user?.phone}</span></td>
                    <td style={{ fontSize: 13 }}>{b.serviceTitle}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(b.scheduledDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}</td>
                    <td><span className="status-pill" style={{ color: STATUS_COLOR[b.status], background: STATUS_COLOR[b.status] + '20' }}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* My Services */}
        <div className="provider-card">
          <div className="provider-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Wrench size={18} color="var(--primary)" />
              <span>My Services</span>
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/provider/services')}>Manage</button>
          </div>
          {stats?.myServices?.length === 0 ? (
            <div className="provider-empty">
              <div className="icon"><Wrench size={40} color="var(--text-light)" /></div>
              <h3>No services yet</h3>
              <p style={{ marginBottom: 16 }}>Add your first service to start getting bookings</p>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/provider/services')}>+ Add Service</button>
            </div>
          ) : (
            <table className="provider-table">
              <thead><tr><th>Service</th><th>Bookings</th><th>Rating</th></tr></thead>
              <tbody>
                {stats?.myServices?.map(s => (
                  <tr key={s._id}>
                    <td><strong>{s.title}</strong></td>
                    <td>{s.totalBookings}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        <Star size={14} color="#f59e0b" fill="#f59e0b" />
                        {(s.rating || 0).toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
