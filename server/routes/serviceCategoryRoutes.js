const express = require('express');
const router = express.Router();

const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/serviceCategoryController');

// GET all
router.get('/', getCategories);

// GET one
router.get('/:id', getCategoryById);

// CREATE
router.post('/', createCategory);

// UPDATE
router.put('/:id', updateCategory);

// DELETE
router.delete('/:id', deleteCategory);

module.exports = router;