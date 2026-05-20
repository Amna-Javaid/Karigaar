import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toggleWishlist } from '../services/api';
import toast from 'react-hot-toast';
import CategoryIcon from './CategoryIcon';
import './ServiceCard.css';

const USER_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
  </svg>
);

const LOCATION_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s7-4.35 7-10a7 7 0 0 0-14 0c0 5.65 7 10 7 10Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const HEART_ICON = (filled) => (
  <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-4.5-10-9c-2.1-3 0.5-7 4.5-7 2.1 0 4 1.2 5 3 1-1.8 2.9-3 5-3 4 0 6.6 4 4.5 7-3 4.5-10 9-10 9Z" />
  </svg>
);

export default function ServiceCard({ service, wishlistIds = [], onWishlistToggle }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const isWishlisted = wishlistIds.includes(service._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to save to wishlist'); return; }
    try {
      await toggleWishlist(service._id);
      onWishlistToggle?.(service._id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Something went wrong'); }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login first'); return; }
    try {
      await addItem(service._id, 1);
      toast.success('Added to cart!');
    } catch { toast.error('Could not add to cart'); }
  };

  const stars = '★'.repeat(Math.round(service.rating || 0)) + '☆'.repeat(5 - Math.round(service.rating || 0));

  return (
    <Link to={`/service/${service.slug || service._id}`} className="service-card">
      <div className="sc-image-wrap">
        <img
          src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format'}
          alt={service.title}
          loading="lazy"
        />
        {service.featured && <span className="sc-badge-featured">Featured</span>}
        <button className={`sc-wish-btn ${isWishlisted ? 'active' : ''}`} onClick={handleWishlist} title="Wishlist">
          {HEART_ICON(isWishlisted)}
        </button>
      </div>
      <div className="sc-body">
        <div className="sc-category">
          <CategoryIcon category={service.category} />
          {service.category}
        </div>
        <h3 className="sc-title">{service.title}</h3>
        <div className="sc-meta">
          <span className="sc-provider"><span className="meta-icon">{USER_ICON}</span>{service.providerName}</span>
          <span className="sc-city"><span className="meta-icon">{LOCATION_ICON}</span>{service.city}</span>
        </div>
        <div className="sc-footer">
          <div className="sc-rating">
            <span className="stars" style={{ fontSize: 13 }}>{stars}</span>
            <span className="sc-rating-num">({service.numReviews || 0})</span>
          </div>
          <div className="sc-price">
            <span className="price-amount">Rs. {service.pricePerHour?.toLocaleString()}</span>
            <span className="price-unit">/hr</span>
          </div>
        </div>
        <button className="sc-cart-btn" onClick={handleAddToCart}>+ Add to Cart</button>
      </div>
    </Link>
  );
}
