import { useQuery } from '@tanstack/react-query';
import { Part } from '@/types/inventory';

export const useInventoryLookup = (inspectionId: string | null) => {
  return useQuery<Part[]>({
    queryKey: ['inventoryLookup', inspectionId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/inventory/lookup/${inspectionId}`);
      if (!res.ok) throw new Error('Failed to lookup inventory');
      return res.json();
    },
    enabled: !!inspectionId,
    staleTime: 2 * 60 * 1000,
  });
};
