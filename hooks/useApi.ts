import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import api from '@/utils/api';
import { AxiosError } from 'axios';

export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: UseQueryOptions<T, AxiosError>
) {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await api.get<T>(endpoint);
      return response.data;
    },
    ...options,
  });
}

export function useApiMutation<T, V>(
  endpoint: string,
  options?: UseMutationOptions<T, AxiosError, V>
) {
  return useMutation({
    mutationFn: async (variables: V) => {
      const response = await api.post<T>(endpoint, variables);
      return response.data;
    },
    ...options,
  });
}