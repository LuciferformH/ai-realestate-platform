import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard');
      return data;
    },
  });
}

export function useLineChart(groupBy = 'city', metric = 'price') {
  return useQuery({
    queryKey: ['analytics', 'line', groupBy, metric],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/charts/line?group_by=${groupBy}&metric=${metric}`);
      return data;
    },
  });
}

export function useBarChart(groupBy = 'city', metric = 'price') {
  return useQuery({
    queryKey: ['analytics', 'bar', groupBy, metric],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/charts/bar?group_by=${groupBy}&metric=${metric}`);
      return data;
    },
  });
}

export function usePieChart(groupBy = 'property_type') {
  return useQuery({
    queryKey: ['analytics', 'pie', groupBy],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/charts/pie?group_by=${groupBy}`);
      return data;
    },
  });
}

export function useAreaChart(timeField = 'created_at', groupBy = 'property_type') {
  return useQuery({
    queryKey: ['analytics', 'area', timeField, groupBy],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/charts/area?time_field=${timeField}&group_by=${groupBy}`);
      return data;
    },
  });
}

export function useScatterChart(xField = 'area', yField = 'price') {
  return useQuery({
    queryKey: ['analytics', 'scatter', xField, yField],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/charts/scatter?x_field=${xField}&y_field=${yField}`);
      return data;
    },
  });
}

export function useTreemap(groupBy = 'city') {
  return useQuery({
    queryKey: ['analytics', 'treemap', groupBy],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/charts/treemap?group_by=${groupBy}`);
      return data;
    },
  });
}

export function useCorrelation() {
  return useQuery({
    queryKey: ['analytics', 'correlation'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/correlation');
      return data;
    },
  });
}

export function useDistribution(field = 'price') {
  return useQuery({
    queryKey: ['analytics', 'distribution', field],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/distribution?field=${field}`);
      return data;
    },
  });
}

export function useMonthlyTrends(months = 12) {
  return useQuery({
    queryKey: ['analytics', 'monthly-trends', months],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/monthly-trends?months=${months}`);
      return data;
    },
  });
}

export function useYearlyTrends() {
  return useQuery({
    queryKey: ['analytics', 'yearly-trends'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/yearly-trends');
      return data;
    },
  });
}

export function useTopCities(limit = 10) {
  return useQuery({
    queryKey: ['analytics', 'top-cities', limit],
    queryFn: async () => {
      const { data } = await api.get(`/analytics/top-cities?limit=${limit}`);
      return data;
    },
  });
}

export function useInvestmentScores() {
  return useQuery({
    queryKey: ['analytics', 'investment-scores'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/investment-scores');
      return data;
    },
  });
}
