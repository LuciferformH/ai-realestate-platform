"""
Exploratory Data Analysis for Real Estate Data
"""
import pandas as pd
import numpy as np
import json
import os
from typing import Dict, Any, List, Optional, Tuple


def basic_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate basic statistics for all numeric columns.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary containing mean, median, std, min, max, quartiles for each numeric column
    """
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    if not numeric_cols:
        return {"message": "No numeric columns found"}
    
    stats = {}
    for col in numeric_cols:
        col_data = df[col].dropna()
        if len(col_data) > 0:
            stats[col] = {
                "mean": float(col_data.mean()),
                "median": float(col_data.median()),
                "std": float(col_data.std()),
                "min": float(col_data.min()),
                "max": float(col_data.max()),
                "q1": float(col_data.quantile(0.25)),
                "q3": float(col_data.quantile(0.75)),
                "iqr": float(col_data.quantile(0.75) - col_data.quantile(0.25)),
                "skewness": float(col_data.skew()),
                "kurtosis": float(col_data.kurtosis()),
                "count": int(len(col_data)),
                "missing": int(df[col].isna().sum()),
                "missing_pct": float(df[col].isna().sum() / len(df) * 100)
            }
    
    return {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "numeric_columns": numeric_cols,
        "statistics": stats
    }


def correlation_analysis(df: pd.DataFrame, top_n: int = 10) -> Dict[str, Any]:
    """
    Perform correlation analysis on numeric columns.
    
    Args:
        df: Input DataFrame
        top_n: Number of top correlated pairs to return
        
    Returns:
        Dictionary containing correlation matrix and top correlated pairs
    """
    numeric_df = df.select_dtypes(include=[np.number])
    
    if numeric_df.shape[1] < 2:
        return {"message": "Need at least 2 numeric columns for correlation analysis"}
    
    corr_matrix = numeric_df.corr()
    
    # Get top correlated pairs (excluding self-correlations)
    pairs = []
    for i in range(len(corr_matrix.columns)):
        for j in range(i + 1, len(corr_matrix.columns)):
            col1 = corr_matrix.columns[i]
            col2 = corr_matrix.columns[j]
            corr_value = corr_matrix.iloc[i, j]
            if not np.isnan(corr_value):
                pairs.append({
                    "column1": col1,
                    "column2": col2,
                    "correlation": float(corr_value),
                    "strength": _get_correlation_strength(corr_value)
                })
    
    # Sort by absolute correlation
    pairs.sort(key=lambda x: abs(x["correlation"]), reverse=True)
    
    return {
        "correlation_matrix": corr_matrix.to_dict(),
        "top_correlated_pairs": pairs[:top_n],
        "total_pairs": len(pairs)
    }


def _get_correlation_strength(corr_value: float) -> str:
    """Determine correlation strength based on value."""
    abs_corr = abs(corr_value)
    if abs_corr >= 0.8:
        return "Very Strong"
    elif abs_corr >= 0.6:
        return "Strong"
    elif abs_corr >= 0.4:
        return "Moderate"
    elif abs_corr >= 0.2:
        return "Weak"
    else:
        return "Very Weak"


def distribution_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze distribution of numeric columns.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary containing skewness and kurtosis for each numeric column
    """
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    distributions = {}
    for col in numeric_cols:
        col_data = df[col].dropna()
        if len(col_data) > 0:
            distributions[col] = {
                "skewness": float(col_data.skew()),
                "kurtosis": float(col_data.kurtosis()),
                "distribution_type": _get_distribution_type(col_data.skew(), col_data.kurtosis()),
                "normality_test": {
                    "is_likely_normal": abs(col_data.skew()) < 0.5 and abs(col_data.kurtosis()) < 3,
                    "skew_interpretation": _interpret_skewness(col_data.skew()),
                    "kurtosis_interpretation": _interpret_kurtosis(col_data.kurtosis())
                }
            }
    
    return {"distributions": distributions}


def _get_distribution_type(skewness: float, kurtosis: float) -> str:
    """Determine distribution type based on skewness and kurtosis."""
    if abs(skewness) < 0.5 and abs(kurtosis) < 3:
        return "Approximately Normal"
    elif skewness > 0.5:
        return "Right Skewed"
    elif skewness < -0.5:
        return "Left Skewed"
    elif kurtosis > 3:
        return "Leptokurtic (Heavy Tailed)"
    elif kurtosis < 3:
        return "Platykurtic (Light Tailed)"
    return "Unknown"


