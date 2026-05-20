import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Star, 
  User, 
  Wrench 
} from '../components/Icons';
import './Auth.css';

export default function Login() {
  const { login }    = useAuth();
  const { fetchCart }= useCart();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from || '/';
  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      await fetchCart();
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'admin' ? '/admin' : user.role === 'provider' ? '/provider' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={28} color="var(--primary)" />
            <span>Karigaar<span className="logo-pk" style={{ color: 'var(--primary)' }}>PK</span></span>
          </div>
          <h2>Pakistan's #1 Local Service Hub</h2>
          <p>Book verified professionals for any home service — electricians, plumbers, tutors and more.</p>
          <div className="auth-features">
            <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--accent)" /> 
              <span>500+ Verified Karigaars</span>
            </div>
            <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="var(--accent)" /> 
              <span>7 Major Cities</span>
            </div>
            <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={16} color="var(--accent)" fill="var(--accent)" /> 
              <span>10,000+ Happy Customers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1>Welcome back!</h1>
          <p className="auth-subtitle">Sign in to your KarigaarPK account</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <div className="auth-demo">
            <p className="text-sm text-muted" style={{marginBottom:10}}>Demo accounts:</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="demo-btn" onClick={() => setForm({ email:'admin@karigaarpk.com', password:'admin123' })} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <User size={13} /> Admin
              </button>
              <button className="demo-btn" onClick={() => setForm({ email:'provider@karigaarpk.com', password:'provider123' })} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Wrench size={13} /> Provider
              </button>
              <button className="demo-btn" onClick={() => setForm({ email:'amna@example.com', password:'user123' })} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <User size={13} /> User
              </button>
            </div>
          </div>

          <p className="auth-switch">Don't have an account? <Link to="/register">Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
}
