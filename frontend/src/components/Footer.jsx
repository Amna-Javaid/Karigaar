import { Link } from 'react-router-dom';
import { Zap, Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail, Clock } from './Icons';
import './Footer.css';

const CATEGORIES = ['Electrician', 'Plumber', 'Tutor', 'Mehndi Artist', 'Makeup Artist', 'Carpenter', 'AC Technician', 'Cleaner'];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Zap size={28} color="#f97316" />
              <span>Karigaar<span>PK</span></span>
            </div>
            <p>Pakistan's #1 local service hub. Hire verified professionals for any home or personal service need.</p>
            <div className="footer-social">
              <a href="#" className="social-link" title="Facebook"><Facebook size={20} color="#0f172a" /></a>
              <a href="#" className="social-link" title="Instagram"><Instagram size={20} color="#0f172a" /></a>
              <a href="#" className="social-link" title="Twitter"><Twitter size={20} color="#0f172a" /></a>
              <a href="#" className="social-link" title="YouTube"><Youtube size={20} color="#0f172a" /></a>
            </div>
          </div>

          {/* Categories */}
          <div className="footer-col">
            <h4>Service Categories</h4>
            <ul>
              {CATEGORIES.map(c => (
                <li key={c}><Link to={`/browse?category=${c}`}>{c}</Link></li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/browse">Browse Services</Link></li>
              <li><Link to="/register">Become a Member</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/my-bookings">My Bookings</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4>Contact Us</h4>
            <ul className="contact-list">
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <MapPin size={18} color="#f97316" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Lahore, Punjab, Pakistan</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Phone size={18} color="#f97316" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>+92-300-1234567</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Mail size={18} color="#f97316" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>support@karigaarpk.com</span>
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Clock size={18} color="#f97316" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Mon – Sat: 9am – 9pm</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 KarigaarPK. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
// already has import './Footer.css' ? 
