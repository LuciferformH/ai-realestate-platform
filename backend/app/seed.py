"""
Seed script to populate the database with sample data.
Run: cd backend && python -m app.seed
"""
import random
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, SessionLocal, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.property import Property
from app.models.ml_model import MLModel

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
    "Mumbai": ["Bandra", "Andheri", "Juhu", "Powai", "Worli", "Lower Parel", "Thane", "Navi Mumbai", "Borivali", "Malad"],
    "Delhi": ["Connaught Place", "Dwarka", "Rohini", "Lajpat Nagar", "Saket", "Vasant Kunj", "Greater Kailash", "Karol Bagh"],
    "Bangalore": ["Whitefield", "Koramangala", "Indiranagar", "HSR Layout", "BTM Layout", "Marathahalli", "Electronic City"],
    "Hyderabad": ["Gachibowli", "Hitech City", "Madhapur", "Jubilee Hills", "Banjara Hills", "Kondapur"],
    "Chennai": ["T. Nagar", "Anna Nagar", "Adyar", "Velachery", "OMR", "Porur"],
    "Pune": ["Kothrud", "Hinjewadi", "Wakad", "Baner", "Viman Nagar", "Kharadi"],
    "Kolkata": ["Salt Lake", "Park Street", "New Town", "Ballygunge", "EM Bypass"],
    "Ahmedabad": ["SG Highway", "Satellite", "Vastrapur", "Bopal", "Thaltej"],
    "Jaipur": ["Malviya Nagar", "Mansarovar", "Vaishali Nagar", "Jagatpura"],
    "Lucknow": ["Gomti Nagar", "Hazratganj", "Indira Nagar", "Aashiana"],
}

PROPERTY_TYPES = ["house", "apartment", "condo", "townhouse", "land", "commercial"]
AMENITIES = ["Swimming Pool", "Gym", "Park", "Security", "CCTV", "Power Backup", "Elevator", "Club House", "Children Play Area", "Jogging Track", "Wifi", "Servant Room", "Study Room", "Modular Kitchen", "Wardrobe", "AC", "Garden", "Terrace"]
SCHOOLS = ["Delhi Public School", "Kendriya Vidyalaya", "DAV School", "St. Xavier's", "Ryan International School", "The Doon School"]


def create_users(db):
    admin = User(
        email="admin@realestate.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin User",
        is_superuser=True,
        role="admin",
        phone="+91 9876543210",
    )
    test_user = User(
        email="test@realestate.com",
        hashed_password=get_password_hash("test123"),
        full_name="Test User",
        role="user",
        phone="+91 9876543211",
    )
    analyst = User(
        email="analyst@realestate.com",
        hashed_password=get_password_hash("analyst123"),
        full_name="Data Analyst",
        role="analyst",
        phone="+91 9876543212",
    )
    db.add_all([admin, test_user, analyst])
    db.commit()
    db.refresh(admin)
    db.refresh(test_user)
    return admin, test_user


def generate_properties(db, owner_id, count=500):
    properties = []
    city_weights = [c["weight"] for c in CITIES]
    city_names = [c["name"] for c in CITIES]
    city_data = {c["name"]: c for c in CITIES}

    for i in range(count):
        city_name = random.choices(city_names, weights=city_weights, k=1)[0]
        cd = city_data[city_name]
        locality = random.choice(LOCALITIES.get(city_name, ["Main Area"]))

        bedrooms = random.choices([1, 2, 3, 4, 5, 6], weights=[15, 25, 30, 18, 8, 4], k=1)[0]
        bathrooms = min(bedrooms, random.choices([1, 2, 3, 4, 5], weights=[20, 35, 25, 15, 5], k=1)[0])
        area = random.randint(400, 500) + bedrooms * random.randint(200, 400)
        prop_type = random.choices(PROPERTY_TYPES, weights=[35, 30, 15, 10, 5, 5], k=1)[0]
        year_built = random.randint(1995, 2024)
        parking = random.randint(0, min(3, bedrooms))
        furnished = random.random() < 0.4

        base_price = (500000 + area * random.randint(2000, 8000)) * cd["price_mult"]
        price = round(base_price * random.uniform(0.7, 1.3), -4)

        hospital_dist = round(random.uniform(0.5, 10.0), 1)
        metro_dist = round(random.uniform(0.3, 15.0), 1)
        crime_rate = round(random.uniform(1.0, 8.0), 1)
        rental_yield = round(random.uniform(2.0, 8.0), 2)
        market_growth = round(random.uniform(1.0, 15.0), 2)
        population = random.randint(100000, 10000000)

        lat = cd["lat"] + random.uniform(-0.05, 0.05)
        lng = cd["lng"] + random.uniform(-0.05, 0.05)

        prop = Property(
            title=f"{prop_type.title()} in {locality}, {city_name}",
            property_type=prop_type,
            price=price,
            city=city_name,
            locality=locality,
            address=f"{random.randint(1, 500)}, {locality}, {city_name}, {cd['state']}",
            latitude=lat,
            longitude=lng,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            parking=parking,
            furnished=furnished,
            area=area,
            year_built=year_built,
            property_age=2025 - year_built,
            description=f"Beautiful {prop_type} in prime {locality} location. {bedrooms} BHK with {bathrooms} bathrooms, {area} sqft area. {random.choice(AMENITIES)}. Close to schools, hospitals, and metro.",
            images=[],
            amenities=random.sample(AMENITIES, k=random.randint(3, 8)),
            nearby_schools=random.sample(SCHOOLS, k=random.randint(1, 3)),
            hospital_distance=hospital_dist,
            metro_distance=metro_dist,
            crime_rate=crime_rate,
            population=population,
            rental_yield=rental_yield,
            market_growth=market_growth,
            is_featured=random.random() < 0.1,
            is_active=True,
            owner_id=owner_id,
        )
        properties.append(prop)

    db.add_all(properties)
    db.commit()
    print(f"  Created {len(properties)} properties")
    return properties


def main():
    print("Seeding database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    existing = db.query(User).count()
    if existing > 0:
        print(f"  Database already has {existing} users. Skipping seed.")
        db.close()
        return

    admin, test_user = create_users(db)
    print("  Created users: admin@realestate.com, test@realestate.com, analyst@realestate.com")

    generate_properties(db, admin.id, count=500)

    print("Database seeded successfully!")
    db.close()


if __name__ == "__main__":
    main()
