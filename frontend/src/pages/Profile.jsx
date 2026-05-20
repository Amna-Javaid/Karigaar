import { useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import toast from 'react-hot-toast';
import { User, ShieldCheck, LogOut } from '../components/Icons';
import './Profile.css';

const CITIES = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'];

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    city: user?.city || 'Lahore', password: '', confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [tab, setTab]         = useState('profile');

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password && form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, phone: form.phone, city: form.city };
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
    <Layout>
      <div className="page-header">
        <div className="container">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={26} color="var(--primary)" />
            <span>My Profile</span>
          </h1>
          <p>Manage your account information</p>
        </div>
      </div>

      <div className="container profile-layout">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar-big">{user?.name?.[0]?.toUpperCase()}</div>
          <h3>{user?.name}</h3>
          <p className="text-muted text-sm">{user?.email}</p>
          <span className="badge badge-primary" style={{ marginTop: 8 }}>{user?.role}</span>

          <nav className="profile-nav">
            <button className={`profile-nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => setTab('profile')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={15} /> Profile Info
            </button>
            <button className={`profile-nav-item ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={15} /> Change Password
            </button>
          </nav>

          <button className="btn btn-danger btn-sm btn-full" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }} onClick={logout}>
            <LogOut size={14} /> Logout
          </button>
        </aside>

        {/* Form */}
        <div className="profile-form-card">
          {tab === 'profile' ? (
            <>
              <h3>Personal Information</h3>
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" value={form.name} onChange={set('name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                  <span className="text-sm text-muted">Email cannot be changed</span>
                </div>
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
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h3>Change Password</h3>
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-input" placeholder="Repeat new password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