def _interpret_skewness(skewness: float) -> str:
    """Interpret skewness value."""
    if abs(skewness) < 0.5:
        return "Approximately symmetric"
    elif skewness >= 0.5 and skewness < 1:
        return "Moderately right skewed"
    elif skewness >= 1:
        return "Highly right skewed"
    elif skewness <= -0.5 and skewness > -1:
        return "Moderately left skewed"
    else:
        return "Highly left skewed"


def _interpret_kurtosis(kurtosis: float) -> str:
    """Interpret kurtosis value."""
    if abs(kurtosis) < 3:
        return "Mesokurtic (similar to normal)"
    elif kurtosis > 3:
        return "Leptokurtic (heavy tails, sharp peak)"
    else:
        return "Platykurtic (light tails, flat peak)"


def outlier_detection(df: pd.DataFrame, method: str = "iqr") -> Dict[str, Any]:
    """
    Detect outliers using IQR method or z-score.
    
    Args:
        df: Input DataFrame
        method: Detection method ('iqr' or 'zscore')
        
    Returns:
        Dictionary containing outliers for each column
    """
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    
    outliers = {}
    for col in numeric_cols:
        col_data = df[col].dropna()
        if len(col_data) > 0:
            if method == "iqr":
                Q1 = col_data.quantile(0.25)
                Q3 = col_data.quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                outlier_mask = (col_data < lower_bound) | (col_data > upper_bound)
            else:  # zscore
                mean = col_data.mean()
                std = col_data.std()
                if std == 0:
                    outlier_mask = pd.Series([False] * len(col_data), index=col_data.index)
                else:
                    z_scores = np.abs((col_data - mean) / std)
                    outlier_mask = z_scores > 3
                    lower_bound = mean - 3 * std
                    upper_bound = mean + 3 * std
            
            outlier_count = outlier_mask.sum()
            outliers[col] = {
                "count": int(outlier_count),
                "percentage": float(outlier_count / len(col_data) * 100),
                "lower_bound": float(lower_bound),
                "upper_bound": float(upper_bound),
                "outlier_indices": col_data[outlier_mask].index.tolist()[:100],  # Limit to 100
                "outlier_values": col_data[outlier_mask].tolist()[:100]
            }
    
    return {
        "method": method,
        "total_outliers": sum(o["count"] for o in outliers.values()),
        "outliers_by_column": outliers
    }


def missing_value_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze missing values in the DataFrame.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary containing missing value counts, percentages, and patterns
    """
    total_cells = df.shape[0] * df.shape[1]
    total_missing = df.isna().sum().sum()
    
    column_missing = {}
    for col in df.columns:
        missing_count = df[col].isna().sum()
        if missing_count > 0:
            column_missing[col] = {
                "count": int(missing_count),
                "percentage": float(missing_count / len(df) * 100),
                "dtype": str(df[col].dtype)
            }
    
    # Missing value patterns
    missing_patterns = df.isna().sum(axis=1).value_counts().sort_index().to_dict()
    
    # Columns with no missing values
    complete_columns = df.columns[df.isna().sum() == 0].tolist()
    
    return {
        "total_rows": len(df),
        "total_columns": len(df.columns),
        "total_cells": total_cells,
        "total_missing": int(total_missing),
        "overall_missing_pct": float(total_missing / total_cells * 100) if total_cells > 0 else 0,
        "columns_with_missing": column_missing,
        "columns_without_missing": complete_columns,
        "missing_patterns": missing_patterns,
        "complete_rows": int((df.isna().sum(axis=1) == 0).sum()),
        "complete_rows_pct": float((df.isna().sum(axis=1) == 0).sum() / len(df) * 100)
    }


def categorical_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze categorical columns.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary containing value counts for categorical columns
    """
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    # Also include columns with few unique values
    for col in df.columns:
        if col not in categorical_cols and df[col].nunique() < 20:
            categorical_cols.append(col)
    
    categorical_stats = {}
    for col in categorical_cols:
        value_counts = df[col].value_counts()
        categorical_stats[col] = {
            "unique_count": int(df[col].nunique()),
            "top_values": value_counts.head(10).to_dict(),
            "top_value": str(value_counts.index[0]) if len(value_counts) > 0 else None,
            "top_value_pct": float(value_counts.iloc[0] / len(df) * 100) if len(value_counts) > 0 else 0,
            "missing": int(df[col].isna().sum()),
            "missing_pct": float(df[col].isna().sum() / len(df) * 100)
        }
    
    return {"categorical_columns": categorical_stats}


