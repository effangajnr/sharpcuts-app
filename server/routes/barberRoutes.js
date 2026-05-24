const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');

// ✅ ADDED: Import admin authentication middleware
const { authenticateAdmin } = require('../middleware/authMiddleware');

const {
  createBarber,
  getBarbers,
  getBarberById,
  updateBarber,
  deleteBarber
} = require('../controllers/barberController');


/* ───────── GET ALL BARBERS (Public - clients can view) ───────── */
router.get('/', getBarbers);


/* ───────── GET ONE BARBER (Public - clients can view) ───────── */
router.get('/:id', getBarberById);


/* ───────── CREATE BARBER (Protected - admin only) ───────── */
router.post(
  '/',
  authenticateAdmin,  // 
  (req, res, next) => {
    req.uploadFolder = 'barbers';
    next();
  },
  upload.single('image'),
  createBarber
);


/* ───────── UPDATE BARBER (Protected - admin only) ───────── */
router.put(
  '/:id',
  authenticateAdmin,  //
  (req, res, next) => {
    req.uploadFolder = 'barbers';
    next();
  },
  upload.single('image'),
  updateBarber
);


/* ───────── DELETE BARBER (Protected - admin only) ───────── */
router.delete('/:id', authenticateAdmin, deleteBarber);  // 


module.exports = router;
