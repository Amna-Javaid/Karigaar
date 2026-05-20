const Service = require('../models/Service');

// Helper to compute rich search context / metadata for intelligent search recommendations
const computeSearchContext = async (search, city, category) => {
  let matchedCategory = category || '';
  let queryText = (search || '').toLowerCase().trim();

  const categoryKeywords = {
    'Electrician': ['electrician', 'electric', 'wiring', 'switch', 'light', 'short circuit', 'board'],
    'Plumber': ['plumber', 'plumbing', 'pipe', 'leak', 'tap', 'sink', 'toilet', 'flush', 'water tank'],
    'Tutor': ['tutor', 'teacher', 'teaching', 'math', 'science', 'english', 'academy', 'class', 'physics'],
    'Mehndi Artist': ['mehndi', 'henna', 'bridal mehndi', 'eid mehndi', 'mehndi design'],
    'Makeup Artist': ['makeup', 'makeup artist', 'bridal makeup', 'parlor', 'grooming', 'party makeup', 'hair styling'],
    'Carpenter': ['carpenter', 'furniture', 'wood', 'door', 'lock', 'sofa', 'table', 'chair', 'cupboard'],
    'AC Technician': ['ac', 'air conditioner', 'cooling', 'fridge', 'refrigerator', 'compressor', 'split ac', 'ac repair'],
    'Cleaner': ['cleaner', 'cleaning', 'sofa cleaning', 'carpet cleaning', 'house cleaning', 'maid', 'dusting'],
    'Driver': ['driver', 'driving', 'chauffeur', 'car driver', 'monthly driver', 'outstation driver'],
    'Cook': ['cook', 'chef', 'cooking', 'food', 'meal prep', 'baking', 'catering']
  };

  if (!matchedCategory && queryText) {
    for (const [catName, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(kw => queryText.includes(kw) || kw.includes(queryText))) {
        matchedCategory = catName;
        break;
      }
    }
  }

  // Generate intent-driven related searches
  let relatedKeywords = [];
  const citySuffix = city ? ` in ${city}` : ' near me';
  if (matchedCategory === 'Electrician') {
    relatedKeywords = [
      `Home Electrician${citySuffix}`,
      `Emergency Electrician${citySuffix}`,
      `AC Electrician${citySuffix}`,
      'Wiring Services',
      `Electrician${citySuffix}`,
      'Average electrician pricing',
      'Recommended providers'
    ];
  } else if (matchedCategory === 'Plumber') {
    relatedKeywords = [
      `Emergency Plumber${citySuffix}`,
      `Bathroom Plumbing Repair`,
      `Water Tank Leakage Fix`,
      `Plumber${citySuffix}`,
      'Sump pump installation',
      'Average plumber pricing'
    ];
  } else if (matchedCategory === 'AC Technician') {
    relatedKeywords = [
      `Inverter AC Service${citySuffix}`,
      `AC Gas Charging`,
      `AC Installation`,
      `AC Repairing${citySuffix}`,
      'Average AC service pricing'
    ];
  } else if (matchedCategory) {
    relatedKeywords = [
      `Professional ${matchedCategory}${citySuffix}`,
      `Emergency ${matchedCategory}`,
      `Affordable ${matchedCategory}`,
      `Best ${matchedCategory}${citySuffix}`,
      `${matchedCategory} pricing`
    ];
  } else {
    relatedKeywords = [
      'Electrician in Lahore',
      'Emergency Plumber Karachi',
      'AC Gas Charging Islamabad',
      'Home Tutor Lahore',
      'Bridal Makeup Rawalpindi',
      'Sofa Cleaning Service'
    ];
  }

  // Generate suggested related categories
  let suggestedCategories = [];
  if (matchedCategory) {
    suggestedCategories.push(matchedCategory);
    if (matchedCategory === 'Electrician') suggestedCategories.push('AC Technician', 'Carpenter');
    else if (matchedCategory === 'AC Technician') suggestedCategories.push('Electrician', 'Cleaner');
    else if (matchedCategory === 'Plumber') suggestedCategories.push('Cleaner', 'Carpenter');
    else if (matchedCategory === 'Makeup Artist') suggestedCategories.push('Mehndi Artist');
    else if (matchedCategory === 'Mehndi Artist') suggestedCategories.push('Makeup Artist');
    else if (matchedCategory === 'Tutor') suggestedCategories.push('Other');
    else suggestedCategories.push('Electrician', 'Plumber');
  } else {
    suggestedCategories = ['Electrician', 'Plumber', 'AC Technician', 'Tutor'];
  }

  // Dynamically calculate estimated pricing range based on real database records
  let priceRange = { min: 300, max: 1500, avg: 650 };
  const priceQuery = { available: true };
  if (matchedCategory) priceQuery.category = matchedCategory;
  if (city) priceQuery.city = city;

  const Service = require('../models/Service');
  const prices = await Service.find(priceQuery).select('pricePerHour').lean();
  if (prices.length > 0) {
    const list = prices.map(p => p.pricePerHour);
    priceRange.min = Math.min(...list);
    priceRange.max = Math.max(...list);
    priceRange.avg = Math.round(list.reduce((sum, val) => sum + val, 0) / list.length);
  }

  // Retrieve popular or nearby provider recommendations
  const popQuery = { available: true };
  if (matchedCategory) popQuery.category = matchedCategory;
  if (city) popQuery.city = city;

  const popularOrNearby = await Service.find(popQuery)
    .sort({ rating: -1, totalBookings: -1 })
    .limit(3)
    .select('title category pricePerHour city rating providerName image slug')
    .lean();

  return {
    matchedCategory,
    relatedKeywords,
    suggestedCategories,
    priceRange,
    popularOrNearby
  };
};

