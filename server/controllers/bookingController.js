const pool = require('../config/db');


/* ───────────────────────────────────────── */
/* CREATE BOOKING (CLIENT) */
/* ───────────────────────────────────────── */
const createBooking = async (req, res) => {

  try {

    const user_id = req.user.user_id;

    const {
      barber_id,
      service_id,
      booking_date,
      booking_time,
      location_type,
      service_address
    } = req.body;

    /* VALIDATION */
    if (
      !barber_id ||
      !service_id ||
      !booking_date ||
      !booking_time
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking fields'
      });
    }

    /* INSERT BOOKING */
    const result = await pool.query(
      `
      INSERT INTO bookings (
        user_id,
        barber_id,
        service_id,
        booking_date,
        booking_time,
        status,
        location_type,
        service_address
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        'pending',
        $6,
        $7
      )
      RETURNING *
      `,
      [
        user_id,
        barber_id,
        service_id,
        booking_date,
        booking_time,
        location_type || 'in_salon',
        service_address || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────────────────────────────────────── */
/* GET MY BOOKINGS (CLIENT) */
/* ───────────────────────────────────────── */
const getMyBookings = async (req, res) => {

  try {

    const user_id = req.user.user_id;

    const result = await pool.query(
      `
      SELECT
        b.booking_id,
        s.name AS service_name,

        CONCAT(
          bu.first_name,
          ' ',
          bu.last_name
        ) AS barber_name,

        b.booking_date,
        b.booking_time,
        b.location_type,
        b.service_address,
        b.status

      FROM bookings b

      JOIN services s
      ON b.service_id = s.service_id

      JOIN barbers br
      ON b.barber_id = br.barber_id

      JOIN users bu
      ON br.user_id = bu.user_id

      WHERE b.user_id = $1

      ORDER BY
      b.booking_date DESC,
      b.booking_time DESC
      `,
      [user_id]
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────────────────────────────────────── */
/* GET ALL BOOKINGS (ADMIN) */
/* ───────────────────────────────────────── */
const getAllBookings = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        b.booking_id,

        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS customer_name,

        CONCAT(
          bu.first_name,
          ' ',
          bu.last_name
        ) AS barber_name,

        s.name AS service_name,

        b.booking_date,
        b.booking_time,
        b.location_type,
        b.service_address,
        b.status

      FROM bookings b

      JOIN users u
      ON b.user_id = u.user_id

      JOIN barbers br
      ON b.barber_id = br.barber_id

      JOIN users bu
      ON br.user_id = bu.user_id

      JOIN services s
      ON b.service_id = s.service_id

      ORDER BY b.booking_id DESC
      `
    );

    res.json({
      success: true,
      data: result.rows
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────────────────────────────────────── */
/* GET BOOKING BY ID */
/* ───────────────────────────────────────── */
const getBookingById = async (req, res) => {

  try {

    const result = await pool.query(
      `
      SELECT
        b.booking_id,

        CONCAT(
          u.first_name,
          ' ',
          u.last_name
        ) AS customer_name,

        CONCAT(
          bu.first_name,
          ' ',
          bu.last_name
        ) AS barber_name,

        s.name AS service_name,

        b.booking_date,
        b.booking_time,
        b.location_type,
        b.service_address,
        b.status

      FROM bookings b

      JOIN users u
      ON b.user_id = u.user_id

      JOIN barbers br
      ON b.barber_id = br.barber_id

      JOIN users bu
      ON br.user_id = bu.user_id

      JOIN services s
      ON b.service_id = s.service_id

      WHERE b.booking_id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────────────────────────────────────── */
/* UPDATE BOOKING (ADMIN) */
/* ───────────────────────────────────────── */
const updateBooking = async (req, res) => {

  try {

    const existing = await pool.query(
      `
      SELECT * FROM bookings
      WHERE booking_id = $1
      `,
      [req.params.id]
    );

    if (existing.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const oldBooking = existing.rows[0];

    const {
      barber_id,
      service_id,
      booking_date,
      booking_time,
      status,
      location_type,
      service_address
    } = req.body;

    const result = await pool.query(
      `
      UPDATE bookings

      SET
        barber_id = $1,
        service_id = $2,
        booking_date = $3,
        booking_time = $4,
        status = $5,
        location_type = $6,
        service_address = $7

      WHERE booking_id = $8

      RETURNING *
      `,
      [
        barber_id || oldBooking.barber_id,
        service_id || oldBooking.service_id,
        booking_date || oldBooking.booking_date,
        booking_time || oldBooking.booking_time,
        status || oldBooking.status,
        location_type || oldBooking.location_type,
        service_address || oldBooking.service_address,
        req.params.id
      ]
    );

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────────────────────────────────────── */
/* DELETE BOOKING (ADMIN) */
/* ───────────────────────────────────────── */
const deleteBooking = async (req, res) => {

  try {

    const result = await pool.query(
      `
      DELETE FROM bookings
      WHERE booking_id = $1
      RETURNING *
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking deleted'
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────────────────────────────────────── */
/* CANCEL BOOKING (CLIENT) */
/* ───────────────────────────────────────── */
const cancelBooking = async (req, res) => {

  try {

    const bookingId = req.params.id;

    const bookingResult = await pool.query(
      `
      SELECT * FROM bookings
      WHERE booking_id = $1
      `,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {

      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingResult.rows[0];

    /* SECURITY CHECK */
    if (booking.user_id !== req.user.user_id) {

      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const result = await pool.query(
      `
      UPDATE bookings

      SET status = 'cancelled'

      WHERE booking_id = $1

      RETURNING *
      `,
      [bookingId]
    );

    res.json({
      success: true,
      message: 'Booking cancelled',
      data: result.rows[0]
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


/* ───────────────────────────────────────── */
/* EXPORTS */
/* ───────────────────────────────────────── */
module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  cancelBooking
};