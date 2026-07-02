import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { useInventoryStore } from '../store/inventoryStore';
import { useParts } from '../hooks/useParts';
import type { Part } from '@/types/inventory';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import ErrorState from './ErrorState';
import { Button } from '@/components/ui/button';
import { EyeIcon, HistoryIcon, ArchiveIcon } from 'lucide-react';

const InventoryTable: React.FC = () => {
  const {
    currentPage,
    pageSize,
    sortOrder,
    setSortOrder,
    setCurrentPage,
    selectedPartId,
    setSelectedPartId,
    searchText,
    selectedFilters,
    setModalState,
  } = useInventoryStore();

  const sortField = sortOrder.split('_')[0] || 'name';
  const sortDir = sortOrder.endsWith('_desc') ? 'desc' : 'asc';

  const { data, isLoading, isError, error, refetch } = useParts({
    page: currentPage,
    pageSize,
    search: searchText || undefined,
    warehouseId: selectedFilters.warehouseId,
    categoryId: selectedFilters.categoryId,
    supplierId: selectedFilters.supplierId,
    status: selectedFilters.status,
    sortField,
    sortOrder: sortDir,
  });

  const handleSort = (field: string) => {
    const [col, dir] = sortOrder.split('_');
    const newDir = col === field && dir === 'asc' ? 'desc' : 'asc';
    setSortOrder(`${field}_${newDir}`);
    setCurrentPage(1);
  };

  const openView = (id: string) => {
    setSelectedPartId(id);
    setModalState({ viewPart: true });
  };

  const openReserve = (id: string) => {
    setSelectedPartId(id);
    setModalState({ reservePart: true });
  };

  const openHistory = (id: string) => {
    setSelectedPartId(id);
    setModalState({ partHistory: true });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;
  if (!data || data.data.length === 0) return <EmptyState message="No parts found." />;

  const parts: Part[] = data.data;

  return (
    <>
      <Table className="bg-white/5 backdrop-blur-sm dark:bg-black/20 rounded-md">
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('partNumber')} className="cursor-pointer">Part Number</TableHead>
            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">Part Name</TableHead>
            <TableHead>Aircraft Model</TableHead>
            <TableHead>ATA Chapter</TableHead>
            <TableHead>Manufacturer</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Reserved</TableHead>
            <TableHead>Minimum Stock</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => (
            <TableRow
              key={part.id}
              className={selectedPartId === part.id ? 'bg-blue-500/20' : ''}
              onClick={() => setSelectedPartId(part.id)}
            >
              <TableCell>{part.partNumber}</TableCell>
              <TableCell>{part.name}</TableCell>
              <TableCell>{part.aircraftModel ?? '-'}</TableCell>
              <TableCell>{part.ataChapter ?? '-'}</TableCell>
              <TableCell>{part.manufacturer ?? '-'}</TableCell>
              <TableCell>{(part as any).warehouseName ?? part.warehouseId ?? '-'}</TableCell>
              <TableCell>{part.availableQty}</TableCell>
              <TableCell>{part.reservedQty}</TableCell>
              <TableCell>{part.minStock ?? '-'}</TableCell>
              <TableCell>{(part as any).supplierName ?? part.supplierId ?? '-'}</TableCell>
              <TableCell>{part.lifecycleStatus ?? 'unknown'}</TableCell>
              <TableCell className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openView(part.id); }}>
                  <EyeIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openReserve(part.id); }}>
                  <ArchiveIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openHistory(part.id); }}>
                  <HistoryIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default InventoryTable;
