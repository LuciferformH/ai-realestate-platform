#!/usr/bin/env python3
"""
AI Real Estate Insights Platform - Property Seed Data Generator
Generates 100,000+ realistic Indian property listings.
"""

import csv
import json
import random
import uuid
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Tuple

random.seed(42)

# ============================================================
# CITY CONFIGURATION
# ============================================================
CITIES = {
    "Mumbai": {
        "state": "Maharashtra",
        "lat": 19.0760, "lon": 72.8777,
        "population": 20411274,
        "price_range": (5_000_000, 50_000_000),
        "rent_range": (25_000, 3_00_000),
        "localities": [
            "Bandra", "Andheri", "Powai", "Juhu", "Worli", "Lower Parel",
            "Malad", "Borivali", "Kandivali", "Thane", "Navi Mumbai",
            "Dadar", "Matunga", "Sion", "Goregaon", "Kurla", "Chembur",
            "Mulund", "Bhandup", "Vikhroli", "Chakala", "MIDC",
            "Andheri East", "BKC", "Colaba", "Fort", "Nariman Point",
            "Marine Drive", "Churchgate", "Parel", "Hindu Colony",
            "Vashi", "Belapur", "Kharghar", "Panvel", "Ulwe", "Dombivli"
        ],
        "landmarks": ["Gateway of India", "Marine Drive", "Bandra-Worli Sea Link", "Chhatrapati Shivaji Terminus"],
        "is_metro": True
    },
    "Delhi": {
        "state": "Delhi",
        "lat": 28.7041, "lon": 77.1025,
        "population": 16787941,
        "price_range": (3_000_000, 30_000_000),
        "rent_range": (15_000, 2_00_000),
        "localities": [
            "Lajpat Nagar", "Dwarka", "Rohini", "Saket", "Vasant Kunj",
            "South Delhi", "Central Delhi", "East Delhi", "West Delhi",
            "North Delhi", "New Delhi", "Connaught Place", "Karol Bagh",
            "Nehru Place", "Okhla", "Defence Colony", "Greater Kailash",
            "Hauz Khas", "Malviya Nagar", "Green Park", "RK Puram",
            "Pitampura", "Paschim Vihar", "Janakpuri", "Uttam Nagar",
            "Noida Extension", "Gurgaon", "Faridabad", "Ghaziabad"
        ],
        "landmarks": ["India Gate", "Red Fort", "Qutub Minar", "Lotus Temple"],
        "is_metro": True
    },
    "Bangalore": {
        "state": "Karnataka",
        "lat": 12.9716, "lon": 77.5946,
        "population": 12349320,
        "price_range": (2_000_000, 20_000_000),
        "rent_range": (12_000, 1_50_000),
        "localities": [
            "Koramangala", "Indiranagar", "Whitefield", "Electronic City",
            "HSR Layout", "BTM Layout", "Jayanagar", "JP Nagar",
            "Banashankari", "Marathahalli", "Sarjapur Road", "Bellandur",
            "Hebbal", "Yelahanka", "Rajajinagar", "Malleshwaram",
            "Basavanagudi", "JP Nagar 5th Phase", "Bannerghatta Road",
            "Kanakapura Road", "Hennur", "Lingadheeranahalli",
            "RR Nagar", "Peenya", "Jigani", "Anekal", "Devanahalli",
            "Varthur", "Gunjur", "Carmelaram", "Bommanahalli"
        ],
        "landmarks": ["Vidhana Soudha", "Cubbon Park", "Lalbagh", "ISKCON Temple"],
        "is_metro": True
    },
    "Hyderabad": {
        "state": "Telangana",
        "lat": 17.3850, "lon": 78.4867,
        "population": 10004144,
        "price_range": (2_000_000, 18_000_000),
        "rent_range": (10_000, 1_20_000),
        "localities": [
            "Gachibowli", "Hitech City", "Kondapur", "Madhapur",
            "Kukatpally", "Miyapur", "LB Nagar", "Dilshuknagar",
            "Secunderabad", "Banjara Hills", "Jubilee Hills",
            "Banjara Hills", "Begumpet", "Ameerpet", "SR Nagar",
            "KPHB", "Nizampet", "Pragathi Nagar", "Manikonda",
            "Narsingi", "Nanakramguda", "Financial District",
            "Kokapet", "Tellapur", "Bachupally", "Nallagandla"
        ],
        "landmarks": ["Charminar", "Golconda Fort", "Hussain Sagar", "Ramoji Film City"],
        "is_metro": True
    },
    "Chennai": {
        "state": "Tamil Nadu",
        "lat": 13.0827, "lon": 80.2707,
        "population": 10971108,
        "price_range": (2_000_000, 18_000_000),
        "rent_range": (10_000, 1_20_000),
        "localities": [
            "Adyar", "Anna Nagar", "T. Nagar", "Velachery", "OMR",
            "ECR", "Porur", "Mogappair", "Ambattur", "Tambaram",
            "Sholinganallur", "Pallikaranai", "Perumbakkam",
            "Chromepet", "Thoraipakkam", "Padur", "Kelambakkam",
            "Urapakkam", "Guduvanchery", "Maraimalai Nagar",
            "Nungambakkam", "Chetpet", "Royapettah", "Mylapore"
        ],
        "landmarks": ["Marina Beach", "Kapaleeshwarar Temple", "Fort St. George"],
        "is_metro": True
    },
    "Pune": {
        "state": "Maharashtra",
        "lat": 18.5204, "lon": 73.8567,
        "population": 7426310,
        "price_range": (2_500_000, 20_000_000),
        "rent_range": (12_000, 1_50_000),
        "localities": [
            "Kharadi", "Wadgaon Sheri", "Hinjewadi", "Wakad",
            "Baner", "Aundh", "Kothrud", "Swargate", "Shivajinagar",
            "Deccan", "Camp", "Hadapsar", "Undri", "Fursungi",
            "Manjri", "Saswad", "Talawade", "Chakan", "Bhosari",
            "Pimpri", "Chinchwad", "Nigdi", "Akurdi", "Ravet",
            "Bavdhan", "Mundhwa", "Kharadi", "Viman Nagar", "Kalyani Nagar"
        ],
        "landmarks": ["Shaniwar Wada", "Aga Khan Palace", "Sinhagad Fort"],
        "is_metro": True
    },
    "Kolkata": {
        "state": "West Bengal",
        "lat": 22.5726, "lon": 88.3639,
        "population": 14850321,
        "price_range": (1_500_000, 15_000_000),
        "rent_range": (8_000, 1_00_000),
        "localities": [
            "Salt Lake", "New Town", "EM Bypass", "Park Street",
            "Ballygunge", "Alipore", "Jadavpur", "Tollygunge",
            "Behala", "Bhowanipore", "Garia", "Kasba",
            "Rajpur Sonarpur", "Baruipur", "Dum Dum", "Lake Town",
            "Bangur", "Kaikhali", "Nagerbazar", "Ultadanga"
        ],
        "landmarks": ["Victoria Memorial", "Howrah Bridge", "Indian Museum"],
        "is_metro": True
    },
    "Ahmedabad": {
        "state": "Gujarat",
        "lat": 23.0225, "lon": 72.5714,
        "population": 8088726,
        "price_range": (1_500_000, 15_000_000),
        "rent_range": (7_000, 80_000),
        "localities": [
            "SG Highway", "Thaltej", "Bodakdev", "Vastrapur",
            "Satellite", "Paldi", "Navrangpura", "CG Road",
            "Ashram Road", "Science City", "Sola", "Gota",
            "Chandkheda", "Motera", "Sabarmati", "Vastral",
            "Naroda", "Nikol", "Vatva", "Odha", "Sanand"
        ],
        "landmarks": ["Sabarmati Ashram", "Adalaj Stepwell", "Sidi Saiyyed Mosque"],
        "is_metro": True
    },
    "Jaipur": {
        "state": "Rajasthan",
        "lat": 26.9124, "lon": 75.7873,
        "population": 3909333,
        "price_range": (1_200_000, 12_000_000),
        "rent_range": (6_000, 60_000),
        "localities": [
            "Mansarovar", "Vaishali Nagar", "Malviya Nagar",
            "Jagatpura", "Mansarovar Extension", "Tonk Road",
            "Ajmer Road", "Station Road", "MI Road", "C-Scheme",
            "Civil Lines", "Lal Kothi", "Bais Godam", "Chomu House",
            "Raja Park", "Shyam Nagar", "Pratap Nagar", "Murlipura",
            "Sanganer", "Vidhyadhar Nagar", "Jhotwara"
        ],
        "landmarks": ["Hawa Mahal", "Amber Fort", "City Palace", "Jantar Mantar"],
        "is_metro": True
    },
    "Lucknow": {
        "state": "Uttar Pradesh",
        "lat": 26.8467, "lon": 80.9462,
        "population": 3681713,
        "price_range": (1_000_000, 10_000_000),
        "rent_range": (5_000, 50_000),
        "localities": [
            "Gomti Nagar", "Hazratganj", "Alambagh", "Aashiana",
            "Indira Nagar", "Vikas Nagar", "Aminabad", "Chowk",
            "Mahanagar", "Telibagh", "Faizabad Road", "Sushant Golf City",
            "Amar Shaheed Path", "Vrindavan Yojana", "Jankipuram",
            "Aliganj", "IT City", "Sector H", "Patrakarpuram"
        ],
        "landmarks": ["Bara Imambara", "Rumi Darwaza", "British Residency"],
        "is_metro": True
    },
    "Chandigarh": {
        "state": "Chandigarh",
        "lat": 30.7333, "lon": 76.7794,
        "population": 1055450,
        "price_range": (2_000_000, 15_000_000),
        "rent_range": (8_000, 70_000),
        "localities": [
            "Sector 17", "Sector 22", "Sector 35", "Sector 44",
            "Sector 70", "Sector 71", "Aerocity", "Mullanpur",
            "Zirakpur", "Panchkula", "Mohali", "IT City",
            "Knowledge Park", "Sector 82", "Sector 85", "Sector 88"
        ],
        "landmarks": ["Rock Garden", "Sukhna Lake", "Rose Garden"],
        "is_metro": False
    },
    "Kochi": {
        "state": "Kerala",
        "lat": 9.9312, "lon": 76.2673,
        "population": 2117990,
        "price_range": (1_500_000, 12_000_000),
        "rent_range": (7_000, 70_000),
        "localities": [
            "Kakkanad", "Infopark", "Seaport-Airport Road", "Edappally",
            "Palarivattom", "Vytilla", "Marine Drive", "Fort Kochi",
            "Mattancherry", "Ernakulam", "Aluva", "Perumbavoor",
            "Kalamassery", "Thripunithura", "Munambam", "Cherai"
        ],
        "landmarks": ["Chinese Fishing Nets", "Fort Kochi", "Mattancherry Palace"],
        "is_metro": False
    },
    "Indore": {
        "state": "Madhya Pradesh",
        "lat": 22.7196, "lon": 75.8577,
        "population": 3276697,
        "price_range": (800_000, 8_000_000),
        "rent_range": (4_000, 40_000),
        "localities": [
            "Vijay Nagar", "Palasia", "Sapna Sangeeta", "AB Road",
            "Rajwada", "MG Road", "Scheme 78", "Scheme 94",
            "Scheme 114", "Bicholi Mardana", "Super Corridor",
            "AB Bypass", "Pithampur", "Mhow", "Depalpur", "Sanwer"
        ],
        "landmarks": ["Rajwada", "Lal Bagh Palace", "Sarafa Bazaar"],
        "is_metro": False
    },
    "Bhopal": {
        "state": "Madhya Pradesh",
        "lat": 23.2599, "lon": 77.4126,
        "population": 2371061,
        "price_range": (700_000, 7_000_000),
        "rent_range": (4_000, 35_000),
        "localities": [
            "MP Nagar", "Kolar Road", "Hoshangabad Road", "6 No Stop",
            "1100 Quarter", "Arera Colony", "Bittan Market",
            "Kasturba Nagar", "Shahpura", "Bairagarh", "Ayodhya Nagar",
            "New Market", "TT Nagar", "Char Imli", "Bagh Sewania"
        ],
        "landmarks": ["Upper Lake", "Taj-ul-Masajid", "Bharat Bhavan"],
        "is_metro": False
    },
    "Nagpur": {
        "state": "Maharashtra",
        "lat": 21.1458, "lon": 79.0882,
        "population": 2405665,
        "price_range": (800_000, 8_000_000),
        "rent_range": (4_000, 40_000),
        "localities": [
            "Wardhaman Nagar", "Dharampeth", "Sadar", "Civil Lines",
            "Dhantoli", "Sitabuldi", "Itwari", "Mahal", "Sonegaon",
            "Hingna", "Wardha Road", "Kamptee", "Khapri",
            "MIHAN", "Butibori", "Nagpur South", "Ramdaspeth"
        ],
        "landmarks": ["Deekshabhoomi", "Futala Lake", "Sitabuldi Fort"],
        "is_metro": False
    },
    "Surat": {
        "state": "Gujarat",
        "lat": 21.1702, "lon": 72.8311,
        "population": 4467797,
        "price_range": (1_000_000, 10_000_000),
        "rent_range": (5_000, 50_000),
        "localities": [
            "Athwa", "Adajan", "Vesu", "Piplod", "Dumas Road",
            "City Light", "Ring Road", "Veer Nariman Road",
            "Nanpura", "Rustampura", "Bhatar", "Udhna", "Sachin",
            "Kapodra", "Parvat Patiya", "Sultanabad", "Althan"
        ],
        "landmarks": ["Dutch Garden", "Surat Castle", "Dumas Beach"],
        "is_metro": False
    },
    "Visakhapatnam": {
        "state": "Andhra Pradesh",
        "lat": 17.6868, "lon": 83.2185,
        "population": 1728128,
        "price_range": (1_200_000, 10_000_000),
        "rent_range": (5_000, 50_000),
        "localities": [
            "MVP Colony", "Dwaraka Nagar", "RTC Complex", "Muralinagar",
            "Seethammadhara", "Patrolunka", "Madhurawada",
            "Gajuwaka", "Kanaka Mamidi", "Rushikonda",
            "Bheemili", "Anakapalle", "Tagarapuvalasa", "Padmanabham"
        ],
        "landmarks": ["RK Beach", "Kailasagiri", "INS Kurusura"],
        "is_metro": False
    },
    "Coimbatore": {
        "state": "Tamil Nadu",
        "lat": 11.0168, "lon": 76.9558,
        "population": 1601438,
        "price_range": (1_000_000, 10_000_000),
        "rent_range": (5_000, 50_000),
        "localities": [
            "Gandhipuram", "RS Puram", "Peelamedu", "Avinashi Road",
            "Avinashi", "Sitra", "Vilankurichi", "Selvapuram",
            "Race Course", "Tatabad", "Mettupalayam", "Sulur",
            "Annur", "Kinathukadavu", "Pollachi", "Perur"
        ],
        "landmarks": ["Marudhamalai Temple", "VOC Park", "Perur Pateeswarar Temple"],
        "is_metro": False
    },
    "Mysore": {
        "state": "Karnataka",
        "lat": 12.2958, "lon": 76.6394,
        "population": 983795,
        "price_range": (800_000, 8_000_000),
        "rent_range": (4_000, 40_000),
        "localities": [
            "Vani Vilas Mohalla", "Jayalakshmipuram", "Gokulam",
            "Saraswathipuram", "Siddarth Nagar", "Nazarbad",
            "Sharadadevi Nagar", "Kuvempu Nagar", "Hebbal",
            "Hootagalli", "Nanjangud", "Bannimantap",
            "Srirampura", "Kesare", "Alanahalli"
        ],
        "landmarks": ["Mysore Palace", "Chamundi Hills", "Brindavan Gardens"],
        "is_metro": False
    },
    "Goa": {
        "state": "Goa",
        "lat": 15.2993, "lon": 74.1240,
        "population": 1457724,
        "price_range": (1_500_000, 15_000_000),
        "rent_range": (8_000, 80_000),
        "localities": [
            "Panaji", "Mapusa", "Margao", "Vasco da Gama",
            "Calangute", "Baga", "Anjuna", "Candolim",
            "Sinquerim", "Aguada", "Assagao", "Siolim",
            "Chicalim", "Dabolim", "Colva", "Benaulim",
            "Cavelossim", "Varca", "Palolem", "Agonda"
        ],
        "landmarks": ["Basilica of Bom Jesus", "Fort Aguada", "Dudhsagar Falls"],
        "is_metro": False
    }
}

