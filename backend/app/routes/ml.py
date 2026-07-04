from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.routes.auth import get_current_user_dep
from app.models.user import User
from app.services.ml_service import MLService

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


@router.get("/models")
def list_models(db: Session = Depends(get_db)):
    service = MLService(db)
    return service.get_model_comparison()


@router.post("/predict")
def predict_price(features: Dict[str, Any], db: Session = Depends(get_db)):
    service = MLService(db)
    return service.predict_price(features)


@router.post("/train")
def train_models(
    current_user: User = Depends(get_current_user_dep),
    db: Session = Depends(get_db),
):
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Only admins can train models")
    service = MLService(db)
    results = service.train_models()
    return {"message": "Models trained successfully", "results": results}


@router.get("/compare")
def compare_models(db: Session = Depends(get_db)):
    service = MLService(db)
    return service.get_model_comparison()


@router.get("/feature-importance")
def get_feature_importance(db: Session = Depends(get_db)):
    service = MLService(db)
    return service.get_feature_importance()
