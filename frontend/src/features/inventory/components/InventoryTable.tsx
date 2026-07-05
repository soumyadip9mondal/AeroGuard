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
import { ArchiveIcon } from 'lucide-react';

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



  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState error={error as Error} onRetry={refetch} />;
  if (!data || data.data.length === 0) return (
    <div className="py-12 border border-border-subtle rounded-2xl bg-surface flex flex-col items-center justify-center text-center">
      <div className="h-12 w-12 rounded-full bg-surface-hover flex items-center justify-center mb-4">
        <ArchiveIcon className="h-6 w-6 text-text-tertiary" />
      </div>
      <div className="text-[15px] font-medium text-text-primary mb-1">No Parts Found</div>
      <div className="text-[13px] text-text-tertiary max-w-sm">We could not find any inventory matching your current filters or search query. Try adjusting them to see more results.</div>
    </div>
  );

  const parts: Part[] = data.data;

  const getStatusBadge = (available: number, min: number | null | undefined, reserved: number) => {
    if (available === 0) return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-danger bg-danger-subtle px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-danger"></span>Out of Stock</span>;
    if (min != null && available < min) return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning bg-warning-subtle px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-warning"></span>Low Stock</span>;
    if (reserved > 0) return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-accent bg-accent-subtle px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-accent"></span>Reserved</span>;
    return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success-subtle px-2 py-0.5 rounded-full"><span className="h-1.5 w-1.5 rounded-full bg-success"></span>In Stock</span>;
  };

  return (
    <div className="space-y-3">
      <div className="text-[12px] font-medium text-text-tertiary px-1">
        Showing {parts.length} {parts.length === 1 ? 'Part' : 'Parts'}
      </div>
      <div className="rounded-[24px] border border-border-subtle bg-surface overflow-hidden shadow-sm w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border-subtle">
            <th onClick={() => handleSort('partNumber')} className="px-3 sm:px-4 py-2.5 text-text-tertiary cursor-pointer hover:text-text-primary transition-colors" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Part Number</th>
            <th onClick={() => handleSort('name')} className="px-3 sm:px-4 py-2.5 text-text-tertiary cursor-pointer hover:text-text-primary transition-colors" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Part Name</th>
            <th className="hidden lg:table-cell px-4 py-2.5 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Aircraft</th>
            <th className="hidden xl:table-cell px-4 py-2.5 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>ATA</th>
            <th className="hidden md:table-cell px-4 py-2.5 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Mfg</th>
            <th className="hidden lg:table-cell px-4 py-2.5 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Warehouse & Avail</th>
            <th className="hidden sm:table-cell px-4 py-2.5 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Rsvd</th>
            <th className="hidden sm:table-cell px-4 py-2.5 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Min</th>
            <th className="hidden xl:table-cell px-4 py-2.5 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Supplier & Lead Time</th>
            <th className="hidden md:table-cell px-4 py-2.5 text-text-tertiary" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr
              key={part.id}
              className={`border-b border-border-subtle last:border-0 hover:bg-elevated/50 transition-colors cursor-pointer ${selectedPartId === part.id ? 'bg-transparent' : ''}`}
              onClick={() => setSelectedPartId(part.id)}
            >
              <td className="px-3 sm:px-4 py-3 font-mono text-[13px] text-text-primary hover:text-accent max-w-[90px] sm:max-w-none truncate">{part.partNumber}</td>
              <td className="px-3 sm:px-4 py-3 text-[13px] text-text-secondary max-w-[100px] sm:max-w-[150px] truncate">{part.name}</td>
              <td className="hidden lg:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.aircraftModel ?? '-'}</td>
              <td className="hidden xl:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.ataChapter ?? '-'}</td>
              <td className="hidden md:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.manufacturer ?? '-'}</td>
              <td className="hidden lg:table-cell px-4 py-3">
                <div className="text-[13px] text-text-primary">{(part as any).warehouseName ?? part.warehouseId ?? '-'}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">{part.availableQty} Available</div>
              </td>
              <td className="hidden sm:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.reservedQty}</td>
              <td className="hidden sm:table-cell px-4 py-3 text-[13px] text-text-tertiary">{part.minStock ?? '-'}</td>
              <td className="hidden xl:table-cell px-4 py-3">
                <div className="text-[13px] text-text-primary">{(part as any).supplierName ?? part.supplierId ?? '-'}</div>
                <div className="text-[11px] text-text-tertiary mt-0.5">{part.leadTimeDays ? `${part.leadTimeDays} days lead` : '-'}</div>
              </td>
              <td className="hidden md:table-cell px-4 py-3 align-top">
                <div className="flex flex-col items-start gap-1">
                  {getStatusBadge(part.availableQty, part.minStock, part.reservedQty)}
                  {part.minStock != null && part.availableQty < part.minStock && (
                    <div className="text-[10px] text-accent font-medium mt-0.5">Recommended Purchase: {part.minStock - part.availableQty + 10} Units</div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default InventoryTable;