# ============================================================
# AMENITIES DATABASE
# ============================================================
AMENITIES = {
    "residential": [
        "Swimming Pool", "Gymnasium", "Club House", "Children's Play Area",
        "Landscaped Gardens", "24/7 Security", "CCTV Surveillance",
        "Intercom Facility", "Power Backup", "Lift", "Fire Safety",
        "Rain Water Harvesting", "Sewage Treatment Plant", "Community Hall",
        "Jogging Track", "Yoga Room", "Meditation Hall", "Library",
        "Wi-Fi Ready", "Modular Kitchen", "Wardrobe", "AC Units",
        "Solar Panels", "EV Charging Station", "Servant Room", "Store Room",
        "Pooja Room", "Study Room", "Home Theater", "Private Garden",
        "Terrace Garden", "Barbeque Area", "Pet Friendly", "Gated Community",
        "Concierge Service", "Valet Parking", "Basketball Court",
        "Tennis Court", "Badminton Court", "Table Tennis", "Billiards",
        "Mini Theatre", "Party Hall", "Senior Citizen Area", "Cricket Practice Net"
    ],
    "commercial": [
        "24/7 Security", "CCTV Surveillance", "Power Backup", "Lift",
        "Visitor Parking", "Conference Room", "Reception Area",
        "Fire Safety", "High Speed Internet", "Central AC",
        "Modular Flooring", "Glass Facade", "Branded Elevators",
        "DG Set", "ATS System", "Biometric Access", "Server Room",
        "Open Workspace", "Private Cabins", "Pantry", "Restrooms",
        "Loading Dock", "Freight Elevator", "Signage Space"
    ]
}

