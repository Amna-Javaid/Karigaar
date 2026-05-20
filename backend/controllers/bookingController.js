const Booking = require('../models/Booking');
const Service = require('../models/Service');

// POST /api/bookings  (user)
const createBooking = async (req, res) => {
  try {
    const { serviceId, hours, scheduledDate, scheduledTime, address, city, notes, paymentMethod } = req.body;
    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const booking = await Booking.create({
      user: req.user._id,
      service: serviceId,
      provider: service.provider,       // ← link to provider
      serviceTitle:    service.title,
      serviceCategory: service.category,
      providerName:    service.providerName,
      pricePerHour:    service.pricePerHour,
      serviceImage:    service.image,
      hours,
      totalAmount: service.pricePerHour * hours,
      scheduledDate, scheduledTime, address, city, notes, paymentMethod
    });

    await Service.findByIdAndUpdate(serviceId, { $inc: { totalBookings: 1 } });
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/bookings/my  (user's own bookings)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/bookings/provider  (provider sees bookings for their services)
const getProviderBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ provider: req.user._id })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/bookings/provider/stats  (provider dashboard stats)
const getProviderStats = async (req, res) => {
  try {
    const providerId = req.user._id;
    const totalBookings   = await Booking.countDocuments({ provider: providerId });
    const pendingBookings = await Booking.countDocuments({ provider: providerId, status: 'pending' });
    const completedBookings = await Booking.countDocuments({ provider: providerId, status: 'completed' });

    const revenueAgg = await Booking.aggregate([
      { $match: { provider: providerId, status: { $in: ['confirmed','completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    const recentBookings = await Booking.find({ provider: providerId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    const myServices = await Service.find({ provider: providerId }).select('title totalBookings rating');

    res.json({ totalBookings, pendingBookings, completedBookings, totalRevenue, recentBookings, myServices });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('user', 'name email phone');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isOwner    = booking.user._id.toString() === req.user._id.toString();
    const isProvider = booking.provider?.toString()  === req.user._id.toString();
    const isAdmin    = req.user.role === 'admin';
    if (!isOwner && !isProvider && !isAdmin)
      return res.status(403).json({ message: 'Access denied' });
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/bookings  (admin — all bookings)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/bookings/:id/status  (provider updates their booking OR admin updates any)
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isProvider = booking.provider?.toString() === req.user._id.toString();
    const isAdmin    = req.user.role === 'admin';
    if (!isProvider && !isAdmin) return res.status(403).json({ message: 'Access denied' });

    const { status } = req.body;
    const valid = ['pending','confirmed','in-progress','completed','cancelled'];
    if (!valid.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    booking.status = status;
    const stepMap = { confirmed: 1, 'in-progress': 3, completed: 4 };
    if (stepMap[status] !== undefined) {
      booking.trackingSteps.forEach((step, i) => {
        if (i <= stepMap[status]) { step.done = true; if (!step.completedAt) step.completedAt = new Date(); }
      });
    }
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// PUT /api/bookings/:id/cancel  (user cancels their booking)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Access denied' });
    if (booking.status === 'completed')
      return res.status(400).json({ message: 'Cannot cancel a completed booking' });
    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createBooking, getMyBookings, getProviderBookings, getProviderStats, getBookingById, getAllBookings, updateBookingStatus, cancelBooking };
