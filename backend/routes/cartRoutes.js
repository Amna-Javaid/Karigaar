const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:serviceId', protect, updateCartItem);
// ⚠️ /clear MUST be before /:serviceId so Express doesn't treat "clear" as a serviceId
router.delete('/clear', protect, clearCart);
router.delete('/:serviceId', protect, removeFromCart);

module.exports = router;