def price_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze price distributions by various categories.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary containing price analysis by city, type, bedrooms, etc.
    """
    if 'price' not in df.columns:
        return {"message": "No 'price' column found in DataFrame"}
    
    analysis = {
        "overall": {
            "mean": float(df['price'].mean()),
            "median": float(df['price'].median()),
            "std": float(df['price'].std()),
            "min": float(df['price'].min()),
            "max": float(df['price'].max())
        }
    }
    
    # Price by city
    if 'city' in df.columns:
        city_stats = df.groupby('city')['price'].agg(['mean', 'median', 'std', 'count']).to_dict('index')
        analysis["by_city"] = {k: {kk: float(vv) if kk != 'count' else int(vv) 
                                    for kk, vv in v.items()} 
                               for k, v in city_stats.items()}
    
    # Price by property type
    if 'property_type' in df.columns:
        type_stats = df.groupby('property_type')['price'].agg(['mean', 'median', 'std', 'count']).to_dict('index')
        analysis["by_property_type"] = {k: {kk: float(vv) if kk != 'count' else int(vv) 
                                             for kk, vv in v.items()} 
                                        for k, v in type_stats.items()}
    
    # Price by bedrooms
    if 'bedrooms' in df.columns:
        bedroom_stats = df.groupby('bedrooms')['price'].agg(['mean', 'median', 'std', 'count']).to_dict('index')
        analysis["by_bedrooms"] = {str(k): {kk: float(vv) if kk != 'count' else int(vv) 
                                             for kk, vv in v.items()} 
                                   for k, v in bedroom_stats.items()}
    
    # Price by bathrooms
    if 'bathrooms' in df.columns:
        bathroom_stats = df.groupby('bathrooms')['price'].agg(['mean', 'median', 'std', 'count']).to_dict('index')
        analysis["by_bathrooms"] = {str(k): {kk: float(vv) if kk != 'count' else int(vv) 
                                              for kk, vv in v.items()} 
                                    for k, v in bathroom_stats.items()}
    
    # Price by condition
    if 'condition' in df.columns:
        condition_stats = df.groupby('condition')['price'].agg(['mean', 'median', 'std', 'count']).to_dict('index')
        analysis["by_condition"] = {k: {kk: float(vv) if kk != 'count' else int(vv) 
                                         for kk, vv in v.items()} 
                                    for k, v in condition_stats.items()}
    
    return analysis


def area_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze area distributions and price per square foot.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary containing area analysis
    """
    analysis = {}
    
    # Area statistics
    if 'area_sqft' in df.columns:
        area_data = df['area_sqft'].dropna()
        analysis["area_statistics"] = {
            "mean": float(area_data.mean()),
            "median": float(area_data.median()),
            "std": float(area_data.std()),
            "min": float(area_data.min()),
            "max": float(area_data.max()),
            "q1": float(area_data.quantile(0.25)),
            "q3": float(area_data.quantile(0.75))
        }
        
        # Area distribution by property type
        if 'property_type' in df.columns:
            analysis["area_by_type"] = df.groupby('property_type')['area_sqft'].agg(['mean', 'median', 'count']).to_dict('index')
            analysis["area_by_type"] = {k: {kk: float(vv) if kk != 'count' else int(vv) 
                                             for kk, vv in v.items()} 
                                        for k, v in analysis["area_by_type"].items()}
    
    # Price per square foot
    if 'price' in df.columns and 'area_sqft' in df.columns:
        df_temp = df[['price', 'area_sqft']].dropna()
        df_temp = df_temp[df_temp['area_sqft'] > 0]
        df_temp['price_per_sqft'] = df_temp['price'] / df_temp['area_sqft']
        
        analysis["price_per_sqft"] = {
            "mean": float(df_temp['price_per_sqft'].mean()),
            "median": float(df_temp['price_per_sqft'].median()),
            "std": float(df_temp['price_per_sqft'].std()),
            "min": float(df_temp['price_per_sqft'].min()),
            "max": float(df_temp['price_per_sqft'].max())
        }
        
        # Price per sqft by city
        if 'city' in df.columns:
            df_temp['city'] = df.loc[df_temp.index, 'city']
            ppsf_by_city = df_temp.groupby('city')['price_per_sqft'].agg(['mean', 'median', 'count']).to_dict('index')
            analysis["price_per_sqft_by_city"] = {k: {kk: float(vv) if kk != 'count' else int(vv) 
                                                       for kk, vv in v.items()} 
                                                  for k, v in ppsf_by_city.items()}
    
    return analysis


