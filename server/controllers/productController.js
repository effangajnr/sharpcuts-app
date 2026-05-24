const pool = require('../config/db');


/* ───────── CREATE PRODUCT ───────── */
const createProduct = async (req, res) => {
  try {

    const image_url = req.file
      ? `/uploads/products/${req.file.filename}`
      : null;

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, image_url, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [
        req.body.name,
        req.body.description || null,
        parseFloat(req.body.price) || 0,
        parseInt(req.body.stock) || 0,
        image_url
      ]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── GET ALL PRODUCTS (ADMIN) ───────── */

const getProducts = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT * 
       FROM products 
       WHERE is_active = true
       ORDER BY product_id DESC`
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── GET ONE PRODUCT ───────── */
const getProductById = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT * 
       FROM products 
       WHERE product_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── UPDATE PRODUCT ───────── */
const updateProduct = async (req, res) => {
  try {

    const existing = await pool.query(
      `SELECT * FROM products WHERE product_id = $1`,
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const image_url = req.file
      ? `/uploads/products/${req.file.filename}`
      : existing.rows[0].image_url;

    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           stock = $4,
           image_url = $5,
           is_active = $6
       WHERE product_id = $7
       RETURNING *`,
      [
        req.body.name,
        req.body.description || null,
        parseFloat(req.body.price) || 0,
        parseInt(req.body.stock) || 0,
        image_url,
        req.body.is_active === "true" || req.body.is_active === true,
        req.params.id
      ]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── DELETE PRODUCT (SOFT DELETE) ───────── */
const deleteProduct = async (req, res) => {
  try {

    const result = await pool.query(
      `UPDATE products 
       SET is_active = false 
       WHERE product_id = $1 
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      message: "Product deactivated successfully"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};


module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
