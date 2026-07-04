export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'analyst';
  is_active: boolean;
  created_at: string;
}

export interface Property {
  id: number;
  title: string;
  property_type: string;
  price: number;
  city: string;
  locality: string;
  address: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  furnished: boolean;
  area: number;
  year_built: number;
  property_age: number;
  description: string;
  images: string[];
  amenities: string[];
  nearby_schools: string[];
  hospital_distance: number;
  metro_distance: number;
  crime_rate: number;
  population: number;
  rental_yield: number;
  market_growth: number;
  is_featured: boolean;
  is_active: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: number;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  population: number;
  avg_price: number;
  growth_rate: number;
}

export interface DashboardStats {
  total_properties: number;
  average_price: number;
  median_price: number;
  highest_price: number;
  lowest_price: number;
  avg_price_per_sqft: number;
  total_cities: number;
  total_listings: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface MLModel {
  id: number;
  name: string;
  model_type: string;
  accuracy: number;
  mae: number;
  rmse: number;
  r2_score: number;
  created_at: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface PredictionInput {
  bedrooms: number;
  bathrooms: number;
  area: number;
  city: string;
  property_type: string;
  age: number;
}

export interface PredictionResult {
  predicted_price: number;
  confidence: number;
  model_used: string;
  comparable_properties: Property[];
}

export interface PropertyFilters {
  city?: string;
  locality?: string;
  property_type?: string;
  min_price?: number;
  max_price?: number;
  min_area?: number;
  max_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  furnished?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
  search?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface CorrelationResult {
  feature1: string;
  feature2: string;
  correlation: number;
}

export interface DistributionData {
  label: string;
  count: number;
  percentage: number;
}

export interface TrendData {
  date: string;
  value: number;
  label?: string;
}

export interface TrainingJob {
  id: number;
  model_name: string;
  status: 'pending' | 'training' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}
