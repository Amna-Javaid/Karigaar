import { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, verifyProvider } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  User, 
  Wrench, 
  ShieldCheck, 
  Users, 
  Clock 
} from '../../components/Icons';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const { user: me }          = useAuth();

  const load = () => {
    setLoading(true);
    getAllUsers()
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Could not load users'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id, name) => {
    if (id === me._id) { toast.error("Can't delete your own account"); return; }
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await deleteUser(id); toast.success('Deleted'); setUsers(p => p.filter(u => u._id !== id)); }
    catch { toast.error('Could not delete'); }
  };

  const handleVerify = async (id, name) => {
    try {
      await verifyProvider(id);
      setUsers(p => p.map(u => u._id === id ? { ...u, isVerified: true } : u));
      toast.success(`${name} verified!`);
    } catch { toast.error('Could not verify'); }
  };

  const filtered = users.filter(u => {
    const matchRole   = filter === 'all' || u.role === filter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = { all: users.length, user: users.filter(u=>u.role==='user').length, provider: users.filter(u=>u.role==='provider').length, admin: users.filter(u=>u.role==='admin').length };

  return (
    <div>
      <div className="admin-page-header">
        <h1>User Management</h1>
        <p>{users.length} registered accounts</p>
      </div>

      <div className="admin-stats" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
        {[
          { label:'Customers',  value: counts.user,     icon: User },
          { label:'Providers',  value: counts.provider, icon: Wrench },
          { label:'Admins',     value: counts.admin,    icon: ShieldCheck },
          { label:'Total',      value: counts.all,      icon: Users },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div><div className="stat-card-label">{s.label}</div><div className="stat-card-value" style={{fontSize:26}}>{s.value}</div></div>
              <div className="stat-card-icon-modern">
                <Icon size={24} color="var(--primary)" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="admin-card">
        <div className="admin-card-header" style={{ flexWrap:'wrap', gap:12 }}>
          <h3>All Users</h3>
          <div style={{ display:'flex', gap:10 }}>
            <input className="form-input" style={{ width:220 }} placeholder="Search name or email..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" style={{ width:150 }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Roles</option>
              <option value="user">Customers</option>
              <option value="provider">Providers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        {loading ? <div className="spinner-wrap"><div className="spinner"/></div> : (
          <table className="admin-table">
            <thead>
              <tr><th>User</th><th>Phone</th><th>City</th><th>Role</th><th>Business</th><th>Verified</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, background: u.role==='admin'?'var(--secondary)':u.role==='provider'?'#8b5cf6':'var(--primary)', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14, flexShrink:0 }}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <strong style={{ fontSize:13 }}>{u.name}{u._id===me._id&&<span style={{color:'var(--primary)',fontSize:11}}> (You)</span>}</strong>
                        <div style={{ fontSize:12, color:'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:13 }}>{u.phone||'—'}</td>
                  <td style={{ fontSize:13 }}>{u.city||'—'}</td>
                  <td>
                    <span className={`badge ${u.role==='admin'?'badge-neutral':u.role==='provider'?'badge-warning':'badge-primary'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textTransform:'capitalize' }}>
                      {u.role === 'admin' ? (
                        <>
                          <ShieldCheck size={12} /> Admin
                        </>
                      ) : u.role === 'provider' ? (
                        <>
                          <Wrench size={12} /> Provider
                        </>
                      ) : (
                        <>
                          <User size={12} /> Customer
                        </>
                      )}
                    </span>
                  </td>
                  <td style={{ fontSize:13 }}>{u.businessName||'—'}<br/><span style={{fontSize:11,color:'var(--text-muted)'}}>{u.businessCategory||''}</span></td>
                  <td>
                    {u.role==='provider'
                      ? u.isVerified ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <ShieldCheck size={11} color="var(--accent)" /> Verified
                        </span>
                      ) : (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} color="var(--warning)" /> Pending
                        </span>
                      )
                      : <span style={{color:'var(--text-muted)',fontSize:12}}>—</span>}
                  </td>
                  <td style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      {u.role==='provider' && !u.isVerified && (
                        <button className="btn btn-success btn-sm" onClick={() => handleVerify(u._id, u.name)}>Verify</button>
                      )}
                      <button className="btn btn-danger btn-sm" disabled={u._id===me._id} onClick={() => handleDelete(u._id, u.name)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length===0 && <tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-muted)',padding:40}}>No users found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
