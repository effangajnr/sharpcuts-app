const pool = require('../config/db');
const bcrypt = require('bcrypt');

/* ───────── CREATE USER ───────── */
const createUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      role
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users
       (first_name, last_name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING user_id, first_name, last_name, email, phone, role, created_at`,
      [
        first_name,
        last_name,
        email,
        phone || null,
        hashedPassword,
        role || 'user'
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

/* ───────── GET ALL USERS ───────── */
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email, phone, role, created_at
       FROM users
       ORDER BY user_id DESC`
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

/* ───────── GET USER BY ID ───────── */
const getUserById = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email, phone, role, created_at
       FROM users
       WHERE user_id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
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

/* ───────── UPDATE USER ───────── */
const updateUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      role,
      password
    } = req.body;

    let result;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      result = await pool.query(
        `UPDATE users
         SET first_name=$1,
             last_name=$2,
             email=$3,
             phone=$4,
             role=$5,
             password_hash=$6
         WHERE user_id=$7
         RETURNING user_id, first_name, last_name, email, phone, role`,
        [
          first_name,
          last_name,
          email,
          phone,
          role,
          hashedPassword,
          req.params.id
        ]
      );
    } else {
      result = await pool.query(
        `UPDATE users
         SET first_name=$1,
             last_name=$2,
             email=$3,
             phone=$4,
             role=$5
         WHERE user_id=$6
         RETURNING user_id, first_name, last_name, email, phone, role`,
        [
          first_name,
          last_name,
          email,
          phone,
          role,
          req.params.id
        ]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
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

/* ───────── DELETE USER ───────── */
const deleteUser = async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM users
       WHERE user_id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "User deleted"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
};