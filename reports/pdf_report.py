"""
PDF Report Generator using ReportLab
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.graphics.shapes import Drawing
import os
from typing import Dict, Any, List, Optional, Union
from datetime import datetime


def add_header(doc: Any, title: str, subtitle: str = "") -> List[Any]:
    """
    Add header section to the document.
    
    Args:
        doc: ReportLab document
        title: Report title
        subtitle: Report subtitle
        
    Returns:
        List of flowables for header
    """
    elements = []
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=6,
        textColor=colors.HexColor('#1a5276'),
        alignment=1  # Center
    )
    
    # Subtitle style
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=20,
        textColor=colors.HexColor('#566573'),
        alignment=1  # Center
    )
    
    elements.append(Spacer(1, 0.5 * inch))
    elements.append(Paragraph(title, title_style))
    
    if subtitle:
        elements.append(Paragraph(subtitle, subtitle_style))
    
    # Add date
    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.gray,
        alignment=1
    )
    elements.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", date_style))
    elements.append(Spacer(1, 0.3 * inch))
    
    # Horizontal line
    elements.append(Drawing(450, 2))
    
    return elements


def add_property_table(doc: Any, property_data: Dict[str, Any]) -> List[Any]:
    """
    Add property details table to the document.
    
    Args:
        doc: ReportLab document
        property_data: Dictionary containing property information
        
    Returns:
        List of flowables for property table
    """
    elements = []
    styles = getSampleStyleSheet()
    
    # Section header
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.HexColor('#1a5276')
    )
    elements.append(Paragraph("Property Details", section_style))
    
    # Prepare table data
    table_data = [
        ['Property Information', ''],
    ]
    
    field_mapping = {
        'address': 'Address',
        'city': 'City',
        'state': 'State',
        'zip_code': 'ZIP Code',
        'property_type': 'Property Type',
        'bedrooms': 'Bedrooms',
        'bathrooms': 'Bathrooms',
        'area_sqft': 'Area (sqft)',
        'year_built': 'Year Built',
        'condition': 'Condition',
        'price': 'Listing Price',
        'lot_size': 'Lot Size',
        'garage_spaces': 'Garage Spaces'
    }
    
    for field, label in field_mapping.items():
        if field in property_data and property_data[field] is not None:
            value = property_data[field]
            if field == 'price':
                value = f"${value:,.2f}"
            elif field == 'area_sqft':
                value = f"{value:,.0f} sqft"
            table_data.append([label, str(value)])
    
    # Create table
    if len(table_data) > 1:
        table = Table(table_data, colWidths=[2.5 * inch, 3.5 * inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a5276')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8f9fa')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#dee2e6')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(table)
    
    return elements


def add_metrics_section(doc: Any, metrics_dict: Dict[str, Any]) -> List[Any]:
    """
    Add metrics section to the document.
    
    Args:
        doc: ReportLab document
        metrics_dict: Dictionary containing metrics
        
    Returns:
        List of flowables for metrics section
    """
    elements = []
    styles = getSampleStyleSheet()
    
    # Section header
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.HexColor('#1a5276')
    )
    elements.append(Paragraph("Key Metrics", section_style))
    
    # Prepare table data
    table_data = [['Metric', 'Value']]
    
    metric_formatters = {
        'price': lambda x: f"${x:,.2f}",
        'price_per_sqft': lambda x: f"${x:,.2f}",
        'annual_rent': lambda x: f"${x:,.2f}",
        'rental_yield': lambda x: f"{x:.2f}%",
        'cap_rate': lambda x: f"{x:.2f}%",
        'roi': lambda x: f"{x:.2f}%",
        'investment_score': lambda x: f"{x:.1f}/100"
    }
    
    for key, value in metrics_dict.items():
        if value is not None:
            label = key.replace('_', ' ').title()
            if key in metric_formatters:
                formatted_value = metric_formatters[key](value)
            elif isinstance(value, float):
                formatted_value = f"{value:,.2f}"
            elif isinstance(value, int):
                formatted_value = f"{value:,}"
            else:
                formatted_value = str(value)
            
            table_data.append([label, formatted_value])
    
    # Create table
    if len(table_data) > 1:
        table = Table(table_data, colWidths=[3 * inch, 3 * inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#27ae60')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fff4')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d4edda')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0fff4')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ]))
        elements.append(table)
    
    return elements


def add_footer(doc: Any) -> List[Any]:
    """
    Add footer section to the document.
    
    Args:
        doc: ReportLab document
        
    Returns:
        List of flowables for footer
    """
    elements = []
    styles = getSampleStyleSheet()
    
    elements.append(Spacer(1, 0.5 * inch))
    
    # Horizontal line
    elements.append(Drawing(450, 2))
    
    # Footer text
    footer_style = ParagraphStyle(
        'FooterStyle',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.gray,
        alignment=1,
        spaceBefore=10
    )
    
    elements.append(Paragraph(
        "AI Real Estate Insights Platform | Confidential Report",
        footer_style
    ))
    elements.append(Paragraph(
        f"Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}",
        footer_style
    ))
    
    return elements


def create_property_report(property_data: Dict[str, Any], output_path: str) -> str:
    """
    Create a PDF report for a single property.
    
    Args:
        property_data: Dictionary containing property information
        output_path: Path to save the PDF report
        
    Returns:
        Path to saved PDF
    """
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    elements = []
    
    # Header
    address = property_data.get('address', 'Property Report')
    city = property_data.get('city', '')
    title = f"Property Report"
    subtitle = f"{address}, {city}" if city else address
    
    elements.extend(add_header(doc, title, subtitle))
    
    # Property details table
    elements.extend(add_property_table(doc, property_data))
    
    # Key metrics
    metrics = {}
    if 'price' in property_data:
        metrics['Listing Price'] = property_data['price']
    if 'price_per_sqft' in property_data:
        metrics['Price per Sqft'] = property_data['price_per_sqft']
    if 'investment_score' in property_data:
        metrics['Investment Score'] = property_data['investment_score']
    if 'rental_yield' in property_data:
        metrics['Rental Yield'] = property_data['rental_yield']
    
    if metrics:
        elements.extend(add_metrics_section(doc, metrics))
    
    # Additional information section
    styles = getSampleStyleSheet()
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.HexColor('#1a5276')
    )
    
    if 'description' in property_data:
        elements.append(Paragraph("Description", section_style))
        desc_style = ParagraphStyle(
            'DescStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            spaceAfter=10
        )
        elements.append(Paragraph(property_data['description'], desc_style))
    
    # Footer
    elements.extend(add_footer(doc))
    
    # Build PDF
    doc.build(elements)
    
    return output_path


def create_market_report(city_data: Dict[str, Any], output_path: str) -> str:
    """
    Create a PDF report for city market overview.
    
    Args:
        city_data: Dictionary containing city market information
        output_path: Path to save the PDF report
        
    Returns:
        Path to saved PDF
    """
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Header
    city_name = city_data.get('city', 'City')
    elements.extend(add_header(doc, f"Market Report: {city_name}", "Comprehensive Market Analysis"))
    
    # City statistics section
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.HexColor('#1a5276')
    )
    
    elements.append(Paragraph("Market Statistics", section_style))
    
    stats_data = [['Metric', 'Value']]
    
    stats_fields = {
        'total_listings': ('Total Listings', lambda x: f"{x:,}"),
        'avg_price': ('Average Price', lambda x: f"${x:,.2f}"),
        'median_price': ('Median Price', lambda x: f"${x:,.2f}"),
        'avg_days_on_market': ('Avg Days on Market', lambda x: f"{x:.0f} days"),
        'price_per_sqft': ('Price per Sqft', lambda x: f"${x:,.2f}"),
        'inventory_months': ('Months of Inventory', lambda x: f"{x:.1f} months"),
        'price_change_yoy': ('Year-over-Year Change', lambda x: f"{x:+.1f}%")
    }
    
    for field, (label, formatter) in stats_fields.items():
        if field in city_data and city_data[field] is not None:
            stats_data.append([label, formatter(city_data[field])])
    
    if len(stats_data) > 1:
        table = Table(stats_data, colWidths=[3 * inch, 3 * inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8e44ad')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f5eef8')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d7bde2')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f5eef8')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ]))
        elements.append(table)
    
    # Market health section
    if 'market_health_score' in city_data:
        elements.append(Paragraph("Market Health", section_style))
        health_data = [
            ['Indicator', 'Score', 'Status'],
        ]
        
        health = city_data['market_health_score']
        if isinstance(health, dict):
            for key, value in health.items():
                if isinstance(value, (int, float)):
                    health_data.append([key.replace('_', ' ').title(), f"{value:.1f}", 
                                       "Good" if value >= 60 else "Fair" if value >= 40 else "Poor"])
        
        if len(health_data) > 1:
            table = Table(health_data, colWidths=[2.5 * inch, 1.5 * inch, 2 * inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e67e22')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#f0d9b5')),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
                ('ALIGN', (1, 1), (1, -1), 'CENTER'),
                ('ALIGN', (2, 1), (2, -1), 'CENTER'),
            ]))
            elements.append(table)
    
    # Investment analysis section
    if 'investment_analysis' in city_data:
        elements.append(Paragraph("Investment Analysis", section_style))
        inv_style = ParagraphStyle(
            'InvStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            spaceAfter=10
        )
        elements.append(Paragraph(str(city_data['investment_analysis']), inv_style))
    
    # Footer
    elements.extend(add_footer(doc))
    
    # Build PDF
    doc.build(elements)
    
    return output_path


def create_portfolio_report(properties_df: Any, output_path: str) -> str:
    """
    Create a PDF report for a portfolio of properties.
    
    Args:
        properties_df: DataFrame or list of dictionaries containing property data
        output_path: Path to save the PDF report
        
    Returns:
        Path to saved PDF
    """
    import pandas as pd
    
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Convert to DataFrame if needed
    if isinstance(properties_df, list):
        df = pd.DataFrame(properties_df)
    else:
        df = properties_df
    
    # Header
    elements.extend(add_header(doc, "Portfolio Report", 
                              f"Analysis of {len(df)} Properties"))
    
    # Portfolio summary section
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=14,
        spaceBefore=20,
        spaceAfter=10,
        textColor=colors.HexColor('#1a5276')
    )
    
    elements.append(Paragraph("Portfolio Summary", section_style))
    
    # Calculate portfolio metrics
    summary_data = [['Metric', 'Value']]
    
    if 'price' in df.columns:
        total_value = df['price'].sum()
        avg_price = df['price'].mean()
        summary_data.append(['Total Portfolio Value', f"${total_value:,.2f}"])
        summary_data.append(['Average Property Value', f"${avg_price:,.2f}"])
        summary_data.append(['Number of Properties', f"{len(df):,}"])
    
    if 'area_sqft' in df.columns:
        total_area = df['area_sqft'].sum()
        summary_data.append(['Total Area', f"{total_area:,.0f} sqft"])
    
    if 'bedrooms' in df.columns:
        total_bedrooms = df['bedrooms'].sum()
        summary_data.append(['Total Bedrooms', f"{int(total_bedrooms):,}"])
    
    if 'bathrooms' in df.columns:
        total_bathrooms = df['bathrooms'].sum()
        summary_data.append(['Total Bathrooms', f"{int(total_bathrooms):,}"])
    
    # Create summary table
    if len(summary_data) > 1:
        table = Table(summary_data, colWidths=[3 * inch, 3 * inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#ecf0f1')),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#ecf0f1')]),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
        ]))
        elements.append(table)
    
    # Property breakdown by type
    if 'property_type' in df.columns:
        elements.append(Paragraph("Properties by Type", section_style))
        
        type_counts = df['property_type'].value_counts()
        type_data = [['Property Type', 'Count', '% of Portfolio']]
        
        for ptype, count in type_counts.items():
            pct = (count / len(df)) * 100
            type_data.append([str(ptype), f"{count:,}", f"{pct:.1f}%"])
        
        table = Table(type_data, colWidths=[2.5 * inch, 1.5 * inch, 2 * inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#16a085')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#a3d9d1')),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ]))
        elements.append(table)
    
    # Geographic distribution
    if 'city' in df.columns:
        elements.append(Paragraph("Geographic Distribution", section_style))
        
        city_counts = df['city'].value_counts().head(10)
        city_data = [['City', 'Properties', 'Avg Price']]
        
        for city, count in city_counts.items():
            avg_price = df[df['city'] == city]['price'].mean() if 'price' in df.columns else 0
            city_data.append([str(city), f"{count:,}", f"${avg_price:,.0f}"])
        
        table = Table(city_data, colWidths=[2.5 * inch, 1.5 * inch, 2 * inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#d35400')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#f5b7b1')),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('ALIGN', (1, 1), (-1, -1), 'CENTER'),
        ]))
        elements.append(table)
    
    # Individual properties list
    elements.append(Paragraph("Individual Properties", section_style))
    
    # Create properties table
    display_cols = ['address', 'city', 'price', 'bedrooms', 'bathrooms', 'area_sqft']
    available_cols = [col for col in display_cols if col in df.columns]
    
    if available_cols:
        props_data = [[col.replace('_', ' ').title() for col in available_cols]]
        
        for _, row in df.head(20).iterrows():  # Limit to 20 properties
            row_data = []
            for col in available_cols:
                val = row[col]
                if col == 'price':
                    row_data.append(f"${val:,.0f}")
                elif col == 'area_sqft':
                    row_data.append(f"{val:,.0f}")
                else:
                    row_data.append(str(val) if val else "-")
            props_data.append(row_data)
        
        col_widths = [6 * inch / len(available_cols)] * len(available_cols)
        table = Table(props_data, colWidths=col_widths)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2c3e50')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bdc3c7')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8f9fa')]),
            ('ALIGN', (0, 1), (-1, -1), 'LEFT'),
        ]))
        elements.append(table)
        
        if len(df) > 20:
            elements.append(Spacer(1, 10))
            note_style = ParagraphStyle(
                'NoteStyle',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.gray,
                alignment=1
            )
            elements.append(Paragraph(f"Showing 20 of {len(df)} properties", note_style))
    
    # Footer
    elements.extend(add_footer(doc))
    
    # Build PDF
    doc.build(elements)
    
    return output_path
