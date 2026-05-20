import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { Zap, ShoppingCart, ChevronUp, ChevronDown } from './Icons';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin, isProvider } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setDropOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const close = () => { setMenuOpen(false); setDropOpen(false); };

  // Dashboard link depends on role
  const dashboardLink = isAdmin ? '/admin' : isProvider ? '/provider' : null;

  return (
    <nav className="navbar">
      <div className="container flex-between" style={{ height: '100%' }}>
        <Link to="/" className="navbar-logo">
          <Zap size={24} color="#f97316" />
          <span className="logo-text">Karigaar<span className="logo-pk">PK</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/"       className={`nav-link ${isActive('/')}`}       onClick={close}>Home</Link>
          <Link to="/?scrollTo=categories" className="nav-link" onClick={(e) => { if (location.pathname === '/') { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); } close(); }}>Categories</Link>
          <Link to="/?scrollTo=featured" className="nav-link" onClick={(e) => { if (location.pathname === '/') { e.preventDefault(); document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' }); } close(); }}>Featured</Link>
          <Link to="/?scrollTo=how-it-works" className="nav-link" onClick={(e) => { if (location.pathname === '/') { e.preventDefault(); document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }); } close(); }}>How It Works</Link>
          <Link to="/browse" className={`nav-link ${isActive('/browse')}`} onClick={close}>Browse Services</Link>
        </div>

        <div className="navbar-actions">
          {/* Cart — only for regular users */}
          {user && !isAdmin && !isProvider && (
            <Link to="/cart" className="cart-btn" title="Cart">
              <ShoppingCart size={20} color="#f97316" />
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>
          )}

          {user ? (
            <div className="user-drop">
              <button className="user-avatar-btn" onClick={() => setDropOpen(!dropOpen)}>
                <span className="avatar-circle">{user.name?.[0]?.toUpperCase()}</span>
                <span className="user-name hide-mobile">{user.name.split(' ')[0]}</span>
                {dropOpen ? <ChevronUp size={16} color="#f97316" /> : <ChevronDown size={16} color="#f97316" />}
              </button>

              {dropOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                    <span className="role-pill">{user.role === 'admin' ? 'Admin' : user.role === 'provider' ? 'Provider' : 'Customer'}</span>
                  </div>
                  <div className="dropdown-divider" />

                  {/* Role-specific menu */}
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item" onClick={close}>Admin Dashboard</Link>
                  )}
                  {isProvider && (
                    <>
                      <Link to="/provider"          className="dropdown-item" onClick={close}>Provider Dashboard</Link>
                      <Link to="/provider/services" className="dropdown-item" onClick={close}>My Services</Link>
                      <Link to="/provider/bookings" className="dropdown-item" onClick={close}>My Bookings</Link>
                      <Link to="/provider/profile"  className="dropdown-item" onClick={close}>My Profile</Link>
                    </>
                  )}
                  {!isAdmin && !isProvider && (
                    <>
                      <Link to="/profile"     className="dropdown-item" onClick={close}>My Profile</Link>
                      <Link to="/my-bookings" className="dropdown-item" onClick={close}>My Bookings</Link>
                      <Link to="/wishlist"    className="dropdown-item" onClick={close}>Wishlist</Link>
                    </>
                  )}

                  <div className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login"    className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
