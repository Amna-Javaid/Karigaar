const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { generateProductContent } = require('../controllers/aiController');

// POST /api/admin/generate-product-content
router.post('/generate-product-content', protect, adminOnly, generateProductContent);

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });

    const revenueAgg = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const bookingsByCategory = await Booking.aggregate([
      { $group: { _id: '$serviceCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const bookingUserStats = await Booking.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const distinctBookingUsers = bookingUserStats.length;
    const returningCustomers = bookingUserStats.filter(u => u.count > 1).length;
    const conversionRate = totalUsers ? Math.round((distinctBookingUsers / totalUsers) * 100) : 0;

    const seoScoreAgg = await Service.aggregate([
      {
        $project: {
          seoFilledCount: {
            $add: [
              { $cond: [{ $gt: ['$seoTitle', ''] }, 1, 0] },
              { $cond: [{ $gt: ['$seoDescription', ''] }, 1, 0] },
              { $cond: [{ $gt: ['$seoKeywords', ''] }, 1, 0] }
            ]
          }
        }
      },
      { $group: { _id: null, totalFilled: { $sum: '$seoFilledCount' }, count: { $sum: 1 } } }
    ]);

    const seoScore = seoScoreAgg[0]
      ? Math.round((seoScoreAgg[0].totalFilled / (seoScoreAgg[0].count * 3)) * 100)
      : 0;

    const recentBookings = await Booking.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const topServices = await Service.find({}).sort({ totalBookings: -1 }).limit(7)
      .select('title category totalBookings rating pricePerHour seoTitle seoDescription seoKeywords');

    // Monthly revenue for chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $in: ['confirmed', 'completed'] } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalServices,
      totalBookings,
      totalUsers,
      totalRevenue,
      bookingsByStatus,
      bookingsByCategory,
      recentBookings,
      topServices,
      monthlyRevenue,
      distinctBookingUsers,
      returningCustomers,
      conversionRate,
      seoScore
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
