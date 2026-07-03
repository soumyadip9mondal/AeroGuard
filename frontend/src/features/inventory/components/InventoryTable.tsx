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
    <div className="rounded-[24px] border border-border-subtle bg-surface overflow-x-auto shadow-sm">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-subtle">
            <th onClick={() => handleSort('partNumber')} className="px-3 sm:px-4 py-2.5 text-text-tertiary whitespace-nowrap cursor-pointer hover:text-text-primary transition-colors" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Part Number</th>
            <th onClick={() => handleSort('name')} className="px-3 sm:px-4 py-2.5 text-text-tertiary whitespace-nowrap cursor-pointer hover:text-text-primary transition-colors" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Part Name</th>
            <th className="hidden lg:table-cell px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Aircraft</th>
            <th className="hidden xl:table-cell px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>ATA</th>
            <th className="hidden md:table-cell px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Mfg</th>
            <th className="hidden lg:table-cell px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Warehouse</th>
            <th className="px-3 sm:px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Avail</th>
            <th className="hidden sm:table-cell px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Rsvd</th>
            <th className="hidden sm:table-cell px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Min</th>
            <th className="hidden xl:table-cell px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Supplier</th>
            <th className="hidden md:table-cell px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Status</th>
            <th className="px-3 sm:px-4 py-2.5 text-text-tertiary whitespace-nowrap text-right" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr
              key={part.id}
              className={`border-b border-border-subtle last:border-0 hover:bg-elevated/50 transition-colors cursor-pointer ${selectedPartId === part.id ? 'bg-accent-subtle/50' : ''}`}
              onClick={() => setSelectedPartId(part.id)}
            >
              <td className="px-3 sm:px-4 py-3 font-mono text-[13px] text-text-primary hover:text-accent max-w-[90px] sm:max-w-none truncate">{part.partNumber}</td>
              <td className="px-3 sm:px-4 py-3 text-[13px] text-text-secondary whitespace-nowrap max-w-[100px] sm:max-w-[150px] truncate">{part.name}</td>
              <td className="hidden lg:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.aircraftModel ?? '-'}</td>
              <td className="hidden xl:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.ataChapter ?? '-'}</td>
              <td className="hidden md:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.manufacturer ?? '-'}</td>
              <td className="hidden lg:table-cell px-4 py-3 text-[13px] text-text-tertiary">{(part as any).warehouseName ?? part.warehouseId ?? '-'}</td>
              <td className="px-3 sm:px-4 py-3 text-[13px] text-text-primary font-medium">{part.availableQty}</td>
              <td className="hidden sm:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.reservedQty}</td>
              <td className="hidden sm:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.minStock ?? '-'}</td>
              <td className="hidden xl:table-cell px-4 py-3 text-[13px] text-text-tertiary">{(part as any).supplierName ?? part.supplierId ?? '-'}</td>
              <td className="hidden md:table-cell px-4 py-3 text-[13px] text-text-tertiary capitalize">{part.lifecycleStatus?.replace(/_/g, ' ') ?? 'unknown'}</td>
              <td className="px-3 sm:px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1 sm:gap-2">
                  <button onClick={(e) => { e.stopPropagation(); openView(part.id); }} className="p-1.5 text-text-tertiary hover:text-accent transition-colors rounded-md hover:bg-elevated"><EyeIcon className="h-4 w-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); openReserve(part.id); }} className="p-1.5 text-text-tertiary hover:text-accent transition-colors rounded-md hover:bg-elevated"><ArchiveIcon className="h-4 w-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); openHistory(part.id); }} className="p-1.5 text-text-tertiary hover:text-accent transition-colors rounded-md hover:bg-elevated"><HistoryIcon className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
