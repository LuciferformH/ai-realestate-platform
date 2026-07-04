from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.models.property import Property
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyFilter
from app.utils.helpers import paginate_query, calculate_pagination_meta


class PropertyService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, property_id: int) -> Optional[Property]:
        return self.db.query(Property).filter(Property.id == property_id).first()

    def get_list(self, filters: PropertyFilter) -> Tuple[List[Property], int]:
        query = self.db.query(Property).filter(Property.is_active == True)

        if filters.city:
            query = query.filter(Property.city.ilike(f"%{filters.city}%"))
        if filters.property_type:
            query = query.filter(Property.property_type == filters.property_type)
        if filters.min_price is not None:
            query = query.filter(Property.price >= filters.min_price)
        if filters.max_price is not None:
            query = query.filter(Property.price <= filters.max_price)
        if filters.min_bedrooms is not None:
            query = query.filter(Property.bedrooms >= filters.min_bedrooms)
        if filters.max_bedrooms is not None:
            query = query.filter(Property.bedrooms <= filters.max_bedrooms)
        if filters.min_bathrooms is not None:
            query = query.filter(Property.bathrooms >= filters.min_bathrooms)
        if filters.max_bathrooms is not None:
            query = query.filter(Property.bathrooms <= filters.max_bathrooms)
        if filters.min_area is not None:
            query = query.filter(Property.area >= filters.min_area)
        if filters.max_area is not None:
            query = query.filter(Property.area <= filters.max_area)
        if filters.furnished is not None:
            query = query.filter(Property.furnished == filters.furnished)
        if filters.search:
            search_term = f"%{filters.search}%"
            query = query.filter(
                or_(
                    Property.title.ilike(search_term),
                    Property.address.ilike(search_term),
                    Property.locality.ilike(search_term),
                    Property.description.ilike(search_term),
                )
            )

        if filters.sort_by:
            sort_column = getattr(Property, filters.sort_by, Property.id)
            if filters.sort_order == "desc":
                query = query.order_by(sort_column.desc())
            else:
                query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(Property.created_at.desc())

        return paginate_query(query, filters.page, filters.size)

    def get_all(self, page: int = 1, size: int = 100) -> List[Property]:
        query = self.db.query(Property).filter(Property.is_active == True).order_by(Property.id)
        items, _ = paginate_query(query, page, size)
        return items

    def create(self, data: PropertyCreate, owner_id: int) -> Property:
        property_obj = Property(**data.model_dump(), owner_id=owner_id)
        self.db.add(property_obj)
        self.db.commit()
        self.db.refresh(property_obj)
        return property_obj

    def update(self, property_id: int, data: PropertyUpdate, owner_id: int) -> Optional[Property]:
        property_obj = self.db.query(Property).filter(Property.id == property_id).first()
        if not property_obj:
            return None
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(property_obj, key, value)
        self.db.commit()
        self.db.refresh(property_obj)
        return property_obj

    def delete(self, property_id: int) -> bool:
        property_obj = self.db.query(Property).filter(Property.id == property_id).first()
        if not property_obj:
            return False
        self.db.delete(property_obj)
        self.db.commit()
        return True

    def get_featured(self, limit: int = 10) -> List[Property]:
        return (
            self.db.query(Property)
            .filter(Property.is_featured == True, Property.is_active == True)
            .order_by(Property.created_at.desc())
            .limit(limit)
            .all()
        )

    def get_stats(self) -> Dict[str, Any]:
        total = self.db.query(func.count(Property.id)).filter(Property.is_active == True).scalar()
        avg_price = self.db.query(func.avg(Property.price)).filter(Property.is_active == True).scalar()
        total_value = self.db.query(func.sum(Property.price)).filter(Property.is_active == True).scalar()
        avg_area = self.db.query(func.avg(Property.area)).filter(Property.is_active == True).scalar()

        type_counts = (
            self.db.query(Property.property_type, func.count(Property.id))
            .filter(Property.is_active == True)
            .group_by(Property.property_type)
            .all()
        )

        city_counts = (
            self.db.query(Property.city, func.count(Property.id))
            .filter(Property.is_active == True)
            .group_by(Property.city)
            .order_by(func.count(Property.id).desc())
            .limit(10)
            .all()
        )

        return {
            "total_properties": total or 0,
            "avg_price": float(avg_price or 0),
            "total_value": float(total_value or 0),
            "avg_area": float(avg_area or 0),
            "property_types": {t: c for t, c in type_counts},
            "top_cities": {c: n for c, n in city_counts},
        }

    def get_cities(self) -> List[Dict[str, Any]]:
        results = (
            self.db.query(
                Property.city,
                func.count(Property.id).label("count"),
                func.avg(Property.price).label("avg_price"),
            )
            .filter(Property.is_active == True, Property.city.isnot(None))
            .group_by(Property.city)
            .all()
        )
        return [{"name": r.city, "count": r.count, "avg_price": float(r.avg_price or 0)} for r in results]

    def compare_properties(self, property_ids: List[int]) -> List[Property]:
        return self.db.query(Property).filter(Property.id.in_(property_ids)).all()

    def search(self, term: str) -> List[Property]:
        search_term = f"%{term}%"
        return (
            self.db.query(Property)
            .filter(
                Property.is_active == True,
                or_(
                    Property.title.ilike(search_term),
                    Property.city.ilike(search_term),
                    Property.locality.ilike(search_term),
                    Property.description.ilike(search_term),
                ),
            )
            .limit(50)
            .all()
        )
