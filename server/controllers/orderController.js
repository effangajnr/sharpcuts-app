const pool = require('../config/db');


/* ───────── CREATE ORDER (CHECKOUT) ───────── */
const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get cart items
    const cartItems = await client.query(
      `
      SELECT c.*, p.price
      FROM cart c
      JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = $1
      `,
      [req.user.user_id]
    );

    if (cartItems.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // Calculate total
    let total = 0;
    cartItems.rows.forEach(item => {
      total += Number(item.price) * Number(item.quantity);
    });

    // Create order
    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, total_amount, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
      `,
      [req.user.user_id, total]
    );

    const order = orderResult.rows[0];

    // Insert order items
    for (const item of cartItems.rows) {
      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
        `,
        [order.order_id, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await client.query(
      `DELETE FROM cart WHERE user_id = $1`,
      [req.user.user_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: "Order placed successfully",
      data: order
    });

  } catch (err) {
    await client.query('ROLLBACK');

    res.status(500).json({
      success: false,
      message: err.message
    });

  } finally {
    client.release();
  }
};


/* ───────── GET USER ORDERS ───────── */
const getUserOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [req.user.user_id]
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


/* ───────── GET ORDER DETAILS (USER) ───────── */
const getOrderDetails = async (req, res) => {
  try {

    const orderResult = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE order_id = $1 AND user_id = $2
      `,
      [req.params.id, req.user.user_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        order: orderResult.rows[0],
        items: itemsResult.rows
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── GET ALL ORDERS (ADMIN) ───────── */
const getAllOrders = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT 
        o.order_id,
        o.total_amount,
        o.status,
        o.created_at,

        CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
        u.email AS customer_email,

        COALESCE(COUNT(oi.order_item_id), 0) AS item_count

      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id

      GROUP BY 
        o.order_id,
        o.total_amount,
        o.status,
        o.created_at,
        u.first_name,
        u.last_name,
        u.email

      ORDER BY o.created_at DESC
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


/* ───────── GET ORDER BY ID (ADMIN) ───────── */
const getOrderById = async (req, res) => {
  try {

    const orderResult = await pool.query(
      `
      SELECT 
        o.*,
        CONCAT(u.first_name, ' ', u.last_name) AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.order_id = $1
      `,
      [req.params.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const itemsResult = await pool.query(
      `
      SELECT 
        oi.*,
        p.name AS product_name,
        p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.order_item_id
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        order: orderResult.rows[0],
        items: itemsResult.rows
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── UPDATE ORDER STATUS (ADMIN) ───────── */
const updateOrderStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const validStatuses = [
      'pending',
      'confirmed',
      'completed',
      'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET status = $1
      WHERE order_id = $2
      RETURNING *
      `,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      message: `Order ${status} successfully`,
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── CANCEL ORDER (USER) ───────── */
const cancelOrder = async (req, res) => {
  try {

    const order = await pool.query(
      `SELECT status FROM orders WHERE order_id = $1 AND user_id = $2`,
      [req.params.id, req.user.user_id]
    );

    if (order.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    if (order.rows[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: "Only pending orders can be cancelled"
      });
    }

    const result = await pool.query(
      `
      UPDATE orders
      SET status = 'cancelled'
      WHERE order_id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: result.rows[0]
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── EXPORTS ───────── */
module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};