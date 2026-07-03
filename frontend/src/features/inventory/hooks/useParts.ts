import { useQuery } from '@tanstack/react-query';
import { Part } from '@/types/inventory';
import { inventoryFetch } from '../lib/inventoryFetch';

interface UsePartsParams {
  page: number;
  pageSize: number;
  search?: string;
  warehouseId?: string;
  categoryId?: string;
  supplierId?: string;
  status?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

function getStockStatus(part: Part): string {
  if (part.availableQty === 0) return 'out_of_stock';
  if (part.minStock != null && part.availableQty <= part.minStock) return 'low_stock';
  return 'in_stock';
}

export const useParts = (params: UsePartsParams) => {
  const { page, pageSize, search, warehouseId, categoryId, supplierId, status, sortField, sortOrder } = params;

  const queryKey = ['parts', { page, pageSize, search, warehouseId, categoryId, supplierId, status, sortField, sortOrder }];

  return useQuery<{ data: Part[]; total: number }>({
    queryKey,
    queryFn: async () => {
      const query = new URLSearchParams({
        page: page.toString(),
        pageSize: (status ? 200 : pageSize).toString(),
      });
      if (search) query.append('search', search);
      if (warehouseId) query.append('warehouseId', warehouseId);
      if (categoryId) query.append('categoryId', categoryId);
      if (supplierId) query.append('supplierId', supplierId);
      if (sortField) query.append('sortField', sortField);
      if (sortOrder) query.append('sortOrder', sortOrder);

      const response = await inventoryFetch(`/api/v1/inventory/parts?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch parts');
      }
      const result = await response.json();

      if (status) {
        const filtered = result.data.filter((p: Part) => getStockStatus(p) === status);
        return { data: filtered, total: filtered.length };
      }

      return result;
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
