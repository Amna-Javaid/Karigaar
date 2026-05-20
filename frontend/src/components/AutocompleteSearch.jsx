import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getChatSuggestions } from '../services/api';
import './AutocompleteSearch.css';

const TRENDING_SEARCHES = [
  { label: 'Home Electrician', query: 'Electrician' },
  { label: 'Emergency Plumber', query: 'Plumber' },
  { label: 'AC Technician', query: 'AC Technician' },
  { label: 'Home Tutor', query: 'Tutor' },
  { label: 'Bridal Makeup', query: 'Makeup Artist' },
  { label: 'Sofa Cleaner', query: 'Cleaner' }
];

export default function AutocompleteSearch({ placeholder, initialValue = '', onSearchSubmit }) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Fetch search autocomplete suggestions
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await getChatSuggestions(query);
        setSuggestions(response.data.suggestions || []);
      } catch (err) {
        console.error('Failed to load search autocomplete suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 250); // Debounce API requests by 250ms for performance

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on clicking outside
  useEffect(() => {
    const clickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleKeyDown = (e) => {
    const totalLength = query.trim().length < 2 ? TRENDING_SEARCHES.length : suggestions.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(prev => (prev + 1) % totalLength);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex(prev => (prev - 1 + totalLength) % totalLength);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault();
        if (query.trim().length < 2) {
          handleTrendingClick(TRENDING_SEARCHES[activeIndex]);
        } else {
          handleSuggestionClick(suggestions[activeIndex]);
        }
      } else if (onSearchSubmit) {
        e.preventDefault();
        setIsOpen(false);
        onSearchSubmit(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  const handleTrendingClick = (item) => {
    setQuery(item.label);
    setIsOpen(false);
    setActiveIndex(-1);
    if (onSearchSubmit) {
      onSearchSubmit(item.query);
    } else {
      navigate(`/browse?search=${encodeURIComponent(item.query)}`);
    }
  };

  const handleSuggestionClick = (item) => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (item.type === 'category') {
      navigate(`/browse?category=${encodeURIComponent(item.value)}`);
    } else {
      // Go to details using the slug or fallback to ID
      const link = item.slug ? `/service/${item.slug}` : `/service/${item.id}`;
      navigate(link);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    setActiveIndex(-1);
    if (onSearchSubmit) {
      onSearchSubmit(query);
    } else {
      navigate(`/browse?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="autocomplete-container" ref={containerRef} onKeyDown={handleKeyDown}>
      <form onSubmit={handleSubmit} className="autocomplete-form">
        <input
          type="text"
          className="autocomplete-input"
          placeholder={placeholder || 'Search for services...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <button type="submit" className="btn btn-primary autocomplete-submit">Search</button>
      </form>

      {isOpen && (
        <div className="autocomplete-dropdown">
          {query.trim().length < 2 ? (
            <div className="trending-section">
              <div className="dropdown-header-title">🔥 Popular Searches</div>
              {TRENDING_SEARCHES.map((item, idx) => (
                <div
                  key={idx}
                  className={`dropdown-item-sugg ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => handleTrendingClick(item)}
                >
                  <span className="sugg-icon">🔍</span>
                  <span className="sugg-text">{item.label}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="suggestions-section">
              {loading && <div className="dropdown-loading">Searching suggestions...</div>}
              {!loading && suggestions.length === 0 && (
                <div className="dropdown-no-results">No suggestions found. Press Enter to search.</div>
              )}
              {!loading && suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className={`dropdown-item-sugg ${idx === activeIndex ? 'active' : ''}`}
                  onClick={() => handleSuggestionClick(item)}
                >
                  {item.type === 'category' ? (
                    <>
                      <span className="sugg-icon">📁</span>
                      <div className="sugg-details">
                        <span className="sugg-text font-bold">{item.label}</span>
                        <span className="sugg-sub">Browse entire category</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="sugg-icon">🔧</span>
                      <div className="sugg-details">
                        <span className="sugg-text">{item.label}</span>
                        {item.sub && <span className="sugg-sub">{item.sub}</span>}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
