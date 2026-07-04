"""
Price Prediction Module
Loads trained model and predicts property prices
"""
import pandas as pd
import numpy as np
import joblib
import os
import logging
from typing import Optional

from config import MODEL_DIR, MODEL_PARAMS

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


def load_model(model_name: str = "XGBoost", model_dir: str = MODEL_DIR) -> tuple:
    model_path = os.path.join(model_dir, f"{model_name}.joblib")
    scaler_path = os.path.join(model_dir, "scaler.joblib")
    features_path = os.path.join(model_dir, "features.joblib")
    encoders_path = os.path.join(model_dir, "encoders.joblib")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}. Run train.py first.")
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler not found: {scaler_path}. Run train.py first.")
    if not os.path.exists(features_path):
        raise FileNotFoundError(f"Features file not found: {features_path}. Run train.py first.")

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    feature_cols = joblib.load(features_path)
    label_encoders = joblib.load(encoders_path) if os.path.exists(encoders_path) else {}

    logger.info("Loaded model: %s | Features: %d | Encoders: %d",
                model_name, len(feature_cols), len(label_encoders))
    return model, scaler, feature_cols, label_encoders


def predict_price(model, scaler, features: dict, feature_cols: list, label_encoders: dict) -> dict:
    input_df = pd.DataFrame([features])

    for col in feature_cols:
        if col not in input_df.columns:
            input_df[col] = 0

    input_df = input_df[feature_cols]

    for col, le in label_encoders.items():
        if col in input_df.columns:
            val = str(input_df[col].iloc[0])
            if val in le.classes_:
                input_df[col] = le.transform([val])[0]
            else:
                input_df[col] = 0

    for col in feature_cols:
        input_df[col] = pd.to_numeric(input_df[col], errors="coerce").fillna(0)

    X = scaler.transform(input_df.values)
    predicted_price = model.predict(X)[0]

    result = {
        "predicted_price": round(predicted_price, 2),
        "predicted_price_formatted": f"${predicted_price:,.2f}",
        "input_features": features,
    }
    logger.info("Predicted price: $%s", f"{predicted_price:,.2f}")
    return result


def explain_prediction(model, features: dict, feature_cols: list, label_encoders: dict, scaler=None) -> dict:
    input_df = pd.DataFrame([features])
    for col in feature_cols:
        if col not in input_df.columns:
            input_df[col] = 0
    input_df = input_df[feature_cols]

    for col, le in label_encoders.items():
        if col in input_df.columns:
            val = str(input_df[col].iloc[0])
            if val in le.classes_:
                input_df[col] = le.transform([val])[0]
            else:
                input_df[col] = 0

    for col in feature_cols:
        input_df[col] = pd.to_numeric(input_df[col], errors="coerce").fillna(0)

    if scaler is not None:
        X = scaler.transform(input_df.values)
    else:
        X = input_df.values

    contributions = {}

    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        input_vals = input_df.values.flatten()
        weighted = importances * np.abs(input_vals)
        total = weighted.sum() if weighted.sum() > 0 else 1

        for i, col in enumerate(feature_cols):
            if i < len(importances):
                contributions[col] = {
                    "importance": round(float(importances[i]), 4),
                    "value": round(float(input_vals[i]), 4),
                    "weighted_contribution": round(float(weighted[i]), 4),
                    "contribution_pct": round(float(weighted[i] / total * 100), 2),
                }
    elif hasattr(model, "coef_"):
        coefs = model.coef_.flatten()
        input_vals = input_df.values.flatten()
        weighted = coefs * input_vals
        total = np.abs(weighted).sum() if np.abs(weighted).sum() > 0 else 1

        for i, col in enumerate(feature_cols):
            if i < len(coefs):
                contributions[col] = {
                    "coefficient": round(float(coefs[i]), 4),
                    "value": round(float(input_vals[i]), 4),
                    "weighted_contribution": round(float(weighted[i]), 4),
                    "contribution_pct": round(float(np.abs(weighted[i]) / total * 100), 2),
                }

    sorted_contributions = dict(
        sorted(contributions.items(), key=lambda x: abs(x[1].get("weighted_contribution", 0)), reverse=True)
    )

    prediction = model.predict(X)[0]

    explanation = {
        "predicted_price": round(prediction, 2),
        "predicted_price_formatted": f"${prediction:,.2f}",
        "top_positive_factors": {k: v for k, v in sorted_contributions.items() if v.get("weighted_contribution", 0) > 0},
        "top_negative_factors": {k: v for k, v in sorted_contributions.items() if v.get("weighted_contribution", 0) < 0},
        "all_contributions": sorted_contributions,
    }
    return explanation


