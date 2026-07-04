import type { City } from '@/types';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const CITIES: City[] = [
  { id: 1, name: 'Mumbai', state: 'Maharashtra', latitude: 19.076, longitude: 72.8777, population: 12478447, avg_price: 18500000, growth_rate: 8.5 },
  { id: 2, name: 'Delhi', state: 'Delhi', latitude: 28.7041, longitude: 77.1025, population: 11007835, avg_price: 12500000, growth_rate: 7.2 },
  { id: 3, name: 'Bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946, population: 8443675, avg_price: 9800000, growth_rate: 10.1 },
  { id: 4, name: 'Hyderabad', state: 'Telangana', latitude: 17.385, longitude: 78.4867, population: 6810000, avg_price: 7200000, growth_rate: 12.3 },
  { id: 5, name: 'Chennai', state: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, population: 7088000, avg_price: 8500000, growth_rate: 6.8 },
  { id: 6, name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567, population: 3124458, avg_price: 7800000, growth_rate: 9.4 },
  { id: 7, name: 'Ahmedabad', state: 'Gujarat', latitude: 23.0225, longitude: 72.5714, population: 5633927, avg_price: 5200000, growth_rate: 7.9 },
  { id: 8, name: 'Kolkata', state: 'West Bengal', latitude: 22.5726, longitude: 88.3639, population: 4496694, avg_price: 6100000, growth_rate: 5.6 },
  { id: 9, name: 'Jaipur', state: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, population: 3046692, avg_price: 4800000, growth_rate: 8.1 },
  { id: 10, name: 'Lucknow', state: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, population: 2817105, avg_price: 4200000, growth_rate: 7.5 },
];

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'Independent House' },
  { value: 'villa', label: 'Villa' },
  { value: 'plot', label: 'Plot' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'duplex', label: 'Duplex' },
] as const;

export const BEDROOM_OPTIONS = [
  { value: 1, label: '1 BHK' },
  { value: 2, label: '2 BHK' },
  { value: 3, label: '3 BHK' },
  { value: 4, label: '4 BHK' },
  { value: 5, label: '5+ BHK' },
] as const;

export const SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'area_asc', label: 'Area: Small to Large' },
  { value: 'area_desc', label: 'Area: Large to Small' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'bedrooms_asc', label: 'Bedrooms: Low to High' },
  { value: 'bedrooms_desc', label: 'Bedrooms: High to Low' },
] as const;

export const CHART_COLORS = [
  '#6366f1',
  '#14b8a6',
  '#d946ef',
  '#f59e0b',
  '#ef4444',
  '#3b82f6',
  '#10b981',
  '#f97316',
  '#8b5cf6',
  '#06b6d4',
] as const;

export const AMENITIES_LIST = [
  'Swimming Pool',
  'Gym',
  'Garden',
  'Club House',
  'Playground',
  'Security',
  'CCTV',
  'Power Backup',
  'Elevator',
  'Parking',
  'Rain Water Harvesting',
  'Solar Panels',
  'Smart Home',
  'Modular Kitchen',
  'Wardrobe',
  'Gas Pipeline',
] as const;

export const ROLE_LABELS: Record<string, string> = {
  user: 'User',
  admin: 'Administrator',
  analyst: 'Data Analyst',
};
