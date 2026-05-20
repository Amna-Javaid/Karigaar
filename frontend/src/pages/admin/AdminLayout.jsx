import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Wrench, 
  ClipboardList, 
  Users, 
  Zap, 
  Globe, 
  LogOut, 
  ChevronLeft, 
  ChevronRight 
} from '../../components/Icons';
import './Admin.css';

const NAV = [
  { to: '/admin',          label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/analytics', label: 'Analytics',  icon: TrendingUp },
  { to: '/admin/services', label: 'Services',  icon: Wrench },
  { to: '/admin/bookings', label: 'Bookings',  icon: ClipboardList },
  { to: '/admin/users',    label: 'Users',     icon: Users },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Persist sidebar collapsed preference in localStorage
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="admin-sidebar-header">
          {!collapsed ? (
            <div className="admin-logo">
              <Zap size={22} color="var(--primary)" />
              <span>Karigaar<span className="logo-pk">PK</span></span>
            </div>
          ) : (
            <div className="admin-logo collapsed-logo">
              <Zap size={22} color="var(--primary)" />
            </div>
          )}
          <button className="sidebar-toggle-btn" onClick={toggleCollapse} aria-label="Toggle Sidebar">
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
        
        {!collapsed && <div className="admin-label">Admin Panel</div>}

        <nav className="admin-nav">
          {NAV.map(n => {
            const Icon = n.icon;
            return (
              <NavLink 
                key={n.to} 
                to={n.to} 
                end={n.end}
                className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? n.label : undefined}
              >
                <span className="nav-icon-span"><Icon size={18} /></span> 
                {!collapsed && <span className="nav-label-span">{n.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-user-avatar" title={user?.name}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            {!collapsed && (
              <div>
                <strong>{user?.name}</strong>
                <span>Administrator</span>
              </div>
            )}
          </div>
          
          <div className={`admin-footer-actions ${collapsed ? 'collapsed-actions' : ''}`}>
            <button 
              className="btn btn-ghost btn-sm btn-icon" 
              onClick={() => navigate('/')} 
              title="View Site"
            >
              <Globe size={16} />
              {!collapsed && "Site"}
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
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
