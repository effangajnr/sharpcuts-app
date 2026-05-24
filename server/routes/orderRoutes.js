const express = require('express');
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

const {
  authenticateUser,
  authenticateAdmin
} = require('../middleware/authMiddleware');


/* ───────── ADMIN ROUTES ───────── */

// Get all orders (admin dashboard)
router.get('/admin/all', authenticateAdmin, getAllOrders);

// Get single order (admin)
router.get('/admin/:id', authenticateAdmin, getOrderById);

router.put('/admin/:id/status', authenticateAdmin, updateOrderStatus);

router.put('/admin/:id/cancel', authenticateAdmin, cancelOrder);


/* ───────── CLIENT ROUTES ───────── */

// Create order
router.post('/', authenticateUser, createOrder);

// Get user orders
router.get('/', authenticateUser, getUserOrders);

// Get single user order
router.get('/:id', authenticateUser, getOrderDetails);

// Cancel order (user side)
router.put('/:id/cancel', authenticateUser, cancelOrder);


module.exports = router;