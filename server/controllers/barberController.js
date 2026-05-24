const pool = require('../config/db');


/* ───────── CREATE BARBER ───────── */
const createBarber = async (req, res) => {
  try {

    const image_url = req.file
      ? `/uploads/barbers/${req.file.filename}`
      : null;

    const result = await pool.query(
      `
      INSERT INTO barbers
      (user_id, bio, experience_years, image_url, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
      `,
      [
        req.body.user_id,
        req.body.bio,
        req.body.experience_years || 0,
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


/* ───────── GET ALL BARBERS ───────── */

const getBarbers = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        b.barber_id,
        b.user_id,
        u.first_name,
        u.last_name,
        b.bio,
        b.experience_years,
        b.image_url,
        b.is_active,
        b.created_at
      FROM barbers b
      JOIN users u ON b.user_id = u.user_id
      WHERE b.is_active = true
      ORDER BY b.barber_id DESC
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


/* ───────── GET ONE BARBER ───────── */
const getBarberById = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        b.barber_id,
        b.user_id,
        u.first_name,
        u.last_name,
        b.bio,
        b.experience_years,
        b.image_url,
        b.is_active,
        b.created_at
      FROM barbers b
      JOIN users u ON b.user_id = u.user_id
      WHERE b.barber_id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber not found"
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


/* ───────── UPDATE BARBER ───────── */
const updateBarber = async (req, res) => {
  try {

    const existing = await pool.query(
      `SELECT * FROM barbers WHERE barber_id = $1`,
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber not found"
      });
    }

    const image_url = req.file
      ? `/uploads/barbers/${req.file.filename}`
      : existing.rows[0].image_url;

    const result = await pool.query(
      `
      UPDATE barbers
      SET user_id = $1,
          bio = $2,
          experience_years = $3,
          image_url = $4,
          is_active = $5
      WHERE barber_id = $6
      RETURNING *
      `,
      [
        req.body.user_id,
        req.body.bio,
        req.body.experience_years || 0,
        image_url,
        req.body.is_active ?? true,
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


/* ───────── DELETE BARBER (SOFT DELETE) ───────── */
const deleteBarber = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE barbers 
       SET is_active = false 
       WHERE barber_id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Barber not found"
      });
    }

    res.json({
      success: true,
      message: "Barber deactivated successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = {
  createBarber,
  getBarbers,
  getBarberById,
  updateBarber,
  deleteBarber
};
