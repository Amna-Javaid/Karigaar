const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const { OpenAI } = require('openai');

const getBookingAnalytics = async (req, res) => {
  try {
    const { range = 'weekly' } = req.query;
    let dateFormat = range === 'daily' ? '%Y-%m-%d' : range === 'weekly' ? '%Y-%U' : '%Y-%m';

    const trends = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          totalBookings: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $in: ['$status', ['completed', 'confirmed']] }, '$totalAmount', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const revenueByCategory = await Booking.aggregate([
      { $match: { status: { $in: ['completed', 'confirmed'] } } },
      { $group: { _id: '$serviceCategory', revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { revenue: -1 } }
    ]);

    const totalBookings = await Booking.countDocuments();
    const totalRevenue = revenueByCategory.reduce((sum, c) => sum + c.revenue, 0);
    const avgBookingValue = totalBookings ? Math.round(totalRevenue / totalBookings) : 0;

    res.json({ trends, revenueByCategory, kpis: { totalBookings, totalRevenue, avgBookingValue } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getTrendingServices = async (req, res) => {
  try {
    const topBooked = await Service.find({}).sort({ totalBookings: -1 }).limit(10).select('title category totalBookings views');
    const topViewed = await Service.find({}).sort({ views: -1 }).limit(10).select('title category totalBookings views');
    res.json({ topBooked, topViewed });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getTrendingSoon = async (req, res) => {
  try {
    const trendingSoon = await Service.find({ views: { $gt: 20 }, totalBookings: { $lt: 5 } })
      .sort({ views: -1 })
      .limit(10)
      .select('title category views totalBookings');
    res.json(trendingSoon);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getCancellations = async (req, res) => {
  try {
    const reasons = await Booking.aggregate([
      { $match: { status: 'cancelled' } },
      { $group: { _id: { $cond: [{ $eq: ['$cancellationReason', ''] }, 'User Cancelled (No Reason)', '$cancellationReason'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const topOffenders = await Booking.aggregate([
      { $match: { status: 'cancelled', providerName: { $ne: '' } } },
      { $group: { _id: '$providerName', cancelCount: { $sum: 1 } } },
      { $sort: { cancelCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({ reasons, topOffenders });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getProviderAlerts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 3;
    const activeProvidersByCategory = await Service.aggregate([
      { $match: { available: true, provider: { $ne: null } } },
      { $group: { _id: '$category', providers: { $addToSet: '$provider' } } },
      { $project: { category: '$_id', providerCount: { $size: '$providers' } } },
      { $match: { providerCount: { $lte: threshold } } },
      { $sort: { providerCount: 1 } }
    ]);
    res.json(activeProvidersByCategory);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getSeasonalDemand = async (req, res) => {
  try {
    const seasonal = await Booking.aggregate([
      {
        $group: {
          _id: { category: '$serviceCategory', month: { $month: '$scheduledDate' } },
          count: { $sum: 1 }
        }
      },
      {
        $group: { _id: '$_id.category', monthlyData: { $push: { month: '$_id.month', count: '$count' } } }
      }
    ]);
    res.json(seasonal);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getTrafficIntelligence = async (req, res) => {
  try {
    const traffic = await Service.aggregate([
      { $match: { views: { $gt: 0 } } },
      {
        $project: {
          title: 1, category: 1, views: 1, totalBookings: 1,
          conversionRate: { $round: [{ $multiply: [{ $divide: ['$totalBookings', '$views'] }, 100] }, 1] }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 20 }
    ]);
    res.json(traffic);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getProviderPerformance = async (req, res) => {
  try {
    const providers = await Service.aggregate([
      { $match: { available: true, providerName: { $ne: '' } } },
      {
        $group: {
          _id: '$providerName',
          totalBookings: { $sum: '$totalBookings' },
          avgRating: { $avg: '$rating' },
          serviceCount: { $sum: 1 }
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 20 }
    ]);
    res.json(providers);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getUserBehavior = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const usersWithBookings = (await Booking.distinct('user')).length;
    const wishlistAgg = await User.aggregate([
      { $match: { role: 'user' } },
      { $project: { hasWishlist: { $gt: [{ $size: '$wishlist' }, 0] } } },
      { $match: { hasWishlist: true } },
      { $count: 'count' }
    ]);
    const usersWithWishlist = wishlistAgg[0]?.count || 0;

    const funnel = {
      totalUsers,
      usersWithWishlist,
      usersWithBookings,
      dropoffWishlistToBooking: usersWithWishlist ? 100 - Math.round((usersWithBookings / usersWithWishlist) * 100) : 0
    };
    res.json({ funnel });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const generateDashboardInsight = async (req, res) => {
  try {
    const metrics = req.body;
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ message: 'OpenAI API key missing.' });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `You are a data-driven business analyst for KarigaarPK, an on-demand home services platform in Pakistan.
Analyze the following platform metrics and return a strict JSON object with actionable insights.

Metrics Data:
${JSON.stringify(metrics, null, 2)}

Return EXACTLY this JSON structure, with no markdown formatting:
{
  "platformHealthScore": number (0-100),
  "weekSummary": "2-3 sentences summarizing the overall platform performance",
  "criticalAlerts": ["string alert 1", "string alert 2"],
  "topOpportunities": ["string opportunity 1", "string opportunity 2"],
  "providerAlerts": ["string provider alert 1"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    let jsonText = response.choices[0].message.content.trim();
    if (jsonText.startsWith('\`\`\`json')) jsonText = jsonText.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
    else if (jsonText.startsWith('\`\`\`')) jsonText = jsonText.replace(/^\`\`\`\n/, '').replace(/\n\`\`\`$/, '');

    res.json(JSON.parse(jsonText));
  } catch (err) {
    console.error('OpenAI Analytics Error:', err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
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
};
