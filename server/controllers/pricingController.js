const pool = require('../config/db');

const getPricing = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.category_id,
        c.name AS category_name,

        s.service_id,
        s.name AS service_name,
        s.description,
        s.price,
        s.duration_minutes

      FROM service_categories c
      LEFT JOIN services s 
        ON s.category_id = c.category_id

      WHERE s.is_active = true OR s.is_active IS NULL
      ORDER BY c.category_id, s.service_id
    `);

    const map = {};

    result.rows.forEach(row => {

      if (!map[row.category_id]) {
        map[row.category_id] = {
          name: row.category_name,
          items: []
        };
      }

      if (row.service_id) {
        map[row.category_id].items.push({
          name: row.service_name,
          description: row.description,
          price: row.price,
          duration_minutes: row.duration_minutes
        });
      }
    });

    res.json({
      success: true,
      categories: Object.values(map)
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = { getPricing };