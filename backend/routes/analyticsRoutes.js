const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getBookingAnalytics,
  getTrendingServices,
  getTrendingSoon,
  getCancellations,
  getProviderAlerts,
  getSeasonalDemand,
  getTrafficIntelligence,
  getProviderPerformance,
  getUserBehavior,
  generateDashboardInsight
} = require('../controllers/analyticsController');

// All analytics routes are protected for admin only
router.use(protect, adminOnly);

router.get('/bookings', getBookingAnalytics);
router.get('/trending', getTrendingServices);
router.get('/trending-soon', getTrendingSoon);
router.get('/cancellations', getCancellations);
router.get('/provider-alerts', getProviderAlerts);
router.get('/seasonal', getSeasonalDemand);
router.get('/traffic', getTrafficIntelligence);
router.get('/providers', getProviderPerformance);
router.get('/users', getUserBehavior);

router.post('/ai-dashboard-insight', generateDashboardInsight);

module.exports = router;
