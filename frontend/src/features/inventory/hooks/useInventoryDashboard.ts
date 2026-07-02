import { useQuery } from '@tanstack/react-query';

/**
 * Hook to fetch inventory dashboard KPI data.
 * Expected endpoint: GET /api/v1/inventory/dashboard
 */
export const useInventoryDashboard = () => {
  return useQuery({
    queryKey: ['inventoryDashboard'],
    queryFn: async () => {
      const response = await fetch('/api/v1/inventory/dashboard');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory dashboard');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
};
