const pool = require('../config/db');


/* ───────── CREATE SERVICE ───────── */
const createService = async (req, res) => {
  try {

    const {
      category_id,
      name,
      description,
      price,
      duration_minutes
    } = req.body;

    if (!category_id || !name || !price) {
      return res.status(400).json({
        success: false,
        message: "Category, name and price are required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO services
      (
        category_id,
        name,
        description,
        price,
        duration_minutes,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
      `,
      [
        category_id,
        name,
        description || null,
        price,
        duration_minutes || 30
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


/* ───────── GET ALL SERVICES (ADMIN) ───────── */
const getServices = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        s.*,
        c.name AS category_name
      FROM services s
      LEFT JOIN service_categories c
        ON s.category_id = c.category_id
      WHERE s.is_active = true
      ORDER BY s.service_id DESC
      `
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


/* ───────── GET ONE SERVICE ───────── */
const getServiceById = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        s.*,
        c.name AS category_name
      FROM services s
      LEFT JOIN service_categories c
        ON s.category_id = c.category_id
      WHERE s.service_id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
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


/* ───────── UPDATE SERVICE ───────── */
const updateService = async (req, res) => {
  try {

    const {
      category_id,
      name,
      description,
      price,
      duration_minutes,
      is_active
    } = req.body;

    const result = await pool.query(
      `
      UPDATE services
      SET
        category_id = $1,
        name = $2,
        description = $3,
        price = $4,
        duration_minutes = $5,
        is_active = $6
      WHERE service_id = $7
      RETURNING *
      `,
      [
        category_id,
        name,
        description || null,
        price,
        duration_minutes || 30,
        typeof is_active === "boolean" ? is_active : true,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
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


/* ───────── DELETE SERVICE (SOFT DELETE) ───────── */
const deleteService = async (req, res) => {
  try {

    const result = await pool.query(
      `
      UPDATE services
      SET is_active = false
      WHERE service_id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      message: "Service deactivated successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService
};
