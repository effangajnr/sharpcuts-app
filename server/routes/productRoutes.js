const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');

const { authenticateAdmin } = require('../middleware/authMiddleware');

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');


/* ───────── GET ALL (Public - clients can view products) ───────── */
router.get('/', getProducts);


/* ───────── GET ONE (Public - clients can view product details) ───────── */
router.get('/:id', getProductById);


/* ───────── CREATE (Protected - admin only) ───────── */
router.post(
  '/',
  authenticateAdmin,  
  (req, res, next) => {
    req.uploadFolder = 'products';
    next();
  },
  upload.single('image'),
  createProduct
);


/* ───────── UPDATE (Protected - admin only) ───────── */
router.put(
  '/:id',
  authenticateAdmin,  
  (req, res, next) => {
    req.uploadFolder = 'products';
    next();
  },
  upload.single('image'),
  updateProduct
);


/* ───────── DELETE (Protected - admin only) ───────── */
router.delete('/:id', authenticateAdmin, deleteProduct);  


module.exports = router;
