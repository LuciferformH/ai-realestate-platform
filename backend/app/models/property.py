from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    property_type = Column(String(50), nullable=False)
    price = Column(Numeric(15, 2), nullable=False)
    city = Column(String(100), index=True)
    locality = Column(String(200))
    address = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    parking = Column(Integer, default=0)
    furnished = Column(Boolean, default=False)
    area = Column(Float)
    year_built = Column(Integer)
    property_age = Column(Integer)
    description = Column(Text)
    images = Column(JSON, default=list)
    amenities = Column(JSON, default=list)
    nearby_schools = Column(JSON, default=list)
    hospital_distance = Column(Float)
    metro_distance = Column(Float)
    crime_rate = Column(Float)
    population = Column(Integer)
    rental_yield = Column(Float)
    market_growth = Column(Float)
    is_featured = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="properties")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")
    price_alerts = relationship("PriceAlert", back_populates="property", cascade="all, delete-orphan")