// GET /api/services  (public, with filters & intelligent search context)
const getServices = async (req, res) => {
  try {
    const { category, city, search, featured, page = 1, limit = 12 } = req.query;
    const query = { available: true };
    if (category) query.category = category;
    if (city) query.city = city;
    if (featured === 'true') query.featured = true;

    // Smart search logic: match title, category, description, and keywords
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { seoKeywords: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Service.countDocuments(query);
    const services = await Service.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Track search appearances analytics for returned services
    if (services.length > 0 && search) {
      const ids = services.map(s => s._id);
      await Service.updateMany(
        { _id: { $in: ids } },
        { $inc: { searchAppearances: 1 } }
      );
    }

    // Generate dynamic context recommendations for SEO and smart search UI
    const searchContext = await computeSearchContext(search, city, category);

    res.json({ services, total, page: Number(page), pages: Math.ceil(total / limit), searchContext });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/services/admin/all  (admin — all services)
const getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find({}).populate('provider', 'name email').sort({ createdAt: -1 });
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/services/my  (provider — only their services)
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// GET /api/services/:idOrSlug  (public - lookup by Mongo ID or URL slug)
const getServiceById = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const { id } = req.params;
    let service;
    if (mongoose.Types.ObjectId.isValid(id)) {
      service = await Service.findById(id).populate('provider', 'name email phone');
    } else {
      service = await Service.findOne({ slug: id }).populate('provider', 'name email phone');
    }
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Track analytics - increment page views
    service.views = (service.views || 0) + 1;
    await service.save();

    res.json(service);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/services  (provider or admin)
const createService = async (req, res) => {
  try {
    const data = { ...req.body, provider: req.user._id };
    // Auto-fill providerName from user if not given
    if (!data.providerName) data.providerName = req.user.businessName || req.user.name;
    const service = await Service.create(data);
    res.status(201).json(service);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// PUT /api/services/:id  (owner provider or admin)
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    // Only owner provider or admin can update
    if (req.user.role !== 'admin' && service.provider?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your service' });
    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// DELETE /api/services/:id  (owner provider or admin)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (req.user.role !== 'admin' && service.provider?.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not your service' });
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Service deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// POST /api/services/:id/review  (authenticated user)
const addReview = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.reviews.find(r => r.user.toString() === req.user._id.toString()))
      return res.status(400).json({ message: 'Already reviewed' });
    service.reviews.push({ user: req.user._id, name: req.user.name, rating: req.body.rating, comment: req.body.comment });
    service.numReviews = service.reviews.length;
    service.rating = service.reviews.reduce((a, r) => a + r.rating, 0) / service.reviews.length;
    await service.save();
    res.status(201).json({ message: 'Review added' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getServices, getAllServicesAdmin, getMyServices, getServiceById, createService, updateService, deleteService, addReview };
