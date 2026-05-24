require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');


const app = express();

// use env port (fallback to 3000)
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Static files
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/', express.static(path.join(__dirname, '../client')));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes (better practice)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/service-categories', require('./routes/serviceCategoryRoutes'));
app.use('/api/pricing', require('./routes/pricingRoutes'));
app.use('/api/barbers', require('./routes/barberRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
