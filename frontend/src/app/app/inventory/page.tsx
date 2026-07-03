'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/ui.store';
import { CheckCircle2, AlertTriangle, XCircle, Star } from 'lucide-react';
import InventoryToolbar from '@/features/inventory/components/InventoryToolbar';
import InventoryTable from '@/features/inventory/components/InventoryTable';
import ViewPartModal from '@/features/inventory/components/ViewPartModal';
import ReservePartModal from '@/features/inventory/components/ReservePartModal';
import PartHistoryModal from '@/features/inventory/components/PartHistoryModal';
import { useInventoryDashboard } from '@/features/inventory/hooks/useInventoryDashboard';
import { useInventoryStore } from '@/features/inventory/store/inventoryStore';

const statusBadge = (s: string) => {
  if (s === 'in_stock') return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success"><CheckCircle2 className="h-3 w-3" />In Stock</span>;
  if (s === 'low_stock') return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-warning"><AlertTriangle className="h-3 w-3" />Low Stock</span>;
  return <span className="inline-flex items-center gap-1 text-[11px] font-medium text-danger"><XCircle className="h-3 w-3" />Out of Stock</span>;
};

export default function InventoryPage() {
  const [tab, setTab] = useState<'inventory' | 'orders' | 'suppliers'>('inventory');
  const setPageTitle = useUIStore((s) => s.setPageTitle);
  const { currentPage, pageSize } = useInventoryStore();
  useEffect(() => { setPageTitle('Inventory & Procurement'); }, [setPageTitle]);

  const { data: dashboard, isLoading: dashboardLoading } = useInventoryDashboard();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [supplierLoading, setSupplierLoading] = useState(false);

  useEffect(() => {
    if (tab === 'suppliers') {
      setSupplierLoading(true);
      fetch('/api/v1/inventory/suppliers')
        .then((r) => r.json())
        .then((data) => { setSuppliers(Array.isArray(data) ? data : []); setSupplierLoading(false); })
        .catch(() => setSupplierLoading(false));
    }
  }, [tab]);

  const lowStockItems = dashboard?.lowStockItems ?? [];

  return (
    <div>
      <div className="page-enter px-3 py-4 md:p-6 space-y-5 content-max">
        {/* Tabs */}
        <div className="flex items-center justify-between border-b border-border-subtle">
          <div className="flex gap-1 overflow-x-auto custom-scrollbar">
            {([['inventory', 'Inventory'], ['orders', 'Low Stock & Orders'], ['suppliers', 'Suppliers']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors whitespace-nowrap ${tab === key ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="hidden sm:block text-[11px] text-text-tertiary font-medium pr-2 pb-1 self-end">
            Last Updated: Just now
          </div>
        </div>

        {tab === 'inventory' && (
          <>
            {/* Dashboard Stats */}
            {dashboard && !dashboardLoading && (
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider">Total Parts</div>
                    <div className="text-[20px] font-semibold text-text-primary mt-1">{dashboard.totalParts}</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider">Available Parts</div>
                    <div className="text-[20px] font-semibold text-success mt-1">{dashboard.totalParts ? dashboard.totalParts - 15 : 0}</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider">Low Stock</div>
                    <div className="text-[20px] font-semibold text-warning mt-1">{dashboard.lowStockCount}</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider">Out of Stock</div>
                    <div className="text-[20px] font-semibold text-danger mt-1">3</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider">Reserved Parts</div>
                    <div className="text-[20px] font-semibold text-accent mt-1">12</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface p-3">
                    <div className="text-[11px] text-text-tertiary uppercase tracking-wider">Active Suppliers</div>
                    <div className="text-[20px] font-semibold text-text-primary mt-1">8</div>
                  </div>
                </div>
                
                {/* Inventory Statistics Progress Bars */}
                <div className="flex flex-col gap-2 mb-1">
                  <div className="text-[12px] font-medium text-text-secondary">Inventory Statistics</div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-[11px] font-medium">
                    <div className="flex flex-col gap-1 flex-1 w-full">
                      <div className="flex justify-between text-text-tertiary"><span>Parts Available</span><span>85%</span></div>
                      <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden"><div className="h-full bg-success" style={{ width: '85%' }}></div></div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 w-full">
                      <div className="flex justify-between text-text-tertiary"><span>Reserved</span><span>12%</span></div>
                      <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden"><div className="h-full bg-accent" style={{ width: '12%' }}></div></div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 w-full">
                      <div className="flex justify-between text-text-tertiary"><span>Out of Stock</span><span>3%</span></div>
                      <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden"><div className="h-full bg-danger" style={{ width: '3%' }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <div className="rounded-lg border border-warning/30 bg-warning-subtle p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left justify-center sm:justify-start">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <div className="text-[13px] font-medium text-text-primary">
                  ⚠ {lowStockItems.length} Critical Aircraft Parts are running below minimum stock.
                </div>
              </div>
            )}

            {/* AI Recommended Parts */}
            <div className="rounded-lg border border-accent/30 bg-accent-subtle/20 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-accent fill-current" />
                <span className="text-[13px] font-semibold text-text-primary tracking-wide">Recommended Parts for Current Inspection</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium">Detected Defects</div>
                  <ul className="text-[13px] text-text-secondary list-disc pl-4 marker:text-text-tertiary space-y-0.5">
                    <li>Crack</li>
                    <li>Corrosion</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <div className="text-[11px] text-text-tertiary uppercase tracking-wider font-medium">Recommended Parts</div>
                  <ul className="text-[13px] text-text-secondary list-disc pl-4 marker:text-accent space-y-0.5">
                    <li>Turbine Blade</li>
                    <li>Flight Computer Module</li>
                    <li>Hydraulic Seal Kit</li>
                  </ul>
                </div>
              </div>
            </div>

            <InventoryToolbar />
            <InventoryTable />
            <ViewPartModal />
            <ReservePartModal />
            <PartHistoryModal />
          </>
        )}

        {tab === 'orders' && (
          <div className="space-y-3">
            {dashboardLoading ? (
              <div className="text-[13px] text-text-tertiary py-8 text-center">Loading...</div>
            ) : lowStockItems.length === 0 ? (
              <div className="text-[13px] text-text-tertiary py-8 text-center">No low stock items detected.</div>
            ) : (
              lowStockItems.map((part: any) => (
                <div key={part.id} className="rounded-lg border border-border-subtle bg-surface p-4 sm:p-5 hover:border-border-default transition-colors shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                    <div>
                      <span className="font-mono text-[14px] font-medium text-text-primary">{part.partNumber}</span>
                      <span className="ml-2 sm:ml-3 inline-block sm:inline rounded-full px-2 py-0.5 text-[10px] font-medium uppercase bg-danger-subtle text-danger">low stock</span>
                    </div>
                  </div>
                  <div className="grid gap-x-6 gap-y-1 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
                    <div><span className="text-text-tertiary">Part:</span> <span className="text-text-primary">{part.name}</span></div>
                    <div><span className="text-text-tertiary">Available:</span> <span className="text-text-primary">{part.availableQty} units</span></div>
                    <div><span className="text-text-tertiary">Min Stock:</span> <span className="text-text-primary">{part.minStock} units</span></div>
                    <div><span className="text-text-tertiary">Manufacturer:</span> <span className="text-text-primary">{part.manufacturer ?? '-'}</span></div>
                    <div><span className="text-text-tertiary">Unit Cost:</span> <span className="text-text-primary">${Number(part.unitCost ?? 0).toLocaleString()}</span></div>
                    <div><span className="text-text-tertiary">Lead Time:</span> <span className="text-text-primary">{part.leadTimeDays ?? '-'} days</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'suppliers' && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {supplierLoading ? (
              <div className="text-[13px] text-text-tertiary py-8 text-center col-span-full">Loading suppliers...</div>
            ) : suppliers.length === 0 ? (
              <div className="text-[13px] text-text-tertiary py-8 text-center col-span-full">No suppliers found.</div>
            ) : (
              suppliers.map((s: any) => (
                <div key={s.id} className="rounded-lg border border-border-subtle bg-surface p-4 sm:p-5 hover:border-border-default transition-colors shadow-sm">
                  <div className="text-[15px] font-medium text-text-primary mb-1">{s.name}</div>
                  <div className="text-[12px] text-text-tertiary mb-3">{s.location ?? 'No location'}</div>
                  <div className="space-y-1.5 text-[13px]">
                    <div className="flex justify-between"><span className="text-text-tertiary">Lead Time</span><span className="text-text-primary">{s.leadTimeDays ?? '-'} days</span></div>
                    <div className="flex justify-between"><span className="text-text-tertiary">Rating</span><span className="flex items-center gap-1 text-warning"><Star className="h-3 w-3 fill-current" />{s.rating ?? '-'}</span></div>
                    <div className="flex justify-between"><span className="text-text-tertiary">Contact</span><span className="text-accent text-[12px]">{s.contactEmail ?? '-'}</span></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
