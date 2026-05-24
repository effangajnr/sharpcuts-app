const pool = require('../config/db');


/* ───────── GET USER CART ───────── */
const getCart = async (req, res) => {
  try {

    const result = await pool.query(
      `
      SELECT
        c.cart_id,
        c.quantity,
        p.product_id,
        p.name,
        p.price,
        p.image_url
      FROM cart c
      JOIN products p ON c.product_id = p.product_id
      WHERE c.user_id = $1
      ORDER BY c.cart_id DESC
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


/* ───────── ADD TO CART ───────── */
const addToCart = async (req, res) => {
  try {

    const { product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Product required"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO cart (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [
        req.user.user_id,
        product_id,
        quantity || 1
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


/* ───────── UPDATE CART ITEM ───────── */
const updateCart = async (req, res) => {
  try {

    const { quantity } = req.body;

    const result = await pool.query(
      `
      UPDATE cart
      SET quantity = $1
      WHERE cart_id = $2 AND user_id = $3
      RETURNING *
      `,
      [
        quantity,
        req.params.id,
        req.user.user_id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found"
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


/* ───────── REMOVE FROM CART ───────── */
const removeFromCart = async (req, res) => {
  try {

    const result = await pool.query(
      `
      DELETE FROM cart
      WHERE cart_id = $1 AND user_id = $2
      RETURNING *
      `,
      [req.params.id, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item not found"
      });
    }

    res.json({
      success: true,
      message: "Item removed"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────── CLEAR CART ───────── */
const clearCart = async (req, res) => {
  try {

    await pool.query(
      `DELETE FROM cart WHERE user_id = $1`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      message: "Cart cleared"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
};