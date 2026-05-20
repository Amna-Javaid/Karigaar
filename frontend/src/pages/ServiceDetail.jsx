import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CategoryIcon from '../components/CategoryIcon';
import SEO from '../components/SEO';
import { getServiceById, addReview, toggleWishlist, getServices } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './ServiceDetail.css';

const META_ICONS = {
  location: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-4.35 7-10a7 7 0 0 0-14 0c0 5.65 7 10 7 10Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  provider: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.6 2.7 4 5.3a2 2 0 0 0-.5 2.1c.7 1.8 2.1 4.1 4.6 6.6 2.5 2.5 4.8 3.9 6.6 4.6a2 2 0 0 0 2.1-.5l2.6-2.6a2 2 0 0 0 .4-2.2l-1.7-4a2 2 0 0 0-1.9-1.2l-3.1.3a1 1 0 0 1-.8-.3L9.5 4.6a1 1 0 0 1-.3-.8l.3-3.1a2 2 0 0 0-1.2-1.9l-4-.8a2 2 0 0 0-2.2.4Z" />
    </svg>
  ),
  experience: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6 13.5 10H18L14 12.5 15.5 16 12 13.5 8.5 16 10 12.5 6 10h4.5L12 6Z" />
    </svg>
  ),
};

export default function ServiceDetail() {
  const { idOrSlug }        = useParams();
  const navigate            = useNavigate();
  const { user }            = useAuth();
  const { addItem }         = useCart();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState(false);
  const [hours, setHours]   = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [relatedServices, setRelatedServices] = useState([]);

  useEffect(() => {
    setLoading(true);
    getServiceById(idOrSlug)
      .then(r => setService(r.data))
      .catch(() => toast.error('Service not found'))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  useEffect(() => {
    if (service) {
      getServices({ category: service.category, city: service.city, limit: 4 })
        .then(r => {
          setRelatedServices(r.data.services.filter(s => s._id !== service._id).slice(0, 3));
        })
        .catch(() => {});
    }
  }, [service]);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    try { await addItem(service._id, hours); toast.success('Added to cart!'); }
    catch { toast.error('Could not add to cart'); }
  };

  const handleBookNow = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    try { await addItem(service._id, hours); navigate('/checkout'); }
    catch { toast.error('Could not proceed'); }
  };

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      const { data } = await toggleWishlist(service._id);
      setWishlisted(data.added);
      toast.success(data.added ? 'Added to wishlist' : 'Removed from wishlist');
    } catch { toast.error('Something went wrong'); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Login to review'); return; }
    setSubmitting(true);
    try {
      await addReview(service._id, review);
      toast.success('Review submitted!');
      const r = await getServiceById(service._id);
      setService(r.data);
      setReview({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally { setSubmitting(false); }
  };

  if (loading) return <Layout><div className="spinner-wrap"><div className="spinner" /></div></Layout>;
  if (!service) return <Layout><div className="empty-state"><h3>Service not found</h3></div></Layout>;

  const fullStars  = Math.round(service.rating || 0);
  const starsStr   = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
  const totalPrice = (service.pricePerHour * hours).toLocaleString();

  const serviceTitle = `${service.title} in ${service.city} | KarigaarPK`;
  const serviceDesc = `${service.description?.substring(0, 150)}... Hire ${service.providerName} starting at Rs. ${service.pricePerHour}/hr in ${service.city}.`;
  const serviceKeywords = `${service.category?.toLowerCase()}, ${service.city?.toLowerCase()}, ${service.providerName?.toLowerCase()}, home services, local professional`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.title,
    "description": service.description,
    "provider": {
      "@type": "LocalBusiness",
      "name": service.providerName,
      "telephone": service.providerPhone,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": service.city,
        "addressCountry": "PK"
      }
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "PKR",
      "price": service.pricePerHour,
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "price": service.pricePerHour,
        "priceCurrency": "PKR",
        "unitText": "hour"
      }
    },
    ...(service.numReviews > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": service.rating,
        "reviewCount": service.numReviews,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {})
  };

  return (
    <Layout>
      <SEO
        title={serviceTitle}
        description={serviceDesc}
        keywords={serviceKeywords}
        schema={serviceSchema}
      />
      <div className="sd-page">
        <div className="container">
          <div className="sd-grid">
            {/* ── Left: image + info ── */}
            <div className="sd-main">
              <div className="sd-image-wrap">
                <img src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format'} alt={service.title} />
                {service.featured && <span className="sd-badge">Featured</span>}
              </div>

              <div className="sd-info">
                <div className="sd-category"><CategoryIcon category={service.category} />{service.category}</div>
                <h1 className="sd-title">{service.title}</h1>

                <div className="sd-meta-row">
                  <span className="sd-meta-item"><span className="meta-icon">{META_ICONS.location}</span>{service.city}</span>
                  <span className="sd-meta-item"><span className="meta-icon">{META_ICONS.provider}</span>{service.providerName}</span>
                  <span className="sd-meta-item"><span className="meta-icon">{META_ICONS.phone}</span>{service.providerPhone}</span>
                  <span className="sd-meta-item"><span className="meta-icon">{META_ICONS.experience}</span>{service.experience} yrs experience</span>
                </div>

                <div className="sd-rating-row">
                  <span className="stars sd-stars">{starsStr}</span>
                  <span className="sd-rating-val">{(service.rating || 0).toFixed(1)}</span>
                  <span className="sd-reviews-count">({service.numReviews} reviews)</span>
                </div>

                <div className="sd-description">
                  <h3>About This Service</h3>
                  <p>{service.description}</p>
                </div>

                {/* Reviews */}
                <div className="sd-reviews">
                  <h3>Customer Reviews</h3>
                  {service.reviews?.length === 0 ? (
                    <p className="text-muted text-sm">No reviews yet. Be the first!</p>
                  ) : (
                    service.reviews?.map((r, i) => (
                      <div key={i} className="review-card">
                        <div className="review-header">
                          <span className="review-avatar">{r.name?.[0]?.toUpperCase()}</span>
                          <div>
                            <strong>{r.name}</strong>
                            <div className="stars" style={{ fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</div>
                          </div>
                          <span className="review-date">{new Date(r.createdAt).toLocaleDateString('en-PK', { year:'numeric', month:'short', day:'numeric' })}</span>
                        </div>
                        <p>{r.comment}</p>
                      </div>
                    ))
                  )}

                  {user && (
                    <form className="review-form" onSubmit={handleReview}>
                      <h4>Leave a Review</h4>
                      <div className="form-group">
                        <label className="form-label">Rating</label>
                        <div className="star-picker">
                          {[1,2,3,4,5].map(n => (
                            <button key={n} type="button"
                              className={`star-btn ${n <= review.rating ? 'active' : ''}`}
                              onClick={() => setReview(p => ({ ...p, rating: n }))}
                            >★</button>
                          ))}
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Comment</label>
                        <textarea className="form-textarea" rows={3}
                          value={review.comment}
                          onChange={e => setReview(p => ({ ...p, comment: e.target.value }))}
                          placeholder="Share your experience..."
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: booking card ── */}
            <div className="sd-sidebar">
              <div className="booking-card">
                <div className="booking-price">
                  <span className="bp-amount">Rs. {service.pricePerHour?.toLocaleString()}</span>
                  <span className="bp-unit">per hour</span>
                </div>

                <div className="form-group" style={{ marginTop: 20 }}>
                  <label className="form-label">Number of Hours</label>
                  <div className="hours-stepper">
                    <button type="button" onClick={() => setHours(h => Math.max(1, h-1))}>−</button>
                    <span>{hours}</span>
                    <button type="button" onClick={() => setHours(h => h+1)}>+</button>
                  </div>
                </div>

                <div className="booking-total">
                  <span>Total</span>
                  <strong>Rs. {totalPrice}</strong>
                </div>

                <div className="booking-actions">
                  <button className="btn btn-primary btn-full btn-lg" onClick={handleBookNow}>Book Now</button>
                  <button className="btn btn-outline btn-full" onClick={handleAddToCart}>Add to Cart</button>
                  <button className={`btn ${wishlisted ? 'btn-danger' : 'btn-ghost'} btn-full`} onClick={handleWishlist}>
                    {wishlisted ? 'Wishlisted' : 'Save to Wishlist'}
                  </button>
                </div>

                <div className="booking-badges">
                  <span>Verified Provider</span>
                  <span>Secure Booking</span>
                  <span>Direct Contact</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related services internal linking */}
          {relatedServices.length > 0 && (
            <div className="sd-related-section" style={{ marginTop: '56px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
              <h2 className="related-title" style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>Other Popular {service.category}s in {service.city}</h2>
              <div className="related-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {relatedServices.map(s => (
                  <ServiceCard
                    key={s._id}
                    service={s}
                    wishlistIds={[]}
                    onWishlistToggle={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
