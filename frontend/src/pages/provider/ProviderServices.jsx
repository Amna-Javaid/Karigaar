import { useState, useEffect } from 'react';
import { getMyServices, createService, updateService, deleteService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Wrench } from '../../components/Icons';
import AIContentGenerator from '../../components/AIContentGenerator';
import toast from 'react-hot-toast';
import './Provider.css';

const CATEGORIES = ['Electrician','Plumber','Tutor','Mehndi Artist','Makeup Artist','Carpenter','Painter','AC Technician','Cleaner','Driver','Cook','Other'];
const CITIES     = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'];

const EMPTY = {
  title: '', category: 'Electrician', description: '',
  pricePerHour: '', providerName: '', providerPhone: '',
  city: 'Lahore', image: '', experience: 1, available: true,
  seoTitle: '', seoDescription: '', seoKeywords: ''
};

export default function ProviderServices() {
  const { user }              = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [tab, setTab]           = useState('details');
  const [saving, setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    getMyServices()
      .then(r => setServices(r.data))
      .catch(() => toast.error('Could not load services'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY, providerName: user?.businessName || user?.name, providerPhone: user?.phone || '', city: user?.city || 'Lahore', category: user?.businessCategory || 'Electrician' });
    setEditing(null); setTab('details'); setModal(true);
  };
  const openEdit = (s) => { setForm({ ...EMPTY, ...s }); setEditing(s._id); setTab('details'); setModal(true); };
  const set = (f) => (e) => { const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm(p => ({ ...p, [f]: val })); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, pricePerHour: Number(form.pricePerHour), experience: Number(form.experience) };
      if (editing) { await updateService(editing, payload); toast.success('Service updated!'); }
      else         { await createService(payload);          toast.success('Service created!'); }
      setModal(false); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await deleteService(id); toast.success('Deleted'); load(); }
    catch { toast.error('Could not delete'); }
  };

  return (
    <div>
      <div className="provider-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>My Services</h1><p>Manage the services you offer to customers</p></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Service</button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : services.length === 0 ? (
        <div className="provider-card">
          <div className="provider-empty">
            <div className="icon"><Wrench size={40} color="var(--text-light)" /></div>
            <h3>No services yet</h3>
            <p style={{ marginBottom: 20 }}>Add your first service to start receiving bookings from customers.</p>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Your First Service</button>
          </div>
        </div>
      ) : (
        <div className="provider-card">
          <div className="provider-card-header"><h3>All Services ({services.length})</h3></div>
          <table className="provider-table">
            <thead><tr><th>Service</th><th>Category</th><th>Price/hr</th><th>City</th><th>Bookings</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {services.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img src={s.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=60&auto=format'} alt="" style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover' }} />
                      <strong style={{ fontSize: 14 }}>{s.title}</strong>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{s.category}</span></td>
                  <td style={{ fontWeight: 700 }}>Rs. {s.pricePerHour?.toLocaleString()}</td>
                  <td>{s.city}</td>
                  <td>{s.totalBookings}</td>
                  <td><span className={`badge ${s.available ? 'badge-success' : 'badge-danger'}`}>{s.available ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm"  onClick={() => handleDelete(s._id, s.title)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 24px' }}>
              {['details', 'seo'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '12px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t ? 'var(--primary)' : 'transparent'}`, color: tab === t ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  {t === 'details' ? 'Service Details' : 'SEO & Meta'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <AIContentGenerator onGenerateSuccess={(data) => {
                  setForm(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    description: data.longDescription || data.shortDescription || prev.description,
                    seoTitle: data.metaTitle || prev.seoTitle,
                    seoDescription: data.metaDescription || prev.seoDescription,
                    seoKeywords: Array.isArray(data.seoKeywords) ? data.seoKeywords.join(', ') : (data.seoKeywords || prev.seoKeywords),
                    pricePerHour: (data.price && !isNaN(parseInt(data.price))) ? parseInt(data.price) : prev.pricePerHour,
                  }));
                }} />
                
                {tab === 'details' ? (
                  <>
                    <div className="form-grid-2">
                      <div className="form-group"><label className="form-label">Title *</label><input className="form-input" value={form.title} onChange={set('title')} required /></div>
                      <div className="form-group"><label className="form-label">Category *</label><select className="form-select" value={form.category} onChange={set('category')}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                    </div>
                    <div className="form-group"><label className="form-label">Description *</label><textarea className="form-textarea" rows={4} value={form.description} onChange={set('description')} required /></div>
                    <div className="form-grid-2">
                      <div className="form-group"><label className="form-label">Price per Hour (Rs.) *</label><input type="number" className="form-input" min="1" value={form.pricePerHour} onChange={set('pricePerHour')} required /></div>
                      <div className="form-group"><label className="form-label">Experience (years)</label><input type="number" className="form-input" min="0" value={form.experience} onChange={set('experience')} /></div>
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group"><label className="form-label">Provider Name *</label><input className="form-input" value={form.providerName} onChange={set('providerName')} required /></div>
                      <div className="form-group"><label className="form-label">Provider Phone</label><input className="form-input" value={form.providerPhone} onChange={set('providerPhone')} /></div>
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group"><label className="form-label">City *</label><select className="form-select" value={form.city} onChange={set('city')}>{CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
                      <div className="form-group"><label className="form-label">Image URL</label><input className="form-input" placeholder="https://..." value={form.image} onChange={set('image')} /></div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.available} onChange={set('available')} /> Service is Active / Available
                    </label>
                  </>
                ) : (
                  <>
                    <div className="alert alert-info">SEO fields help customers find your service on Google.</div>
                    <div className="form-group"><label className="form-label">SEO Title</label><input className="form-input" placeholder="Best Electrician in Lahore | KarigaarPK" value={form.seoTitle} onChange={set('seoTitle')} /></div>
                    <div className="form-group"><label className="form-label">Meta Description</label><textarea className="form-textarea" rows={3} placeholder="Short description for search results..." value={form.seoDescription} onChange={set('seoDescription')} /></div>
                    <div className="form-group"><label className="form-label">Keywords</label><input className="form-input" placeholder="electrician lahore, home electrician" value={form.seoKeywords} onChange={set('seoKeywords')} /></div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