SCHOOLS = [
    "Delhi Public School", "Kendriya Vidyalaya", "DAV Public School",
    "St. Xavier's School", "The Doon School", "Bishop Cotton School",
    "Sainik School", "Navodaya Vidyalaya", "Ryan International School",
    "GD Goenka Public School", "DPS R K Puram", "Amity International School",
    "The Shri Ram School", "Inodvaale School", "Pathways School",
    "Greenwood High", "Chrysalis High", "The Valley School",
    "Vibgyor High", "TISB", "NPS International", "Orchids International"
]

Facing = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"]
Furnishing = ["unfurnished", "semi-furnished", "fully-furnished"]
Condition = ["new", "excellent", "good", "fair"]
WaterSupply = ["24x7", "borewell", "municipal", "borewell+municipal"]

# ============================================================
# HELPER FUNCTIONS
# ============================================================
def generate_uuid() -> str:
    return str(uuid.uuid4())


def generate_property_title(city: str, locality: str, bedrooms: int, property_type: str) -> str:
    prefixes = [
        f"Spacious {bedrooms}BHK in {locality}",
        f"Premium {bedrooms}BHK Apartment in {locality}",
        f"Modern {bedrooms}BHK Flat in {locality}",
        f"Beautiful {bedrooms}BHK Home in {locality}",
        f"Elegant {bedrooms}BHK Villa in {locality}",
        f"Luxury {bedrooms}BHK Residence in {locality}",
        f"Contemporary {bedrooms}BHK Unit in {locality}",
        f"Affordable {bedrooms}BHK in {locality}",
        f"Prime Location {bedrooms}BHK in {locality}",
        f"Ready to Move {bedrooms}BHK in {locality}",
        f"New Construction {bedrooms}BHK in {locality}",
        f"Corner {bedrooms}BHK Apartment in {locality}",
        f"East Facing {bedrooms}BHK in {locality}",
        f"Park View {bedrooms}BHK in {locality}",
        f"Lake Facing {bedrooms}BHK in {locality}",
        f"High Rise {bedrooms}BHK in {locality}",
        f"Gated Community {bedrooms}BHK in {locality}",
        f"Stunning {bedrooms}BHK Penthouse in {locality}",
        f"Cozy {bedrooms}BHK Studio in {locality}",
        f"Renovated {bedrooms}BHK in {locality}"
    ]
    return random.choice(prefixes)


