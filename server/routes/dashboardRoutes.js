const express = require('express');
const router = express.Router();

const { getCounts } = require('../controllers/dashboardController');

router.get('/counts', getCounts);

module.exports = router;