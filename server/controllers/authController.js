const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/* ───────── REGISTER ───────── */
const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, phone } = req.body;

    // validation
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    // check if user exists
    const existing = await pool.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    const result = await pool.query(
      `INSERT INTO users
       (first_name, last_name, email, phone, password_hash, role)
       VALUES ($1,$2,$3,$4,$5,'user')
       RETURNING user_id, first_name, last_name, email, phone, role, created_at`,
      [
        first_name,
        last_name,
        email,
        phone || null,
        hashedPassword
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── LOGIN ───────── */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    // get user (no SELECT *)
    const result = await pool.query(
      `SELECT user_id, first_name, last_name, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];

    // compare password
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // create JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};