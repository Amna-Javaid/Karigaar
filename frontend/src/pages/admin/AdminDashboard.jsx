import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../services/api';
import { 
  Wrench, 
  ClipboardList, 
  Users, 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  Star, 
  Clock 
} from '../../components/Icons';
import './Admin.css';
import './Dashboard.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLOR = {
  pending: '#f59e0b', confirmed: '#3b82f6',
  'in-progress': '#8b5cf6', completed: '#10b981', cancelled: '#ef4444'
};

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    getAdminStats()
      .then(r => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!stats)  return <div className="alert alert-error">Could not load stats.</div>;

  const maxRevenue = Math.max(...(stats.monthlyRevenue.map(m => m.revenue) || [1]), 1);

  return (
    <div>
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening with KarigaarPK.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="admin-stats">
        <div className="stat-card">
          <div>
            <div className="stat-card-label">Total Services</div>
            <div className="stat-card-value">{stats.totalServices}</div>
          </div>
          <div className="stat-card-icon-modern">
            <Wrench size={28} color="var(--primary)" />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-card-label">Total Bookings</div>
            <div className="stat-card-value">{stats.totalBookings}</div>
          </div>
          <div className="stat-card-icon-modern">
            <ClipboardList size={28} color="var(--primary)" />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-card-label">Total Users</div>
            <div className="stat-card-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card-icon-modern">
            <Users size={28} color="var(--primary)" />
          </div>
        </div>
        <div className="stat-card">
          <div>
            <div className="stat-card-label">Total Revenue</div>
            <div className="stat-card-value" style={{ fontSize: 22 }}>Rs. {stats.totalRevenue?.toLocaleString()}</div>
          </div>
          <div className="stat-card-icon-modern">
            <DollarSign size={28} color="var(--primary)" />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* ── Revenue Chart ── */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--primary)" />
              <span>Monthly Revenue</span>
            </h3>
          </div>
          <div style={{ padding: '24px' }}>
            {stats.monthlyRevenue.length === 0 ? (
              <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '40px 0' }}>No revenue data yet. Make some bookings!</p>
            ) : (
              <div className="bar-chart">
                {stats.monthlyRevenue.map((m, i) => (
                  <div key={i} className="bar-item">
                    <div className="bar-tooltip">Rs. {m.revenue?.toLocaleString()}</div>
                    <div className="bar" style={{ height: `${(m.revenue / maxRevenue) * 180}px` }} />
                    <div className="bar-label">{MONTHS[(m._id.month - 1)]}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bookings by Status ── */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="var(--primary)" />
              <span>Bookings by Status</span>
            </h3>
          </div>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.bookingsByStatus.map(s => {
              const pct = stats.totalBookings ? Math.round((s.count / stats.totalBookings) * 100) : 0;
              return (
                <div key={s._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                    <span style={{ textTransform: 'capitalize' }}>{s._id}</span>
                    <span>{s.count} ({pct}%)</span>
                  </div>
                  <div style={{ background: '#f1f5f9', borderRadius: 4, height: 8 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: STATUS_COLOR[s._id] || '#94a3b8', borderRadius: 4, transition: 'width .6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Top Services ── */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={18} color="var(--primary)" fill="var(--primary)" />
              <span>Top Services</span>
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/services')}>View All</button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Service</th><th>Category</th><th>Bookings</th><th>Rating</th></tr></thead>
            <tbody>
              {stats.topServices.map(s => (
                <tr key={s._id}>
                  <td><strong>{s.title}</strong></td>
                  <td><span className="badge badge-primary">{s.category}</span></td>
                  <td>{s.totalBookings}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      {(s.rating || 0).toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {stats.topServices.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No services yet</td></tr>}
            </tbody>
          </table>
        </div>

        {/* ── Recent Bookings ── */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--primary)" />
              <span>Recent Bookings</span>
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/bookings')}>View All</button>
          </div>
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {stats.recentBookings.map(b => (
                <tr key={b._id}>
                  <td>{b.user?.name || 'N/A'}</td>
                  <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.serviceTitle}</td>
                  <td>Rs. {b.totalAmount?.toLocaleString()}</td>
                  <td>
                    <span style={{ color: STATUS_COLOR[b.status], fontWeight: 700, fontSize: 13, textTransform: 'capitalize' }}>{b.status}</span>
                  </td>
                </tr>
              ))}
              {stats.recentBookings.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No bookings yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
