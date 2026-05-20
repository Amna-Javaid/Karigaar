import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, removeFromCart, clearCart, updateCartItem } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [] }); return; }
    try {
      setLoading(true);
      const { data } = await getCart();
      setCart(data);
    } catch { setCart({ items: [] }); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (serviceId, hours = 1) => {
    const { data } = await addToCart({ serviceId, hours });
    setCart(data);
  };

  const removeItem = async (serviceId) => {
    const { data } = await removeFromCart(serviceId);
    setCart(data);
  };

  const updateHours = async (serviceId, hours) => {
    const { data } = await updateCartItem(serviceId, { hours });
    setCart(data);
  };

  const emptyCart = async () => {
    await clearCart();
    setCart({ items: [] });
  };

  const totalAmount = cart.items.reduce((s, i) => s + i.pricePerHour * i.hours, 0);
  const totalItems  = cart.items.length;

  return (
    <CartContext.Provider value={{ cart, loading, addItem, removeItem, updateHours, emptyCart, totalAmount, totalItems, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
