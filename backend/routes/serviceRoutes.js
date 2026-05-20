const express = require('express');
const router  = express.Router();
const { getServices, getAllServicesAdmin, getMyServices, getServiceById, createService, updateService, deleteService, addReview } = require('../controllers/serviceController');
const { protect, adminOnly, providerOnly } = require('../middleware/authMiddleware');

// ⚠️ static routes BEFORE /:id
router.get('/admin/all',  protect, adminOnly,   getAllServicesAdmin);
router.get('/my',         protect, providerOnly, getMyServices);

router.get ('/',     getServices);
router.get ('/:id',  getServiceById);
router.post('/:id/review', protect, addReview);

router.post('/',     protect, providerOnly, createService);
router.put ('/:id',  protect, providerOnly, updateService);
router.delete('/:id',protect, providerOnly, deleteService);

module.exports = router;
