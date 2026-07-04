import io
import csv
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routes.auth import get_current_user_dep
from app.models.user import User
from app.models.property import Property
from app.services.property_service import PropertyService

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(current_user: User = Depends(get_current_user_dep)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@router.get("/users")
def list_users(
    page: int = 1,
    size: int = 20,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from app.utils.helpers import paginate_query
    query = db.query(User).order_by(User.created_at.desc())
    items, total = paginate_query(query, page, size)
    return {
        "items": [
            {
                "id": u.id,
                "email": u.email,
                "full_name": u.full_name,
                "role": u.role,
                "is_active": u.is_active,
                "created_at": str(u.created_at) if u.created_at else None,
            }
            for u in items
        ],
        "total": total,
        "page": page,
        "size": size,
    }


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    role: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if role not in ("user", "admin", "analyst"):
        raise HTTPException(status_code=400, detail="Invalid role")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    db.commit()
    return {"message": f"User role updated to {role}"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    imported = 0
    skipped = 0
    for row in reader:
        try:
            prop = Property(
                title=row.get("title", "Untitled"),
                property_type=row.get("property_type", "house"),
                price=float(row.get("price", 0)),
                city=row.get("city"),
                locality=row.get("locality"),
                address=row.get("address"),
                latitude=float(row["latitude"]) if row.get("latitude") else None,
                longitude=float(row["longitude"]) if row.get("longitude") else None,
                bedrooms=int(row["bedrooms"]) if row.get("bedrooms") else None,
                bathrooms=int(row["bathrooms"]) if row.get("bathrooms") else None,
                parking=int(row.get("parking", 0)),
                furnished=row.get("furnished", "").lower() in ("true", "1", "yes"),
                area=float(row["area"]) if row.get("area") else None,
                year_built=int(row["year_built"]) if row.get("year_built") else None,
                description=row.get("description"),
                owner_id=admin.id,
            )
            db.add(prop)
            imported += 1
        except Exception:
            skipped += 1
            continue

    db.commit()
    return {"message": f"Imported {imported} properties, skipped {skipped}"}


@router.get("/dataset/stats")
def dataset_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total = db.query(Property).count()
    active = db.query(Property).filter(Property.is_active == True).count()
    cities = db.query(Property.city).distinct().count()
    types = db.query(Property.property_type).distinct().count()
    return {
        "total_properties": total,
        "active_properties": active,
        "unique_cities": cities,
        "property_types": types,
    }


@router.post("/import-data")
async def import_data(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    imported = 0
    for row in reader:
        try:
            prop = Property(
                title=row.get("title", "Imported Property"),
                property_type=row.get("property_type", "house"),
                price=float(row.get("price", 0)),
                city=row.get("city", "Unknown"),
                locality=row.get("locality"),
                address=row.get("address"),
                bedrooms=int(row["bedrooms"]) if row.get("bedrooms") else None,
                bathrooms=int(row["bathrooms"]) if row.get("bathrooms") else None,
                area=float(row["area"]) if row.get("area") else None,
                description=row.get("description"),
                owner_id=admin.id,
            )
            db.add(prop)
            imported += 1
        except Exception:
            continue

    db.commit()
    return {"message": f"Successfully imported {imported} records"}
