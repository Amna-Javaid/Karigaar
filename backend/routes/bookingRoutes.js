const express = require('express');
const router  = express.Router();
const { createBooking, getMyBookings, getProviderBookings, getProviderStats, getBookingById, getAllBookings, updateBookingStatus, cancelBooking } = require('../controllers/bookingController');
const { protect, adminOnly, providerOnly } = require('../middleware/authMiddleware');

// ⚠️ static routes BEFORE /:id
router.get('/my',              protect,                  getMyBookings);
router.get('/provider',        protect, providerOnly,    getProviderBookings);
router.get('/provider/stats',  protect, providerOnly,    getProviderStats);
router.get('/',                protect, adminOnly,        getAllBookings);

router.post('/',               protect,                  createBooking);
router.get ('/:id',            protect,                  getBookingById);
router.put ('/:id/cancel',     protect,                  cancelBooking);
router.put ('/:id/status',     protect, providerOnly,    updateBookingStatus);

module.exports = router;