def time_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze time-based trends including year built and property age.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary containing time analysis
    """
    analysis = {}
    
    current_year = pd.Timestamp.now().year
    
    # Year built analysis
    if 'year_built' in df.columns:
        year_data = df['year_built'].dropna()
        analysis["year_built_statistics"] = {
            "mean": float(year_data.mean()),
            "median": float(year_data.median()),
            "min": int(year_data.min()),
            "max": int(year_data.max()),
            "std": float(year_data.std())
        }
        
        # Properties by decade
        df_temp = df[['year_built']].dropna()
        df_temp['decade'] = (df_temp['year_built'] // 10 * 10).astype(int)
        decade_counts = df_temp['decade'].value_counts().sort_index()
        analysis["properties_by_decade"] = {str(k): int(v) for k, v in decade_counts.items()}
        
        # Price by year built
        if 'price' in df.columns:
            price_by_year = df.groupby('year_built')['price'].agg(['mean', 'count']).to_dict('index')
            analysis["price_by_year_built"] = {str(k): {"mean": float(v['mean']), "count": int(v['count'])}
                                                for k, v in price_by_year.items()}
    
    # Property age analysis
    if 'year_built' in df.columns:
        df_temp = df[['year_built']].dropna()
        df_temp['age'] = current_year - df_temp['year_built']
        
        analysis["age_statistics"] = {
            "mean": float(df_temp['age'].mean()),
            "median": float(df_temp['age'].median()),
            "min": int(df_temp['age'].min()),
            "max": int(df_temp['age'].max()),
            "std": float(df_temp['age'].std())
        }
        
        # Age groups
        age_bins = [0, 5, 10, 20, 30, 50, 100, 200]
        age_labels = ['0-5 years', '6-10 years', '11-20 years', '21-30 years', 
                      '31-50 years', '51-100 years', '100+ years']
        df_temp['age_group'] = pd.cut(df_temp['age'], bins=age_bins, labels=age_labels, right=False)
        age_groups = df_temp['age_group'].value_counts()
        analysis["age_groups"] = {str(k): int(v) for k, v in age_groups.items()}
        
        # Price by age group
        if 'price' in df.columns:
            df_temp['price'] = df.loc[df_temp.index, 'price']
            price_by_age = df_temp.groupby('age_group', observed=True)['price'].agg(['mean', 'count'])
            analysis["price_by_age_group"] = {str(k): {"mean": float(v['mean']), "count": int(v['count'])}
                                               for k, v in price_by_age.to_dict('index').items()}
    
    return analysis


def generate_eda_report(df: pd.DataFrame, output_dir: str) -> Dict[str, Any]:
    """
    Generate comprehensive EDA report with all analyses.
    
    Args:
        df: Input DataFrame
        output_dir: Directory to save the report
        
    Returns:
        Dictionary containing all analyses
    """
    os.makedirs(output_dir, exist_ok=True)
    
    report = {
        "basic_statistics": basic_statistics(df),
        "correlation_analysis": correlation_analysis(df),
        "distribution_analysis": distribution_analysis(df),
        "outlier_detection": outlier_detection(df),
        "missing_value_analysis": missing_value_analysis(df),
        "categorical_analysis": categorical_analysis(df),
        "price_analysis": price_analysis(df),
        "area_analysis": area_analysis(df),
        "time_analysis": time_analysis(df),
        "data_summary": {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()}
        }
    }
    
    # Save report as JSON
    report_path = os.path.join(output_dir, "eda_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    # Generate summary statistics CSV
    summary_path = os.path.join(output_dir, "basic_statistics.csv")
    stats_df = pd.DataFrame(report["basic_statistics"]["statistics"]).T
    stats_df.to_csv(summary_path)
    
    return report
