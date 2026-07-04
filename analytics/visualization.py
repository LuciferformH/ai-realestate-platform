"""
Visualization Module for Real Estate Data
"""
import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import os
from typing import Dict, Any, List, Optional, Tuple


def plot_price_distribution(df: pd.DataFrame, save_path: Optional[str] = None) -> str:
    """
    Plot price distribution histogram.
    
    Args:
        df: Input DataFrame with 'price' column
        save_path: Path to save the plot
        
    Returns:
        Path to saved plot
    """
    if 'price' not in df.columns:
        raise ValueError("No 'price' column found in DataFrame")
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Histogram
    axes[0].hist(df['price'].dropna(), bins=50, edgecolor='black', alpha=0.7, color='steelblue')
    axes[0].set_title('Price Distribution', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Price ($)', fontsize=12)
    axes[0].set_ylabel('Frequency', fontsize=12)
    axes[0].xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    axes[0].axvline(df['price'].mean(), color='red', linestyle='--', label=f"Mean: ${df['price'].mean():,.0f}")
    axes[0].axvline(df['price'].median(), color='green', linestyle='--', label=f"Median: ${df['price'].median():,.0f}")
    axes[0].legend()
    
    # Box plot
    axes[1].boxplot(df['price'].dropna(), vert=True)
    axes[1].set_title('Price Box Plot', fontsize=14, fontweight='bold')
    axes[1].set_ylabel('Price ($)', fontsize=12)
    axes[1].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    
    plt.tight_layout()
    
    if save_path is None:
        save_path = os.path.join(os.getcwd(), 'price_distribution.png')
    
    os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return save_path


def plot_price_by_city(df: pd.DataFrame, save_path: Optional[str] = None) -> str:
    """
    Plot average price by city.
    
    Args:
        df: Input DataFrame with 'price' and 'city' columns
        save_path: Path to save the plot
        
    Returns:
        Path to saved plot
    """
    if 'price' not in df.columns or 'city' not in df.columns:
        raise ValueError("Required columns ('price', 'city') not found")
    
    city_stats = df.groupby('city')['price'].agg(['mean', 'median', 'count']).sort_values('mean', ascending=False)
    
    # Limit to top 15 cities
    city_stats = city_stats.head(15)
    
    fig, ax = plt.subplots(figsize=(12, 8))
    
    x = range(len(city_stats))
    width = 0.35
    
    ax.bar([i - width/2 for i in x], city_stats['mean'], width, label='Mean Price', color='steelblue', alpha=0.8)
    ax.bar([i + width/2 for i in x], city_stats['median'], width, label='Median Price', color='coral', alpha=0.8)
    
    ax.set_title('Average Price by City', fontsize=14, fontweight='bold')
    ax.set_xlabel('City', fontsize=12)
    ax.set_ylabel('Price ($)', fontsize=12)
    ax.set_xticks(x)
    ax.set_xticklabels(city_stats.index, rotation=45, ha='right')
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    ax.legend()
    ax.grid(axis='y', alpha=0.3)
    
    # Add count labels
    for i, (_, row) in enumerate(city_stats.iterrows()):
        ax.text(i, max(row['mean'], row['median']) * 1.02, f'n={int(row["count"])}', 
                ha='center', va='bottom', fontsize=9, color='gray')
    
    plt.tight_layout()
    
    if save_path is None:
        save_path = os.path.join(os.getcwd(), 'price_by_city.png')
    
    os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return save_path


def plot_price_by_type(df: pd.DataFrame, save_path: Optional[str] = None) -> str:
    """
    Plot average price by property type.
    
    Args:
        df: Input DataFrame with 'price' and 'property_type' columns
        save_path: Path to save the plot
        
    Returns:
        Path to saved plot
    """
    if 'price' not in df.columns or 'property_type' not in df.columns:
        raise ValueError("Required columns ('price', 'property_type') not found")
    
    type_stats = df.groupby('property_type')['price'].agg(['mean', 'median', 'count']).sort_values('mean', ascending=False)
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Bar chart
    colors = plt.cm.Set2(np.linspace(0, 1, len(type_stats)))
    axes[0].barh(type_stats.index, type_stats['mean'], color=colors, alpha=0.8)
    axes[0].set_title('Average Price by Property Type', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Average Price ($)', fontsize=12)
    axes[0].xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    
    # Add count labels
    for i, (_, row) in enumerate(type_stats.iterrows()):
        axes[0].text(row['mean'] * 1.01, i, f'n={int(row["count"])}', va='center', fontsize=9)
    
    # Pie chart for distribution
    axes[1].pie(type_stats['count'], labels=type_stats.index, autopct='%1.1f%%', 
                colors=colors, startangle=90)
    axes[1].set_title('Property Type Distribution', fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    
    if save_path is None:
        save_path = os.path.join(os.getcwd(), 'price_by_type.png')
    
    os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return save_path


def plot_correlation_heatmap(df: pd.DataFrame, save_path: Optional[str] = None) -> str:
    """
    Plot correlation heatmap for numeric columns.
    
    Args:
        df: Input DataFrame
        save_path: Path to save the plot
        
    Returns:
        Path to saved plot
    """
    numeric_df = df.select_dtypes(include=[np.number])
    
    if numeric_df.shape[1] < 2:
        raise ValueError("Need at least 2 numeric columns for correlation heatmap")
    
    # Select top correlated columns for readability
    if numeric_df.shape[1] > 15:
        # Select columns with highest variance
        variances = numeric_df.var()
        top_cols = variances.nlargest(15).index
        numeric_df = numeric_df[top_cols]
    
    corr_matrix = numeric_df.corr()
    
    fig, ax = plt.subplots(figsize=(12, 10))
    
    mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
    
    sns.heatmap(corr_matrix, mask=mask, annot=True, fmt='.2f', cmap='coolwarm',
                center=0, square=True, linewidths=0.5, ax=ax,
                cbar_kws={"shrink": 0.8}, vmin=-1, vmax=1)
    
    ax.set_title('Correlation Heatmap', fontsize=14, fontweight='bold')
    
    plt.tight_layout()
    
    if save_path is None:
        save_path = os.path.join(os.getcwd(), 'correlation_heatmap.png')
    
    os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return save_path


def plot_bedroom_distribution(df: pd.DataFrame, save_path: Optional[str] = None) -> str:
    """
    Plot bedroom distribution and price by bedrooms.
    
    Args:
        df: Input DataFrame with 'bedrooms' and optionally 'price' columns
        save_path: Path to save the plot
        
    Returns:
        Path to saved plot
    """
    if 'bedrooms' not in df.columns:
        raise ValueError("No 'bedrooms' column found in DataFrame")
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Distribution
    bedroom_counts = df['bedrooms'].value_counts().sort_index()
    axes[0].bar(bedroom_counts.index.astype(str), bedroom_counts.values, color='steelblue', alpha=0.8)
    axes[0].set_title('Bedroom Distribution', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Number of Bedrooms', fontsize=12)
    axes[0].set_ylabel('Count', fontsize=12)
    axes[0].grid(axis='y', alpha=0.3)
    
    # Add count labels
    for i, (beds, count) in enumerate(zip(bedroom_counts.index, bedroom_counts.values)):
        axes[0].text(i, count + 0.5, str(count), ha='center', va='bottom', fontsize=10)
    
    # Price by bedrooms
    if 'price' in df.columns:
        bedroom_price = df.groupby('bedrooms')['price'].agg(['mean', 'median', 'std'])
        
        axes[1].bar(bedroom_price.index.astype(str), bedroom_price['mean'], 
                    yerr=bedroom_price['std'], capsize=5, color='coral', alpha=0.8, label='Mean')
        axes[1].plot(bedroom_price.index.astype(str), bedroom_price['median'], 
                    'go-', markersize=8, label='Median')
        
        axes[1].set_title('Price by Bedrooms', fontsize=14, fontweight='bold')
        axes[1].set_xlabel('Number of Bedrooms', fontsize=12)
        axes[1].set_ylabel('Price ($)', fontsize=12)
        axes[1].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'${x:,.0f}'))
        axes[1].legend()
        axes[1].grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    
    if save_path is None:
        save_path = os.path.join(os.getcwd(), 'bedroom_distribution.png')
    
    os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return save_path


def plot_area_vs_price(df: pd.DataFrame, save_path: Optional[str] = None) -> str:
    """
    Plot area vs price scatter plot.
    
    Args:
        df: Input DataFrame with 'area_sqft' and 'price' columns
        save_path: Path to save the plot
        
    Returns:
        Path to saved plot
    """
    if 'area_sqft' not in df.columns or 'price' not in df.columns:
        raise ValueError("Required columns ('area_sqft', 'price') not found")
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Scatter plot
    scatter = axes[0].scatter(df['area_sqft'], df['price'], alpha=0.5, c='steelblue', s=30)
    axes[0].set_title('Area vs Price', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Area (sqft)', fontsize=12)
    axes[0].set_ylabel('Price ($)', fontsize=12)
    axes[0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    axes[0].grid(alpha=0.3)
    
    # Add trend line
    z = np.polyfit(df['area_sqft'].dropna(), df.loc[df['area_sqft'].notna(), 'price'], 1)
    p = np.poly1d(z)
    x_line = np.linspace(df['area_sqft'].min(), df['area_sqft'].max(), 100)
    axes[0].plot(x_line, p(x_line), "r--", alpha=0.8, label='Trend Line')
    axes[0].legend()
    
    # Price per sqft distribution
    df_temp = df[['area_sqft', 'price']].dropna()
    df_temp = df_temp[df_temp['area_sqft'] > 0]
    df_temp['price_per_sqft'] = df_temp['price'] / df_temp['area_sqft']
    
    axes[1].hist(df_temp['price_per_sqft'], bins=50, edgecolor='black', alpha=0.7, color='steelblue')
    axes[1].set_title('Price per Square Foot Distribution', fontsize=14, fontweight='bold')
    axes[1].set_xlabel('Price per Sqft ($)', fontsize=12)
    axes[1].set_ylabel('Frequency', fontsize=12)
    axes[1].axvline(df_temp['price_per_sqft'].mean(), color='red', linestyle='--', 
                    label=f"Mean: ${df_temp['price_per_sqft'].mean():,.0f}")
    axes[1].legend()
    
    plt.tight_layout()
    
    if save_path is None:
        save_path = os.path.join(os.getcwd(), 'area_vs_price.png')
    
    os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return save_path


def plot_monthly_trends(df: pd.DataFrame, save_path: Optional[str] = None) -> str:
    """
    Plot monthly price trends.
    
    Args:
        df: Input DataFrame with 'price' and 'created_at' columns
        save_path: Path to save the plot
        
    Returns:
        Path to saved plot
    """
    if 'price' not in df.columns or 'created_at' not in df.columns:
        raise ValueError("Required columns ('price', 'created_at') not found")
    
    df_temp = df[['price', 'created_at']].copy()
    df_temp['created_at'] = pd.to_datetime(df_temp['created_at'], errors='coerce')
    df_temp = df_temp.dropna(subset=['created_at'])
    
    df_temp['year_month'] = df_temp['created_at'].dt.to_period('M')
    monthly_avg = df_temp.groupby('year_month')['price'].agg(['mean', 'median', 'count'])
    
    fig, axes = plt.subplots(2, 1, figsize=(14, 10))
    
    # Price trends
    x = range(len(monthly_avg))
    axes[0].plot(x, monthly_avg['mean'], marker='o', linewidth=2, markersize=4, label='Mean Price', color='steelblue')
    axes[0].plot(x, monthly_avg['median'], marker='s', linewidth=2, markersize=4, label='Median Price', color='coral')
    axes[0].fill_between(x, monthly_avg['mean'], alpha=0.2, color='steelblue')
    
    axes[0].set_title('Monthly Price Trends', fontsize=14, fontweight='bold')
    axes[0].set_ylabel('Price ($)', fontsize=12)
    axes[0].yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, p: f'${x:,.0f}'))
    axes[0].legend()
    axes[0].grid(alpha=0.3)
    
    # Set x-axis labels (every 3 months)
    tick_positions = list(range(0, len(monthly_avg), 3))
    tick_labels = [str(monthly_avg.index[i]) for i in tick_positions]
    axes[0].set_xticks(tick_positions)
    axes[0].set_xticklabels(tick_labels, rotation=45, ha='right')
    
    # Listing volume
    axes[1].bar(x, monthly_avg['count'], color='steelblue', alpha=0.7)
    axes[1].set_title('Monthly Listing Volume', fontsize=14, fontweight='bold')
    axes[1].set_xlabel('Month', fontsize=12)
    axes[1].set_ylabel('Number of Listings', fontsize=12)
    axes[1].grid(axis='y', alpha=0.3)
    axes[1].set_xticks(tick_positions)
    axes[1].set_xticklabels(tick_labels, rotation=45, ha='right')
    
    plt.tight_layout()
    
    if save_path is None:
        save_path = os.path.join(os.getcwd(), 'monthly_trends.png')
    
    os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return save_path


def plot_investment_scores(df: pd.DataFrame, save_path: Optional[str] = None) -> str:
    """
    Plot investment scores distribution.
    
    Args:
        df: Input DataFrame with property data
        save_path: Path to save the plot
        
    Returns:
        Path to saved plot
    """
    from analytics.investment import calculate_investment_score
    
    if 'price' not in df.columns:
        raise ValueError("No 'price' column found in DataFrame")
    
    # Calculate investment scores
    scores = []
    for idx, row in df.iterrows():
        property_data = row.to_dict()
        score_result = calculate_investment_score(property_data)
        scores.append(score_result["investment_score"])
    
    fig, axes = plt.subplots(1, 2, figsize=(14, 6))
    
    # Score distribution
    axes[0].hist(scores, bins=20, edgecolor='black', alpha=0.7, color='steelblue')
    axes[0].axvline(np.mean(scores), color='red', linestyle='--', label=f'Mean: {np.mean(scores):.1f}')
    axes[0].axvline(np.median(scores), color='green', linestyle='--', label=f'Median: {np.median(scores):.1f}')
    axes[0].set_title('Investment Score Distribution', fontsize=14, fontweight='bold')
    axes[0].set_xlabel('Investment Score', fontsize=12)
    axes[0].set_ylabel('Frequency', fontsize=12)
    axes[0].legend()
    axes[0].grid(axis='y', alpha=0.3)
    
    # Rating distribution
    ratings = []
    for score in scores:
        if score >= 80:
            ratings.append('Excellent')
        elif score >= 60:
            ratings.append('Good')
        elif score >= 40:
            ratings.append('Average')
        elif score >= 20:
            ratings.append('Below Average')
        else:
            ratings.append('Poor')
    
    rating_counts = pd.Series(ratings).value_counts()
    colors = {'Excellent': '#2ecc71', 'Good': '#3498db', 'Average': '#f39c12', 
              'Below Average': '#e74c3c', 'Poor': '#95a5a6'}
    bar_colors = [colors.get(r, 'gray') for r in rating_counts.index]
    
    axes[1].bar(rating_counts.index, rating_counts.values, color=bar_colors, alpha=0.8)
    axes[1].set_title('Investment Rating Distribution', fontsize=14, fontweight='bold')
    axes[1].set_xlabel('Rating', fontsize=12)
    axes[1].set_ylabel('Count', fontsize=12)
    axes[1].grid(axis='y', alpha=0.3)
    
    # Add count labels
    for i, (rating, count) in enumerate(zip(rating_counts.index, rating_counts.values)):
        axes[1].text(i, count + 0.5, str(count), ha='center', va='bottom', fontsize=10)
    
    plt.tight_layout()
    
    if save_path is None:
        save_path = os.path.join(os.getcwd(), 'investment_scores.png')
    
    os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return save_path


def plot_feature_importance(importances: List[float], feature_names: List[str], 
                           save_path: Optional[str] = None) -> str:
    """
    Plot feature importance bar chart.
    
    Args:
        importances: List of importance values
        feature_names: List of feature names
        save_path: Path to save the plot
        
    Returns:
        Path to saved plot
    """
    if len(importances) != len(feature_names):
        raise ValueError("importances and feature_names must have same length")
    
    # Sort by importance
    sorted_idx = np.argsort(importances)
    sorted_importances = np.array(importances)[sorted_idx]
    sorted_names = np.array(feature_names)[sorted_idx]
    
    fig, ax = plt.subplots(figsize=(10, 8))
    
    colors = plt.cm.viridis(np.linspace(0.3, 0.9, len(sorted_importances)))
    ax.barh(range(len(sorted_importances)), sorted_importances, color=colors, alpha=0.8)
    ax.set_yticks(range(len(sorted_importances)))
    ax.set_yticklabels(sorted_names)
    ax.set_title('Feature Importance', fontsize=14, fontweight='bold')
    ax.set_xlabel('Importance', fontsize=12)
    ax.grid(axis='x', alpha=0.3)
    
    # Add value labels
    for i, (imp, name) in enumerate(zip(sorted_importances, sorted_names)):
        ax.text(imp + 0.001, i, f'{imp:.3f}', va='center', fontsize=9)
    
    plt.tight_layout()
    
    if save_path is None:
        save_path = os.path.join(os.getcwd(), 'feature_importance.png')
    
    os.makedirs(os.path.dirname(save_path) if os.path.dirname(save_path) else '.', exist_ok=True)
    plt.savefig(save_path, dpi=150, bbox_inches='tight')
    plt.close()
    
    return save_path


def create_dashboard_summary(df: pd.DataFrame, output_dir: str) -> List[str]:
    """
    Generate all charts for a comprehensive dashboard.
    
    Args:
        df: Input DataFrame
        output_dir: Directory to save all charts
        
    Returns:
        List of paths to saved charts
    """
    os.makedirs(output_dir, exist_ok=True)
    
    saved_charts = []
    
    # Generate each chart with error handling
    chart_configs = [
        ("price_distribution.png", plot_price_distribution),
        ("price_by_city.png", plot_price_by_city),
        ("price_by_type.png", plot_price_by_type),
        ("correlation_heatmap.png", plot_correlation_heatmap),
        ("bedroom_distribution.png", plot_bedroom_distribution),
        ("area_vs_price.png", plot_area_vs_price),
        ("monthly_trends.png", plot_monthly_trends),
        ("investment_scores.png", plot_investment_scores)
    ]
    
    for filename, plot_func in chart_configs:
        try:
            save_path = os.path.join(output_dir, filename)
            plot_func(df, save_path)
            saved_charts.append(save_path)
        except (ValueError, KeyError) as e:
            print(f"Skipping {filename}: {str(e)}")
        except Exception as e:
            print(f"Error generating {filename}: {str(e)}")
    
    return saved_charts
