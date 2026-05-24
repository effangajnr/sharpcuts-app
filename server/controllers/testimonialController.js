const pool = require('../config/db');


/* ───────── CREATE TESTIMONIAL ───────── */
const createTestimonial = async (req, res) => {
  try {

    const image_url = req.file
      ? `/uploads/testimonials/${req.file.filename}`
      : null;

    const {
      reviewer_name,
      customer_type,
      comment,
      is_active
    } = req.body;

    if (!reviewer_name || !comment) {
      return res.status(400).json({
        success: false,
        message: "Reviewer name and comment are required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO testimonials
      (reviewer_name, customer_type, comment, image_url, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        reviewer_name,
        customer_type || null,
        comment,
        image_url,
        typeof is_active === "boolean"
          ? is_active
          : true
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


/* ───────── GET ALL TESTIMONIALS ───────── */
const getTestimonials = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT * FROM testimonials ORDER BY testimonial_id DESC`
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


/* ───────── GET ONE TESTIMONIAL ───────── */
const getTestimonialById = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT * FROM testimonials WHERE testimonial_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
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


/* ───────── UPDATE TESTIMONIAL ───────── */
const updateTestimonial = async (req, res) => {
  try {

    const existing = await pool.query(
      `SELECT * FROM testimonials WHERE testimonial_id = $1`,
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    const image_url = req.file
      ? `/uploads/testimonials/${req.file.filename}`
      : existing.rows[0].image_url;

    const {
      reviewer_name,
      customer_type,
      comment,
      is_active
    } = req.body;

    const result = await pool.query(
      `
      UPDATE testimonials
      SET reviewer_name = $1,
          customer_type = $2,
          comment = $3,
          image_url = $4,
          is_active = $5
      WHERE testimonial_id = $6
      RETURNING *
      `,
      [
        reviewer_name,
        customer_type || null,
        comment,
        image_url,
        typeof is_active === "boolean"
          ? is_active
          : true,
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


/* ───────── DELETE TESTIMONIAL ───────── */
const deleteTestimonial = async (req, res) => {
  try {

    const result = await pool.query(
      `DELETE FROM testimonials WHERE testimonial_id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found"
      });
    }

    res.json({
      success: true,
      message: "Testimonial deleted"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = {
  createTestimonial,
  getTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial
};