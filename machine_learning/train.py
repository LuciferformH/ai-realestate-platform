"""
ML Training Pipeline for Real Estate Price Prediction
Trains and compares: LinearRegression, RandomForest, GradientBoosting, XGBoost
"""
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
import joblib
import json
import os
import logging
from datetime import datetime

from config import DATA_PATH, MODEL_DIR, OUTPUT_DIR, RANDOM_STATE, TEST_SIZE, CV_FOLDS, MODEL_PARAMS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(OUTPUT_DIR, "training.log")),
    ],
)
logger = logging.getLogger(__name__)


def load_data(path: str) -> pd.DataFrame:
    logger.info("Loading data from %s", path)
    if not os.path.exists(path):
        logger.warning("File not found: %s. Generating synthetic dataset.", path)
        df = _generate_synthetic_data()
        os.makedirs(os.path.dirname(path), exist_ok=True)
        df.to_csv(path, index=False)
        logger.info("Synthetic dataset saved to %s", path)
        return df
    df = pd.read_csv(path)
    logger.info("Loaded %d rows, %d columns", df.shape[0], df.shape[1])

    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())

    categorical_cols = df.select_dtypes(include=["object", "category"]).columns
    for col in categorical_cols:
        df[col].fillna(df[col].mode().iloc[0] if not df[col].mode().empty else "Unknown", inplace=True)

    rows_before = df.shape[0]
    df.drop_duplicates(inplace=True)
    logger.info("Removed %d duplicate rows", rows_before - df.shape[0])

    return df


def _generate_synthetic_data() -> pd.DataFrame:
    np.random.seed(RANDOM_STATE)
    n = 2000
    locations = ["Downtown", "Suburban", "Rural", "Urban", "Waterfront"]
    property_types = ["House", "Apartment", "Condo", "Townhouse", "Villa"]
    condition_labels = ["Excellent", "Good", "Average", "Below Average", "Poor"]

    data = {
        "square_feet": np.random.randint(500, 5000, n),
        "bedrooms": np.random.randint(1, 7, n),
        "bathrooms": np.random.randint(1, 5, n),
        "lot_size": np.random.uniform(0.1, 5.0, n).round(2),
        "garage_spaces": np.random.randint(0, 4, n),
        "year_built": np.random.randint(1950, 2025, n),
        "location": np.random.choice(locations, n),
        "property_type": np.random.choice(property_types, n),
        "condition": np.random.choice(condition_labels, n),
        "has_pool": np.random.choice([0, 1], n, p=[0.7, 0.3]),
        "hoa_fee": np.random.uniform(0, 500, n).round(2),
    }

    location_premium = {"Waterfront": 80000, "Downtown": 60000, "Urban": 30000, "Suburban": 10000, "Rural": -10000}
    type_premium = {"Villa": 120000, "House": 50000, "Condo": 20000, "Townhouse": 10000, "Apartment": -20000}
    condition_mult = {"Excellent": 1.3, "Good": 1.15, "Average": 1.0, "Below Average": 0.85, "Poor": 0.7}

    base_price = (
        50000
        + data["square_feet"] * 150
        + data["bedrooms"] * 15000
        + data["bathrooms"] * 12000
        + data["garage_spaces"] * 20000
        + (2026 - np.array(data["year_built"])) * -500
        + np.array([location_premium[loc] for loc in data["location"]])
        + np.array([type_premium[pt] for pt in data["property_type"]])
        + np.array([condition_mult[c] for c in data["condition"]]) * 50000
        + data["has_pool"] * 35000
        + data["lot_size"] * 15000
        - data["hoa_fee"] * 50
        + np.random.normal(0, 25000, n)
    )

    data["price"] = np.clip(base_price, 50000, 2000000).round(0).astype(int)
    return pd.DataFrame(data)