def generate_description(city: str, locality: str, bedrooms: int, bathrooms: int,
                         area_sqft: int, price: int, amenities: List[str]) -> str:
    templates = [
        f"This stunning {bedrooms}BHK apartment in {locality}, {city} offers {area_sqft} sqft of luxurious living space. "
        f"With {bathrooms} modern bathrooms and premium finishes throughout, this property is perfect for families. "
        f"Located close to major IT hubs, schools, and hospitals, this home offers excellent connectivity. "
        f"The property features {', '.join(amenities[:5])} and more. Available at an attractive price of ₹{price:,.0f}.",

        f"Discover your dream home in the heart of {locality}, {city}. This beautifully designed {bedrooms}BHK "
        f"spans {area_sqft} sqft and boasts {bathrooms} well-appointed bathrooms. The property is surrounded by "
        f"top-rated schools, shopping centers, and healthcare facilities. Enjoy world-class amenities including "
        f"{', '.join(amenities[:4])}. Priced at ₹{price:,.0f}, this is an excellent investment opportunity.",

        f"A rare find in {locality}, {city}! This spacious {bedrooms}BHK residence of {area_sqft} sqft comes with "
        f"{bathrooms} bathrooms and modern fittings. The locality offers great infrastructure with metro connectivity, "
        f"reputed educational institutions, and recreational facilities. Amenities include {', '.join(amenities[:5])}. "
        f"Don't miss this opportunity at ₹{price:,.0f}."
    ]
    return random.choice(templates)


