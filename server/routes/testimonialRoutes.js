const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');

const {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');


/* ───────── GET ALL ───────── */
router.get('/', getTestimonials);


/* ───────── GET ONE ───────── */
router.get('/:id', getTestimonialById);


/* ───────── CREATE ───────── */
router.post(
  '/',
  (req, res, next) => {
    req.uploadFolder = 'testimonials';
    next();
  },
  upload.single('image'),
  createTestimonial
);


/* ───────── UPDATE ───────── */
router.put(
  '/:id',
  (req, res, next) => {
    req.uploadFolder = 'testimonials';
    next();
  },
  upload.single('image'),
  updateTestimonial
);


/* ───────── DELETE ───────── */
router.delete('/:id', deleteTestimonial);


module.exports = router;