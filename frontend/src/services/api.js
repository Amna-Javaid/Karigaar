import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('karigaar_user') || 'null');
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

// ── Auth / Users ─────────────────────────────────────────────
export const registerUser     = (data) => api.post('/users/register', data);
export const loginUser        = (data) => api.post('/users/login', data);
export const getProfile       = ()     => api.get('/users/profile');
export const updateProfile    = (data) => api.put('/users/profile', data);
export const toggleWishlist   = (id)   => api.post(`/users/wishlist/${id}`);
export const getAllUsers       = ()     => api.get('/users');
export const deleteUser       = (id)   => api.delete(`/users/${id}`);
export const verifyProvider   = (id)   => api.put(`/users/${id}/verify`);

// ── Services ─────────────────────────────────────────────────
export const getServices        = (p)      => api.get('/services', { params: p });
export const getServiceById     = (id)     => api.get(`/services/${id}`);
export const getAdminServices   = ()       => api.get('/services/admin/all');
export const getMyServices      = ()       => api.get('/services/my');        // provider
export const createService      = (data)   => api.post('/services', data);
export const updateService      = (id, d)  => api.put(`/services/${id}`, d);
export const deleteService      = (id)     => api.delete(`/services/${id}`);
export const addReview          = (id, d)  => api.post(`/services/${id}/review`, d);

// ── Cart ─────────────────────────────────────────────────────
export const getCart          = ()         => api.get('/cart');
export const addToCart        = (data)     => api.post('/cart', data);
export const updateCartItem   = (svcId, d) => api.put(`/cart/${svcId}`, d);
export const removeFromCart   = (svcId)    => api.delete(`/cart/${svcId}`);
export const clearCart        = ()         => api.delete('/cart/clear');

// ── Bookings ─────────────────────────────────────────────────
export const createBooking        = (data) => api.post('/bookings', data);
export const getMyBookings        = ()     => api.get('/bookings/my');
export const getProviderBookings  = ()     => api.get('/bookings/provider');
export const getProviderStats     = ()     => api.get('/bookings/provider/stats');
export const getBookingById       = (id)   => api.get(`/bookings/${id}`);
export const getAllBookings        = ()     => api.get('/bookings');
export const updateBookingStatus  = (id,d) => api.put(`/bookings/${id}/status`, d);
export const cancelBooking        = (id)   => api.put(`/bookings/${id}/cancel`);

// ── Admin Stats ──────────────────────────────────────────────
export const getAdminStats = () => api.get('/admin/stats');
export const getBookingAnalytics = (params) => api.get('/admin/analytics/bookings', { params });
export const getTrendingServicesAnalytics = () => api.get('/admin/analytics/trending');
export const getTrendingSoonAnalytics = () => api.get('/admin/analytics/trending-soon');
export const getCancellationsAnalytics = () => api.get('/admin/analytics/cancellations');
export const getProviderAlertsAnalytics = (params) => api.get('/admin/analytics/provider-alerts', { params });
export const getSeasonalDemandAnalytics = () => api.get('/admin/analytics/seasonal');
export const getTrafficIntelligenceAnalytics = () => api.get('/admin/analytics/traffic');
export const getProviderPerformanceAnalytics = () => api.get('/admin/analytics/providers');
export const getUserBehaviorAnalytics = () => api.get('/admin/analytics/users');
export const generateDashboardInsight = (data) => api.post('/admin/analytics/ai-dashboard-insight', data);

export default api;

// ── Chatbot ───────────────────────────────────────────────────
export const sendChatMessage  = (data) => api.post("/chatbot/message", data);
export const getChatSuggestions = (q)  => api.get("/chatbot/autocomplete", { params: { q } });

