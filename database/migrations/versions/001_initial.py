"""initial migration - create all tables

Revision ID: 001_initial
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create extensions
    op.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""))
    op.execute(text("CREATE EXTENSION IF NOT EXISTS \"pg_trgm\""))

    # Create enum types
    op.execute(text("""
        DO $$ BEGIN
            CREATE TYPE property_type_enum AS ENUM ('residential', 'commercial', 'industrial', 'agricultural', 'mixed_use');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))

    op.execute(text("""
        DO $$ BEGIN
            CREATE TYPE listing_status_enum AS ENUM ('active', 'sold', 'rented', 'pending', 'expired', 'draft');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))

    op.execute(text("""
        DO $$ BEGIN
            CREATE TYPE property_condition_enum AS ENUM ('new', 'excellent', 'good', 'fair', 'poor');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))

    op.execute(text("""
        DO $$ BEGIN
            CREATE TYPE user_role_enum AS ENUM ('admin', 'agent', 'buyer', 'seller', 'premium');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """))

    # ============================================================
    # Users table
    # ============================================================
    op.create_table(
        'users',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('role', sa.String(20), server_default='buyer'),
        sa.Column('avatar_url', sa.Text, nullable=True),
        sa.Column('is_verified', sa.Boolean, server_default='false'),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # Cities table
    # ============================================================
    op.create_table(
        'cities',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(100), unique=True, nullable=False),
        sa.Column('state', sa.String(100), nullable=False),
        sa.Column('country', sa.String(100), server_default='India'),
        sa.Column('latitude', sa.Numeric(10, 7), nullable=False),
        sa.Column('longitude', sa.Numeric(10, 7), nullable=False),
        sa.Column('population', sa.BigInteger, nullable=True),
        sa.Column('avg_price_per_sqft', sa.Numeric(12, 2), nullable=True),
        sa.Column('cost_of_living_index', sa.Numeric(5, 2), nullable=True),
        sa.Column('is_metro', sa.Boolean, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # Categories table
    # ============================================================
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('name', sa.String(100), unique=True, nullable=False),
        sa.Column('slug', sa.String(100), unique=True, nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('icon', sa.String(50), nullable=True),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # Properties table
    # ============================================================
    op.create_table(
        'properties',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('city_id', sa.Integer, sa.ForeignKey('cities.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('category_id', sa.Integer, sa.ForeignKey('categories.id', ondelete='RESTRICT'), nullable=False),
        sa.Column('owner_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('property_type', sa.String(20), nullable=False),
        sa.Column('listing_status', sa.String(20), server_default='active'),
        sa.Column('condition', sa.String(20), server_default='good'),

        # Location
        sa.Column('address', sa.Text, nullable=False),
        sa.Column('locality', sa.String(255), nullable=True),
        sa.Column('landmark', sa.String(255), nullable=True),
        sa.Column('pincode', sa.String(10), nullable=True),
        sa.Column('latitude', sa.Numeric(10, 7), nullable=True),
        sa.Column('longitude', sa.Numeric(10, 7), nullable=True),

        # Dimensions
        sa.Column('area_sqft', sa.Numeric(10, 2), nullable=False),
        sa.Column('area_sqm', sa.Numeric(10, 2), nullable=True),
        sa.Column('carpet_area', sa.Numeric(10, 2), nullable=True),
        sa.Column('built_up_area', sa.Numeric(10, 2), nullable=True),
        sa.Column('land_area_acres', sa.Numeric(10, 4), nullable=True),

        # Rooms
        sa.Column('bedrooms', sa.SmallInteger, server_default='1'),
        sa.Column('bathrooms', sa.SmallInteger, server_default='1'),
        sa.Column('balconies', sa.SmallInteger, server_default='0'),
        sa.Column('floors_total', sa.SmallInteger, nullable=True),
        sa.Column('floor_number', sa.SmallInteger, nullable=True),
        sa.Column('parking_spaces', sa.SmallInteger, server_default='0'),

        # Pricing
        sa.Column('price', sa.Numeric(15, 2), nullable=False),
        sa.Column('price_per_sqft', sa.Numeric(10, 2), nullable=True),
        sa.Column('rental_yield', sa.Numeric(5, 2), nullable=True),
        sa.Column('maintenance_cost', sa.Numeric(10, 2), nullable=True),
        sa.Column('stamp_duty', sa.Numeric(12, 2), nullable=True),
        sa.Column('registration_fee', sa.Numeric(12, 2), nullable=True),

        # Features
        sa.Column('year_built', sa.SmallInteger, nullable=True),
        sa.Column('facing_direction', sa.String(20), nullable=True),
        sa.Column('furnishing', sa.String(50), server_default='unfurnished'),
        sa.Column('water_supply', sa.String(50), nullable=True),
        sa.Column('power_backup', sa.Boolean, server_default='false'),
        sa.Column('gated_community', sa.Boolean, server_default='false'),

        # Amenities (JSON)
        sa.Column('amenities', JSONB, server_default=text("'[]'::jsonb")),
        sa.Column('nearby_schools', JSONB, server_default=text("'[]'::jsonb")),

        # Nearby distances
        sa.Column('hospital_distance_km', sa.Numeric(5, 2), nullable=True),
        sa.Column('metro_distance_km', sa.Numeric(5, 2), nullable=True),
        sa.Column('airport_distance_km', sa.Numeric(6, 2), nullable=True),
        sa.Column('shopping_mall_distance_km', sa.Numeric(5, 2), nullable=True),

        # Analytics
        sa.Column('crime_rate', sa.Numeric(5, 2), nullable=True),
        sa.Column('population_density', sa.Numeric(10, 2), nullable=True),
        sa.Column('market_growth_pct', sa.Numeric(5, 2), nullable=True),
        sa.Column('avg_rent_per_month', sa.Numeric(12, 2), nullable=True),
        sa.Column('views_count', sa.Integer, server_default='0'),
        sa.Column('inquiries_count', sa.Integer, server_default='0'),

        # Media
        sa.Column('images', JSONB, server_default=text("'[]'::jsonb")),
        sa.Column('video_url', sa.Text, nullable=True),
        sa.Column('virtual_tour_url', sa.Text, nullable=True),

        # Metadata
        sa.Column('is_featured', sa.Boolean, server_default='false'),
        sa.Column('is_verified', sa.Boolean, server_default='false'),
        sa.Column('listed_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
        sa.Column('sold_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # Favorites table
    # ============================================================
    op.create_table(
        'favorites',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('property_id', UUID(as_uuid=True), sa.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
        sa.UniqueConstraint('user_id', 'property_id', name='uq_favorites_user_property'),
    )

    # ============================================================
    # Saved Searches table
    # ============================================================
    op.create_table(
        'saved_searches',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('search_criteria', JSONB, server_default=text("'{}'::jsonb")),
        sa.Column('notify_new_matches', sa.Boolean, server_default='true'),
        sa.Column('last_notified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # Price Alerts table
    # ============================================================
    op.create_table(
        'price_alerts',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('property_id', UUID(as_uuid=True), sa.ForeignKey('properties.id', ondelete='CASCADE'), nullable=True),
        sa.Column('city_id', sa.Integer, sa.ForeignKey('cities.id', ondelete='CASCADE'), nullable=True),
        sa.Column('category_id', sa.Integer, sa.ForeignKey('categories.id', ondelete='CASCADE'), nullable=True),
        sa.Column('target_price', sa.Numeric(15, 2), nullable=False),
        sa.Column('alert_type', sa.String(20), server_default='below'),
        sa.Column('threshold_pct', sa.Numeric(5, 2), nullable=True),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('last_triggered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # ML Models table
    # ============================================================
    op.create_table(
        'ml_models',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('version', sa.String(50), nullable=False),
        sa.Column('model_type', sa.String(100), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('training_data_points', sa.Integer, nullable=True),
        sa.Column('accuracy_score', sa.Numeric(5, 4), nullable=True),
        sa.Column('rmse', sa.Numeric(10, 4), nullable=True),
        sa.Column('mae', sa.Numeric(10, 4), nullable=True),
        sa.Column('r2_score', sa.Numeric(5, 4), nullable=True),
        sa.Column('features_used', JSONB, server_default=text("'[]'::jsonb")),
        sa.Column('hyperparameters', JSONB, server_default=text("'{}'::jsonb")),
        sa.Column('model_path', sa.Text, nullable=True),
        sa.Column('is_active', sa.Boolean, server_default='true'),
        sa.Column('trained_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
        sa.UniqueConstraint('name', 'version', name='uq_ml_models_name_version'),
    )

    # ============================================================
    # Price Predictions table
    # ============================================================
    op.create_table(
        'price_predictions',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")),
        sa.Column('property_id', UUID(as_uuid=True), sa.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False),
        sa.Column('model_id', UUID(as_uuid=True), sa.ForeignKey('ml_models.id', ondelete='CASCADE'), nullable=False),
        sa.Column('predicted_price', sa.Numeric(15, 2), nullable=False),
        sa.Column('confidence_lower', sa.Numeric(15, 2), nullable=True),
        sa.Column('confidence_upper', sa.Numeric(15, 2), nullable=True),
        sa.Column('confidence_score', sa.Numeric(5, 4), nullable=True),
        sa.Column('prediction_date', sa.Date, server_default=text("CURRENT_DATE")),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # Property Views (analytics) table
    # ============================================================
    op.create_table(
        'property_views',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")),
        sa.Column('property_id', UUID(as_uuid=True), sa.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('session_id', sa.String(255), nullable=True),
        sa.Column('ip_address', INET, nullable=True),
        sa.Column('user_agent', sa.Text, nullable=True),
        sa.Column('referrer', sa.Text, nullable=True),
        sa.Column('viewed_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # Search History table
    # ============================================================
    op.create_table(
        'search_history',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()")),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('session_id', sa.String(255), nullable=True),
        sa.Column('query_text', sa.Text, nullable=True),
        sa.Column('filters', JSONB, server_default=text("'{}'::jsonb")),
        sa.Column('results_count', sa.Integer, nullable=True),
        sa.Column('searched_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # Audit Log table
    # ============================================================
    op.create_table(
        'audit_log',
        sa.Column('id', sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(50), nullable=False),
        sa.Column('table_name', sa.String(100), nullable=False),
        sa.Column('record_id', UUID(as_uuid=True), nullable=True),
        sa.Column('old_values', JSONB, nullable=True),
        sa.Column('new_values', JSONB, nullable=True),
        sa.Column('ip_address', INET, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=text("NOW()")),
    )

    # ============================================================
    # INDEXES
    # ============================================================

    # Properties indexes
    op.create_index('idx_properties_city_id', 'properties', ['city_id'])
    op.create_index('idx_properties_category_id', 'properties', ['category_id'])
    op.create_index('idx_properties_owner_id', 'properties', ['owner_id'])
    op.create_index('idx_properties_property_type', 'properties', ['property_type'])
    op.create_index('idx_properties_listing_status', 'properties', ['listing_status'])
    op.create_index('idx_properties_price', 'properties', ['price'])
    op.create_index('idx_properties_area_sqft', 'properties', ['area_sqft'])
    op.create_index('idx_properties_bedrooms', 'properties', ['bedrooms'])
    op.create_index('idx_properties_bathrooms', 'properties', ['bathrooms'])
    op.create_index('idx_properties_created_at', 'properties', [sa.text('created_at DESC')])
    op.create_index('idx_properties_listed_at', 'properties', [sa.text('listed_at DESC')])
    op.create_index('idx_properties_is_featured', 'properties', ['is_featured'],
                     postgresql_where=sa.text('is_featured = true'))
    op.create_index('idx_properties_is_verified', 'properties', ['is_verified'],
                     postgresql_where=sa.text('is_verified = true'))
    op.create_index('idx_properties_city_price', 'properties', ['city_id', 'price'])
    op.create_index('idx_properties_type_price', 'properties', ['property_type', 'price'])
    op.create_index('idx_properties_bedrooms_price', 'properties', ['bedrooms', 'price'])
    op.execute(text("CREATE INDEX idx_properties_locality_trgm ON properties USING gin(locality gin_trgm_ops)"))
    op.execute(text("CREATE INDEX idx_properties_title_trgm ON properties USING gin(title gin_trgm_ops)"))

    # Favorites indexes
    op.create_index('idx_favorites_user_id', 'favorites', ['user_id'])
    op.create_index('idx_favorites_property_id', 'favorites', ['property_id'])

    # Saved searches indexes
    op.create_index('idx_saved_searches_user_id', 'saved_searches', ['user_id'])

    # Price alerts indexes
    op.create_index('idx_price_alerts_user_id', 'price_alerts', ['user_id'])
    op.create_index('idx_price_alerts_property_id', 'price_alerts', ['property_id'])
    op.create_index('idx_price_alerts_is_active', 'price_alerts', ['is_active'],
                     postgresql_where=sa.text('is_active = true'))

    # ML models indexes
    op.create_index('idx_ml_models_name', 'ml_models', ['name'])
    op.create_index('idx_ml_models_is_active', 'ml_models', ['is_active'],
                     postgresql_where=sa.text('is_active = true'))

    # Price predictions indexes
    op.create_index('idx_price_predictions_property_id', 'price_predictions', ['property_id'])
    op.create_index('idx_price_predictions_model_id', 'price_predictions', ['model_id'])
    op.create_index('idx_price_predictions_date', 'price_predictions', [sa.text('prediction_date DESC')])

    # Property views indexes
    op.create_index('idx_property_views_property_id', 'property_views', ['property_id'])
    op.create_index('idx_property_views_user_id', 'property_views', ['user_id'])
    op.create_index('idx_property_views_viewed_at', 'property_views', [sa.text('viewed_at DESC')])

    # Search history indexes
    op.create_index('idx_search_history_user_id', 'search_history', ['user_id'])
    op.create_index('idx_search_history_searched_at', 'search_history', [sa.text('searched_at DESC')])

    # Audit log indexes
    op.create_index('idx_audit_log_user_id', 'audit_log', ['user_id'])
    op.create_index('idx_audit_log_action', 'audit_log', ['action'])
    op.create_index('idx_audit_log_table_name', 'audit_log', ['table_name'])
    op.create_index('idx_audit_log_created_at', 'audit_log', [sa.text('created_at DESC')])

    # ============================================================
    # TRIGGERS
    # ============================================================
    op.execute(text("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    """))

    for table in ['users', 'properties', 'saved_searches', 'ml_models']:
        op.execute(text(f"""
            CREATE TRIGGER trg_{table}_updated_at
                BEFORE UPDATE ON {table}
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        """))

    # ============================================================
    # SEED DATA - Cities
    # ============================================================
    op.execute(text("""
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
    """))

    # ============================================================
    # SEED DATA - Categories
    # ============================================================
    op.execute(text("""
        INSERT INTO categories (name, slug, description, icon) VALUES
        ('Residential', 'residential', 'Houses, apartments, villas, and residential plots', 'home'),
        ('Commercial', 'commercial', 'Office spaces, shops, showrooms, and commercial complexes', 'building'),
        ('Industrial', 'industrial', 'Warehouses, factories, and industrial plots', 'factory'),
        ('Agricultural', 'agricultural', 'Farmland, agricultural land, and plantations', 'leaf'),
        ('Mixed Use', 'mixed-use', 'Properties with combined residential and commercial use', 'layers')
        ON CONFLICT (name) DO NOTHING;
    """))

    # ============================================================
    # SEED DATA - Users
    # ============================================================
    op.execute(text("""
        INSERT INTO users (email, password_hash, full_name, phone, role, is_verified, is_active) VALUES
        ('admin@realestate.com', '$2b$12$LJ3m4ys4IhYg.5QZ5x5YNeYhPq5V7M9R5q4v2K4v1M3N5b6c7d8e', 'Platform Admin', '+91-9876543210', 'admin', TRUE, TRUE),
        ('test@realestate.com', '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', '+91-9876543211', 'buyer', TRUE, TRUE)
        ON CONFLICT (email) DO NOTHING;
    """))

    # ============================================================
    # SEED DATA - ML Models
    # ============================================================
    op.execute(text("""
        INSERT INTO ml_models (name, version, model_type, description, is_active) VALUES
        ('Price Predictor v1', '1.0.0', 'gradient_boosting', 'XGBoost model for property price prediction based on features', TRUE),
        ('Market Trend Analyzer', '1.0.0', 'lstm', 'LSTM model for market trend analysis and forecasting', TRUE),
        ('Demand Forecaster', '1.0.0', 'prophet', 'Prophet model for housing demand forecasting', TRUE)
        ON CONFLICT (name, version) DO NOTHING;
    """))


def downgrade() -> None:
    # Drop tables in reverse order
    tables = [
        'audit_log', 'search_history', 'property_views',
        'price_predictions', 'price_alerts', 'saved_searches',
        'favorites', 'properties', 'ml_models',
        'categories', 'cities', 'users'
    ]
    for table in tables:
        op.drop_table(table)

    # Drop enum types
    op.execute(text("DROP TYPE IF EXISTS user_role_enum"))
    op.execute(text("DROP TYPE IF EXISTS property_condition_enum"))
    op.execute(text("DROP TYPE IF EXISTS listing_status_enum"))
    op.execute(text("DROP TYPE IF EXISTS property_type_enum"))
