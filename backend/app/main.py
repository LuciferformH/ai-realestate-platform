from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.routes import auth, properties, analytics, ml, admin, reports

# Import all models to register them
from app.models import User, Property, City, Category, Favorite, SavedSearch, PriceAlert, MLModel


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    docs_url=f"{settings.API_V1_PREFIX}/docs",
    redoc_url=f"{settings.API_V1_PREFIX}/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(properties.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(ml.router, prefix=settings.API_V1_PREFIX)
app.include_router(admin.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}


@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": f"{settings.API_V1_PREFIX}/docs",
        "health": "/health",
    }


@app.get("/seed", tags=["Seed"])
def seed_database():
    from app.core.database import SessionLocal
    from app.core.security import get_password_hash
    from app.models.user import User
    from app.models.property import Property
    import random

    CITIES = [
        {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777, "weight": 0.12, "price_mult": 3.0},
        {"name": "Delhi", "state": "Delhi", "lat": 28.7041, "lng": 77.1025, "weight": 0.11, "price_mult": 2.5},
        {"name": "Bangalore", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946, "weight": 0.10, "price_mult": 2.0},
        {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867, "weight": 0.09, "price_mult": 1.5},
        {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707, "weight": 0.08, "price_mult": 1.6},
        {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567, "weight": 0.08, "price_mult": 1.8},
        {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639, "weight": 0.07, "price_mult": 1.2},
        {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714, "weight": 0.06, "price_mult": 1.0},
        {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873, "weight": 0.05, "price_mult": 0.9},
        {"name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462, "weight": 0.05, "price_mult": 0.8},
        {"name": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lng": 76.7794, "weight": 0.04, "price_mult": 1.3},
        {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lng": 76.2673, "weight": 0.04, "price_mult": 1.1},
        {"name": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lng": 75.8577, "weight": 0.03, "price_mult": 0.7},
        {"name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lng": 77.4126, "weight": 0.03, "price_mult": 0.7},
        {"name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lng": 79.0882, "weight": 0.03, "price_mult": 0.7},
        {"name": "Surat", "state": "Gujarat", "lat": 21.1702, "lng": 72.8311, "weight": 0.03, "price_mult": 0.8},
        {"name": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lng": 83.2185, "weight": 0.02, "price_mult": 0.8},
        {"name": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lng": 76.9558, "weight": 0.02, "price_mult": 0.9},
        {"name": "Mysore", "state": "Karnataka", "lat": 12.2958, "lng": 76.6394, "weight": 0.02, "price_mult": 0.8},
        {"name": "Goa", "state": "Goa", "lat": 15.2993, "lng": 74.1240, "weight": 0.02, "price_mult": 1.4},
    ]

    LOCALITIES = {
        "Mumbai": ["Bandra", "Andheri", "Juhu", "Powai", "Worli", "Lower Parel", "Thane", "Navi Mumbai"],
        "Delhi": ["Connaught Place", "Dwarka", "Rohini", "Lajpat Nagar", "Saket", "Vasant Kunj"],
        "Bangalore": ["Whitefield", "Koramangala", "Indiranagar", "HSR Layout", "BTM Layout", "Marathahalli"],
        "Hyderabad": ["Gachibowli", "Hitech City", "Madhapur", "Jubilee Hills", "Banjara Hills"],
        "Chennai": ["T. Nagar", "Anna Nagar", "Adyar", "Velachery", "OMR"],
        "Pune": ["Kothrud", "Hinjewadi", "Wakad", "Baner", "Viman Nagar"],
        "Kolkata": ["Salt Lake", "Park Street", "New Town", "Ballygunge"],
        "Ahmedabad": ["SG Highway", "Satellite", "Vastrapur", "Bopal"],
        "Jaipur": ["Malviya Nagar", "Mansarovar", "Vaishali Nagar"],
        "Lucknow": ["Gomti Nagar", "Hazratganj", "Indira Nagar"],
    }
    PROPERTY_TYPES = ["house", "apartment", "condo", "townhouse", "land", "commercial"]
    AMENITIES = ["Swimming Pool", "Gym", "Park", "Security", "CCTV", "Power Backup", "Elevator", "Club House"]

    db = SessionLocal()
    try:
        existing = db.query(User).count()
        if existing > 0:
            return {"message": f"Database already seeded with {existing} users"}

        admin = User(email="admin@realestate.com", hashed_password=get_password_hash("admin123"), full_name="Admin User", is_superuser=True, role="admin", phone="+91 9876543210")
        test_user = User(email="test@realestate.com", hashed_password=get_password_hash("test123"), full_name="Test User", role="user", phone="+91 9876543211")
        analyst = User(email="analyst@realestate.com", hashed_password=get_password_hash("analyst123"), full_name="Data Analyst", role="analyst", phone="+91 9876543212")
        db.add_all([admin, test_user, analyst])
        db.commit()
        db.refresh(admin)

        city_data = {c["name"]: c for c in CITIES}
        city_names = [c["name"] for c in CITIES]
        city_weights = [c["weight"] for c in CITIES]
        properties = []

        for _ in range(500):
            cn = random.choices(city_names, weights=city_weights, k=1)[0]
            cd = city_data[cn]
            loc = random.choice(LOCALITIES.get(cn, ["Main Area"]))
            bt = random.choices([1, 2, 3, 4, 5], weights=[15, 25, 30, 18, 12], k=1)[0]
            ba = min(bt, random.choices([1, 2, 3], weights=[20, 40, 40], k=1)[0])
            area = random.randint(400, 500) + bt * random.randint(200, 400)
            pt = random.choices(PROPERTY_TYPES, weights=[35, 30, 15, 10, 5, 5], k=1)[0]
            price = round((500000 + area * random.randint(2000, 8000)) * cd["price_mult"] * random.uniform(0.7, 1.3), -4)

            properties.append(Property(
                title=f"{pt.title()} in {loc}, {cn}", property_type=pt, price=price, city=cn, locality=loc,
                address=f"{random.randint(1, 500)}, {loc}, {cn}", latitude=cd["lat"] + random.uniform(-0.05, 0.05),
                longitude=cd["lng"] + random.uniform(-0.05, 0.05), bedrooms=bt, bathrooms=ba,
                parking=random.randint(0, min(3, bt)), furnished=random.random() < 0.4, area=area,
                year_built=random.randint(1995, 2024), property_age=random.randint(1, 30),
                description=f"Beautiful {pt} in {loc}", images=[], amenities=random.sample(AMENITIES, k=random.randint(3, 6)),
                hospital_distance=round(random.uniform(0.5, 10.0), 1), metro_distance=round(random.uniform(0.3, 15.0), 1),
                crime_rate=round(random.uniform(1.0, 8.0), 1), rental_yield=round(random.uniform(2.0, 8.0), 2),
                market_growth=round(random.uniform(1.0, 15.0), 2), population=random.randint(100000, 10000000),
                is_featured=random.random() < 0.1, is_active=True, owner_id=admin.id,
            ))

        db.add_all(properties)
        db.commit()
        return {"message": "Database seeded!", "users": 3, "properties": 500}
    finally:
        db.close()
