const pool = require('../config/db');

const getCounts = async (req, res) => {
  try {
    const customers = await pool.query(
      `SELECT COUNT(*) FROM users WHERE role = 'user'`
    );

    const bookings = await pool.query(
      `SELECT COUNT(*) FROM bookings`
    );

    const products = await pool.query(
      `SELECT COUNT(*) FROM products`
    );

        const orders = await pool.query(
      `SELECT COUNT(*) FROM orders`
    );

    res.json({
      success: true,
      data: {
        customers: customers.rows[0].count,
        bookings: bookings.rows[0].count,
        products: products.rows[0].count,
        orders: orders.rows[0].count
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = { getCounts };