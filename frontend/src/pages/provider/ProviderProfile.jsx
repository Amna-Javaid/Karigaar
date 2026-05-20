import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../services/api';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, 
  Clock, 
  User, 
  Wrench 
} from '../../components/Icons';
import './Provider.css';

const CITIES      = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'];
const CATEGORIES  = ['Electrician','Plumber','Tutor','Mehndi Artist','Makeup Artist','Carpenter','Painter','AC Technician','Cleaner','Driver','Cook','Other'];

export default function ProviderProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name:             user?.name             || '',
    phone:            user?.phone            || '',
    city:             user?.city             || 'Lahore',
    businessName:     user?.businessName     || '',
    businessCategory: user?.businessCategory || 'Electrician',
    bio:              user?.bio              || '',
    password:         '',
    confirmPassword:  ''
  });
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState('business');

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (form.password && form.password.length < 6) { toast.error('Minimum 6 characters'); return; }
    setLoading(true);
    try {
      const payload = { name: form.name, phone: form.phone, city: form.city, businessName: form.businessName, businessCategory: form.businessCategory, bio: form.bio };
      if (form.password) payload.password = form.password;
      const { data } = await updateProfile(payload);
      updateUser(data);
      toast.success('Profile updated!');
      setForm(p => ({ ...p, password: '', confirmPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="provider-page-header">
        <h1>Provider Profile</h1>
        <p>Manage your business information and account settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sidebar card */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 72, height: 72, background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{user?.businessName || user?.name}</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</p>
          <span className="badge badge-primary">{user?.businessCategory || 'Provider'}</span>
          
          {user?.isVerified ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 13, fontWeight: 700 }}>
              <ShieldCheck size={16} color="#10b981" /> Verified Provider
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#f59e0b', fontSize: 13, fontWeight: 600 }}>
              <Clock size={16} color="#f59e0b" /> Pending Verification
            </span>
          )}
          
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {user?.isVerified ? 'Your account is verified. Your services are visible to customers.' : 'Admin will verify your account shortly. Your services will then be visible to customers.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', marginTop: 8 }}>
            {['business', 'personal', 'password'].map(t => {
              let iconElement;
              if (t === 'business') iconElement = <Wrench size={14} />;
              else if (t === 'personal') iconElement = <User size={14} />;
              else iconElement = <ShieldCheck size={14} />;

              return (
                <button 
                  key={t} 
                  onClick={() => setTab(t)}
                  style={{ 
                    padding: '10px 14px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: tab === t ? 'rgba(249,115,22,.08)' : 'none', 
                    color: tab === t ? 'var(--primary)' : 'var(--text-muted)', 
                    border: 'none', 
                    borderRadius: 'var(--radius-md)', 
                    fontWeight: 600, 
                    fontSize: 13, 
                    cursor: 'pointer', 
                    textAlign: 'left', 
                    textTransform: 'capitalize' 
                  }}
                >
                  {iconElement}
                  <span>{t} info</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: 32 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 800, marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
            {tab === 'business' ? <Wrench size={18} color="var(--primary)" /> : tab === 'personal' ? <User size={18} color="var(--primary)" /> : <ShieldCheck size={18} color="var(--primary)" />}
            {tab === 'business' ? 'Business Information' : tab === 'personal' ? 'Personal Information' : 'Change Password'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 500 }}>
            {tab === 'business' && (
              <>
                <div className="form-group"><label className="form-label">Business / Provider Name</label><input className="form-input" value={form.businessName} onChange={set('businessName')} /></div>
                <div className="form-group"><label className="form-label">Service Category</label><select className="form-select" value={form.businessCategory} onChange={set('businessCategory')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="form-group"><label className="form-label">Bio / About Your Service</label><textarea className="form-textarea" rows={4} placeholder="Describe your experience and what makes you great..." value={form.bio} onChange={set('bio')} /></div>
              </>
            )}
            {tab === 'personal' && (
              <>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={form.name} onChange={set('name')} required /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} /></div>
                <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" placeholder="0300-1234567" value={form.phone} onChange={set('phone')} /></div>
                <div className="form-group"><label className="form-label">City</label><select className="form-select" value={form.city} onChange={set('city')}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
              </>
            )}
            {tab === 'password' && (
              <>
                <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} required /></div>
                <div className="form-group"><label className="form-label">Confirm Password</label><input type="password" className="form-input" placeholder="Repeat new password" value={form.confirmPassword} onChange={set('confirmPassword')} required /></div>
              </>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
