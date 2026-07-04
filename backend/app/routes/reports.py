import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routes.auth import get_current_user_dep
from app.models.user import User
from app.models.property import Property
from app.services.report_service import ReportService
from app.services.property_service import PropertyService

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/pdf/{property_id}")
def generate_pdf_report(
    property_id: int,
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    service = PropertyService(db)
    prop = service.get_by_id(property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    prop_data = {
        "title": prop.title,
        "property_type": prop.property_type,
        "price": float(prop.price) if prop.price else 0,
        "city": prop.city,
        "locality": prop.locality,
        "address": prop.address,
        "bedrooms": prop.bedrooms,
        "bathrooms": prop.bathrooms,
        "area": prop.area,
        "parking": prop.parking,
        "furnished": prop.furnished,
        "year_built": prop.year_built,
        "property_age": prop.property_age,
        "description": prop.description,
        "amenities": prop.amenities or [],
        "hospital_distance": prop.hospital_distance,
        "metro_distance": prop.metro_distance,
        "crime_rate": prop.crime_rate,
        "population": prop.population,
        "rental_yield": prop.rental_yield,
        "market_growth": prop.market_growth,
    }

    report_service = ReportService()
    pdf_content = report_service.generate_pdf(prop_data)

    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="property_{property_id}_report.pdf"'},
    )


@router.get("/excel")
def generate_excel_report(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    service = PropertyService(db)
    properties = service.get_all(page=1, size=10000)

    data = []
    for p in properties:
        data.append({
            "id": p.id,
            "title": p.title,
            "property_type": p.property_type,
            "price": float(p.price) if p.price else 0,
            "city": p.city,
            "locality": p.locality,
            "address": p.address,
            "bedrooms": p.bedrooms,
            "bathrooms": p.bathrooms,
            "area": p.area,
            "parking": p.parking,
            "furnished": p.furnished,
            "year_built": p.year_built,
            "created_at": str(p.created_at) if p.created_at else "",
        })

    report_service = ReportService()
    excel_content = report_service.generate_excel(data)

    return Response(
        content=excel_content,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="properties_report.xlsx"'},
    )


@router.get("/csv")
def generate_csv_report(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    service = PropertyService(db)
    properties = service.get_all(page=1, size=10000)

    data = []
    for p in properties:
        data.append({
            "id": p.id,
            "title": p.title,
            "property_type": p.property_type,
            "price": float(p.price) if p.price else 0,
            "city": p.city,
            "locality": p.locality,
            "address": p.address,
            "bedrooms": p.bedrooms,
            "bathrooms": p.bathrooms,
            "area": p.area,
            "parking": p.parking,
            "furnished": p.furnished,
            "year_built": p.year_built,
        })

    report_service = ReportService()
    csv_content = report_service.generate_csv(data)

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="properties_report.csv"'},
    )
