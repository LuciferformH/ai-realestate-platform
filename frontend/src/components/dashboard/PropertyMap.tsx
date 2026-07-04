import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';

interface Property {
  id: string | number;
  title: string;
  price: number;
  beds: number;
  baths: number;
  area: number;
  latitude: number;
  longitude: number;
  image?: string;
  city?: string;
}

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (property: Property) => void;
}

const getPriceColor = (price: number): string => {
  if (price < 200000) return '#10b981'; // Green - cheap
  if (price < 400000) return '#3b82f6'; // Blue - medium
  if (price < 600000) return '#f59e0b'; // Yellow - above average
  if (price < 800000) return '#f97316'; // Orange - expensive
  return '#ef4444'; // Red - very expensive
};

const createPriceIcon = (price: number) => {
  const color = getPriceColor(price);
  const formattedPrice = price >= 1000000
    ? `$${(price / 1000000).toFixed(1)}M`
    : `$${(price / 1000).toFixed(0)}K`;

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        color: white;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        transform: translate(-50%, -50%);
      ">
        ${formattedPrice}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export const PropertyMap: React.FC<PropertyMapProps> = ({
  properties,
  center = [40.7128, -74.006],
  zoom = 12,
  onMarkerClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      // Initialize marker cluster group
      markersRef.current = (L as any).markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
      });

      mapInstanceRef.current.addLayer(markersRef.current);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers
    properties.forEach((property) => {
      const marker = L.marker([property.latitude, property.longitude], {
        icon: createPriceIcon(property.price),
      });

      // Create popup content
      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui, sans-serif;">
          ${
            property.image
              ? `<img src="${property.image}" alt="${property.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />`
              : ''
          }
          <h3 style="font-weight: 600; font-size: 14px; margin: 0 0 4px 0; color: #1f2937;">${property.title}</h3>
          <p style="font-size: 18px; font-weight: 700; color: #3b82f6; margin: 0 0 8px 0;">$${property.price.toLocaleString()}</p>
          <div style="display: flex; gap: 12px; font-size: 12px; color: #6b7280;">
            <span>🛏️ ${property.beds} beds</span>
            <span>🚿 ${property.baths} baths</span>
            <span>📐 ${property.area.toLocaleString()} sqft</span>
          </div>
          ${property.city ? `<p style="font-size: 12px; color: #9ca3af; margin-top: 4px;">📍 ${property.city}</p>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup',
      });

      marker.on('click', () => {
        onMarkerClick?.(property);
      });

      markersRef.current?.addLayer(marker);
    });

    // Fit bounds if there are properties
    if (properties.length > 0 && markersRef.current) {
      const bounds = markersRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [properties, onMarkerClick]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-xl overflow-hidden"
      style={{ height: '400px' }}
    />
  );
};

export default PropertyMap;
