const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

interface DashboardStats {
  totalProperties: number;
  totalPropertiesTrend: number;
  avgPrice: number;
  avgPriceTrend: number;
  medianPrice: number;
  medianPriceTrend: number;
  highestPrice: number;
  highestPriceTrend: number;
  lowestPrice: number;
  lowestPriceTrend: number;
  avgPricePerSqft: number;
  avgPricePerSqftTrend: number;
  totalCities: number;
  totalCitiesTrend: number;
  totalListings: number;
  totalListingsTrend: number;
}

interface PriceHistoryItem {
  name: string;
  date?: string;
  avgPrice?: number;
  medianPrice?: number;
  [key: string]: unknown;
}

interface CityDistributionItem {
  name: string;
  value: number;
}

interface PropertyTypeItem {
  name: string;
  value: number;
}

interface PriceVsAreaItem {
  x: number;
  y: number;
  z?: number;
  name?: string;
}

interface MarketHeatmapData {
  data: number[][];
  rowLabels: string[];
  colLabels: string[];
}

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

const fetchApi = async <T>(endpoint: string): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }
  return response.json();
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  return fetchApi<DashboardStats>('/dashboard/stats');
};

export const fetchPriceHistory = async (): Promise<PriceHistoryItem[]> => {
  return fetchApi<PriceHistoryItem[]>('/dashboard/price-history');
};

export const fetchCityDistribution = async (): Promise<CityDistributionItem[]> => {
  return fetchApi<CityDistributionItem[]>('/dashboard/city-distribution');
};

export const fetchPropertyTypes = async (): Promise<PropertyTypeItem[]> => {
  return fetchApi<PropertyTypeItem[]>('/dashboard/property-types');
};

export const fetchPriceVsArea = async (): Promise<PriceVsAreaItem[]> => {
  return fetchApi<PriceVsAreaItem[]>('/dashboard/price-vs-area');
};

export const fetchMarketHeatmap = async (): Promise<MarketHeatmapData> => {
  return fetchApi<MarketHeatmapData>('/dashboard/market-heatmap');
};

export const fetchRecentProperties = async (): Promise<Property[]> => {
  return fetchApi<Property[]>('/dashboard/recent-properties');
};

export type {
  DashboardStats,
  PriceHistoryItem,
  CityDistributionItem,
  PropertyTypeItem,
  PriceVsAreaItem,
  MarketHeatmapData,
  Property,
};
