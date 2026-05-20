const express = require('express');
const router  = express.Router();
const { handleMessage, autocomplete } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// Optional auth — chatbot works for guests too, but extra features for logged-in users
const optionalAuth = async (req, res, next) => {
  try {
    const jwt  = require('jsonwebtoken');
    const User = require('../models/User');
    if (req.headers.authorization?.startsWith('Bearer')) {
      const token   = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user      = await User.findById(decoded.id).select('-password');
    }
  } catch (_) { /* guest — no token */ }
  next();
};

router.post('/message',    optionalAuth, handleMessage);
router.get ('/autocomplete', autocomplete);

module.exports = router;
