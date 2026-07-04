from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.property import Property
from app.models.user import User


class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db
        self._df: Optional[pd.DataFrame] = None

    def _load_dataframe(self) -> pd.DataFrame:
        if self._df is None:
            properties = (
                self.db.query(Property)
                .filter(Property.is_active == True)
                .all()
            )
            records = []
            for p in properties:
                records.append({
                    "id": p.id,
                    "title": p.title,
                    "property_type": p.property_type,
                    "price": float(p.price) if p.price else 0,
                    "city": p.city,
                    "locality": p.locality,
                    "bedrooms": p.bedrooms or 0,
                    "bathrooms": p.bathrooms or 0,
                    "parking": p.parking or 0,
                    "furnished": p.furnished,
                    "area": p.area or 0,
                    "year_built": p.year_built or 0,
                    "property_age": p.property_age or 0,
                    "hospital_distance": p.hospital_distance or 0,
                    "metro_distance": p.metro_distance or 0,
                    "crime_rate": p.crime_rate or 0,
                    "population": p.population or 0,
                    "rental_yield": p.rental_yield or 0,
                    "market_growth": p.market_growth or 0,
                    "created_at": p.created_at,
                })
            self._df = pd.DataFrame(records) if records else pd.DataFrame()
        return self._df

    def invalidate_cache(self):
        self._df = None

    def get_dashboard_stats(self) -> Dict[str, Any]:
        df = self._load_dataframe()
        total_users = self.db.query(func.count(User.id)).scalar() or 0
        total_properties = len(df)
        avg_price = float(df["price"].mean()) if not df.empty else 0
        median_price = float(df["price"].median()) if not df.empty else 0
        highest_price = float(df["price"].max()) if not df.empty else 0
        lowest_price = float(df["price"].min()) if not df.empty else 0
        total_value = float(df["price"].sum()) if not df.empty else 0
        avg_price_per_sqft = float((df["price"] / df["area"]).replace([np.inf, -np.inf], np.nan).dropna().mean()) if not df.empty else 0
        total_cities = df["city"].nunique() if not df.empty else 0

        monthly_trends = []
        if not df.empty and "created_at" in df.columns:
            df["month"] = pd.to_datetime(df["created_at"], errors="coerce").dt.to_period("M").astype(str)
            monthly = df.groupby("month").agg(count=("id", "count"), avg_price=("price", "mean")).tail(12)
            monthly_trends = [{"month": m, "count": int(r["count"]), "avg_price": float(r["avg_price"])} for m, r in monthly.iterrows()]

        type_distribution = df["property_type"].value_counts().to_dict() if not df.empty else {}
        city_distribution = df["city"].value_counts().head(10).to_dict() if not df.empty else {}

        return {
            "total_users": total_users,
            "total_properties": total_properties,
            "avg_price": round(avg_price, 2),
            "median_price": round(median_price, 2),
            "highest_price": round(highest_price, 2),
            "lowest_price": round(lowest_price, 2),
            "avg_price_per_sqft": round(avg_price_per_sqft, 2),
            "total_cities": total_cities,
            "total_value": round(total_value, 2),
            "monthly_trends": monthly_trends,
            "type_distribution": type_distribution,
            "city_distribution": city_distribution,
        }

    def get_line_chart_data(self, group_by: str = "city", metric: str = "price") -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty:
            return {"labels": [], "datasets": []}

        grouped = df.groupby(group_by).agg({metric: ["mean", "count"]}).reset_index()
        grouped.columns = [group_by, "value", "count"]
        grouped = grouped.sort_values("value", ascending=False).head(20)

        return {
            "labels": grouped[group_by].tolist(),
            "datasets": [{"label": f"Avg {metric}", "data": grouped["value"].tolist()}],
        }

    def get_bar_chart_data(self, group_by: str = "city", metric: str = "price") -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty:
            return {"labels": [], "datasets": []}

        grouped = df.groupby(group_by).agg({metric: ["mean", "count", "sum"]}).reset_index()
        grouped.columns = [group_by, "avg", "count", "total"]
        grouped = grouped.sort_values("total", ascending=False).head(20)

        return {
            "labels": grouped[group_by].tolist(),
            "datasets": [
                {"label": f"Avg {metric}", "data": grouped["avg"].tolist()},
                {"label": "Count", "data": grouped["count"].tolist()},
            ],
        }

    def get_pie_chart_data(self, group_by: str = "property_type") -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty:
            return {"labels": [], "values": []}

        counts = df[group_by].value_counts()
        return {"labels": counts.index.tolist(), "values": counts.values.tolist()}

    def get_area_chart_data(self, time_field: str = "created_at", group_by: str = "property_type") -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty or time_field not in df.columns:
            return {"labels": [], "datasets": []}

        df[time_field] = pd.to_datetime(df[time_field], errors="coerce")
        df = df.dropna(subset=[time_field])
        df["period"] = df[time_field].dt.to_period("M").astype(str)

        pivot = df.pivot_table(index="period", columns=group_by, values="price", aggfunc="mean").fillna(0)
        pivot = pivot.sort_index().tail(12)

        datasets = []
        for col in pivot.columns:
            datasets.append({"label": col, "data": pivot[col].tolist()})

        return {"labels": pivot.index.tolist(), "datasets": datasets}

    def get_scatter_chart_data(self, x_field: str = "area", y_field: str = "price") -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty:
            return {"datasets": []}

        valid = df[(df[x_field] > 0) & (df[y_field] > 0)].head(200)
        points = [{"x": float(row[x_field]), "y": float(row[y_field]), "label": row.get("title", "")} for _, row in valid.iterrows()]

        return {
            "datasets": [
                {"label": f"{x_field} vs {y_field}", "data": points}
            ]
        }

    def get_treemap_data(self, group_by: str = "city") -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty:
            return {"labels": [], "values": [], "parents": []}

        grouped = df.groupby(group_by).agg({"price": "mean", "id": "count"}).reset_index()
        grouped.columns = [group_by, "avg_price", "count"]
        grouped = grouped.sort_values("count", ascending=False).head(20)

        return {
            "labels": grouped[group_by].tolist(),
            "values": grouped["count"].tolist(),
            "parents": [""] * len(grouped),
        }

    def get_correlation(self) -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty:
            return {"matrix": {}, "columns": []}

        numeric_cols = ["price", "area", "bedrooms", "bathrooms", "parking",
                        "hospital_distance", "metro_distance", "crime_rate",
                        "rental_yield", "market_growth"]
        available = [c for c in numeric_cols if c in df.columns and df[c].dtype in ["int64", "float64"]]
        if len(available) < 2:
            return {"matrix": {}, "columns": []}

        corr_matrix = df[available].corr().round(3)
        return {
            "matrix": corr_matrix.to_dict(),
            "columns": available,
        }

    def get_distribution(self, field: str = "price") -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty or field not in df.columns:
            return {"bins": [], "counts": []}

        data = df[field].dropna()
        if data.empty:
            return {"bins": [], "counts": []}

        bins, counts = np.histogram(data, bins=20)
        return {
            "bins": [float(b) for b in bins],
            "counts": [int(c) for c in counts],
            "mean": float(data.mean()),
            "median": float(data.median()),
            "std": float(data.std()),
        }

    def get_monthly_trends(self, months: int = 12) -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty:
            return {"labels": [], "datasets": []}

        df["created_at"] = pd.to_datetime(df["created_at"], errors="coerce")
        df = df.dropna(subset=["created_at"])
        df["month"] = df["created_at"].dt.to_period("M").astype(str)

        monthly = df.groupby("month").agg(
            avg_price=("price", "mean"),
            count=("id", "count"),
            total_value=("price", "sum"),
        ).sort_index().tail(months)

        return {
            "labels": monthly.index.tolist(),
            "avg_price": monthly["avg_price"].round(2).tolist(),
            "count": monthly["count"].tolist(),
            "total_value": monthly["total_value"].round(2).tolist(),
        }

    def get_yearly_trends(self) -> Dict[str, Any]:
        df = self._load_dataframe()
        if df.empty:
            return {"labels": [], "datasets": []}

        df["year"] = pd.to_datetime(df["created_at"], errors="coerce").dt.year
        df = df.dropna(subset=["year"])

        yearly = df.groupby("year").agg(
            avg_price=("price", "mean"),
            count=("id", "count"),
        ).sort_index()

        return {
            "labels": yearly.index.astype(str).tolist(),
            "avg_price": yearly["avg_price"].round(2).tolist(),
            "count": yearly["count"].tolist(),
        }

    def get_top_cities(self, limit: int = 10) -> List[Dict[str, Any]]:
        df = self._load_dataframe()
        if df.empty:
            return []

        grouped = df.groupby("city").agg(
            avg_price=("price", "mean"),
            count=("id", "count"),
            avg_area=("area", "mean"),
        ).sort_values("count", ascending=False).head(limit)

        return [
            {
                "city": city,
                "avg_price": float(row["avg_price"]),
                "count": int(row["count"]),
                "avg_area": float(row["avg_area"]),
            }
            for city, row in grouped.iterrows()
        ]

    def get_investment_scores(self) -> List[Dict[str, Any]]:
        df = self._load_dataframe()
        if df.empty:
            return []

        df["investment_score"] = (
            (df["rental_yield"].rank(pct=True) * 30) +
            (df["market_growth"].rank(pct=True) * 30) +
            ((1 - df["crime_rate"].rank(pct=True)) * 20) +
            ((1 - df["price"].rank(pct=True)) * 20)
        ).fillna(0)

        top = df.nlargest(20, "investment_score")
        return [
            {
                "id": int(row["id"]),
                "title": row["title"],
                "city": row["city"],
                "price": float(row["price"]),
                "rental_yield": float(row["rental_yield"]),
                "market_growth": float(row["market_growth"]),
                "investment_score": round(float(row["investment_score"]), 2),
            }
            for _, row in top.iterrows()
        ]
