const express = require('express');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBooking,
  deleteBooking,
  cancelBooking
} = require('../controllers/bookingController');

const { authenticateUser, authenticateAdmin } = require('../middleware/authMiddleware');

/* ───────── CLIENT ROUTES ───────── */
// Regular users can create bookings, view their own, and cancel their own
router.post('/', authenticateUser, createBooking);
router.get('/my', authenticateUser, getMyBookings);
router.put('/cancel/:id', authenticateUser, cancelBooking);

/* ───────── ADMIN ROUTES ───────── */
router.get('/', authenticateAdmin, getAllBookings);          // View all bookings
router.put('/:id', authenticateAdmin, updateBooking);       // Update any booking
router.delete('/:id', authenticateAdmin, deleteBooking);    // Delete any booking

module.exports = router;
