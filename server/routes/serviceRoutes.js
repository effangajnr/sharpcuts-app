const express = require('express');
const router = express.Router();

const {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
} = require('../controllers/serviceController');

// GET all
router.get('/', getServices);

// GET one
router.get('/:id', getServiceById);

// CREATE
router.post('/', createService);

// UPDATE
router.put('/:id', updateService);

// DELETE
router.delete('/:id', deleteService);

module.exports = router;