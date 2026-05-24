const express = require('express');
const router = express.Router();

const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

const { authenticateUser } = require('../middleware/authMiddleware');

/* ───────── CART ROUTES ───────── */

router.get('/', authenticateUser, getCart);
router.post('/', authenticateUser, addToCart);
router.put('/:id', authenticateUser, updateCart);
router.delete('/:id', authenticateUser, removeFromCart);
router.delete('/', authenticateUser, clearCart);

module.exports = router;