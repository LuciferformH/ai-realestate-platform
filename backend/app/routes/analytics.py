from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return service.get_dashboard_stats()


@router.get("/charts/line")
def get_line_chart(
    group_by: str = Query("city"),
    metric: str = Query("price"),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_line_chart_data(group_by, metric)


@router.get("/charts/bar")
def get_bar_chart(
    group_by: str = Query("city"),
    metric: str = Query("price"),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_bar_chart_data(group_by, metric)


@router.get("/charts/pie")
def get_pie_chart(
    group_by: str = Query("property_type"),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_pie_chart_data(group_by)


@router.get("/charts/area")
def get_area_chart(
    time_field: str = Query("created_at"),
    group_by: str = Query("property_type"),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_area_chart_data(time_field, group_by)


@router.get("/charts/scatter")
def get_scatter_chart(
    x_field: str = Query("area"),
    y_field: str = Query("price"),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_scatter_chart_data(x_field, y_field)


@router.get("/charts/treemap")
def get_treemap(
    group_by: str = Query("city"),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_treemap_data(group_by)


@router.get("/correlation")
def get_correlation(db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return service.get_correlation()


@router.get("/distribution")
def get_distribution(
    field: str = Query("price"),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_distribution(field)


@router.get("/monthly-trends")
def get_monthly_trends(
    months: int = Query(12, ge=1, le=60),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_monthly_trends(months)


@router.get("/yearly-trends")
def get_yearly_trends(db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return service.get_yearly_trends()


@router.get("/top-cities")
def get_top_cities(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    service = AnalyticsService(db)
    return service.get_top_cities(limit)


@router.get("/investment-scores")
def get_investment_scores(db: Session = Depends(get_db)):
    service = AnalyticsService(db)
    return service.get_investment_scores()
