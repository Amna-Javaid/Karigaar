import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  Zap, 
  ShieldCheck, 
  Globe, 
  Star, 
  BarChart3, 
  Wrench, 
  ClipboardList, 
  DollarSign, 
  User 
} from '../components/Icons';
import './Auth.css';
import './Register.css';

const CITIES      = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'];
const CATEGORIES  = ['Electrician','Plumber','Tutor','Mehndi Artist','Makeup Artist','Carpenter','Painter','AC Technician','Cleaner','Driver','Cook','Other'];

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [roleTab, setRoleTab] = useState('user'); // 'user' | 'provider'
  const [form, setForm]       = useState({ name:'', email:'', password:'', phone:'', city:'Lahore', businessName:'', businessCategory:'Electrician', bio:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setLoading(true);
    try {
      const user = await register({ ...form, role: roleTab });
      toast.success(`Welcome to KarigaarPK, ${user.name.split(' ')[0]}!`);
      navigate(roleTab === 'provider' ? '/provider' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          {roleTab === 'user' ? (
            <>
              <h2>Join as a Customer</h2>
              <p>Create your free account and book trusted professionals near you.</p>
              <div className="auth-features">
                <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="var(--accent)" /> 
                  <span>Safe & Secure Booking</span>
                </div>
                <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={16} color="var(--accent)" /> 
                  <span>Track Your Bookings Live</span>
                </div>
                <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} color="var(--accent)" fill="var(--accent)" /> 
                  <span>Save to Wishlist</span>
                </div>
                <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Star size={16} color="var(--accent)" /> 
                  <span>Rate & Review Services</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2>Join as a Service Provider</h2>
              <p>Register your service and start receiving bookings from thousands of customers.</p>
              <div className="auth-features">
                <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={16} color="var(--accent)" /> 
                  <span>Personal Provider Dashboard</span>
                </div>
                <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={16} color="var(--accent)" /> 
                  <span>Manage Your Services</span>
                </div>
                <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ClipboardList size={16} color="var(--accent)" /> 
                  <span>Track All Your Bookings</span>
                </div>
                <div className="auth-feat" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={16} color="var(--accent)" /> 
                  <span>Grow Your Business</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          {/* Role selector */}
          <div className="register-role-tabs">
            <button className={`role-tab ${roleTab === 'user' ? 'active' : ''}`} onClick={() => setRoleTab('user')}>
              <span className="tab-icon-span"><User size={18} /></span>
              <div><strong>Customer</strong><small>Book services</small></div>
            </button>
            <button className={`role-tab ${roleTab === 'provider' ? 'active' : ''}`} onClick={() => setRoleTab('provider')}>
              <span className="tab-icon-span"><Wrench size={18} /></span>
              <div><strong>Service Provider</strong><small>Offer services</small></div>
            </button>
          </div>

          <h1>Create Account</h1>
          <p className="auth-subtitle">{roleTab === 'user' ? 'Join KarigaarPK as a customer' : 'Register your service business'}</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="Muhammad Ali" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div className="auth-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" placeholder="0300-1234567" value={form.phone} onChange={set('phone')} />
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <select className="form-select" value={form.city} onChange={set('city')}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Extra fields for provider */}
            {roleTab === 'provider' && (
              <>
                <div className="form-group">
                  <label className="form-label">Business / Provider Name</label>
                  <input type="text" className="form-input" placeholder="e.g. Usman Electric Works" value={form.businessName} onChange={set('businessName')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Category</label>
                  <select className="form-select" value={form.businessCategory} onChange={set('businessCategory')}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Short Bio</label>
                  <textarea className="form-textarea" rows={2} placeholder="Briefly describe your experience..." value={form.bio} onChange={set('bio')} />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} required />
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Creating Account...' : roleTab === 'user' ? 'Create Customer Account' : 'Register as Provider'}
            </button>
          </form>

          {roleTab === 'provider' && (
            <div className="provider-note" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p>After registration, an admin will verify your account. Your services will be visible to customers once verified.</p>
            </div>
          )}

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
