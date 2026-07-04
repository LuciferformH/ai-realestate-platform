-- ============================================================
-- AI Real Estate Insights Platform - Docker PostgreSQL Init
-- This file runs automatically when the container starts.
-- The database is created by POSTGRES_DB env var.
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUM TYPES
-- ============================================================
DO $$ BEGIN
    CREATE TYPE property_type_enum AS ENUM ('residential', 'commercial', 'industrial', 'agricultural', 'mixed_use');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE listing_status_enum AS ENUM ('active', 'sold', 'rented', 'pending', 'expired', 'draft');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE property_condition_enum AS ENUM ('new', 'excellent', 'good', 'fair', 'poor');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('admin', 'agent', 'buyer', 'seller', 'premium');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- TABLES
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role_enum DEFAULT 'buyer',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    population BIGINT,
    avg_price_per_sqft DECIMAL(12, 2),
    cost_of_living_index DECIMAL(5, 2),
    is_metro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_type property_type_enum NOT NULL,
    listing_status listing_status_enum DEFAULT 'active',
    condition property_condition_enum DEFAULT 'good',

    -- Location details
    address TEXT NOT NULL,
    locality VARCHAR(255),
    landmark VARCHAR(255),
    pincode VARCHAR(10),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),

    -- Property dimensions
    area_sqft DECIMAL(10, 2) NOT NULL,
    area_sqm DECIMAL(10, 2),
    carpet_area DECIMAL(10, 2),
    built_up_area DECIMAL(10, 2),
    land_area_acres DECIMAL(10, 4),

    -- Room details
    bedrooms SMALLINT NOT NULL DEFAULT 1,
    bathrooms SMALLINT NOT NULL DEFAULT 1,
    balconies SMALLINT DEFAULT 0,
    floors_total SMALLINT,
    floor_number SMALLINT,
    parking_spaces SMALLINT DEFAULT 0,

    -- Pricing
    price DECIMAL(15, 2) NOT NULL,
    price_per_sqft DECIMAL(10, 2),
    rental_yield DECIMAL(5, 2),
    maintenance_cost DECIMAL(10, 2),
    stamp_duty DECIMAL(12, 2),
    registration_fee DECIMAL(12, 2),

    -- Features
    year_built SMALLINT,
    facing_direction VARCHAR(20),
    furnishing VARCHAR(50) DEFAULT 'unfurnished',
    water_supply VARCHAR(50),
    power_backup BOOLEAN DEFAULT FALSE,
    gated_community BOOLEAN DEFAULT FALSE,

    -- Amenities (stored as JSON array)
    amenities JSONB DEFAULT '[]'::jsonb,

    -- Nearby facilities
    nearby_schools JSONB DEFAULT '[]'::jsonb,
    hospital_distance_km DECIMAL(5, 2),
    metro_distance_km DECIMAL(5, 2),
    airport_distance_km DECIMAL(6, 2),
    shopping_mall_distance_km DECIMAL(5, 2),

    -- Analytics
    crime_rate DECIMAL(5, 2),
    population_density DECIMAL(10, 2),
    market_growth_pct DECIMAL(5, 2),
    avg_rent_per_month DECIMAL(12, 2),
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,

    -- Media
    images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    virtual_tour_url TEXT,

    -- Metadata
    is_featured BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    listed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sold_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Saved Searches table
CREATE TABLE IF NOT EXISTS saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    search_criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
    notify_new_matches BOOLEAN DEFAULT TRUE,
    last_notified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price Alerts table
CREATE TABLE IF NOT EXISTS price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    target_price DECIMAL(15, 2) NOT NULL,
    alert_type VARCHAR(20) DEFAULT 'below' CHECK (alert_type IN ('below', 'above', 'change_pct')),
    threshold_pct DECIMAL(5, 2),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ML Models table
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    model_type VARCHAR(100) NOT NULL,
    description TEXT,
    training_data_points INTEGER,
    accuracy_score DECIMAL(5, 4),
    rmse DECIMAL(10, 4),
    mae DECIMAL(10, 4),
    r2_score DECIMAL(5, 4),
    features_used JSONB DEFAULT '[]'::jsonb,
    hyperparameters JSONB DEFAULT '{}'::jsonb,
    model_path TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    trained_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, version)
);

