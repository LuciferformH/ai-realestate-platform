import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  Property,
  PropertyFilters,
  PaginatedResponse,
} from '@/types';
import toast from 'react-hot-toast';

export function useProperties(filters: PropertyFilters = {}) {
  return useQuery<PaginatedResponse<Property>>({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      const { data } = await api.get(`/properties?${params.toString()}`);
      return data;
    },
  });
}

export function useProperty(id: number | string) {
  return useQuery<Property>({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data } = await api.get(`/properties/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useFeaturedProperties() {
  return useQuery<Property[]>({
    queryKey: ['properties', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/properties?is_featured=true&per_page=6');
      return data.items ?? data;
    },
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyData: Partial<Property>) => {
      const { data } = await api.post('/properties', propertyData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property created successfully!');
    },
    onError: () => {
      toast.error('Failed to create property. Please try again.');
    },
  });
}

export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data: propertyData }: { id: number; data: Partial<Property> }) => {
      const response = await api.put(`/properties/${id}`, propertyData);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
      toast.success('Property updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update property. Please try again.');
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/properties/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete property. Please try again.');
    },
  });
}
