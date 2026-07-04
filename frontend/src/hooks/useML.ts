import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export function useModels() {
  return useQuery({
    queryKey: ['ml', 'models'],
    queryFn: async () => {
      const { data } = await api.get('/ml/models');
      return data;
    },
  });
}

export function usePredict() {
  return useMutation({
    mutationFn: async (input: Record<string, any>) => {
      const { data } = await api.post('/ml/predict', input);
      return data;
    },
    onError: () => {
      toast.error('Prediction failed. Please try again.');
    },
  });
}

export function useTrainModel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/ml/train');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ml', 'models'] });
      toast.success('Model training started!');
    },
    onError: () => {
      toast.error('Failed to start model training.');
    },
  });
}

export function useModelComparison() {
  return useQuery({
    queryKey: ['ml', 'compare'],
    queryFn: async () => {
      const { data } = await api.get('/ml/compare');
      return data;
    },
  });
}

export function useFeatureImportance() {
  return useQuery({
    queryKey: ['ml', 'feature-importance'],
    queryFn: async () => {
      const { data } = await api.get('/ml/feature-importance');
      return data;
    },
  });
}
