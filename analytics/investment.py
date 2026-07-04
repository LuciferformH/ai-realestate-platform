"""
Investment Analysis Module for Real Estate Data
"""
import pandas as pd
import numpy as np
import json
import os
from typing import Dict, Any, List, Optional, Tuple


def calculate_investment_score(property_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate composite investment score (0-100) for a property.
    
    Factors: price growth potential, rental yield, crime rate, infrastructure, demand
    
    Args:
        property_data: Dictionary containing property information
        
    Returns:
        Dictionary containing investment score and breakdown
    """
    scores = {}
    weights = {
        "price_growth": 0.25,
        "rental_yield": 0.25,
        "location_quality": 0.20,
        "property_condition": 0.15,
        "demand_indicator": 0.15
    }
    
    # Price growth potential score (0-100)
    price_growth = property_data.get("price_growth_pct", 0)
    if price_growth >= 10:
        scores["price_growth"] = 100
    elif price_growth >= 5:
        scores["price_growth"] = 75 + (price_growth - 5) * 5
    elif price_growth >= 0:
        scores["price_growth"] = 50 + price_growth * 5
    elif price_growth >= -5:
        scores["price_growth"] = 25 + (price_growth + 5) * 5
    else:
        scores["price_growth"] = max(0, 25 + price_growth * 2.5)
    
    # Rental yield score (0-100)
    annual_rent = property_data.get("annual_rent", 0)
    property_price = property_data.get("price", 0)
    if property_price > 0:
        rental_yield = (annual_rent / property_price) * 100
    else:
        rental_yield = 0
    
    if rental_yield >= 8:
        scores["rental_yield"] = 100
    elif rental_yield >= 6:
        scores["rental_yield"] = 75 + (rental_yield - 6) * 12.5
    elif rental_yield >= 4:
        scores["rental_yield"] = 50 + (rental_yield - 4) * 12.5
    elif rental_yield >= 2:
        scores["rental_yield"] = 25 + (rental_yield - 2) * 12.5
    else:
        scores["rental_yield"] = rental_yield * 12.5
    
    # Location quality score (based on crime rate inverse)
    crime_rate = property_data.get("crime_rate", 50)  # Lower is better
    if crime_rate <= 10:
        scores["location_quality"] = 100
    elif crime_rate <= 30:
        scores["location_quality"] = 75 + (30 - crime_rate) * 1.25
    elif crime_rate <= 50:
        scores["location_quality"] = 50 + (50 - crime_rate) * 1.25
    elif crime_rate <= 70:
        scores["location_quality"] = 25 + (70 - crime_rate) * 1.25
    else:
        scores["location_quality"] = max(0, (100 - crime_rate) * 0.83)
    
    # Property condition score
    condition = property_data.get("condition", "Average")
    condition_scores = {
        "Excellent": 100,
        "Good": 75,
        "Average": 50,
        "Fair": 25,
        "Poor": 10
    }
    scores["property_condition"] = condition_scores.get(condition, 50)
    
    # Demand indicator score
    demand = property_data.get("demand_score", 50)
    scores["demand_indicator"] = min(100, max(0, demand))
    
    # Calculate weighted score
    total_score = sum(scores[factor] * weights[factor] for factor in weights)
    
    # Determine investment rating
    if total_score >= 80:
        rating = "Excellent"
    elif total_score >= 60:
        rating = "Good"
    elif total_score >= 40:
        rating = "Average"
    elif total_score >= 20:
        rating = "Below Average"
    else:
        rating = "Poor"
    
    return {
        "investment_score": round(total_score, 2),
        "rating": rating,
        "score_breakdown": {k: round(v, 2) for k, v in scores.items()},
        "weights": weights,
        "factors": {
            "price_growth_pct": price_growth,
            "rental_yield_pct": round(rental_yield, 2),
            "crime_rate": crime_rate,
            "condition": condition,
            "demand_score": demand
        }
    }


def calculate_rental_yield(annual_rent: float, property_price: float) -> Dict[str, float]:
    """
    Calculate rental yield percentage.
    
    Args:
        annual_rent: Annual rental income
        property_price: Property purchase price
        
    Returns:
        Dictionary containing rental yield metrics
    """
    if property_price <= 0:
        return {"error": "Property price must be positive"}
    
    gross_yield = (annual_rent / property_price) * 100
    
    # Estimate net yield (assuming 30% expenses)
    expense_ratio = 0.30
    net_rent = annual_rent * (1 - expense_ratio)
    net_yield = (net_rent / property_price) * 100
    
    return {
        "gross_yield_pct": round(gross_yield, 2),
        "net_yield_pct": round(net_yield, 2),
        "annual_rent": annual_rent,
        "property_price": property_price,
        "monthly_rent": round(annual_rent / 12, 2),
        "estimated_expenses": round(annual_rent * expense_ratio, 2),
        "net_annual_income": round(net_rent, 2)
    }


def calculate_cap_rate(noi: float, property_value: float) -> Dict[str, float]:
    """
    Calculate capitalization rate.
    
    Args:
        noi: Net Operating Income
        property_value: Property value
        
    Returns:
        Dictionary containing cap rate and related metrics
    """
    if property_value <= 0:
        return {"error": "Property value must be positive"}
    
    cap_rate = (noi / property_value) * 100
    
    # Calculate property value based on cap rate
    # Value = NOI / Cap Rate
    
    return {
        "cap_rate_pct": round(cap_rate, 2),
        "noi": noi,
        "property_value": property_value,
        "monthly_noi": round(noi / 12, 2),
        "price_per_noi": round(property_value / noi, 2) if noi > 0 else float('inf')
    }


def rank_investment_opportunities(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Rank properties by investment score.
    
    Args:
        df: Input DataFrame with property data
        
    Returns:
        Dictionary containing ranked properties
    """
    if 'price' not in df.columns:
        return {"message": "No 'price' column found"}
    
    rankings = []
    
    for idx, row in df.iterrows():
        property_data = row.to_dict()
        
        # Calculate investment score
        score_result = calculate_investment_score(property_data)
        
        rankings.append({
            "property_id": idx,
            "address": row.get("address", f"Property {idx}"),
            "city": row.get("city", "Unknown"),
            "price": float(row.get("price", 0)),
            "investment_score": score_result["investment_score"],
            "rating": score_result["rating"],
            "score_breakdown": score_result["score_breakdown"]
        })
    
    # Sort by investment score
    rankings.sort(key=lambda x: x["investment_score"], reverse=True)
    
    # Add rank numbers
    for i, prop in enumerate(rankings):
        prop["rank"] = i + 1
    
    return {
        "ranked_properties": rankings,
        "total_properties": len(rankings),
        "top_5": rankings[:5] if len(rankings) >= 5 else rankings,
        "score_distribution": {
            "excellent": sum(1 for p in rankings if p["rating"] == "Excellent"),
            "good": sum(1 for p in rankings if p["rating"] == "Good"),
            "average": sum(1 for p in rankings if p["rating"] == "Average"),
            "below_average": sum(1 for p in rankings if p["rating"] == "Below Average"),
            "poor": sum(1 for p in rankings if p["rating"] == "Poor")
        }
    }


def identify_undervalued_properties(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Identify properties below market average with good metrics.
    
    Args:
        df: Input DataFrame
        
    Returns:
        Dictionary containing undervalued properties
    """
    if 'price' not in df.columns:
        return {"message": "No 'price' column found"}
    
    # Calculate market averages
    overall_avg_price = df['price'].mean()
    overall_median_price = df['price'].median()
    
    undervalued = []
    
    for idx, row in df.iterrows():
        price = row.get('price', 0)
        
        if price <= 0:
            continue
        
        # Check if price is below market average
        is_below_avg = price < overall_avg_price
        is_below_median = price < overall_median_price
        
        # Calculate value metrics
        price_to_avg_ratio = price / overall_avg_price if overall_avg_price > 0 else 1
        price_to_median_ratio = price / overall_median_price if overall_median_price > 0 else 1
        
        # Calculate property score
        property_data = row.to_dict()
        score_result = calculate_investment_score(property_data)
        
        # Consider undervalued if:
        # 1. Price is below average AND
        # 2. Investment score is above average (>50)
        if is_below_avg and score_result["investment_score"] > 50:
            undervalued.append({
                "property_id": idx,
                "address": row.get("address", f"Property {idx}"),
                "city": row.get("city", "Unknown"),
                "price": float(price),
                "price_to_avg_ratio": round(price_to_avg_ratio, 2),
                "price_to_median_ratio": round(price_to_median_ratio, 2),
                "investment_score": score_result["investment_score"],
                "rating": score_result["rating"],
                "potential_savings": float(overall_avg_price - price),
                "value_rating": _get_value_rating(price_to_avg_ratio, score_result["investment_score"])
            })
    
    # Sort by value rating and investment score
    undervalued.sort(key=lambda x: (x["value_rating"], x["investment_score"]), reverse=True)
    
    # Add rank
    for i, prop in enumerate(undervalued):
        prop["rank"] = i + 1
    
    return {
        "undervalued_properties": undervalued,
        "total_found": len(undervalued),
        "market_averages": {
            "mean_price": float(overall_avg_price),
            "median_price": float(overall_median_price)
        },
        "summary": {
            "excellent_value": sum(1 for p in undervalued if p["value_rating"] == "Excellent"),
            "good_value": sum(1 for p in undervalued if p["value_rating"] == "Good"),
            "fair_value": sum(1 for p in undervalued if p["value_rating"] == "Fair")
        }
    }


def _get_value_rating(price_ratio: float, score: float) -> str:
    """Determine value rating based on price ratio and score."""
    if price_ratio < 0.7 and score > 70:
        return "Excellent"
    elif price_ratio < 0.85 and score > 60:
        return "Good"
    elif price_ratio < 0.95 and score > 50:
        return "Fair"
    return "Average"


def calculate_roi(property_data: Dict[str, Any], years: int = 5) -> Dict[str, Any]:
    """
    Calculate projected Return on Investment.
    
    Args:
        property_data: Dictionary containing property information
        years: Investment horizon in years
        
    Returns:
        Dictionary containing ROI projections
    """
    purchase_price = property_data.get("price", 0)
    annual_rent = property_data.get("annual_rent", 0)
    appreciation_rate = property_data.get("appreciation_rate", 3) / 100  # Convert percentage to decimal
    expense_ratio = property_data.get("expense_ratio", 0.30)
    
    if purchase_price <= 0:
        return {"error": "Purchase price must be positive"}
    
    # Initial investment (assuming 20% down payment + 3% closing costs)
    down_payment_pct = 0.20
    closing_costs_pct = 0.03
    initial_investment = purchase_price * (down_payment_pct + closing_costs_pct)
    
    # Mortgage calculation (30-year fixed)
    loan_amount = purchase_price * (1 - down_payment_pct)
    interest_rate = property_data.get("mortgage_rate", 6.5) / 100 / 12  # Monthly rate
    mortgage_term = 360  # 30 years in months
    
    if interest_rate > 0:
        monthly_mortgage = loan_amount * (interest_rate * (1 + interest_rate) ** mortgage_term) / \
                          ((1 + interest_rate) ** mortgage_term - 1)
    else:
        monthly_mortgage = loan_amount / mortgage_term
    
    annual_mortgage = monthly_mortgage * 12
    
    # Year-by-year projections
    projections = []
    total_appreciation = 0
    total_rental_income = 0
    total_expenses = 0
    total_mortgage_paid = 0
    
    current_property_value = purchase_price
    remaining_loan = loan_amount
    
    for year in range(1, years + 1):
        # Property appreciation
        current_property_value *= (1 + appreciation_rate)
        year_appreciation = current_property_value * appreciation_rate
        total_appreciation += year_appreciation
        
        # Rental income (assuming 3% annual rent increase)
        year_rent = annual_rent * (1 + 0.03) ** (year - 1)
        total_rental_income += year_rent
        
        # Expenses (maintenance, insurance, property tax, vacancy)
        year_expenses = year_rent * expense_ratio
        total_expenses += year_expenses
        
        # Mortgage payments
        total_mortgage_paid += annual_mortgage
        
        # Equity calculation
        equity = current_property_value - remaining_loan
        
        projections.append({
            "year": year,
            "property_value": round(current_property_value, 2),
            "annual_rent": round(year_rent, 2),
            "annual_expenses": round(year_expenses, 2),
            "net_income": round(year_rent - year_expenses, 2),
            "equity": round(equity, 2),
            "cumulative_appreciation": round(total_appreciation, 2),
            "cumulative_rental_income": round(total_rental_income, 2)
        })
    
    # Final ROI calculations
    final_value = current_property_value
    total_profit = (final_value - purchase_price) + total_rental_income - total_expenses - total_mortgage_paid
    roi = (total_profit / initial_investment) * 100
    annualized_roi = ((1 + roi / 100) ** (1 / years) - 1) * 100 if years > 0 else 0
    
    return {
        "investment_summary": {
            "purchase_price": purchase_price,
            "initial_investment": round(initial_investment, 2),
            "loan_amount": round(loan_amount, 2),
            "monthly_mortgage": round(monthly_mortgage, 2),
            "annual_mortgage": round(annual_mortgage, 2)
        },
        "projections": projections,
        "final_analysis": {
            "final_property_value": round(final_value, 2),
            "total_appreciation": round(total_appreciation, 2),
            "total_rental_income": round(total_rental_income, 2),
            "total_expenses": round(total_expenses, 2),
            "total_mortgage_paid": round(total_mortgage_paid, 2),
            "total_profit": round(total_profit, 2),
            "roi_pct": round(roi, 2),
            "annualized_roi_pct": round(annualized_roi, 2),
            "cash_on_cash_return": round((total_rental_income - total_expenses - total_mortgage_paid) / initial_investment * 100, 2)
        },
        "investment_horizon_years": years
    }


def market_health_score(city_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate overall market health score for a city.
    
    Args:
        city_data: Dictionary containing city market information
        
    Returns:
        Dictionary containing market health score and components
    """
    scores = {}
    weights = {
        "price_stability": 0.20,
        "demand_supply": 0.25,
        "economic_indicators": 0.20,
        "infrastructure": 0.15,
        "growth_potential": 0.20
    }
    
    # Price stability score (lower volatility is better)
    price_volatility = city_data.get("price_volatility", 20)
    if price_volatility <= 5:
        scores["price_stability"] = 100
    elif price_volatility <= 10:
        scores["price_stability"] = 75 + (10 - price_volatility) * 5
    elif price_volatility <= 20:
        scores["price_stability"] = 50 + (20 - price_volatility) * 2.5
    else:
        scores["price_stability"] = max(0, 50 - (price_volatility - 20) * 2.5)
    
    # Demand-supply balance
    supply_demand_ratio = city_data.get("supply_demand_ratio", 1)
    if 0.8 <= supply_demand_ratio <= 1.2:
        scores["demand_supply"] = 100
    elif 0.5 <= supply_demand_ratio < 0.8:
        scores["demand_supply"] = 75 + (supply_demand_ratio - 0.5) * 83.33
    elif 1.2 < supply_demand_ratio <= 1.5:
        scores["demand_supply"] = 75 - (supply_demand_ratio - 1.2) * 83.33
    elif supply_demand_ratio < 0.5:
        scores["demand_supply"] = supply_demand_ratio * 150
    else:
        scores["demand_supply"] = max(0, 75 - (supply_demand_ratio - 1.2) * 83.33)
    
    # Economic indicators
    unemployment_rate = city_data.get("unemployment_rate", 5)
    if unemployment_rate <= 3:
        scores["economic_indicators"] = 100
    elif unemployment_rate <= 5:
        scores["economic_indicators"] = 75 + (5 - unemployment_rate) * 12.5
    elif unemployment_rate <= 8:
        scores["economic_indicators"] = 50 + (8 - unemployment_rate) * 8.33
    else:
        scores["economic_indicators"] = max(0, 50 - (unemployment_rate - 8) * 10)
    
    # Infrastructure score
    infrastructure_score = city_data.get("infrastructure_score", 70)
    scores["infrastructure"] = min(100, max(0, infrastructure_score))
    
    # Growth potential
    population_growth = city_data.get("population_growth_pct", 1)
    if population_growth >= 3:
        scores["growth_potential"] = 100
    elif population_growth >= 1:
        scores["growth_potential"] = 75 + (population_growth - 1) * 12.5
    elif population_growth >= 0:
        scores["growth_potential"] = 50 + population_growth * 25
    else:
        scores["growth_potential"] = max(0, 50 + population_growth * 50)
    
    # Calculate weighted score
    total_score = sum(scores[factor] * weights[factor] for factor in weights)
    
    # Determine market health status
    if total_score >= 80:
        status = "Excellent"
    elif total_score >= 60:
        status = "Good"
    elif total_score >= 40:
        status = "Fair"
    else:
        status = "Poor"
    
    return {
        "market_health_score": round(total_score, 2),
        "status": status,
        "score_breakdown": {k: round(v, 2) for k, v in scores.items()},
        "weights": weights,
        "factors": {
            "price_volatility": price_volatility,
            "supply_demand_ratio": supply_demand_ratio,
            "unemployment_rate": unemployment_rate,
            "infrastructure_score": infrastructure_score,
            "population_growth_pct": population_growth
        }
    }


def demand_score(city_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate demand indicator score.
    
    Args:
        city_data: Dictionary containing city demand information
        
    Returns:
        Dictionary containing demand score and factors
    """
    factors = {}
    weights = {
        "days_on_market": 0.25,
        "listing_volume": 0.20,
        "price_trend": 0.25,
        "absorption_rate": 0.30
    }
    
    # Days on market (lower is better)
    avg_days_on_market = city_data.get("avg_days_on_market", 60)
    if avg_days_on_market <= 15:
        factors["days_on_market"] = 100
    elif avg_days_on_market <= 30:
        factors["days_on_market"] = 75 + (30 - avg_days_on_market) * 1.67
    elif avg_days_on_market <= 60:
        factors["days_on_market"] = 50 + (60 - avg_days_on_market) * 0.83
    else:
        factors["days_on_market"] = max(0, 50 - (avg_days_on_market - 60) * 0.83)
    
    # Listing volume change (positive is good)
    listing_volume_change = city_data.get("listing_volume_change_pct", 0)
    if listing_volume_change > 0:
        factors["listing_volume"] = min(100, 50 + listing_volume_change * 5)
    else:
        factors["listing_volume"] = max(0, 50 + listing_volume_change * 2.5)
    
    # Price trend (positive is good)
    price_trend = city_data.get("price_trend_pct", 0)
    if price_trend > 0:
        factors["price_trend"] = min(100, 50 + price_trend * 5)
    else:
        factors["price_trend"] = max(0, 50 + price_trend * 2.5)
    
    # Absorption rate (sales / listings)
    absorption_rate = city_data.get("absorption_rate", 0.3)
    if absorption_rate >= 0.6:
        factors["absorption_rate"] = 100
    elif absorption_rate >= 0.4:
        factors["absorption_rate"] = 75 + (absorption_rate - 0.4) * 125
    elif absorption_rate >= 0.2:
        factors["absorption_rate"] = 50 + (absorption_rate - 0.2) * 125
    else:
        factors["absorption_rate"] = absorption_rate * 250
    
    # Calculate weighted score
    total_score = sum(factors[factor] * weights[factor] for factor in weights)
    
    # Determine demand level
    if total_score >= 80:
        demand_level = "Very High"
    elif total_score >= 60:
        demand_level = "High"
    elif total_score >= 40:
        demand_level = "Moderate"
    elif total_score >= 20:
        demand_level = "Low"
    else:
        demand_level = "Very Low"
    
    return {
        "demand_score": round(total_score, 2),
        "demand_level": demand_level,
        "factors": {k: round(v, 2) for k, v in factors.items()},
        "weights": weights,
        "input_data": {
            "avg_days_on_market": avg_days_on_market,
            "listing_volume_change_pct": listing_volume_change,
            "price_trend_pct": price_trend,
            "absorption_rate": absorption_rate
        }
    }


def supply_demand_ratio(city_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate supply vs demand ratio.
    
    Args:
        city_data: Dictionary containing supply and demand information
        
    Returns:
        Dictionary containing supply-demand analysis
    """
    active_listings = city_data.get("active_listings", 1000)
    pending_sales = city_data.get("pending_sales", 300)
    closed_sales = city_data.get("closed_sales", 400)
    months_of_inventory = city_data.get("months_of_inventory", 6)
    
    # Calculate ratio
    total_demand = pending_sales + closed_sales
    if active_listings > 0:
        ratio = total_demand / active_listings
    else:
        ratio = 0
    
    # Determine market condition
    if ratio >= 1.0:
        condition = "Seller's Market"
        description = "High demand relative to supply; prices likely to rise"
    elif ratio >= 0.8:
        condition = "Balanced Market"
        description = "Supply and demand are relatively balanced"
    elif ratio >= 0.5:
        condition = "Buyer's Market"
        description = "Supply exceeds demand; prices may be under pressure"
    else:
        condition = "Strong Buyer's Market"
        description = "Significant oversupply; potential for price decreases"
    
    # Months of inventory assessment
    if months_of_inventory <= 3:
        inventory_status = "Very Low"
    elif months_of_inventory <= 6:
        inventory_status = "Low"
    elif months_of_inventory <= 9:
        inventory_status = "Balanced"
    elif months_of_inventory <= 12:
        inventory_status = "High"
    else:
        inventory_status = "Very High"
    
    return {
        "supply_demand_ratio": round(ratio, 3),
        "market_condition": condition,
        "description": description,
        "inventory_status": inventory_status,
        "months_of_inventory": months_of_inventory,
        "supply": {
            "active_listings": active_listings
        },
        "demand": {
            "pending_sales": pending_sales,
            "closed_sales": closed_sales,
            "total_demand": total_demand
        },
        "insights": {
            "absorption_rate": round(closed_sales / active_listings, 3) if active_listings > 0 else 0,
            "pending_to_closed_ratio": round(pending_sales / closed_sales, 2) if closed_sales > 0 else 0
        }
    }


def generate_investment_report(df: pd.DataFrame, output_dir: str) -> Dict[str, Any]:
    """
    Generate comprehensive investment analysis report.
    
    Args:
        df: Input DataFrame
        output_dir: Directory to save the report
        
    Returns:
        Dictionary containing all investment analyses
    """
    os.makedirs(output_dir, exist_ok=True)
    
    report = {
        "investment_rankings": rank_investment_opportunities(df),
        "undervalued_properties": identify_undervalued_properties(df),
        "investment_score_distribution": {},
        "summary": {
            "total_properties_analyzed": len(df),
            "average_investment_score": 0,
            "top_investment_cities": {}
        }
    }
    
    # Calculate investment score distribution
    if 'price' in df.columns:
        scores = []
        for idx, row in df.iterrows():
            property_data = row.to_dict()
            score_result = calculate_investment_score(property_data)
            scores.append(score_result["investment_score"])
        
        if scores:
            report["investment_score_distribution"] = {
                "mean": round(np.mean(scores), 2),
                "median": round(np.median(scores), 2),
                "std": round(np.std(scores), 2),
                "min": round(min(scores), 2),
                "max": round(max(scores), 2)
            }
            report["summary"]["average_investment_score"] = round(np.mean(scores), 2)
    
    # Top investment cities
    if 'city' in df.columns and 'price' in df.columns:
        city_scores = {}
        for city in df['city'].unique():
            city_df = df[df['city'] == city]
            city_scores_list = []
            for idx, row in city_df.iterrows():
                property_data = row.to_dict()
                score_result = calculate_investment_score(property_data)
                city_scores_list.append(score_result["investment_score"])
            if city_scores_list:
                city_scores[city] = round(np.mean(city_scores_list), 2)
        
        # Sort by average score
        sorted_cities = sorted(city_scores.items(), key=lambda x: x[1], reverse=True)[:10]
        report["summary"]["top_investment_cities"] = dict(sorted_cities)
    
    # Save report as JSON
    report_path = os.path.join(output_dir, "investment_report.json")
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2, default=str)
    
    return report
