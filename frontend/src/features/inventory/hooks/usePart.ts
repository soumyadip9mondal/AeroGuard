import { useQuery } from '@tanstack/react-query';
import { Part } from '@/types/inventory';
import { inventoryFetch } from '../lib/inventoryFetch';

/**
 * Hook to fetch a single part by its ID.
 */
export const usePart = (partId: string) => {
  return useQuery<Part>({
    queryKey: ['part', partId],
    queryFn: async () => {
      const response = await inventoryFetch(`/api/v1/inventory/parts/${partId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch part');
      }
      return response.json();
    },
    enabled: !!partId,
    staleTime: 5 * 60 * 1000,
  });
};
