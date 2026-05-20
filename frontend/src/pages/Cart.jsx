import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import './Cart.css';

export default function Cart() {
  const { cart, removeItem, updateHours, totalAmount, loading } = useCart();
  const navigate = useNavigate();

  const handleRemove = async (serviceId, title) => {
    try { await removeItem(serviceId); toast.success(`Removed: ${title}`); }
    catch { toast.error('Could not remove item'); }
  };

  if (loading) return <Layout><div className="spinner-wrap"><div className="spinner"/></div></Layout>;

  return (
    <Layout>
      <div className="page-header"><div className="container"><h1>🛒 Your Cart</h1><p>{cart.items.length} service{cart.items.length !== 1 ? 's' : ''} in cart</p></div></div>

      <div className="container cart-layout">
        {cart.items.length === 0 ? (
          <div className="empty-state" style={{width:'100%'}}>
            <div className="icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Browse services and add them to your cart</p>
            <button className="btn btn-primary" onClick={() => navigate('/browse')}>Browse Services</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map(item => (
                <div key={item.service} className="cart-item">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&auto=format'}
                    alt={item.title} className="cart-item-img"
                  />
                  <div className="cart-item-info">
                    <span className="cart-item-cat">{item.category}</span>
                    <h3>{item.title}</h3>
                    <span className="cart-item-price">Rs. {item.pricePerHour?.toLocaleString()} / hr</span>
                  </div>
                  <div className="cart-item-controls">
                    <label className="form-label" style={{textAlign:'center'}}>Hours</label>
                    <div className="hours-stepper">
                      <button onClick={() => updateHours(item.service, Math.max(1, item.hours - 1))}>−</button>
                      <span>{item.hours}</span>
                      <button onClick={() => updateHours(item.service, item.hours + 1)}>+</button>
                    </div>
                    <span className="cart-item-subtotal">Rs. {(item.pricePerHour * item.hours).toLocaleString()}</span>
                  </div>
                  <button className="cart-remove-btn" onClick={() => handleRemove(item.service, item.title)} title="Remove">✕</button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>
              <div className="summary-rows">
                {cart.items.map(item => (
                  <div key={item.service} className="summary-row">
                    <span>{item.title} × {item.hours}h</span>
                    <span>Rs. {(item.pricePerHour * item.hours).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="summary-total">
                <span>Total</span>
                <strong>Rs. {totalAmount.toLocaleString()}</strong>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>Proceed to Checkout →</button>
              <button className="btn btn-ghost btn-full" onClick={() => navigate('/browse')}>+ Add More Services</button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
