import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import ServiceCard from '../components/ServiceCard';
import CategoryIcon from '../components/CategoryIcon';
import SEO from '../components/SEO';
import AutocompleteSearch from '../components/AutocompleteSearch';
import { getServices } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const CATEGORIES = [
  { name: 'Electrician', color: '#f59e0b' },
  { name: 'Plumber', color: '#3b82f6' },
  { name: 'Tutor', color: '#10b981' },
  { name: 'Mehndi Artist', color: '#ec4899' },
  { name: 'Makeup Artist', color: '#a855f7' },
  { name: 'Carpenter', color: '#f97316' },
  { name: 'AC Technician', color: '#06b6d4' },
  { name: 'Cleaner', color: '#14b8a6' },
  { name: 'Painter', color: '#6366f1' },
  { name: 'Cook', color: '#eab308' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: 'search', title: 'Browse Services', desc: 'Search by category, city, or keyword to find the right professional for your need.' },
  { step: '02', icon: 'calendar', title: 'Book a Time Slot', desc: 'Pick your date, time, and address. Add the service to your cart and checkout.' },
  { step: '03', icon: 'check', title: 'Get It Done', desc: 'Your Karigaar arrives on time, completes the job, and you rate the experience.' },
];

const STEP_ICONS = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M16 3v4M8 3v4M3 11h18" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 13 4 4 10-10" />
    </svg>
  ),
};

export default function Home() {
  const [featured, setFeatured]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [wishlist, setWishlist]   = useState([]);
  const { user }                  = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();

  useEffect(() => {
    getServices({ featured: 'true', limit: 6 })
      .then(r => setFeatured(r.data.services))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const scrollTarget = params.get('scrollTo');
    if (scrollTarget) {
      const timer = setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "KarigaarPK",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${window.location.origin}/browse?search={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Layout>
      <SEO
        title="KarigaarPK — Pakistan's #1 Local Service Hub"
        description="Hire verified electricians, plumbers, tutors, mehndi artists, makeup artists, cleaners, and AC technicians at your doorstep in Lahore, Karachi, Islamabad."
        keywords="home services, electrician Lahore, plumber Karachi, tutor Islamabad, mehndi artist, AC repair, verified service providers"
        schema={homeSchema}
      />
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-badge">Pakistan's #1 Local Service Hub</div>
          <h1 className="hero-title">
            Find Trusted<br />
            <span className="hero-accent">Karigaars</span> Near You
          </h1>
          <p className="hero-subtitle">
            Hire verified electricians, plumbers, tutors, mehndi artists, makeup artists and more — right at your doorstep.
          </p>
          <div className="hero-search-wrapper" style={{ width: '100%', maxWidth: '600px', margin: '0 auto 24px auto' }}>
            <AutocompleteSearch 
              placeholder="Search for electrician, plumber, tutor..." 
              onSearchSubmit={(q) => navigate(`/browse?search=${encodeURIComponent(q.trim())}`)}
            />
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>500+</strong><span>Verified Karigaars</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>7</strong><span>Major Cities</span></div>
            <div className="stat-divider" />
            <div className="stat"><strong>10k+</strong><span>Happy Customers</span></div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section id="categories" className="section-sm">
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Choose from 10+ service categories across Pakistan</p>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                className="category-card"
                style={{ 
                  '--cat-color': cat.color,
                  '--cat-bg': `${cat.color}12`,
                  '--cat-shadow': `0 20px 40px ${cat.color}25`
                }}
                onClick={() => navigate(`/browse?category=${encodeURIComponent(cat.name)}`)}
              >
                <span className="cat-icon"><CategoryIcon category={cat.name} /></span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-indicator">Browse →</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Services ── */}
      <section id="featured" className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-header flex-between">
            <div>
              <h2 className="section-title">Featured Services</h2>
              <p className="section-subtitle">Top-rated professionals across Pakistan</p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/browse')}>View All →</button>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : (
            <div className="grid-3">
              {featured.map(s => (
                <ServiceCard
                  key={s._id}
                  service={s}
                  wishlistIds={wishlist}
                  onWishlistToggle={id => setWishlist(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="section how-section">
        <div className="container">
          <div className="section-header center">
            <h2 className="section-title">How KarigaarPK Works</h2>
            <p className="section-subtitle">Book any home service in 3 simple steps</p>
          </div>
          <div className="how-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="how-card">
                <div className="how-step-num">{step.step}</div>
                <div className="how-icon">{STEP_ICONS[step.icon]}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      {!user && (
        <section className="cta-section">
          <div className="container cta-content">
            <div>
              <h2>Ready to book your first service?</h2>
              <p>Join thousands of happy customers across Pakistan</p>
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>Get Started Free</button>
              <button className="btn btn-outline btn-lg" style={{borderColor:'white',color:'white'}} onClick={() => navigate('/browse')}>Browse Services</button>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
