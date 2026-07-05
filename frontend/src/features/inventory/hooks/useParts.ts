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

const DUMMY_PARTS: Part[] = [
  { id: 'p1', partNumber: 'BOLT-101', name: 'Titanium Hex Bolt', aircraftModel: 'Boeing 737', ataChapter: '53', category: 'Hardware', manufacturer: 'AeroFasteners', warehouseId: 'WH-East', availableQty: 150, reservedQty: 20, minStock: 50, supplierId: 'Sup-A', leadTimeDays: 7 },
  { id: 'p2', partNumber: 'ACT-442', name: 'Flap Actuator', aircraftModel: 'Airbus A320', ataChapter: '27', category: 'Hydraulics', manufacturer: 'HydraTech', warehouseId: 'WH-West', availableQty: 2, reservedQty: 1, minStock: 5, supplierId: 'Sup-B', leadTimeDays: 45 },
  { id: 'p3', partNumber: 'SENS-99', name: 'Temp Sensor', aircraftModel: 'Boeing 787', ataChapter: '21', category: 'Avionics', manufacturer: 'ThermoSensors', warehouseId: 'WH-North', availableQty: 0, reservedQty: 0, minStock: 10, supplierId: 'Sup-C', leadTimeDays: 14 },
  { id: 'p4', partNumber: 'PUMP-200', name: 'Hydraulic Pump', aircraftModel: 'Boeing 777', ataChapter: '29', category: 'Hydraulics', manufacturer: 'HydraTech', warehouseId: 'WH-East', availableQty: 12, reservedQty: 0, minStock: 5, supplierId: 'Sup-B', leadTimeDays: 30 },
  { id: 'p5', partNumber: 'VALVE-5A', name: 'Relief Valve', aircraftModel: 'Airbus A350', ataChapter: '28', category: 'Hydraulics', manufacturer: 'ValveSystems', warehouseId: 'WH-South', availableQty: 45, reservedQty: 10, minStock: 20, supplierId: 'Sup-A', leadTimeDays: 10 },
  { id: 'p6', partNumber: 'SCRN-12', name: 'Display Screen', aircraftModel: 'Boeing 737', ataChapter: '31', category: 'Avionics', manufacturer: 'AeroDisplays', warehouseId: 'WH-East', availableQty: 5, reservedQty: 2, minStock: 10, supplierId: 'Sup-C', leadTimeDays: 21 },
  { id: 'p7', partNumber: 'SEAT-50', name: 'Economy Seat Cushion', aircraftModel: 'Universal', ataChapter: '25', category: 'Interior', manufacturer: 'ComfortAir', warehouseId: 'WH-West', availableQty: 200, reservedQty: 15, minStock: 100, supplierId: 'Sup-D', leadTimeDays: 30 }
];

export const useParts = (params: UsePartsParams) => {
  const { page, pageSize, search, warehouseId, categoryId, supplierId, status, sortField, sortOrder } = params;

  const queryKey = ['parts', { page, pageSize, search, warehouseId, categoryId, supplierId, status, sortField, sortOrder }];

  return useQuery<{ data: Part[]; total: number }>({
    queryKey,
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 600));

      let filtered = [...DUMMY_PARTS];

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(p => 
          p.partNumber.toLowerCase().includes(s) || 
          p.name.toLowerCase().includes(s)
        );
      }
      if (warehouseId) filtered = filtered.filter(p => p.warehouseId === warehouseId);
      if (categoryId) filtered = filtered.filter(p => p.category === categoryId);
      if (supplierId) filtered = filtered.filter(p => p.supplierId === supplierId);
      
      if (status) {
        filtered = filtered.filter(p => getStockStatus(p) === status);
      }

      if (sortField) {
        filtered.sort((a, b) => {
          const aVal = (a as any)[sortField] ?? '';
          const bVal = (b as any)[sortField] ?? '';
          if (aVal < bVal) return sortOrder === 'desc' ? 1 : -1;
          if (aVal > bVal) return sortOrder === 'desc' ? -1 : 1;
          return 0;
        });
      }

      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const paginatedData = status ? filtered : filtered.slice(start, start + pageSize);

      return { data: paginatedData, total };
    },
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};