def generate_address(city: str, locality: str) -> str:
    streets = [
        "Main Road", "1st Main", "2nd Cross", "Gandhi Road", "MG Road",
        "Station Road", "Temple Road", "Park Road", "Lake View Road",
        "Hill View Road", "Nehru Road", "Rajiv Gandhi Nagar",
        "Patel Nagar", "Gandhi Nagar", "Nehru Nagar", "Vivekananda Road"
    ]
    area = random.choice(["Ward No.", "Block", "Phase", "Sector", "Layout", "Extension"])
    num = random.randint(1, 50)
    return f"{random.randint(1, 500)} {random.choice(streets)}, {area} {num}, {locality}, {city}"


def calculate_market_growth(city: str) -> float:
    growth_rates = {
        "Mumbai": (5.0, 12.0), "Delhi": (4.0, 10.0), "Bangalore": (6.0, 14.0),
        "Hyderabad": (7.0, 15.0), "Chennai": (4.0, 10.0), "Pune": (5.0, 13.0),
        "Kolkata": (3.0, 8.0), "Ahmedabad": (5.0, 11.0), "Jaipur": (4.0, 10.0),
        "Lucknow": (4.0, 9.0), "Chandigarh": (4.0, 9.0), "Kochi": (4.0, 10.0),
        "Indore": (5.0, 12.0), "Bhopal": (3.0, 8.0), "Nagpur": (4.0, 9.0),
        "Surat": (5.0, 11.0), "Visakhapatnam": (4.0, 10.0), "Coimbatore": (4.0, 10.0),
        "Mysore": (5.0, 11.0), "Goa": (3.0, 9.0)
    }
    low, high = growth_rates.get(city, (3.0, 10.0))
    return round(random.uniform(low, high), 2)


def calculate_rental_yield(city: str) -> float:
    yields = {
        "Mumbai": (2.0, 4.0), "Delhi": (2.5, 4.5), "Bangalore": (3.0, 5.0),
        "Hyderabad": (3.5, 6.0), "Chennai": (3.0, 5.0), "Pune": (3.0, 5.5),
        "Kolkata": (3.5, 6.0), "Ahmedabad": (3.5, 6.0), "Jaipur": (3.5, 6.5),
        "Lucknow": (4.0, 7.0), "Chandigarh": (3.0, 5.0), "Kochi": (3.5, 6.0),
        "Indore": (4.5, 7.5), "Bhopal": (4.5, 7.5), "Nagpur": (4.0, 7.0),
        "Surat": (4.0, 6.5), "Visakhapatnam": (4.0, 6.5), "Coimbatore": (4.0, 7.0),
        "Mysore": (4.0, 7.0), "Goa": (3.0, 5.5)
    }
    low, high = yields.get(city, (3.0, 6.0))
    return round(random.uniform(low, high), 2)


def calculate_crime_rate(city: str) -> float:
    base_rates = {
        "Mumbai": 35.0, "Delhi": 55.0, "Bangalore": 30.0,
        "Hyderabad": 28.0, "Chennai": 25.0, "Pune": 22.0,
        "Kolkata": 32.0, "Ahmedabad": 20.0, "Jaipur": 38.0,
        "Lucknow": 40.0, "Chandigarh": 18.0, "Kochi": 22.0,
        "Indore": 30.0, "Bhopal": 28.0, "Nagpur": 25.0,
        "Surat": 22.0, "Visakhapatnam": 24.0, "Coimbatore": 22.0,
        "Mysore": 18.0, "Goa": 20.0
    }
    base = base_rates.get(city, 30.0)
    return round(base + random.uniform(-10, 15), 2)


def generate_nearby_schools() -> List[str]:
    count = random.randint(2, 5)
    return random.sample(SCHOOLS, min(count, len(SCHOOLS)))


def generate_nearby_schools_json() -> str:
    schools = generate_nearby_schools()
    result = []
    for school in schools:
        result.append({
            "name": school,
            "distance_km": round(random.uniform(0.5, 8.0), 2),
            "rating": round(random.uniform(3.5, 5.0), 1)
        })
    return json.dumps(result)


