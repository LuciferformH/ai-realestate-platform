"""
CSV Export Module for Real Estate Data
"""
import pandas as pd
import os
from typing import Dict, Any, List, Optional, Union


def export_properties_csv(df: pd.DataFrame, output_path: str) -> str:
    """
    Export properties DataFrame to CSV.
    
    Args:
        df: Input DataFrame containing property data
        output_path: Path to save the CSV file
        
    Returns:
        Path to saved CSV file
    """
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    # Format price columns if they exist
    df_export = df.copy()
    
    price_columns = [col for col in df_export.columns if 'price' in col.lower()]
    for col in price_columns:
        if df_export[col].dtype in ['int64', 'float64']:
            df_export[col] = df_export[col].round(2)
    
    # Export to CSV
    df_export.to_csv(output_path, index=False, encoding='utf-8')
    
    return output_path


def export_filtered_csv(df: pd.DataFrame, filters: Dict[str, Any], output_path: str) -> str:
    """
    Export filtered properties to CSV.
    
    Args:
        df: Input DataFrame
        filters: Dictionary of column:value pairs to filter by
        output_path: Path to save the filtered CSV file
        
    Returns:
        Path to saved CSV file
    """
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    df_filtered = df.copy()
    
    # Apply filters
    for column, value in filters.items():
        if column in df_filtered.columns:
            if isinstance(value, list):
                # Filter by multiple values (isin)
                df_filtered = df_filtered[df_filtered[column].isin(value)]
            elif isinstance(value, dict):
                # Range filter with min/max
                if 'min' in value:
                    df_filtered = df_filtered[df_filtered[column] >= value['min']]
                if 'max' in value:
                    df_filtered = df_filtered[df_filtered[column] <= value['max']]
            elif isinstance(value, tuple) and len(value) == 2:
                # Range filter (min, max)
                df_filtered = df_filtered[
                    (df_filtered[column] >= value[0]) & 
                    (df_filtered[column] <= value[1])
                ]
            else:
                # Exact match
                df_filtered = df_filtered[df_filtered[column] == value]
    
    # Format price columns if they exist
    price_columns = [col for col in df_filtered.columns if 'price' in col.lower()]
    for col in price_columns:
        if df_filtered[col].dtype in ['int64', 'float64']:
            df_filtered[col] = df_filtered[col].round(2)
    
    # Export filtered data
    df_filtered.to_csv(output_path, index=False, encoding='utf-8')
    
    return output_path


def export_analytics_csv(analytics_data: Union[Dict[str, Any], pd.DataFrame], 
                        output_path: str) -> str:
    """
    Export analytics data to CSV.
    
    Args:
        analytics_data: Dictionary or DataFrame containing analytics results
        output_path: Path to save the CSV file
        
    Returns:
        Path to saved CSV file
    """
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    if isinstance(analytics_data, pd.DataFrame):
        # Direct DataFrame export
        analytics_data.to_csv(output_path, index=False, encoding='utf-8')
    elif isinstance(analytics_data, dict):
        # Convert dictionary to DataFrame
        # Handle nested dictionaries by flattening
        flat_data = _flatten_dict(analytics_data)
        df = pd.DataFrame.from_dict(flat_data, orient='index')
        df.to_csv(output_path, encoding='utf-8')
    else:
        raise ValueError("analytics_data must be a DataFrame or dictionary")
    
    return output_path


def _flatten_dict(d: Dict[str, Any], parent_key: str = '', sep: str = '_') -> Dict[str, Any]:
    """
    Flatten a nested dictionary.
    
    Args:
        d: Dictionary to flatten
        parent_key: Parent key for nested items
        sep: Separator for key names
        
    Returns:
        Flattened dictionary
    """
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        
        if isinstance(v, dict):
            items.extend(_flatten_dict(v, new_key, sep=sep).items())
        elif isinstance(v, list):
            # Convert list to string representation
            items.append((new_key, str(v)))
        else:
            items.append((new_key, v))
    
    return dict(items)


def export_multiple_formats(df: pd.DataFrame, base_path: str, 
                           formats: List[str] = None) -> Dict[str, str]:
    """
    Export data in multiple formats.
    
    Args:
        df: Input DataFrame
        base_path: Base path for output files (without extension)
        formats: List of formats to export ('csv', 'json', 'excel')
        
    Returns:
        Dictionary mapping format to output path
    """
    if formats is None:
        formats = ['csv']
    
    output_paths = {}
    
    for fmt in formats:
        if fmt == 'csv':
            path = f"{base_path}.csv"
            df.to_csv(path, index=False, encoding='utf-8')
            output_paths['csv'] = path
        elif fmt == 'json':
            path = f"{base_path}.json"
            df.to_json(path, orient='records', indent=2, force_ascii=False)
            output_paths['json'] = path
        elif fmt == 'excel':
            path = f"{base_path}.xlsx"
            df.to_excel(path, index=False, engine='openpyxl')
            output_paths['excel'] = path
    
    return output_paths


def create_summary_csv(data: Dict[str, Any], output_path: str) -> str:
    """
    Create a summary CSV from analytics data.
    
    Args:
        data: Dictionary containing summary statistics
        output_path: Path to save the CSV file
        
    Returns:
        Path to saved CSV file
    """
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    # Flatten the data
    flat_data = _flatten_dict(data)
    
    # Create DataFrame
    rows = []
    for key, value in flat_data.items():
        rows.append({'Metric': key, 'Value': value})
    
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    return output_path


def export_comparison_csv(properties: List[Dict[str, Any]], output_path: str) -> str:
    """
    Export property comparison data to CSV.
    
    Args:
        properties: List of property dictionaries
        output_path: Path to save the CSV file
        
    Returns:
        Path to saved CSV file
    """
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    # Create DataFrame from list of properties
    df = pd.DataFrame(properties)
    
    # Reorder columns for better readability
    priority_columns = ['address', 'city', 'state', 'price', 'bedrooms', 'bathrooms', 
                       'area_sqft', 'property_type', 'year_built', 'condition']
    
    # Get available columns in priority order
    available_priority = [col for col in priority_columns if col in df.columns]
    other_columns = [col for col in df.columns if col not in priority_columns]
    
    # Reorder DataFrame
    df = df[available_priority + other_columns]
    
    # Format price columns
    price_columns = [col for col in df.columns if 'price' in col.lower()]
    for col in price_columns:
        if df[col].dtype in ['int64', 'float64']:
            df[col] = df[col].round(2)
    
    df.to_csv(output_path, index=False, encoding='utf-8')
    
    return output_path
