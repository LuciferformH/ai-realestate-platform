from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.core.database import Base


class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    state = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    population = Column(Integer)
    avg_price = Column(Float)
    growth_rate = Column(Float)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