def preprocess(df: pd.DataFrame) -> tuple[pd.DataFrame, list[str], dict]:
    logger.info("Preprocessing data...")
    df = df.copy()

    if "price" in df.columns:
        q_low = df["price"].quantile(0.01)
        q_high = df["price"].quantile(0.99)
        df = df[(df["price"] >= q_low) & (df["price"] <= q_high)].reset_index(drop=True)
        logger.info("After outlier removal: %d rows", df.shape[0])

    df["house_age"] = 2026 - df["year_built"] if "year_built" in df.columns else 0
    df["total_rooms"] = df["bedrooms"] + df["bathrooms"] if "bedrooms" in df.columns and "bathrooms" in df.columns else 0
    df["bed_bath_ratio"] = np.where(df["bathrooms"] > 0, df["bedrooms"] / df["bathrooms"], 0) if "bedrooms" in df.columns and "bathrooms" in df.columns else 0
    df["price_per_sqft_est"] = df["price"] / df["square_feet"] if "square_feet" in df.columns and "price" in df.columns else 0
    df["lot_per_sqft"] = np.where(df["square_feet"] > 0, df["lot_size"] * 43560 / df["square_feet"], 0) if "lot_size" in df.columns and "square_feet" in df.columns else 0

    label_encoders = {}
    categorical_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    target_col = "price"
    feature_cols = [c for c in df.columns if c != target_col]
    categorical_cols_in_features = [c for c in categorical_cols if c in feature_cols]

    for col in categorical_cols_in_features:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        label_encoders[col] = le
        logger.info("Encoded column '%s': %d classes", col, len(le.classes_))

    feature_cols = [c for c in df.columns if c != target_col]
    logger.info("Final feature count: %d", len(feature_cols))
    return df, feature_cols, label_encoders


def train_models(X_train: np.ndarray, y_train: np.ndarray) -> dict:
    logger.info("Training models...")
    models = {}

    model_classes = {
        "LinearRegression": lambda params: LinearRegression(**{k: v for k, v in params.items() if k != "n_jobs"}),
        "RandomForest": lambda params: RandomForestRegressor(**params),
        "GradientBoosting": lambda params: GradientBoostingRegressor(**params),
        "XGBoost": lambda params: XGBRegressor(**params),
    }

    for name, builder in model_classes.items():
        logger.info("Training %s...", name)
        params = MODEL_PARAMS.get(name, {})
        model = builder(params)
        model.fit(X_train, y_train)

        scores = cross_val_score(model, X_train, y_train, cv=CV_FOLDS, scoring="r2")
        logger.info("%s CV R2: %.4f (+/- %.4f)", name, scores.mean(), scores.std())

        models[name] = {"model": model, "cv_r2_mean": scores.mean(), "cv_r2_std": scores.std()}
        logger.info("%s trained successfully.", name)

    return models


def evaluate_model(model, X_test: np.ndarray, y_test: np.ndarray) -> dict:
    y_pred = model.predict(X_test)
    metrics = {
        "MAE": round(mean_absolute_error(y_test, y_pred), 2),
        "RMSE": round(np.sqrt(mean_squared_error(y_test, y_pred)), 2),
        "R2": round(r2_score(y_test, y_pred), 4),
        "MAPE": round(np.mean(np.abs((y_test - y_pred) / np.where(y_test == 0, 1, y_test))) * 100, 2),
    }
    return metrics


def compare_models(results: dict) -> pd.DataFrame:
    comparison = []
    for name, data in results.items():
        row = {"Model": name}
        row.update(data["test_metrics"])
        row["CV_R2_Mean"] = round(data["cv_r2_mean"], 4)
        row["CV_R2_Std"] = round(data["cv_r2_std"], 4)
        comparison.append(row)
    df = pd.DataFrame(comparison).sort_values("R2", ascending=False).reset_index(drop=True)
    df.index = df.index + 1
    df.index.name = "Rank"
    return df


