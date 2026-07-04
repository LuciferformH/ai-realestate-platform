from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
from decimal import Decimal


class PropertyBase(BaseModel):
    title: str
    property_type: str
    price: Decimal
    city: Optional[str] = None
    locality: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    parking: int = 0
    furnished: bool = False
    area: Optional[float] = None
    year_built: Optional[int] = None
    property_age: Optional[int] = None
    description: Optional[str] = None
    images: List[str] = []
    amenities: List[str] = []
    nearby_schools: List[str] = []
    hospital_distance: Optional[float] = None
    metro_distance: Optional[float] = None
    crime_rate: Optional[float] = None
    population: Optional[int] = None
    rental_yield: Optional[float] = None
    market_growth: Optional[float] = None
    is_featured: bool = False


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    property_type: Optional[str] = None
    price: Optional[Decimal] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    parking: Optional[int] = None
    furnished: Optional[bool] = None
    area: Optional[float] = None
    year_built: Optional[int] = None
    property_age: Optional[int] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    amenities: Optional[List[str]] = None
    nearby_schools: Optional[List[str]] = None
    hospital_distance: Optional[float] = None
    metro_distance: Optional[float] = None
    crime_rate: Optional[float] = None
    population: Optional[int] = None
    rental_yield: Optional[float] = None
    market_growth: Optional[float] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class PropertyResponse(PropertyBase):
    id: int
    is_active: bool
    owner_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PropertyListResponse(BaseModel):
    items: List[PropertyResponse]
    total: int
    page: int
    size: int
    pages: int


class PropertyFilter(BaseModel):
    city: Optional[str] = None
    property_type: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_bedrooms: Optional[int] = None
    max_bedrooms: Optional[int] = None
    min_bathrooms: Optional[int] = None
    max_bathrooms: Optional[int] = None
    min_area: Optional[float] = None
    max_area: Optional[float] = None
    furnished: Optional[bool] = None
    search: Optional[str] = None
    sort_by: Optional[str] = None
    sort_order: str = "desc"
    page: int = 1
    size: int = 20


class CompareRequest(BaseModel):
    property_ids: List[int]
