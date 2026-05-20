import { useState, useEffect } from 'react';
import { getAdminServices, createService, updateService, deleteService } from '../../services/api';
import { Star } from '../../components/Icons';
import AIContentGenerator from '../../components/AIContentGenerator';
import toast from 'react-hot-toast';
import './Admin.css';

const CATEGORIES = ['Electrician','Plumber','Tutor','Mehndi Artist','Makeup Artist','Carpenter','Painter','AC Technician','Cleaner','Driver','Cook','Other'];
const CITIES     = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'];

const EMPTY = {
  title:'', category:'Electrician', description:'', pricePerHour:'',
  providerName:'', providerPhone:'', city:'Lahore', image:'',
  experience:1, featured:false, available:true,
  seoTitle:'', seoDescription:'', seoKeywords:''
};

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(false);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY);
  const [tab, setTab]           = useState('details');
  const [saving, setSaving]     = useState(false);
  const [search, setSearch]     = useState('');

  const load = () => {
    setLoading(true);
    getAdminServices()
      .then(r => setServices(r.data))
      .catch(() => toast.error('Could not load services'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY); setEditing(null); setTab('details'); setModal(true); };
  const openEdit   = (s)  => { setForm({ ...EMPTY, ...s }); setEditing(s._id); setTab('details'); setModal(true); };
  const closeModal = ()   => setModal(false);

  const set = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(p => ({ ...p, [f]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, pricePerHour: Number(form.pricePerHour), experience: Number(form.experience) };
      if (editing) {
        await updateService(editing, payload);
        toast.success('Service updated!');
      } else {
        await createService(payload);
        toast.success('Service created!');
      }
      closeModal(); load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await deleteService(id);
      toast.success('Service deleted');
      load();
    } catch { toast.error('Could not delete'); }
  };

  const filtered = services.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Services Management</h1>
          <p>{services.length} total services in the system</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add New Service</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h3>All Services</h3>
          <input className="form-input" style={{ width: 260 }} placeholder="Search services..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Service</th><th>Category</th><th>City</th>
                <th>Price/hr</th><th>Rating</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <img src={s.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=60&auto=format'}
                        alt="" style={{ width:44, height:44, borderRadius:8, objectFit:'cover' }} />
                      <div>
                        <strong style={{ display:'block', fontSize:14 }}>{s.title}</strong>
                        <span style={{ fontSize:12, color:'var(--text-muted)' }}>{s.providerName}</span>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{s.category}</span></td>
                  <td>{s.city}</td>
                  <td style={{ fontWeight:700 }}>Rs. {s.pricePerHour?.toLocaleString()}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      {(s.rating || 0).toFixed(1)} ({s.numReviews})
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.available ? 'badge-success' : 'badge-danger'}`}>
                      {s.available ? 'Active' : 'Inactive'}
                    </span>
                    {s.featured && <span className="badge badge-warning" style={{ marginLeft:4 }}>Featured</span>}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s._id, s.title)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:'40px' }}>No services found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit Service' : 'Add New Service'}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-tabs">
              <button className={`modal-tab ${tab==='details' ? 'active':''}`} onClick={() => setTab('details')}>Service Details</button>
              <button className={`modal-tab ${tab==='seo'     ? 'active':''}`} onClick={() => setTab('seo')}>SEO & Meta</button>
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
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Service Title *</label>
                        <input className="form-input" value={form.title} onChange={set('title')} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Category *</label>
                        <select className="form-select" value={form.category} onChange={set('category')}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description *</label>
                      <textarea className="form-textarea" rows={4} value={form.description} onChange={set('description')} required />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Provider Name *</label>
                        <input className="form-input" value={form.providerName} onChange={set('providerName')} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Provider Phone</label>
                        <input className="form-input" value={form.providerPhone} onChange={set('providerPhone')} />
                      </div>
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">Price per Hour (Rs.) *</label>
                        <input type="number" className="form-input" min="1" value={form.pricePerHour} onChange={set('pricePerHour')} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Experience (years)</label>
                        <input type="number" className="form-input" min="0" value={form.experience} onChange={set('experience')} />
                      </div>
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label">City *</label>
                        <select className="form-select" value={form.city} onChange={set('city')}>
                          {CITIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Image URL</label>
                        <input className="form-input" placeholder="https://..." value={form.image} onChange={set('image')} />
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:24 }}>
                      <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>
                        <input type="checkbox" checked={form.featured} onChange={set('featured')} />
                        Featured Service
                      </label>
                      <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>
                        <input type="checkbox" checked={form.available} onChange={set('available')} />
                        Available / Active
                      </label>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    <div className="alert alert-info">These fields improve how your service appears in Google search results.</div>
                    <div className="form-group">
                      <label className="form-label">SEO Title</label>
                      <input className="form-input" placeholder="Best Electrician in Lahore | KarigaarPK" value={form.seoTitle} onChange={set('seoTitle')} />
                      <span className="text-sm text-muted">{form.seoTitle.length}/60 chars recommended</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Meta Description</label>
                      <textarea className="form-textarea" rows={3} placeholder="Brief description for search engines..." value={form.seoDescription} onChange={set('seoDescription')} />
                      <span className="text-sm text-muted">{form.seoDescription.length}/160 chars recommended</span>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Keywords</label>
                      <input className="form-input" placeholder="electrician lahore, home electrician, wiring repair" value={form.seoKeywords} onChange={set('seoKeywords')} />
                      <span className="text-sm text-muted">Comma-separated keywords</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
