import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getBookingById } from '../services/api';
import { Zap, ShoppingCart, ChevronUp, ChevronDown, MapPin, Calendar, Clock, Clock2, User, AlertCircle, CheckCircle, Checkmark, Home, Mail, BookOpen, Wrench } from '../components/Icons';
import toast from 'react-hot-toast';
import './BookingDetail.css';

const STATUS_STYLE = {
  pending:      { color: '#f59e0b', label: 'Pending'      },
  confirmed:    { color: '#3b82f6', label: 'Confirmed'    },
  'in-progress':{ color: '#8b5cf6', label: 'In Progress'  },
  completed:    { color: '#10b981', label: 'Completed'    },
  cancelled:    { color: '#ef4444', label: 'Cancelled'    },
};

export default function BookingDetail() {
  const { id }  = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId;

    const fetchBooking = (showLoading = false) => {
      if (showLoading) setLoading(true);
      getBookingById(id)
        .then(r => {
          setBooking(r.data);
          if (r.data.status === 'completed' || r.data.status === 'cancelled') {
            clearInterval(intervalId);
          }
        })
        .catch(() => { 
          toast.error('Booking not found'); 
          navigate('/my-bookings'); 
          clearInterval(intervalId);
        })
        .finally(() => {
          if (showLoading) setLoading(false);
        });
    };

    fetchBooking(true);

    intervalId = setInterval(() => {
      fetchBooking(false);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [id, navigate]);

  if (loading) return <Layout><div className="spinner-wrap"><div className="spinner" /></div></Layout>;
  if (!booking) return null;

  const s = STATUS_STYLE[booking.status] || STATUS_STYLE.pending;

  return (
    <Layout>
      <div className="page-header">
        <div className="container flex-between">
          <div>
            <h1>Booking Details</h1>
            <p>ID: #{booking._id?.slice(-8).toUpperCase()}</p>
          </div>
          <span className="bd-status-badge" style={{ background: s.color }}>
            {s.label}
          </span>
        </div>
      </div>

      <div className="container bd-layout">
        {/* ── Tracking Timeline ── */}
        <div className="bd-card">
          <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <MapPin size={20} color="#f97316" />
            Live Tracking
          </h3>
          <div className="tracking-timeline">
            {booking.trackingSteps?.map((step, i) => (
              <div key={i} className={`tracking-step ${step.done ? 'done' : ''} ${booking.status === 'cancelled' ? 'cancelled' : ''}`}>
                <div className="tracking-dot">
                  {step.done ? <Checkmark size={16} color="white" /> : <span>{i + 1}</span>}
                </div>
                {i < booking.trackingSteps.length - 1 && (
                  <div className={`tracking-line ${booking.trackingSteps[i + 1]?.done ? 'done' : ''}`} />
                )}
                <div className="tracking-info">
                  <strong>{step.step}</strong>
                  {step.done && step.completedAt && (
                    <span>{new Date(step.completedAt).toLocaleString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {booking.status === 'cancelled' && (
            <div className="alert alert-error" style={{ marginTop: 16 }}>This booking was cancelled.</div>
          )}
        </div>

        {/* ── Service Info ── */}
        <div className="bd-card">
          <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Wrench size={20} color="#f97316" />
            Service Details
          </h3>
          <div className="bd-service">
            <img
              src={booking.serviceImage || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format'}
              alt={booking.serviceTitle}
            />
            <div>
              <span className="booking-cat">{booking.serviceCategory}</span>
              <h4>{booking.serviceTitle}</h4>
              <p>Provider: <strong>{booking.providerName}</strong></p>
            </div>
          </div>

          <div className="bd-details-grid">
            <div className="bd-detail-item"><span style={{ display: 'flex', gap: '4px' }}><Calendar size={16} color="#f97316" /> Date</span><strong>{new Date(booking.scheduledDate).toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
            <div className="bd-detail-item"><span style={{ display: 'flex', gap: '4px' }}><Clock size={16} color="#f97316" /> Time</span><strong>{booking.scheduledTime}</strong></div>
            <div className="bd-detail-item"><span style={{ display: 'flex', gap: '4px' }}><Clock2 size={16} color="#f97316" /> Duration</span><strong>{booking.hours} hour{booking.hours > 1 ? 's' : ''}</strong></div>
            <div className="bd-detail-item"><span style={{ display: 'flex', gap: '4px' }}><MapPin size={16} color="#f97316" /> City</span><strong>{booking.city}</strong></div>
            <div className="bd-detail-item"><span style={{ display: 'flex', gap: '4px' }}><Home size={16} color="#f97316" /> Address</span><strong>{booking.address}</strong></div>
            <div className="bd-detail-item"><span style={{ display: 'flex', gap: '4px' }}><ShoppingCart size={16} color="#f97316" /> Payment</span><strong>{booking.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card'}</strong></div>
            {booking.notes && (
              <div className="bd-detail-item" style={{ gridColumn: '1/-1' }}><span style={{ display: 'flex', gap: '4px' }}><Mail size={16} color="#f97316" /> Notes</span><strong>{booking.notes}</strong></div>
            )}
          </div>
        </div>

        {/* ── Price Summary ── */}
        <div className="bd-card">
          <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ShoppingCart size={20} color="#f97316" />
            Payment Summary
          </h3>
          <div className="bd-price-rows">
            <div className="bd-price-row"><span>Rate per hour</span><span>Rs. {booking.pricePerHour?.toLocaleString()}</span></div>
            <div className="bd-price-row"><span>Hours booked</span><span>{booking.hours} hr{booking.hours > 1 ? 's' : ''}</span></div>
            <div className="bd-price-row bd-price-total"><span>Total Amount</span><strong>Rs. {booking.totalAmount?.toLocaleString()}</strong></div>
            <div className="bd-price-row"><span>Payment Status</span>
              <span style={{ color: booking.paymentStatus === 'paid' ? 'var(--accent)' : 'var(--warning)', fontWeight: 700, display: 'flex', gap: '6px', alignItems: 'center' }}>
                {booking.paymentStatus === 'paid' ? <><CheckCircle size={14} /> Paid</> : <><Clock size={14} /> Unpaid</>}
              </span>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: '1/-1' }}>
          <button className="btn btn-outline" onClick={() => navigate('/my-bookings')}>← Back to My Bookings</button>
        </div>
      </div>
    </Layout>
  );
}