-- Price Predictions table
CREATE TABLE IF NOT EXISTS price_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
    predicted_price DECIMAL(15, 2) NOT NULL,
    confidence_lower DECIMAL(15, 2),
    confidence_upper DECIMAL(15, 2),
    confidence_score DECIMAL(5, 4),
    prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property Views table
CREATE TABLE IF NOT EXISTS property_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search History table
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    query_text TEXT,
    filters JSONB DEFAULT '{}'::jsonb,
    results_count INTEGER,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log table
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_properties_city_id ON properties(city_id);
CREATE INDEX IF NOT EXISTS idx_properties_category_id ON properties(category_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_status ON properties(listing_status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_area_sqft ON properties(area_sqft);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON properties(bathrooms);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_listed_at ON properties(listed_at DESC);
CREATE INDEX IF NOT EXISTS idx_properties_is_featured ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_is_verified ON properties(is_verified) WHERE is_verified = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_city_price ON properties(city_id, price);
CREATE INDEX IF NOT EXISTS idx_properties_type_price ON properties(property_type, price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms_price ON properties(bedrooms, price);
CREATE INDEX IF NOT EXISTS idx_properties_locality_trgm ON properties USING gin(locality gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_properties_title_trgm ON properties USING gin(title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_property_id ON price_alerts(property_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_is_active ON price_alerts(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_ml_models_name ON ml_models(name);
CREATE INDEX IF NOT EXISTS idx_ml_models_is_active ON ml_models(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_price_predictions_property_id ON price_predictions(property_id);
CREATE INDEX IF NOT EXISTS idx_price_predictions_model_id ON price_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_price_predictions_date ON price_predictions(prediction_date DESC);
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_viewed_at ON property_views(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_searched_at ON search_history(searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- ============================================================
-- TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    CREATE TRIGGER trg_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_properties_updated_at
        BEFORE UPDATE ON properties
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_saved_searches_updated_at
        BEFORE UPDATE ON saved_searches
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER trg_ml_models_updated_at
        BEFORE UPDATE ON ml_models
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- SEED DATA - Cities (20 Indian Cities)
-- ============================================================
INSERT INTO cities (name, state, latitude, longitude, population, avg_price_per_sqft, cost_of_living_index, is_metro) VALUES
('Mumbai', 'Maharashtra', 19.0760, 72.8777, 20411274, 22500, 85.0, TRUE),
('Delhi', 'Delhi', 28.7041, 77.1025, 16787941, 18000, 80.0, TRUE),
('Bangalore', 'Karnataka', 12.9716, 77.5946, 12349320, 12000, 72.0, TRUE),
('Hyderabad', 'Telangana', 17.3850, 78.4867, 10004144, 9500, 60.0, TRUE),
('Chennai', 'Tamil Nadu', 13.0827, 80.2707, 10971108, 9000, 62.0, TRUE),
('Pune', 'Maharashtra', 18.5204, 73.8567, 7426310, 10500, 65.0, TRUE),
('Kolkata', 'West Bengal', 22.5726, 88.3639, 14850321, 8000, 55.0, TRUE),
('Ahmedabad', 'Gujarat', 23.0225, 72.5714, 8088726, 7500, 50.0, TRUE),
('Jaipur', 'Rajasthan', 26.9124, 75.7873, 3909333, 7000, 48.0, TRUE),
('Lucknow', 'Uttar Pradesh', 26.8467, 80.9462, 3681713, 6500, 45.0, TRUE),
('Chandigarh', 'Chandigarh', 30.7333, 76.7794, 1055450, 9000, 58.0, FALSE),
('Kochi', 'Kerala', 9.9312, 76.2673, 2117990, 8500, 55.0, FALSE),
('Indore', 'Madhya Pradesh', 22.7196, 75.8577, 3276697, 5500, 42.0, FALSE),
('Bhopal', 'Madhya Pradesh', 23.2599, 77.4126, 2371061, 5000, 40.0, FALSE),
('Nagpur', 'Maharashtra', 21.1458, 79.0882, 2405665, 5500, 43.0, FALSE),
('Surat', 'Gujarat', 21.1702, 72.8311, 4467797, 6000, 45.0, FALSE),
('Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, 1728128, 6500, 47.0, FALSE),
('Coimbatore', 'Tamil Nadu', 11.0168, 76.9558, 1601438, 6000, 45.0, FALSE),
('Mysore', 'Karnataka', 12.2958, 76.6394, 983795, 5500, 42.0, FALSE),
('Goa', 'Goa', 15.2993, 74.1240, 1457724, 8000, 52.0, FALSE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED DATA - Categories
-- ============================================================
INSERT INTO categories (name, slug, description, icon) VALUES
('Residential', 'residential', 'Houses, apartments, villas, and residential plots', 'home'),
('Commercial', 'commercial', 'Office spaces, shops, showrooms, and commercial complexes', 'building'),
('Industrial', 'industrial', 'Warehouses, factories, and industrial plots', 'factory'),
('Agricultural', 'agricultural', 'Farmland, agricultural land, and plantations', 'leaf'),
('Mixed Use', 'mixed-use', 'Properties with combined residential and commercial use', 'layers')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED DATA - Users
-- ============================================================
INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active) VALUES
('admin@realestate.com', '$2b$12$LJ3m4ys4IhYg.5QZ5x5YNeYhPq5V7M9R5q4v2K4v1M3N5b6c7d8e', 'Platform Admin', '+91-9876543210', 'admin', TRUE, TRUE),
('test@realestate.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', '+91-9876543211', 'buyer', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SEED DATA - ML Models
-- ============================================================
INSERT INTO ml_models (name, version, model_type, description, is_active) VALUES
('Price Predictor v1', '1.0.0', 'gradient_boosting', 'XGBoost model for property price prediction based on features', TRUE),
('Market Trend Analyzer', '1.0.0', 'lstm', 'LSTM model for market trend analysis and forecasting', TRUE),
('Demand Forecaster', '1.0.0', 'prophet', 'Prophet model for housing demand forecasting', TRUE)
ON CONFLICT (name, version) DO NOTHING;

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW v_property_listings AS
SELECT
    p.id, p.title, p.description, p.price, p.price_per_sqft,
    p.area_sqft, p.bedrooms, p.bathrooms, p.parking_spaces,
    p.property_type, p.listing_status, p.condition, p.furnishing,
    p.year_built, p.address, p.locality, p.landmark, p.pincode,
    p.latitude, p.longitude, p.amenities, p.nearby_schools,
    p.hospital_distance_km, p.metro_distance_km, p.crime_rate,
    p.market_growth_pct, p.rental_yield, p.avg_rent_per_month,
    p.images, p.is_featured, p.is_verified, p.views_count,
    p.inquiries_count, p.listed_at, p.created_at,
    c.name AS city_name, c.state AS city_state,
    cat.name AS category_name, cat.slug AS category_slug,
    u.full_name AS owner_name, u.email AS owner_email, u.phone AS owner_phone
FROM properties p
JOIN cities c ON p.city_id = c.id
JOIN categories cat ON p.category_id = cat.id
JOIN users u ON p.owner_id = u.id
WHERE p.listing_status = 'active';

CREATE OR REPLACE VIEW v_city_stats AS
SELECT
    c.id, c.name, c.state, c.latitude, c.longitude,
    c.population, c.avg_price_per_sqft,
    COUNT(p.id) AS total_properties,
    COUNT(p.id) FILTER (WHERE p.listing_status = 'active') AS active_properties,
    ROUND(AVG(p.price)) AS avg_property_price,
    MIN(p.price) AS min_price,
    MAX(p.price) AS max_price,
    ROUND(AVG(p.area_sqft)) AS avg_area_sqft
FROM cities c
LEFT JOIN properties p ON c.id = p.city_id
GROUP BY c.id, c.name, c.state, c.latitude, c.longitude, c.population, c.avg_price_per_sqft;

-- ============================================================
-- GRANTS
-- ============================================================
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Done
\echo 'Docker PostgreSQL initialization complete!'
