import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../services/api';
import { Zap, ShoppingCart, ChevronUp, ChevronDown, MapPin, Calendar, Clock, Clock2, User, AlertCircle, CheckCircle, Checkmark, Home, Mail, BookOpen, Wrench } from "../components/Icons";
import toast from 'react-hot-toast';
import './Checkout.css';

const CITIES = ['Lahore','Karachi','Islamabad','Rawalpindi','Faisalabad','Multan','Peshawar'];
const TIME_SLOTS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM','07:00 PM'];

export default function Checkout() {
  const { cart, totalAmount, emptyCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // tomorrow as minimum date
  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const [form, setForm] = useState({
    address: '', city: user?.city || 'Lahore',
    scheduledDate: minDateStr, scheduledTime: '10:00 AM',
    paymentMethod: 'cod', notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm(p => ({...p, [field]: e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.items.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      // Create one booking per cart item
      const bookings = await Promise.all(
        cart.items.map(item =>
          createBooking({
            serviceId: item.service,
            hours: item.hours,
            ...form
          })
        )
      );
      await emptyCart();
      setSuccess(true);
      toast.success('Booking confirmed!');
      setTimeout(() => navigate('/my-bookings'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally { setLoading(false); }
  };

  if (success) return (
    <Layout>
      <div className="container" style={{padding:'80px 24px', textAlign:'center'}}>
        <div style={{fontSize:80, marginBottom:24}}>
          <CheckCircle size={80} color="#10b981" />
        </div>
        <h2 style={{fontSize:32, marginBottom:12}}>Booking Confirmed!</h2>
        <p style={{color:'var(--text-muted)', fontSize:16, marginBottom:32}}>Your Karigaar has been notified. Redirecting to your bookings...</p>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/my-bookings')}>View My Bookings</button>
      </div>
    </Layout>
  );

  if (cart.items.length === 0) return (
    <Layout>
      <div className="empty-state container" style={{padding:'80px 24px'}}>
        <div className="icon"><ShoppingCart size={48} color="#f97316" /></div>
        <h3>Your cart is empty</h3>
        <button className="btn btn-primary" onClick={() => navigate('/browse')}>Browse Services</button>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="page-header"><div className="container"><h1>Checkout</h1><p>Complete your booking details</p></div></div>

      <div className="container checkout-layout">
        {/* ── Form ── */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-section">
            <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <MapPin size={20} color="#f97316" />
              Service Location
            </h3>
            <div className="form-group">
              <label className="form-label">Full Address *</label>
              <input type="text" className="form-input" placeholder="House #, Street, Area"
                value={form.address} onChange={set('address')} required />
            </div>
            <div className="form-group">
              <label className="form-label">City *</label>
              <select className="form-select" value={form.city} onChange={set('city')} required>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="checkout-section">
            <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Calendar size={20} color="#f97316" />
              Schedule
            </h3>
            <div className="checkout-row">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-input"
                  min={minDateStr} value={form.scheduledDate} onChange={set('scheduledDate')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Time Slot *</label>
                <select className="form-select" value={form.scheduledTime} onChange={set('scheduledTime')}>
                  {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShoppingCart size={20} color="#f97316" />
              Payment Method
            </h3>
            <div className="payment-options">
              <label className={`payment-option ${form.paymentMethod==='cod' ? 'active':''}`}>
                <input type="radio" name="payment" value="cod" checked={form.paymentMethod==='cod'} onChange={set('paymentMethod')} />
                <span className="payment-icon"><Zap size={20} color="#10b981" /></span>
                <div>
                  <strong>Cash on Delivery</strong>
                  <p>Pay when service is done</p>
                </div>
              </label>
              <label className={`payment-option ${form.paymentMethod==='card' ? 'active':''}`}>
                <input type="radio" name="payment" value="card" checked={form.paymentMethod==='card'} onChange={set('paymentMethod')} />
                <span className="payment-icon"><ShoppingCart size={20} color="#3b82f6" /></span>
                <div>
                  <strong>Card (Sandbox)</strong>
                  <p>Simulated card payment</p>
                </div>
              </label>
            </div>
            {form.paymentMethod === 'card' && (
              <div className="sandbox-notice">
                <span><AlertCircle size={20} color="#f59e0b" /></span>
                <div>
                  <strong>Sandbox Mode</strong>
                  <p>This is a test payment. Use card: 4242 4242 4242 4242 | Exp: any | CVV: any</p>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-section">
            <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Mail size={20} color="#f97316" />
              Special Instructions (Optional)
            </h3>
            <textarea className="form-textarea" rows={3} placeholder="Any specific requirements or notes for the Karigaar..."
              value={form.notes} onChange={set('notes')} />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-xl" disabled={loading}>
            {loading ? 'Confirming Booking...' : `Confirm Booking · Rs. ${totalAmount.toLocaleString()}`}
          </button>
        </form>

        {/* ── Order Summary ── */}
        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {cart.items.map(item => (
            <div key={item.service} className="co-item">
              <img src={item.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&auto=format'} alt={item.title} />
              <div className="co-item-info">
                <span>{item.title}</span>
                <span className="text-muted text-sm">{item.hours} hour{item.hours>1?'s':''} × Rs. {item.pricePerHour?.toLocaleString()}</span>
              </div>
              <strong>Rs. {(item.pricePerHour * item.hours).toLocaleString()}</strong>
            </div>
          ))}
          <div className="co-total">
            <span>Total Amount</span>
            <strong>Rs. {totalAmount.toLocaleString()}</strong>
          </div>
          <div className="co-info-row"><span><Calendar size={16} color="#f97316" /></span> Date: {form.scheduledDate}</div>
          <div className="co-info-row"><span><Clock size={16} color="#f97316" /></span> Time: {form.scheduledTime}</div>
          <div className="co-info-row"><span><ShoppingCart size={16} color="#f97316" /></span> Payment: {form.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card (Sandbox)'}</div>
        </div>
      </div>
    </Layout>
  );
}
