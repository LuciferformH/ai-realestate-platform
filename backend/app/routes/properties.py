from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routes.auth import get_current_user_dep
from app.models.user import User
from app.models.property import Property
from app.schemas.property import (
    PropertyCreate,
    PropertyUpdate,
    PropertyResponse,
    PropertyListResponse,
    PropertyFilter,
    CompareRequest,
)
from app.services.property_service import PropertyService

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.get("/", response_model=PropertyListResponse)
def list_properties(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    city: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_bedrooms: Optional[int] = None,
    max_bedrooms: Optional[int] = None,
    min_bathrooms: Optional[int] = None,
    max_bathrooms: Optional[int] = None,
    min_area: Optional[float] = None,
    max_area: Optional[float] = None,
    furnished: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: str = "desc",
    db: Session = Depends(get_db),
):
    service = PropertyService(db)
    filters = PropertyFilter(
        page=page,
        size=size,
        city=city,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        min_bedrooms=min_bedrooms,
        max_bedrooms=max_bedrooms,
        min_bathrooms=min_bathrooms,
        max_bathrooms=max_bathrooms,
        min_area=min_area,
        max_area=max_area,
        furnished=furnished,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
    )
    items, total = service.get_list(filters)
    pages = (total + size - 1) // size
    return PropertyListResponse(
        items=[PropertyResponse.model_validate(p) for p in items],
        total=total,
        page=page,
        size=size,
        pages=pages,
    )


@router.get("/featured", response_model=List[PropertyResponse])
def get_featured(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    service = PropertyService(db)
    return [PropertyResponse.model_validate(p) for p in service.get_featured(limit)]


@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    service = PropertyService(db)
    return service.get_stats()


@router.get("/cities")
def get_cities(db: Session = Depends(get_db)):
    service = PropertyService(db)
    return service.get_cities()


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    service = PropertyService(db)
    prop = service.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return PropertyResponse.model_validate(prop)


@router.post("/", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    property_in: PropertyCreate,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    service = PropertyService(db)
    prop = service.create(property_in, owner_id=current_user.id)
    return PropertyResponse.model_validate(prop)


@router.put("/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: int,
    property_in: PropertyUpdate,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    service = PropertyService(db)
    prop = service.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if prop.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    updated = service.update(property_id, property_in, current_user.id)
    return PropertyResponse.model_validate(updated)


@router.delete("/{property_id}")
def delete_property(
    property_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    service = PropertyService(db)
    prop = service.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if prop.owner_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    service.delete(property_id)
    return {"message": "Property deleted successfully"}


@router.post("/compare", response_model=List[PropertyResponse])
def compare_properties(compare_in: CompareRequest, db: Session = Depends(get_db)):
    service = PropertyService(db)
    props = service.compare_properties(compare_in.property_ids)
    return [PropertyResponse.model_validate(p) for p in props]
