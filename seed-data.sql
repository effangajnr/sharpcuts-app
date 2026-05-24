-- ============================================================
--  barber_db  –  Database Schema
--  Run this FIRST before seed-data.sql
--
--  1. Open psql
--  2. CREATE DATABASE barber_db;
--  3. \c barber_db
--  4. \i db/create-tables.sql
-- ============================================================

-- Drop tables in reverse dependency order (safe re-run)
DROP TABLE IF EXISTS order_items        CASCADE;
DROP TABLE IF EXISTS orders             CASCADE;
DROP TABLE IF EXISTS cart               CASCADE;
DROP TABLE IF EXISTS bookings           CASCADE;
DROP TABLE IF EXISTS services           CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS products           CASCADE;
DROP TABLE IF EXISTS barbers            CASCADE;
DROP TABLE IF EXISTS testimonials       CASCADE;
DROP TABLE IF EXISTS users              CASCADE;

-- ─────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────
CREATE TABLE users (
    user_id       SERIAL PRIMARY KEY,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(150) UNIQUE NOT NULL,
    phone         VARCHAR(20),
    password_hash TEXT NOT NULL,
    role          VARCHAR(20) DEFAULT 'user',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT role_check CHECK (role IN ('admin', 'staff', 'user'))
);

-- ─────────────────────────────────────────
--  BARBERS
-- ─────────────────────────────────────────
CREATE TABLE barbers (
    barber_id        SERIAL PRIMARY KEY,
    user_id          INT REFERENCES users(user_id) ON DELETE SET NULL,
    bio              TEXT,
    experience_years INT DEFAULT 0,
    image_url        TEXT,
    is_active        BOOLEAN DEFAULT TRUE,
    is_deleted       BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  SERVICE CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE service_categories (
    category_id SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  SERVICES
-- ─────────────────────────────────────────
CREATE TABLE services (
    service_id       SERIAL PRIMARY KEY,
    category_id      INT REFERENCES service_categories(category_id) ON DELETE SET NULL,
    name             VARCHAR(100) NOT NULL,
    description      TEXT,
    price            NUMERIC(10,2) NOT NULL,
    duration_minutes INT DEFAULT 30,
    is_active        BOOLEAN DEFAULT TRUE,
    is_deleted       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE bookings (
    booking_id      SERIAL PRIMARY KEY,
    user_id         INT REFERENCES users(user_id)     ON DELETE CASCADE,
    barber_id       INT REFERENCES barbers(barber_id),
    service_id      INT REFERENCES services(service_id),
    location_type   VARCHAR(20) DEFAULT 'in_salon'
                        CHECK (location_type IN ('in_salon', 'home_service')),
    service_address TEXT,
    booking_date    DATE NOT NULL,
    booking_time    TIME NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending'
                        CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  PRODUCTS
-- ─────────────────────────────────────────
CREATE TABLE products (
    product_id  SERIAL PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    price       NUMERIC(10,2) NOT NULL,
    stock       INT DEFAULT 0,
    image_url   TEXT,
    is_active   BOOLEAN DEFAULT TRUE,
    is_deleted  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  CART
-- ─────────────────────────────────────────
CREATE TABLE cart (
    cart_id    SERIAL PRIMARY KEY,
    user_id    INT REFERENCES users(user_id)     ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id),
    quantity   INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  ORDERS
-- ─────────────────────────────────────────
CREATE TABLE orders (
    order_id     SERIAL PRIMARY KEY,
    user_id      INT REFERENCES users(user_id) ON DELETE CASCADE,
    total_amount NUMERIC(10,2) DEFAULT 0,
    status       VARCHAR(20) DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────
--  ORDER ITEMS
-- ─────────────────────────────────────────
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id      INT REFERENCES orders(order_id)   ON DELETE CASCADE,
    product_id    INT REFERENCES products(product_id),
    quantity      INT NOT NULL,
    price         NUMERIC(10,2) NOT NULL
);

-- ─────────────────────────────────────────
--  TESTIMONIALS
-- ─────────────────────────────────────────
CREATE TABLE testimonials (
    testimonial_id SERIAL PRIMARY KEY,
    reviewer_name  VARCHAR(150) NOT NULL,
    customer_type  VARCHAR(100),
    comment        TEXT NOT NULL,
    image_url      TEXT,
    is_active      BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
