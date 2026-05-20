import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ServiceCard from '../components/ServiceCard';
import SEO from '../components/SEO';
import AutocompleteSearch from '../components/AutocompleteSearch';
import { getServices } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Browse.css';

const CATEGORIES = ['Electrician','Plumber','Tutor','Mehndi Artist','Makeup Artist','Carpenter','Painter','AC Technician','Cleaner','Driver','Cook','Other'];
const CITIES     = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [loading, setLoading]   = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [searchContext, setSearchContext] = useState(null);
  const { user }                = useAuth();
  const navigate                = useNavigate();

  const category = searchParams.get('category') || '';
  const city     = searchParams.get('city')     || '';
  const search   = searchParams.get('search')   || '';
  const page     = Number(searchParams.get('page')) || 1;

  const fetchServices = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 9 };
    if (category) params.category = category;
    if (city)     params.city     = city;
    if (search)   params.search   = search;
    getServices(params)
      .then(r => { 
        setServices(r.data.services); 
        setTotal(r.data.total); 
        setPages(r.data.pages); 
        setSearchContext(r.data.searchContext);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [category, city, search, page]);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const setPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', p);
    setSearchParams(params);
    window.scrollTo(0, 0);
  };

  const browseTitle = `${category || 'All Services'}${city ? ` in ${city}` : ''} | KarigaarPK`;
  const browseDesc = `Find and book verified ${category || 'home service providers'} ${city ? `in ${city}` : 'across Pakistan'}. Compare prices, ratings, and book online.`;
  const browseKeywords = `${category ? category.toLowerCase() : 'home services'}, ${city ? city.toLowerCase() : 'pakistan'}, local service provider, book karigaar`;
  
  const browseSchema = services.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": services.length,
    "itemListElement": services.map((s, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `${window.location.origin}/service/${s.slug || s._id}`,
      "name": s.title
    }))
  } : null;

  return (
    <Layout>
      <SEO
        title={browseTitle}
        description={browseDesc}
        keywords={browseKeywords}
        schema={browseSchema}
      />
      <div className="browse-page">
        {/* ── Header ── */}
        <div className="browse-header">
          <div className="container">
            <h1>Browse Services</h1>
            <p>{total} services available{category ? ` in ${category}` : ''}{city ? ` · ${city}` : ''}</p>
          </div>
        </div>

        <div className="container browse-layout">
          {/* ── Sidebar Filters ── */}
          <aside className="browse-sidebar">
            <div className="filter-section">
              <h4>Search</h4>
              <AutocompleteSearch
                initialValue={search}
                placeholder="Keyword..."
                onSearchSubmit={(val) => setParam('search', val.trim())}
              />
            </div>

            <div className="filter-section">
              <h4>Category</h4>
              <div className="filter-list">
                <button className={`filter-item ${!category ? 'active' : ''}`} onClick={() => setParam('category','')}>All Categories</button>
                {CATEGORIES.map(c => (
                  <button key={c} className={`filter-item ${category===c ? 'active' : ''}`} onClick={() => setParam('category', c)}>{c}</button>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>City</h4>
              <div className="filter-list">
                <button className={`filter-item ${!city ? 'active' : ''}`} onClick={() => setParam('city','')}>All Cities</button>
                {CITIES.map(c => (
                  <button key={c} className={`filter-item ${city===c ? 'active' : ''}`} onClick={() => setParam('city', c)}>{c}</button>
                ))}
              </div>
            </div>

            {(category || city || search) && (
              <button className="btn btn-outline btn-sm btn-full" onClick={() => setSearchParams({})}>✕ Clear Filters</button>
            )}
          </aside>

          {/* ── Results ── */}
          <div className="browse-results">
            {/* Active filters */}
            {(category || city || search) && (
              <div className="active-filters" style={{ marginBottom: '16px' }}>
                {category && <span className="filter-tag">{category} <button onClick={() => setParam('category','')}>×</button></span>}
                {city     && <span className="filter-tag">{city}     <button onClick={() => setParam('city','')}>×</button></span>}
                {search   && <span className="filter-tag">"{search}"  <button onClick={() => setParam('search','')}>×</button></span>}
              </div>
            )}

            {/* Smart Search Recommendations Widget */}
            {!loading && searchContext && (
              <div className="search-recommendations-widget">
                <div className="widget-row">
                  {/* Pricing Recommendation */}
                  {searchContext.priceRange && (
                    <div className="rec-card pricing-card">
                      <span className="rec-title">💰 Price Range Suggestion</span>
                      <div className="price-meter-info">
                        <span className="price-val">Rs. {searchContext.priceRange.min?.toLocaleString()} - {searchContext.priceRange.max?.toLocaleString()}</span>
                        <span className="price-avg">Avg: Rs. {searchContext.priceRange.avg?.toLocaleString()}/hr</span>
                      </div>
                      <div className="price-meter-bar">
                        <div className="price-meter-fill" style={{ left: '15%', width: '70%' }} />
                      </div>
                    </div>
                  )}

                  {/* Related category suggest */}
                  {searchContext.suggestedCategories && searchContext.suggestedCategories.length > 0 && (
                    <div className="rec-card categories-card">
                      <span className="rec-title">📂 Suggested Categories</span>
                      <div className="rec-badges">
                        {searchContext.suggestedCategories.map(cat => (
                          <button
                            key={cat}
                            className={`rec-badge ${category === cat ? 'active' : ''}`}
                            onClick={() => setParam('category', cat)}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Related Search Terms */}
                {searchContext.relatedKeywords && searchContext.relatedKeywords.length > 0 && (
                  <div className="rec-card related-keywords-card">
                    <span className="rec-title">🔍 Frequently Searched Terms</span>
                    <div className="rec-keywords">
                      {searchContext.relatedKeywords.map((kw, i) => (
                        <button
                          key={i}
                          className="keyword-tag"
                          onClick={() => {
                            const cleanKw = kw.replace(/\b(in|near)\b.*$/gi, '').trim();
                            setParam('search', cleanKw);
                          }}
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highly Rated Nearby Providers */}
                {searchContext.popularOrNearby && searchContext.popularOrNearby.length > 0 && (
                  <div className="rec-card providers-card">
                    <span className="rec-title">⭐ Recommended Providers ({city || 'Nearby'})</span>
                    <div className="rec-providers-list">
                      {searchContext.popularOrNearby.map((p, i) => (
                        <div key={i} className="mini-provider-card" onClick={() => navigate(p.slug ? `/service/${p.slug}` : `/service/${p._id}`)}>
                          <img src={p.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=80&auto=format'} alt={p.title} className="mini-provider-img" />
                          <div className="mini-provider-info">
                            <span className="mini-title">{p.title}</span>
                            <span className="mini-meta">{p.providerName} · {p.city} · Rs. {p.pricePerHour?.toLocaleString()}/hr</span>
                          </div>
                          <div className="mini-rating">★ {Number(p.rating || 0).toFixed(1)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : services.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🔍</div>
                <h3>No services found</h3>
                <p>Try different filters or search terms</p>
                <button className="btn btn-primary" onClick={() => setSearchParams({})}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="browse-grid">
                  {services.map(s => (
                    <ServiceCard
                      key={s._id} service={s}
                      wishlistIds={wishlist}
                      onWishlistToggle={id => setWishlist(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id])}
                    />
                  ))}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button className="btn btn-outline btn-sm" disabled={page===1} onClick={() => setPage(page-1)}>← Prev</button>
                    <span className="page-info">Page {page} of {pages}</span>
                    <button className="btn btn-outline btn-sm" disabled={page===pages} onClick={() => setPage(page+1)}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
