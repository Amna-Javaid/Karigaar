const express = require('express');
const router  = express.Router();
const { register, login, getProfile, updateProfile, toggleWishlist, getAllUsers, deleteUser, verifyProvider } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/register',            register);
router.post('/login',               login);
router.get ('/profile',             protect, getProfile);
router.put ('/profile',             protect, updateProfile);
router.post('/wishlist/:serviceId', protect, toggleWishlist);
router.get ('/',                    protect, adminOnly, getAllUsers);
router.delete('/:id',               protect, adminOnly, deleteUser);
router.put  ('/:id/verify',         protect, adminOnly, verifyProvider);

module.exports = router;
