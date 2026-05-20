import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ServiceCard from '../components/ServiceCard';
import { getProfile } from '../services/api';
import { Star } from '../components/Icons';
import toast from 'react-hot-toast';

export default function Wishlist() {
  const [services, setServices] = useState([]);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading]   = useState(true);
  const navigate                = useNavigate();

  const load = () => {
    setLoading(true);
    getProfile()
      .then(r => {
        const wl = r.data.wishlist || [];
        setServices(wl);
        setWishlistIds(wl.map(s => s._id));
      })
      .catch(() => toast.error('Could not load wishlist'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleToggle = (id) => {
    setWishlistIds(prev => {
      if (prev.includes(id)) {
        setServices(s => s.filter(x => x._id !== id));
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  return (
    <Layout>
      <div className="page-header">
        <div className="container">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={26} color="var(--primary)" fill="var(--primary)" />
            <span>My Wishlist</span>
          </h1>
          <p>{services.length} saved service{services.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px 80px' }}>
        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : services.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><Star size={44} color="var(--text-light)" /></div>
            <h3>Your wishlist is empty</h3>
            <p>Tap the heart icon on any service to save it here</p>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}>Browse Services</button>
          </div>
        ) : (
          <div className="grid-3">
            {services.map(s => (
              <ServiceCard
                key={s._id} service={s}
                wishlistIds={wishlistIds}
                onWishlistToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
