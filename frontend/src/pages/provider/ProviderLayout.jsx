import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  Wrench, 
  ClipboardList, 
  User, 
  Zap, 
  Globe, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  Clock
} from '../../components/Icons';
import './Provider.css';

const NAV = [
  { to: '/provider',          label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/provider/services', label: 'My Services', icon: Wrench },
  { to: '/provider/bookings', label: 'My Bookings', icon: ClipboardList },
  { to: '/provider/profile',  label: 'Profile',    icon: User },
];

export default function ProviderLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Persist sidebar collapsed preference in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('provider_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('provider_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className={`provider-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Sidebar ── */}
      <aside className={`provider-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="provider-sidebar-header">
          {!collapsed ? (
            <div className="provider-logo">
              <Zap size={22} color="var(--primary)" />
              <span>Karigaar<span className="logo-pk">PK</span></span>
            </div>
          ) : (
            <div className="provider-logo collapsed-logo">
              <Zap size={22} color="var(--primary)" />
            </div>
          )}
          <button className="sidebar-toggle-btn" onClick={toggleCollapse} aria-label="Toggle Sidebar">
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {!collapsed && <div className="provider-role-tag">Service Provider</div>}

        <div className="provider-user-card" title={user?.businessName || user?.name}>
          <div className="provider-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          {!collapsed && (
            <div>
              <strong>{user?.businessName || user?.name}</strong>
              <span>{user?.businessCategory || 'Provider'}</span>
              {user?.isVerified ? (
                <span className="verified-badge">
                  <ShieldCheck size={11} color="var(--accent)" /> Verified
                </span>
              ) : (
                <span className="unverified-badge">
                  <Clock size={11} color="var(--warning)" /> Pending
                </span>
              )}
            </div>
          )}
        </div>

        <nav className="provider-nav">
          {NAV.map(n => {
            const Icon = n.icon;
            return (
              <NavLink 
                key={n.to} 
                to={n.to} 
                end={n.end}
                className={({ isActive }) => `provider-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? n.label : undefined}
              >
                <span className="nav-icon-span"><Icon size={18} /></span>
                {!collapsed && <span className="nav-label-span">{n.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className={`provider-sidebar-footer ${collapsed ? 'collapsed-footer' : ''}`}>
          <button 
            className="btn btn-ghost btn-sm btn-icon" 
            onClick={() => navigate('/')} 
            title="View Site"
          >
            <Globe size={16} />
            {!collapsed && "View Site"}
          </button>
          <button 
            className="btn btn-danger btn-sm btn-icon" 
            onClick={handleLogout} 
            title="Logout"
          >
            <LogOut size={16} />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="provider-main">
        <Outlet />
      </main>
    </div>
  );
}
