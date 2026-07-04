import os
import joblib
import numpy as np
import pandas as pd
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
from app.models.property import Property
from app.models.ml_model import MLModel


MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "ml_models")


class MLService:
    def __init__(self, db: Session):
        self.db = db
        os.makedirs(MODEL_DIR, exist_ok=True)

    def _load_data(self) -> pd.DataFrame:
        properties = self.db.query(Property).filter(Property.is_active == True).all()
        records = []
        for p in properties:
            records.append({
                "price": float(p.price) if p.price else 0,
                "area": p.area or 0,
                "bedrooms": p.bedrooms or 0,
                "bathrooms": p.bathrooms or 0,
                "parking": p.parking or 0,
                "property_type": p.property_type or "house",
                "city": p.city or "unknown",
                "furnished": int(p.furnished or False),
                "year_built": p.year_built or 0,
                "property_age": p.property_age or 0,
                "hospital_distance": p.hospital_distance or 0,
                "metro_distance": p.metro_distance or 0,
                "crime_rate": p.crime_rate or 0,
                "rental_yield": p.rental_yield or 0,
                "market_growth": p.market_growth or 0,
            })
        return pd.DataFrame(records)

    def _prepare_features(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, np.ndarray, List[str]]:
        feature_cols = [
            "area", "bedrooms", "bathrooms", "parking", "furnished",
            "year_built", "property_age", "hospital_distance", "metro_distance",
            "crime_rate", "rental_yield", "market_growth",
        ]
        label_encoders = {}
        for col in ["property_type", "city"]:
            if col in df.columns:
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
                label_encoders[col] = le
                feature_cols.append(col)

        available = [c for c in feature_cols if c in df.columns]
        X = df[available].fillna(0).values
        y = df["price"].values if "price" in df.columns else np.zeros(len(df))

        scaler = StandardScaler()
        X = scaler.fit_transform(X)

        return df, X, available

    def train_models(self, df: Optional[pd.DataFrame] = None) -> List[Dict[str, Any]]:
        if df is None:
            df = self._load_data()
        if df.empty or len(df) < 10:
            return []

        df, X, feature_cols = self._prepare_features(df)
        y = df["price"].values if "price" in df.columns else np.zeros(len(df))

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        models_config = {
            "LinearRegression": LinearRegression(),
            "RandomForest": RandomForestRegressor(n_estimators=100, random_state=42),
            "GradientBoosting": GradientBoostingRegressor(n_estimators=100, random_state=42),
            "XGBoost": XGBRegressor(n_estimators=100, random_state=42, verbosity=0),
        }

        results = []
        best_score = -1
        best_model = None

        for name, model in models_config.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)

            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            accuracy = max(0, 1 - (mae / (y_test.mean() + 1e-8)))

            model_path = os.path.join(MODEL_DIR, f"{name.lower()}_model.joblib")
            joblib.dump({"model": model, "features": feature_cols, "scaler": StandardScaler()}, model_path)

            ml_record = MLModel(
                name=name,
                model_type=name.lower(),
                accuracy=round(accuracy, 4),
                mae=round(mae, 2),
                rmse=round(rmse, 2),
                r2_score=round(r2, 4),
                model_path=model_path,
                is_active=False,
            )
            self.db.add(ml_record)

            if r2 > best_score:
                best_score = r2
                best_model = ml_record

            results.append({
                "name": name,
                "accuracy": round(accuracy, 4),
                "mae": round(mae, 2),
                "rmse": round(rmse, 2),
                "r2_score": round(r2, 4),
            })

        if best_model:
            best_model.is_active = True

        self.db.commit()
        return results

    def predict_price(self, features: Dict[str, Any]) -> Dict[str, Any]:
        active_model = self.db.query(MLModel).filter(MLModel.is_active == True).first()
        if not active_model or not active_model.model_path or not os.path.exists(active_model.model_path):
            return {"predicted_price": 0, "model": "none", "confidence": 0}

        saved = joblib.load(active_model.model_path)
        model = saved["model"]

        feature_vector = np.array([[
            features.get("area", 0),
            features.get("bedrooms", 0),
            features.get("bathrooms", 0),
            features.get("parking", 0),
            features.get("furnished", 0),
            features.get("year_built", 0),
            features.get("property_age", 0),
            features.get("hospital_distance", 0),
            features.get("metro_distance", 0),
            features.get("crime_rate", 0),
            features.get("rental_yield", 0),
            features.get("market_growth", 0),
            features.get("property_type_encoded", 0),
            features.get("city_encoded", 0),
        ]])

        prediction = model.predict(feature_vector)[0]
        return {
            "predicted_price": round(float(prediction), 2),
            "model": active_model.name,
            "accuracy": active_model.accuracy,
        }

    def get_model_comparison(self) -> List[Dict[str, Any]]:
        models = self.db.query(MLModel).order_by(MLModel.created_at.desc()).all()
        return [
            {
                "id": m.id,
                "name": m.name,
                "model_type": m.model_type,
                "accuracy": m.accuracy,
                "mae": m.mae,
                "rmse": m.rmse,
                "r2_score": m.r2_score,
                "is_active": m.is_active,
                "created_at": str(m.created_at) if m.created_at else None,
            }
            for m in models
        ]

    def get_feature_importance(self) -> Dict[str, Any]:
        active_model = self.db.query(MLModel).filter(MLModel.is_active == True).first()
        if not active_model or not active_model.model_path or not os.path.exists(active_model.model_path):
            return {"features": [], "importances": []}

        saved = joblib.load(active_model.model_path)
        model = saved["model"]
        feature_names = saved.get("features", [])

        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_.tolist()
        elif hasattr(model, "coef_"):
            importances = np.abs(model.coef_).tolist()
        else:
            return {"features": feature_names, "importances": []}

        paired = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)
        return {
            "features": [p[0] for p in paired],
            "importances": [round(p[1], 4) for p in paired],
        }
