const pool = require('../config/db');

/* ───────── CREATE CATEGORY ───────── */
const createCategory = async (req, res) => {
  try {

    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const result = await pool.query(
      `INSERT INTO service_categories (name)
       VALUES ($1)
       RETURNING *`,
      [name]
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


/* ───────── GET ALL CATEGORIES ───────── */
const getCategories = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT *
      FROM service_categories
      ORDER BY name ASC
    `);

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


/* ───────── GET ONE CATEGORY ───────── */
const getCategoryById = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT *
       FROM service_categories
       WHERE category_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
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


/* ───────── UPDATE CATEGORY ───────── */
const updateCategory = async (req, res) => {
  try {

    const { name } = req.body;

    const result = await pool.query(
      `UPDATE service_categories
       SET name = $1
       WHERE category_id = $2
       RETURNING *`,
      [name, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
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


/* ───────── DELETE CATEGORY ───────── */
const deleteCategory = async (req, res) => {
  try {

    const result = await pool.query(
      `DELETE FROM service_categories
       WHERE category_id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.json({
      success: true,
      message: "Category deleted"
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};


module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};