# ============================================================
# MAIN GENERATOR
# ============================================================
def generate_properties(target_count: int = 105_000) -> List[Dict]:
    properties = []
    total_cities = len(CITIES)

    print(f"\n{'='*60}")
    print(f"  AI Real Estate Insights Platform - Seed Data Generator")
    print(f"{'='*60}")
    print(f"  Target: {target_count:,} properties across {total_cities} cities")
    print(f"{'='*60}\n")

    # Distribute properties per city (weighted by population and activity)
    city_weights = {
        "Mumbai": 12, "Delhi": 11, "Bangalore": 10, "Hyderabad": 9,
        "Chennai": 8, "Pune": 7, "Kolkata": 7, "Ahmedabad": 6,
        "Jaipur": 5, "Lucknow": 4, "Chandigarh": 3, "Kochi": 3,
        "Indore": 3, "Bhopal": 2, "Nagpur": 2, "Surat": 3,
        "Visakhapatnam": 2, "Coimbatore": 2, "Mysore": 2, "Goa": 2
    }
    total_weight = sum(city_weights.values())
    city_counts = {city: max(1, round(target_count * w / total_weight))
                   for city, w in city_weights.items()}

    # Adjust to hit target
    current_total = sum(city_counts.values())
    diff = target_count - current_total
    biggest_city = max(city_weights, key=city_weights.get)
    city_counts[biggest_city] += diff

    running_total = 0
    city_id = 1
    category_id = 1  # All residential for now

    for city_name, city_data in CITIES.items():
        count = city_counts[city_name]
        print(f"  [{city_id:2d}/20] Generating {count:6,} properties for {city_name:20s} ... ", end="", flush=True)

        for i in range(count):
            # Property type distribution: 80% residential, 10% commercial, 5% mixed, 3% industrial, 2% agri
            ptype_roll = random.random()
            if ptype_roll < 0.80:
                prop_type = "residential"
                cat_id = 1
            elif ptype_roll < 0.90:
                prop_type = "commercial"
                cat_id = 2
            elif ptype_roll < 0.95:
                prop_type = "mixed_use"
                cat_id = 5
            elif ptype_roll < 0.98:
                prop_type = "industrial"
                cat_id = 3
            else:
                prop_type = "agricultural"
                cat_id = 4

            locality = random.choice(city_data["localities"])
            landmark = random.choice(city_data["landmarks"])

            # Bedrooms
            if prop_type == "residential":
                bedroom_dist = random.random()
                if bedroom_dist < 0.15:
                    bedrooms = 1
                elif bedroom_dist < 0.40:
                    bedrooms = 2
                elif bedroom_dist < 0.70:
                    bedrooms = 3
                elif bedroom_dist < 0.88:
                    bedrooms = 4
                elif bedroom_dist < 0.96:
                    bedrooms = 5
                else:
                    bedrooms = 6
            elif prop_type == "commercial":
                bedrooms = 0
            else:
                bedrooms = random.choice([0, 1, 2])

            # Bathrooms
            bathrooms = max(1, bedrooms - random.choice([0, 0, 1])) if bedrooms > 0 else random.choice([1, 2])
            bathrooms = min(bathrooms, 5)

            # Area
            if prop_type == "agricultural":
                area_sqft = random.randint(5_000, 50_000)
            elif prop_type == "industrial":
                area_sqft = random.randint(2_000, 20_000)
            elif prop_type == "commercial":
                area_sqft = random.randint(500, 10_000)
            else:
                if bedrooms == 1:
                    area_sqft = random.randint(450, 900)
                elif bedrooms == 2:
                    area_sqft = random.randint(700, 1_400)
                elif bedrooms == 3:
                    area_sqft = random.randint(1_100, 2_200)
                elif bedrooms == 4:
                    area_sqft = random.randint(1_800, 3_500)
                elif bedrooms == 5:
                    area_sqft = random.randint(2_800, 5_000)
                else:
                    area_sqft = random.randint(4_000, 8_000)

            # Price
            price_min, price_max = city_data["price_range"]
            # Adjust price by bedrooms and area
            base_price_per_sqft = random.uniform(
                price_min / (area_sqft * 0.3),
                price_max / (area_sqft * 0.1)
            )
            base_price_per_sqft = max(3_000, min(base_price_per_sqft, 80_000))

            # Locality premium
            premium_localities = ["Bandra", "Juhu", "Worli", "Powai", "Lower Parel",
                                   "Koramangala", "Indiranagar", "Whitefield", "Gachibowli",
                                   "Banjara Hills", "Salt Lake", "New Town", "SG Highway"]
            if locality in premium_localities:
                base_price_per_sqft *= random.uniform(1.2, 1.8)

            price = int(area_sqft * base_price_per_sqft)
            price = max(price_min, min(price, price_max))
            price_per_sqft = round(price / area_sqft, 2)

            # Parking
            parking = random.choices([0, 1, 2, 3, 4], weights=[5, 25, 40, 25, 5])[0] if bedrooms > 0 else random.choice([0, 1])

            # Year built
            year_built = random.randint(1990, 2024)
            age_factor = 1.0 - (2024 - year_built) * 0.005
            price = int(price * age_factor)
            price = max(price_min, min(price, price_max))

            # Amenities
            if prop_type in AMENITIES:
                amenity_pool = AMENITIES[prop_type]
            else:
                amenity_pool = AMENITIES["residential"]
            num_amenities = random.randint(3, min(15, len(amenity_pool)))
            selected_amenities = random.sample(amenity_pool, num_amenities)

            # Rent
            rent_min, rent_max = city_data["rent_range"]
            avg_rent = round(random.uniform(rent_min, rent_max) * (bedrooms / 3 if bedrooms > 0 else 0.5), 0)
            avg_rent = max(rent_min, min(avg_rent, rent_max))

            # Floors
            if prop_type in ("residential", "commercial"):
                total_floors = random.randint(1, 30)
                floor_num = random.randint(1, total_floors)
            else:
                total_floors = 1
                floor_num = 1

            # Facing
            facing = random.choice(Facing)
            furnishing = random.choice(Furnishing)
            condition = random.choice(Condition)
            water = random.choice(WaterSupply)

            # Nearby distances
            hospital_dist = round(random.uniform(0.3, 12.0), 2)
            metro_dist = round(random.uniform(0.5, 25.0), 2) if city_data["is_metro"] else round(random.uniform(5.0, 50.0), 2)
            airport_dist = round(random.uniform(5.0, 60.0), 2)
            mall_dist = round(random.uniform(0.5, 15.0), 2)

            # Analytics
            crime = calculate_crime_rate(city_name)
            pop_density = round(city_data["population"] / random.uniform(100, 500), 2)
            growth = calculate_market_growth(city_name)
            rental_yield = calculate_rental_yield(city_name)
            views = random.randint(0, 5000)
            inquiries = random.randint(0, min(views // 5, 200))

            # Featured / verified
            is_featured = random.random() < 0.05
            is_verified = random.random() < 0.30

            # Listing status
            status_roll = random.random()
            if status_roll < 0.82:
                listing_status = "active"
            elif status_roll < 0.88:
                listing_status = "sold"
            elif status_roll < 0.93:
                listing_status = "rented"
            elif status_roll < 0.97:
                listing_status = "pending"
            else:
                listing_status = "draft"

            # Images
            num_images = random.randint(3, 12)
            images = [f"https://realestate.example.com/images/{generate_uuid()[:8]}.jpg"
                      for _ in range(num_images)]

            # Title and description
            title = generate_property_title(city_name, locality, bedrooms, prop_type)
            description = generate_description(city_name, locality, bedrooms, bathrooms, area_sqft, price, selected_amenities[:5])

            # Stamp duty and registration (approx 7% + 1% in most states)
            stamp_duty = round(price * 0.05, 2)
            reg_fee = round(price * 0.01, 2)
            maintenance = round(random.uniform(500, 8000), 2)

            # Virtual tour
            has_virtual_tour = random.random() < 0.15
            virtual_tour = f"https://realestate.example.com/tour/{generate_uuid()[:8]}" if has_virtual_tour else None

            prop = {
                "id": generate_uuid(),
                "title": title,
                "description": description,
                "city_id": city_id,
                "category_id": cat_id,
                "owner_id": "00000000-0000-0000-0000-000000000001",  # admin user
                "property_type": prop_type,
                "listing_status": listing_status,
                "condition": condition,
                "address": generate_address(city_name, locality),
                "locality": locality,
                "landmark": landmark,
                "pincode": f"{random.randint(100000, 999999)}",
                "latitude": round(city_data["lat"] + random.uniform(-0.05, 0.05), 7),
                "longitude": round(city_data["lon"] + random.uniform(-0.05, 0.05), 7),
                "area_sqft": area_sqft,
                "area_sqm": round(area_sqft * 0.092903, 2),
                "carpet_area": round(area_sqft * random.uniform(0.70, 0.85), 2),
                "built_up_area": round(area_sqft * random.uniform(0.80, 0.95), 2),
                "land_area_acres": round(area_sqft / 43560, 4) if prop_type == "agricultural" else None,
                "bedrooms": bedrooms,
                "bathrooms": bathrooms,
                "balconies": random.randint(0, min(3, bedrooms + 1)) if bedrooms > 0 else 0,
                "floors_total": total_floors,
                "floor_number": floor_num,
                "parking_spaces": parking,
                "price": price,
                "price_per_sqft": price_per_sqft,
                "rental_yield": rental_yield,
                "maintenance_cost": maintenance,
                "stamp_duty": stamp_duty,
                "registration_fee": reg_fee,
                "year_built": year_built,
                "facing_direction": facing,
                "furnishing": furnishing,
                "water_supply": water,
                "power_backup": random.random() < 0.7,
                "gated_community": random.random() < 0.4,
                "amenities": json.dumps(selected_amenities),
                "nearby_schools": generate_nearby_schools_json(),
                "hospital_distance_km": hospital_dist,
                "metro_distance_km": metro_dist,
                "airport_distance_km": airport_dist,
                "shopping_mall_distance_km": mall_dist,
                "crime_rate": crime,
                "population_density": pop_density,
                "market_growth_pct": growth,
                "avg_rent_per_month": avg_rent,
                "views_count": views,
                "inquiries_count": inquiries,
                "images": json.dumps(images),
                "video_url": f"https://realestate.example.com/video/{generate_uuid()[:8]}.mp4" if random.random() < 0.1 else None,
                "virtual_tour_url": virtual_tour,
                "is_featured": is_featured,
                "is_verified": is_verified,
                "listed_at": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
                "sold_at": (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat() if listing_status == "sold" else None,
                "created_at": (datetime.now() - timedelta(days=random.randint(1, 365))).isoformat(),
                "updated_at": datetime.now().isoformat()
            }

            properties.append(prop)

        running_total += count
        print(f"Done ({running_total:7,}/{target_count:,})")
        city_id += 1

    return properties


def save_to_csv(properties: List[Dict], output_path: str):
    print(f"\n  Saving to {output_path} ... ", end="", flush=True)

    fieldnames = [
        "id", "title", "description", "city_id", "category_id", "owner_id",
        "property_type", "listing_status", "condition",
        "address", "locality", "landmark", "pincode",
        "latitude", "longitude",
        "area_sqft", "area_sqm", "carpet_area", "built_up_area", "land_area_acres",
        "bedrooms", "bathrooms", "balconies", "floors_total", "floor_number",
        "parking_spaces",
        "price", "price_per_sqft", "rental_yield", "maintenance_cost",
        "stamp_duty", "registration_fee",
        "year_built", "facing_direction", "furnishing", "water_supply",
        "power_backup", "gated_community",
        "amenities", "nearby_schools",
        "hospital_distance_km", "metro_distance_km", "airport_distance_km",
        "shopping_mall_distance_km",
        "crime_rate", "population_density", "market_growth_pct",
        "avg_rent_per_month", "views_count", "inquiries_count",
        "images", "video_url", "virtual_tour_url",
        "is_featured", "is_verified",
        "listed_at", "sold_at", "created_at", "updated_at"
    ]

    with open(output_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        for prop in properties:
            writer.writerow(prop)

    file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"Done! ({file_size_mb:.2f} MB)")


def print_summary(properties: List[Dict]):
    print(f"\n{'='*60}")
    print(f"  SEED DATA SUMMARY")
    print(f"{'='*60}")

    # Total
    print(f"\n  Total Properties Generated: {len(properties):,}")

    # By city
    city_counts = {}
    city_prices = {}
    for p in properties:
        cid = p["city_id"]
        city_name = list(CITIES.keys())[cid - 1] if cid <= len(CITIES) else f"City {cid}"
        city_counts[city_name] = city_counts.get(city_name, 0) + 1
        if city_name not in city_prices:
            city_prices[city_name] = []
        city_prices[city_name].append(p["price"])

    print(f"\n  {'City':<22} {'Count':>8} {'Avg Price':>15} {'Min Price':>15} {'Max Price':>15}")
    print(f"  {'-'*22} {'-'*8} {'-'*15} {'-'*15} {'-'*15}")
    for city in sorted(city_counts.keys()):
        count = city_counts[city]
        prices = city_prices[city]
        avg_p = sum(prices) / len(prices)
        min_p = min(prices)
        max_p = max(prices)
        print(f"  {city:<22} {count:>8,} {f'₹{avg_p:,.0f}':>15} {f'₹{min_p:,.0f}':>15} {f'₹{max_p:,.0f}':>15}")

    # By type
    type_counts = {}
    for p in properties:
        pt = p["property_type"]
        type_counts[pt] = type_counts.get(pt, 0) + 1

    print(f"\n  By Property Type:")
    for pt, count in sorted(type_counts.items(), key=lambda x: -x[1]):
        pct = count / len(properties) * 100
        print(f"    {pt:<20} {count:>8,} ({pct:.1f}%)")

    # By status
    status_counts = {}
    for p in properties:
        s = p["listing_status"]
        status_counts[s] = status_counts.get(s, 0) + 1

    print(f"\n  By Listing Status:")
    for s, count in sorted(status_counts.items(), key=lambda x: -x[1]):
        pct = count / len(properties) * 100
        print(f"    {s:<20} {count:>8,} ({pct:.1f}%)")

    # By bedrooms
    bed_counts = {}
    for p in properties:
        b = p["bedrooms"]
        bed_counts[b] = bed_counts.get(b, 0) + 1

    print(f"\n  By Bedrooms:")
    for b in sorted(bed_counts.keys()):
        count = bed_counts[b]
        pct = count / len(properties) * 100
        label = f"{b} BHK" if b > 0 else "N/A (Commercial/Other)"
        print(f"    {label:<25} {count:>8,} ({pct:.1f}%)")

    # Price stats
    all_prices = [p["price"] for p in properties]
    print(f"\n  Price Statistics:")
    print(f"    Average:  ₹{sum(all_prices)/len(all_prices):>15,.0f}")
    print(f"    Min:      ₹{min(all_prices):>15,.0f}")
    print(f"    Max:      ₹{max(all_prices):>15,.0f}")
    print(f"    Median:   ₹{sorted(all_prices)[len(all_prices)//2]:>15,.0f}")

    # Area stats
    all_areas = [p["area_sqft"] for p in properties]
    print(f"\n  Area Statistics (sqft):")
    print(f"    Average:  {sum(all_areas)/len(all_areas):>12,.0f}")
    print(f"    Min:      {min(all_areas):>12,}")
    print(f"    Max:      {max(all_areas):>12,}")

    print(f"\n{'='*60}")
    print(f"  Generation Complete!")
    print(f"{'='*60}\n")


# ============================================================
# ENTRY POINT
# ============================================================
if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "dataset")
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "properties.csv")

    properties = generate_properties(target_count=105_000)
    save_to_csv(properties, output_path)
    print_summary(properties)