def save_models(models: dict, feature_cols: list, label_encoders: dict, output_path: str):
    os.makedirs(output_path, exist_ok=True)

    scaler_path = os.path.join(output_path, "scaler.joblib")
    features_path = os.path.join(output_path, "features.joblib")
    encoders_path = os.path.join(output_path, "encoders.joblib")

    for name, data in models.items():
        path = os.path.join(output_path, f"{name}.joblib")
        joblib.dump(data["model"], path)
        logger.info("Saved model: %s", path)

    joblib.dump(feature_cols, features_path)
    joblib.dump(label_encoders, encoders_path)

    metadata = {
        "feature_columns": feature_cols,
        "label_encoders": {k: v.classes_.tolist() for k, v in label_encoders.items()},
        "trained_at": datetime.now().isoformat(),
        "models": {name: {"cv_r2_mean": data["cv_r2_mean"], "cv_r2_std": data["cv_r2_std"]} for name, data in models.items()},
    }
    meta_path = os.path.join(output_path, "metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
    logger.info("Saved metadata to %s", meta_path)


def create_feature_importance_chart(model, feature_names: list, model_name: str, output_dir: str):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    elif hasattr(model, "coef_"):
        importances = np.abs(model.coef_)
    else:
        logger.warning("Model %s does not support feature importances.", model_name)
        return None

    indices = np.argsort(importances)[::-1][:20]
    top_names = [feature_names[i] if i < len(feature_names) else f"Feature_{i}" for i in indices]
    top_importances = importances[indices]

    fig, ax = plt.subplots(figsize=(10, 6))
    bars = ax.barh(range(len(top_names)), top_importances, color="steelblue", edgecolor="black", linewidth=0.5)
    ax.set_yticks(range(len(top_names)))
    ax.set_yticklabels(top_names, fontsize=9)
    ax.invert_yaxis()
    ax.set_xlabel("Importance", fontsize=11)
    ax.set_title(f"Top Feature Importances - {model_name}", fontsize=13, fontweight="bold")
    ax.grid(axis="x", alpha=0.3)
    plt.tight_layout()

    path = os.path.join(output_dir, f"{model_name}_feature_importance.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved feature importance chart: %s", path)
    return path


def create_prediction_vs_actual_chart(y_test, y_pred, model_name: str, output_dir: str):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, ax = plt.subplots(figsize=(8, 8))
    ax.scatter(y_test, y_pred, alpha=0.4, s=15, c="steelblue", edgecolors="black", linewidth=0.3)

    min_val = min(y_test.min(), y_pred.min()) * 0.9
    max_val = max(y_test.max(), y_pred.max()) * 1.1
    ax.plot([min_val, max_val], [min_val, max_val], "r--", linewidth=2, label="Perfect Prediction")

    ax.set_xlabel("Actual Price ($)", fontsize=11)
    ax.set_ylabel("Predicted Price ($)", fontsize=11)
    ax.set_title(f"Predicted vs Actual - {model_name}", fontsize=13, fontweight="bold")
    ax.legend(fontsize=10)
    ax.grid(True, alpha=0.3)
    ax.set_aspect("equal", adjustable="box")
    plt.tight_layout()

    path = os.path.join(output_dir, f"{model_name}_pred_vs_actual.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved prediction vs actual chart: %s", path)
    return path


def create_residual_plot(y_test, y_pred, model_name: str, output_dir: str):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    residuals = y_test - y_pred

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    axes[0].scatter(y_pred, residuals, alpha=0.4, s=15, c="steelblue", edgecolors="black", linewidth=0.3)
    axes[0].axhline(y=0, color="red", linestyle="--", linewidth=1.5)
    axes[0].set_xlabel("Predicted Price ($)", fontsize=11)
    axes[0].set_ylabel("Residual ($)", fontsize=11)
    axes[0].set_title("Residuals vs Predicted", fontsize=12, fontweight="bold")
    axes[0].grid(True, alpha=0.3)

    axes[1].hist(residuals, bins=40, color="steelblue", edgecolor="black", linewidth=0.5, alpha=0.8)
    axes[1].axvline(x=0, color="red", linestyle="--", linewidth=1.5)
    axes[1].set_xlabel("Residual ($)", fontsize=11)
    axes[1].set_ylabel("Frequency", fontsize=11)
    axes[1].set_title("Residual Distribution", fontsize=12, fontweight="bold")
    axes[1].grid(True, alpha=0.3)

    fig.suptitle(f"Residual Analysis - {model_name}", fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()

    path = os.path.join(output_dir, f"{model_name}_residuals.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved residual plot: %s", path)
    return path


def create_model_comparison_chart(comparison_df: pd.DataFrame, output_dir: str):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    models = comparison_df["Model"].values
    colors = ["#2196F3", "#4CAF50", "#FF9800", "#E91E63"]

    axes[0].barh(models, comparison_df["MAE"].values, color=colors[: len(models)], edgecolor="black", linewidth=0.5)
    axes[0].set_xlabel("MAE ($)")
    axes[0].set_title("Mean Absolute Error", fontweight="bold")
    axes[0].grid(axis="x", alpha=0.3)

    axes[1].barh(models, comparison_df["RMSE"].values, color=colors[: len(models)], edgecolor="black", linewidth=0.5)
    axes[1].set_xlabel("RMSE ($)")
    axes[1].set_title("Root Mean Squared Error", fontweight="bold")
    axes[1].grid(axis="x", alpha=0.3)

    axes[2].barh(models, comparison_df["R2"].values, color=colors[: len(models)], edgecolor="black", linewidth=0.5)
    axes[2].set_xlabel("R² Score")
    axes[2].set_title("R² Score (higher is better)", fontweight="bold")
    axes[2].grid(axis="x", alpha=0.3)
    axes[2].set_xlim(0, 1)

    fig.suptitle("Model Comparison", fontsize=14, fontweight="bold")
    plt.tight_layout()

    path = os.path.join(output_dir, "model_comparison.png")
    fig.savefig(path, dpi=150, bbox_inches="tight")
    plt.close(fig)
    logger.info("Saved model comparison chart: %s", path)
    return path


def main():
    logger.info("=" * 60)
    logger.info("ML Training Pipeline Started")
    logger.info("=" * 60)

    df = load_data(DATA_PATH)
    logger.info("Dataset shape: %s", df.shape)
    logger.info("Columns: %s", list(df.columns))

    df, feature_cols, label_encoders = preprocess(df)

    if "price" not in df.columns:
        logger.error("'price' column not found in dataset.")
        return

    X = df[feature_cols].values
    y = df["price"].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )
    logger.info("Train set: %d | Test set: %d", X_train.shape[0], X_test.shape[0])

    trained_models = train_models(X_train, y_train)

    results = {}
    for name, data in trained_models.items():
        metrics = evaluate_model(data["model"], X_test, y_test)
        results[name] = {
            "model": data["model"],
            "test_metrics": metrics,
            "cv_r2_mean": data["cv_r2_mean"],
            "cv_r2_std": data["cv_r2_std"],
        }
        logger.info("%s Test Metrics: %s", name, metrics)

    comparison_df = compare_models(results)
    logger.info("\nModel Comparison:\n%s", comparison_df.to_string())

    best_model_name = comparison_df.iloc[0]["Model"]
    best_model = results[best_model_name]["model"]
    logger.info("Best Model: %s (R2=%.4f)", best_model_name, results[best_model_name]["test_metrics"]["R2"])

    y_pred_best = best_model.predict(X_test)

    for name, data in results.items():
        create_feature_importance_chart(data["model"], feature_cols, name, OUTPUT_DIR)
        y_pred = data["model"].predict(X_test)
        create_prediction_vs_actual_chart(y_test, y_pred, name, OUTPUT_DIR)
        create_residual_plot(y_test, y_pred, name, OUTPUT_DIR)

    create_model_comparison_chart(comparison_df, OUTPUT_DIR)

    comparison_df.to_csv(os.path.join(OUTPUT_DIR, "model_comparison.csv"))

    all_scalers = {"scaler": scaler}
    save_models(trained_models, feature_cols, label_encoders, MODEL_DIR)

    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.joblib"))
    logger.info("Saved scaler to %s", os.path.join(MODEL_DIR, "scaler.joblib"))

    logger.info("=" * 60)
    logger.info("Training Pipeline Completed Successfully")
    logger.info("Best Model: %s", best_model_name)
    logger.info("Models saved to: %s", MODEL_DIR)
    logger.info("Charts saved to: %s", OUTPUT_DIR)
    logger.info("=" * 60)


if __name__ == "__main__":
    main()
