"""
Time Series and Trend Analysis for Real Estate Data
"""
import pandas as pd
import numpy as np
import json
import os
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime


def monthly_price_trends(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate average price by month.
    
    Args:
        df: Input DataFrame with 'price' and 'created_at' columns
        
    Returns:
        Dictionary containing monthly price trends
    """
    if 'price' not in df.columns:
        return {"message": "No 'price' column found"}
    
    if 'created_at' not in df.columns:
        return {"message": "No 'created_at' column found for temporal analysis"}
    
    df_temp = df[['price', 'created_at']].copy()
    df_temp['created_at'] = pd.to_datetime(df_temp['created_at'], errors='coerce')
    df_temp = df_temp.dropna(subset=['created_at'])
    
    df_temp['year_month'] = df_temp['created_at'].dt.to_period('M')
    
    monthly_stats = df_temp.groupby('year_month')['price'].agg(['mean', 'median', 'std', 'count'])
    
    trends = {}
    for period, row in monthly_stats.iterrows():
        trends[str(period)] = {
            "mean_price": float(row['mean']),
            "median_price": float(row['median']),
            "std_price": float(row['std']) if not np.isnan(row['std']) else 0,
            "listing_count": int(row['count'])
        }
    
    return {
        "monthly_trends": trends,
        "period_range": {
            "start": str(monthly_stats.index.min()),
            "end": str(monthly_stats.index.max()),
            "total_months": len(monthly_stats)
        }
    }


def yearly_price_trends(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate average price by year.
    
    Args:
        df: Input DataFrame with 'price' and 'created_at' columns
        
    Returns:
        Dictionary containing yearly price trends
    """
    if 'price' not in df.columns:
        return {"message": "No 'price' column found"}
    
    if 'created_at' not in df.columns:
        return {"message": "No 'created_at' column found for temporal analysis"}
    
    df_temp = df[['price', 'created_at']].copy()
    df_temp['created_at'] = pd.to_datetime(df_temp['created_at'], errors='coerce')
    df_temp = df_temp.dropna(subset=['created_at'])
    
    df_temp['year'] = df_temp['created_at'].dt.year
    
    yearly_stats = df_temp.groupby('year')['price'].agg(['mean', 'median', 'std', 'count'])
    
    trends = {}
    for year, row in yearly_stats.iterrows():
        trends[str(year)] = {
            "mean_price": float(row['mean']),
            "median_price": float(row['median']),
            "std_price": float(row['std']) if not np.isnan(row['std']) else 0,
            "listing_count": int(row['count'])
        }
    
    return {
        "yearly_trends": trends,
        "year_range": {
            "start": int(yearly_stats.index.min()),
            "end": int(yearly_stats.index.max()),
            "total_years": len(yearly_stats)
        }
    }


def growth_rate_calculation(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate year-over-year growth rates.
    
    Args:
        df: Input DataFrame with 'price' and 'created_at' columns
        
    Returns:
        Dictionary containing growth rates
    """
    if 'price' not in df.columns or 'created_at' not in df.columns:
        return {"message": "Required columns ('price', 'created_at') not found"}
    
    df_temp = df[['price', 'created_at']].copy()
    df_temp['created_at'] = pd.to_datetime(df_temp['created_at'], errors='coerce')
    df_temp = df_temp.dropna(subset=['created_at'])
    
    df_temp['year'] = df_temp['created_at'].dt.year
    yearly_avg = df_temp.groupby('year')['price'].mean()
    
    if len(yearly_avg) < 2:
        return {"message": "Need at least 2 years of data for growth rate calculation"}
    
    growth_rates = {}
    years = sorted(yearly_avg.index)
    
    for i in range(1, len(years)):
        prev_year = years[i - 1]
        curr_year = years[i]
        prev_price = yearly_avg[prev_year]
        curr_price = yearly_avg[curr_year]
        
        if prev_price > 0:
            growth_rate = ((curr_price - prev_price) / prev_price) * 100
        else:
            growth_rate = 0
        
        growth_rates[str(curr_year)] = {
            "previous_year": str(prev_year),
            "previous_avg_price": float(prev_price),
            "current_avg_price": float(curr_price),
            "growth_rate_pct": float(growth_rate),
            "absolute_change": float(curr_price - prev_price)
        }
    
    # Calculate CAGR if more than 2 years
    if len(yearly_avg) >= 2:
        first_year = years[0]
        last_year = years[-1]
        n_years = last_year - first_year
        if n_years > 0 and yearly_avg[first_year] > 0:
            cagr = ((yearly_avg[last_year] / yearly_avg[first_year]) ** (1 / n_years) - 1) * 100
        else:
            cagr = 0
        
        overall_stats = {
            "cagr": float(cagr),
            "total_growth_pct": float(((yearly_avg[last_year] / yearly_avg[first_year]) - 1) * 100) if yearly_avg[first_year] > 0 else 0,
            "total_years": n_years,
            "start_price": float(yearly_avg[first_year]),
            "end_price": float(yearly_avg[last_year])
        }
    else:
        overall_stats = {}
    
    return {
        "yearly_growth_rates": growth_rates,
        "overall_growth": overall_stats
    }


def seasonal_patterns(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Analyze seasonal price variations.
    
    Args:
        df: Input DataFrame with 'price' and 'created_at' columns
        
    Returns:
        Dictionary containing seasonal patterns
    """
    if 'price' not in df.columns or 'created_at' not in df.columns:
        return {"message": "Required columns ('price', 'created_at') not found"}
    
    df_temp = df[['price', 'created_at']].copy()
    df_temp['created_at'] = pd.to_datetime(df_temp['created_at'], errors='coerce')
    df_temp = df_temp.dropna(subset=['created_at'])
    
    df_temp['month'] = df_temp['created_at'].dt.month
    df_temp['quarter'] = df_temp['created_at'].dt.quarter
    df_temp['day_of_week'] = df_temp['created_at'].dt.dayofweek
    
    # Monthly seasonality
    monthly_avg = df_temp.groupby('month')['price'].agg(['mean', 'median', 'count'])
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    monthly_seasonality = {}
    for month, row in monthly_avg.iterrows():
        monthly_seasonality[month_names[month - 1]] = {
            "mean_price": float(row['mean']),
            "median_price": float(row['median']),
            "listing_count": int(row['count'])
        }
    
    # Quarterly seasonality
    quarterly_avg = df_temp.groupby('quarter')['price'].agg(['mean', 'median', 'count'])
    quarterly_seasonality = {}
    for quarter, row in quarterly_avg.iterrows():
        quarterly_seasonality[f"Q{quarter}"] = {
            "mean_price": float(row['mean']),
            "median_price": float(row['median']),
            "listing_count": int(row['count'])
        }
    
    # Day of week patterns
    daily_avg = df_temp.groupby('day_of_week')['price'].agg(['mean', 'count'])
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    daily_patterns = {}
    for day, row in daily_avg.iterrows():
        daily_patterns[day_names[day]] = {
            "mean_price": float(row['mean']),
            "listing_count": int(row['count'])
        }
    
    # Calculate seasonal indices
    overall_mean = df_temp['price'].mean()
    seasonal_indices = {}
    for month, row in monthly_avg.iterrows():
        seasonal_indices[month_names[month - 1]] = float(row['mean'] / overall_mean) if overall_mean > 0 else 1
    
    # Peak and low seasons
    peak_month = max(monthly_avg['mean'].items(), key=lambda x: x[1])
    low_month = min(monthly_avg['mean'].items(), key=lambda x: x[1])
    
    return {
        "monthly_seasonality": monthly_seasonality,
        "quarterly_seasonality": quarterly_seasonality,
        "daily_patterns": daily_patterns,
        "seasonal_indices": seasonal_indices,
        "peak_season": {
            "month": month_names[peak_month[0] - 1],
            "avg_price": float(peak_month[1])
        },
        "low_season": {
            "month": month_names[low_month[0] - 1],
            "avg_price": float(low_month[1])
        },
        "seasonal_amplitude": float((peak_month[1] - low_month[1]) / overall_mean * 100) if overall_mean > 0 else 0
    }


def market_cycle_analysis(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Identify bull/bear market phases.
    
    Args:
        df: Input DataFrame with 'price' and 'created_at' columns
        
    Returns:
        Dictionary containing market cycle analysis
    """
    if 'price' not in df.columns or 'created_at' not in df.columns:
        return {"message": "Required columns ('price', 'created_at') not found"}
    
    df_temp = df[['price', 'created_at']].copy()
    df_temp['created_at'] = pd.to_datetime(df_temp['created_at'], errors='coerce')
    df_temp = df_temp.dropna(subset=['created_at'])
    
    df_temp['year'] = df_temp['created_at'].dt.year
    yearly_avg = df_temp.groupby('year')['price'].mean()
    
    if len(yearly_avg) < 3:
        return {"message": "Need at least 3 years of data for cycle analysis"}
    
    # Calculate year-over-year changes
    yearly_changes = yearly_avg.pct_change() * 100
    yearly_changes = yearly_changes.dropna()
    
    # Identify phases based on consecutive changes
    phases = []
    current_phase = None
    phase_start = None
    
    for year, change in yearly_changes.items():
        if change > 0:
            phase = "Bull"
        elif change < 0:
            phase = "Bear"
        else:
            phase = "Stable"
        
        if phase != current_phase:
            if current_phase is not None:
                phases.append({
                    "phase": current_phase,
                    "start_year": phase_start,
                    "end_year": year - 1,
                    "duration_years": year - phase_start
                })
            current_phase = phase
            phase_start = year
    
    # Add final phase
    if current_phase is not None:
        phases.append({
            "phase": current_phase,
            "start_year": phase_start,
            "end_year": yearly_changes.index[-1],
            "duration_years": yearly_changes.index[-1] - phase_start + 1
        })
    
    # Calculate volatility
    volatility = float(yearly_changes.std()) if len(yearly_changes) > 0 else 0
    
    # Current market status
    latest_change = float(yearly_changes.iloc[-1]) if len(yearly_changes) > 0 else 0
    if latest_change > 5:
        current_status = "Strong Bull"
    elif latest_change > 0:
        current_status = "Weak Bull"
    elif latest_change > -5:
        current_status = "Weak Bear"
    else:
        current_status = "Strong Bear"
    
    return {
        "phases": phases,
        "current_status": current_status,
        "latest_change_pct": latest_change,
        "volatility": volatility,
        "total_years_analyzed": len(yearly_avg),
        "average_annual_change": float(yearly_changes.mean()) if len(yearly_changes) > 0 else 0
    }


def forecast_prices(df: pd.DataFrame, years_ahead: int = 5) -> Dict[str, Any]:
    """
    Simple linear forecast for next N years.
    
    Args:
        df: Input DataFrame with 'price' and 'created_at' columns
        years_ahead: Number of years to forecast
        
    Returns:
        Dictionary containing forecast results
    """
    if 'price' not in df.columns or 'created_at' not in df.columns:
        return {"message": "Required columns ('price', 'created_at') not found"}
    
    df_temp = df[['price', 'created_at']].copy()
    df_temp['created_at'] = pd.to_datetime(df_temp['created_at'], errors='coerce')
    df_temp = df_temp.dropna(subset=['created_at'])
    
    df_temp['year'] = df_temp['created_at'].dt.year
    yearly_avg = df_temp.groupby('year')['price'].mean().reset_index()
    yearly_avg.columns = ['year', 'price']
    
    if len(yearly_avg) < 2:
        return {"message": "Need at least 2 years of data for forecasting"}
    
    # Linear regression
    X = yearly_avg['year'].values.reshape(-1, 1)
    y = yearly_avg['price'].values
    
    # Calculate regression coefficients using numpy
    X_mean = np.mean(X)
    y_mean = np.mean(y)
    
    numerator = np.sum((X.flatten() - X_mean) * (y - y_mean))
    denominator = np.sum((X.flatten() - X_mean) ** 2)
    
    if denominator == 0:
        slope = 0
    else:
        slope = numerator / denominator
    
    intercept = y_mean - slope * X_mean
    
    # Calculate R-squared
    y_pred = slope * X.flatten() + intercept
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - y_mean) ** 2)
    r_squared = 1 - (ss_res / ss_tot) if ss_tot != 0 else 0
    
    # Generate forecast
    last_year = int(yearly_avg['year'].max())
    forecast_years = list(range(last_year + 1, last_year + years_ahead + 1))
    forecast_prices = [slope * year + intercept for year in forecast_years]
    
    # Confidence interval (simple approximation)
    residuals = y - y_pred
    std_error = np.sqrt(np.mean(residuals ** 2))
    
    forecast = {}
    for year, price in zip(forecast_years, forecast_prices):
        forecast[str(year)] = {
            "forecasted_price": float(max(0, price)),  # Ensure non-negative
            "lower_bound": float(max(0, price - 1.96 * std_error)),
            "upper_bound": float(price + 1.96 * std_error)
        }
    
    return {
        "historical_data": {str(row['year']): float(row['price']) for _, row in yearly_avg.iterrows()},
        "forecast": forecast,
        "model": {
            "type": "linear_regression",
            "slope": float(slope),
            "intercept": float(intercept),
            "r_squared": float(r_squared),
            "std_error": float(std_error)
        },
        "forecast_period": f"{last_year + 1} to {last_year + years_ahead}",
        "years_ahead": years_ahead
    }


def top_performing_markets(df: pd.DataFrame, top_n: int = 10) -> Dict[str, Any]:
    """
    Identify cities with highest growth.
    
    Args:
        df: Input DataFrame
        top_n: Number of top markets to return
        
    Returns:
        Dictionary containing top performing markets
    """
    if 'price' not in df.columns or 'city' not in df.columns:
        return {"message": "Required columns ('price', 'city') not found"}
    
    if 'created_at' not in df.columns:
        # If no time data, rank by average price
        city_stats = df.groupby('city')['price'].agg(['mean', 'median', 'count'])
        city_stats = city_stats.sort_values('mean', ascending=False).head(top_n)
        
        markets = {}
        for city, row in city_stats.iterrows():
            markets[city] = {
                "mean_price": float(row['mean']),
                "median_price": float(row['median']),
                "listing_count": int(row['count'])
            }
        
        return {
            "top_markets": markets,
            "ranking_metric": "mean_price",
            "note": "Ranking by average price (no temporal data available)"
        }
    
    # With time data, calculate growth rates
    df_temp = df[['price', 'city', 'created_at']].copy()
    df_temp['created_at'] = pd.to_datetime(df_temp['created_at'], errors='coerce')
    df_temp = df_temp.dropna(subset=['created_at'])
    df_temp['year'] = df_temp['created_at'].dt.year
    
    city_yearly = df_temp.groupby(['city', 'year'])['price'].mean().unstack()
    
    if city_yearly.shape[1] < 2:
        return {"message": "Need at least 2 years of data for growth calculation"}
    
    # Calculate CAGR for each city
    city_growth = {}
    for city in city_yearly.index:
        prices = city_yearly.loc[city].dropna()
        if len(prices) >= 2:
            first_price = prices.iloc[0]
            last_price = prices.iloc[-1]
            n_years = prices.index[-1] - prices.index[0]
            
            if n_years > 0 and first_price > 0:
                cagr = ((last_price / first_price) ** (1 / n_years) - 1) * 100
            else:
                cagr = 0
            
            city_growth[city] = {
                "cagr": float(cagr),
                "start_price": float(first_price),
                "end_price": float(last_price),
                "years_of_data": int(n_years + 1),
                "total_growth_pct": float(((last_price / first_price) - 1) * 100) if first_price > 0 else 0
            }
    
    # Sort by CAGR
    sorted_cities = sorted(city_growth.items(), key=lambda x: x[1]['cagr'], reverse=True)[:top_n]
    
    top_markets = {city: metrics for city, metrics in sorted_cities}
    
    return {
        "top_markets": top_markets,
        "ranking_metric": "cagr",
        "total_cities_analyzed": len(city_growth)
    }


def generate_trend_report(df: pd.DataFrame, output_dir: str) -> Dict[str, Any]:
    """
    Generate comprehensive trend analysis report.
    
    Args:
        df: Input DataFrame
        output_dir: Directory to save the report
        
    Returns:
        Dictionary containing all trend analyses
    """
    os.makedirs(output_dir, exist_ok=True)
    
    report = {
        "monthly_trends": monthly_price_trends(df),
        "yearly_trends": yearly_price_trends(df),
        "growth_rates": growth_rate_calculation(df),
        "seasonal_patterns": seasonal_patterns(df),
        "market_cycles": market_cycle_analysis(df),
        "price_forecast": forecast_prices(df),
        "top_performing_markets": top_performing_markets(df)
    }
    
    # Save report as JSON
    report_path = os.path.join(output_dir, "trend_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    return report
