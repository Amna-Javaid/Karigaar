import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Public pages
import Home          from './pages/Home';
import Browse        from './pages/Browse';
import ServiceDetail from './pages/ServiceDetail';
import Login         from './pages/Login';
import Register      from './pages/Register';

// User pages
import Cart          from './pages/Cart';
import Checkout      from './pages/Checkout';
import MyBookings    from './pages/MyBookings';
import BookingDetail from './pages/BookingDetail';
import Wishlist      from './pages/Wishlist';
import Profile       from './pages/Profile';

// Provider pages
import ProviderLayout    from './pages/provider/ProviderLayout';
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderServices  from './pages/provider/ProviderServices';
import ProviderBookings  from './pages/provider/ProviderBookings';
import ProviderProfile   from './pages/provider/ProviderProfile';

// Admin pages
import AdminLayout    from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminServices  from './pages/admin/AdminServices';
import AdminBookings  from './pages/admin/AdminBookings';
import AdminUsers     from './pages/admin/AdminUsers';

// ── Guards ───────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};
const ProviderRoute = ({ children }) => {
  const { user, isProvider } = useAuth();
  if (!user)       return <Navigate to="/login" replace />;
  if (!isProvider) return <Navigate to="/" replace />;
  return children;
};
const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"            element={<Home />} />
      <Route path="/browse"      element={<Browse />} />
      <Route path="/service/:idOrSlug" element={<ServiceDetail />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/register"    element={<Register />} />

      {/* Authenticated user */}
      <Route path="/cart"         element={<PrivateRoute><Cart /></PrivateRoute>} />
      <Route path="/checkout"     element={<PrivateRoute><Checkout /></PrivateRoute>} />
      <Route path="/my-bookings"  element={<PrivateRoute><MyBookings /></PrivateRoute>} />
      <Route path="/booking/:id"  element={<PrivateRoute><BookingDetail /></PrivateRoute>} />
      <Route path="/wishlist"     element={<PrivateRoute><Wishlist /></PrivateRoute>} />
      <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />

      {/* Provider */}
      <Route path="/provider" element={<ProviderRoute><ProviderLayout /></ProviderRoute>}>
        <Route index              element={<ProviderDashboard />} />
        <Route path="services"    element={<ProviderServices />} />
        <Route path="bookings"    element={<ProviderBookings />} />
        <Route path="profile"     element={<ProviderProfile />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index           element={<AdminDashboard />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="users"    element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