def batch_predict(model, scaler, df: pd.DataFrame, feature_cols: list, label_encoders: dict) -> pd.DataFrame:
    df_processed = df.copy()

    for col in feature_cols:
        if col not in df_processed.columns:
            df_processed[col] = 0

    df_processed = df_processed[feature_cols]

    for col, le in label_encoders.items():
        if col in df_processed.columns:
            df_processed[col] = df_processed[col].astype(str).apply(
                lambda x: le.transform([x])[0] if x in le.classes_ else 0
            )

    for col in feature_cols:
        df_processed[col] = pd.to_numeric(df_processed[col], errors="coerce").fillna(0)

    X = scaler.transform(df_processed.values)
    predictions = model.predict(X)

    result_df = df.copy()
    result_df["predicted_price"] = np.round(predictions, 2)
    result_df["predicted_price_formatted"] = result_df["predicted_price"].apply(lambda x: f"${x:,.2f}")

    if "price" in result_df.columns:
        result_df["prediction_error"] = np.round(result_df["predicted_price"] - result_df["price"], 2)
        result_df["prediction_error_pct"] = np.round(
            np.abs(result_df["prediction_error"]) / result_df["price"].replace(0, 1) * 100, 2
        )

    logger.info("Batch prediction complete: %d properties", len(result_df))
    return result_df


def main():
    import sys
    from config import DATA_PATH

    logger.info("Price Prediction Module - Loading model...")
    try:
        model, scaler, feature_cols, label_encoders = load_model()
    except FileNotFoundError as e:
        logger.error(str(e))
        logger.info("Please run train.py first to train and save models.")
        return

    if os.path.exists(DATA_PATH):
        df = pd.read_csv(DATA_PATH)
        logger.info("Loaded %d properties from %s", len(df), DATA_PATH)

        sample = df.head(5)
        results = batch_predict(model, scaler, sample, feature_cols, label_encoders)
        print("\nBatch Predictions (first 5):")
        display_cols = [c for c in results.columns if c in ["price", "predicted_price", "predicted_price_formatted", "square_feet", "bedrooms", "location"]]
        print(results[display_cols].to_string(index=False))

        if len(df) > 5:
            single = df.iloc[5].to_dict()
            print(f"\nSingle Property Prediction:")
            print(f"Input: {single}")
            result = predict_price(model, scaler, single, feature_cols, label_encoders)
            print(f"Predicted Price: {result['predicted_price_formatted']}")

            explanation = explain_prediction(model, single, feature_cols, label_encoders, scaler)
            print(f"\nTop Contributing Factors:")
            for feat, info in list(explanation["top_positive_factors"].items())[:5]:
                print(f"  + {feat}: {info.get('contribution_pct', 0):.1f}%")
            for feat, info in list(explanation["top_negative_factors"].items())[:3]:
                print(f"  - {feat}: {info.get('contribution_pct', 0):.1f}%")
    else:
        logger.info("No dataset found. Testing with synthetic input...")
        synthetic = {
            "square_feet": 2000,
            "bedrooms": 3,
            "bathrooms": 2,
            "lot_size": 0.25,
            "garage_spaces": 2,
            "year_built": 2005,
            "location": "Suburban",
            "property_type": "House",
            "condition": "Good",
            "has_pool": 1,
            "hoa_fee": 150,
        }
        result = predict_price(model, scaler, synthetic, feature_cols, label_encoders)
        print(f"\nSynthetic Property Prediction: {result['predicted_price_formatted']}")

        explanation = explain_prediction(model, synthetic, feature_cols, label_encoders, scaler)
        print(f"\nTop Contributing Factors:")
        for feat, info in list(explanation["top_positive_factors"].items())[:5]:
            print(f"  + {feat}: {info.get('contribution_pct', 0):.1f}%")


if __name__ == "__main__":
    main()
