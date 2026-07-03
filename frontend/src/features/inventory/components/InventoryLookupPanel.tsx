import React, { useState } from 'react';
import { useInventoryLookup } from '../hooks/useInventoryLookup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Package, ShoppingCart } from 'lucide-react';
import { inventoryFetch } from '../lib/inventoryFetch';

interface InventoryLookupPanelProps {
  inspectionId: string;
}

const InventoryLookupPanel: React.FC<InventoryLookupPanelProps> = ({ inspectionId }) => {
  const { data: parts, isLoading } = useInventoryLookup(inspectionId);
  const [reservingId, setReservingId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [reserveStatus, setReserveStatus] = useState<Record<string, { ok: boolean; msg: string }>>({});

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface p-4">
        <div className="flex items-center gap-2 text-[13px] text-text-tertiary">
          <Package className="h-4 w-4 animate-pulse" />
          Looking up inventory...
        </div>
      </div>
    );
  }

  if (!parts || parts.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-surface p-4">
        <div className="flex items-center gap-2 text-[13px] text-text-tertiary">
          <Package className="h-4 w-4" />
          No parts reserved for this inspection.
        </div>
      </div>
    );
  }

  const handleReserve = async (partId: string) => {
    const qty = quantities[partId] || 1;
    setReservingId(partId);
    setReserveStatus((prev) => ({ ...prev, [partId]: { ok: false, msg: '' } }));
    try {
      const res = await inventoryFetch('/api/v1/inventory/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partId, quantity: qty, inspectionId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Reservation failed');
      }
      setReserveStatus((prev) => ({ ...prev, [partId]: { ok: true, msg: 'Reserved' } }));
    } catch (err: any) {
      setReserveStatus((prev) => ({ ...prev, [partId]: { ok: false, msg: err.message } }));
    } finally {
      setReservingId(null);
    }
  };

  const handleCreatePR = async (partId: string) => {
    setReservingId(partId);
    setReserveStatus((prev) => ({ ...prev, [partId]: { ok: false, msg: '' } }));
    try {
      const res = await inventoryFetch('/api/v1/inventory/purchase-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partId, quantity: quantities[partId] || 1, notes: `Auto-created for inspection ${inspectionId.slice(0, 8)}` }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Purchase request failed');
      }
      setReserveStatus((prev) => ({ ...prev, [partId]: { ok: true, msg: 'Purchase request created' } }));
    } catch (err: any) {
      setReserveStatus((prev) => ({ ...prev, [partId]: { ok: false, msg: err.message } }));
    } finally {
      setReservingId(null);
    }
  };

  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4 space-y-3">
      <div className="flex items-center gap-2 text-[13px] font-medium text-text-primary">
        <Package className="h-4 w-4" />
        Inventory — {parts.length} part{parts.length > 1 ? 's' : ''} reserved
      </div>
      <div className="space-y-2">
        {parts.map((part) => {
          const available = part.availableQty;
          const canReserve = available > 0;
          const status = reserveStatus[part.id];
          return (
            <div key={part.id} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-md border border-border-subtle p-3 text-[13px]">
              <div className="flex-1 min-w-0">
                <div className="font-mono font-medium text-text-primary">{part.partNumber}</div>
                <div className="text-text-secondary truncate">{part.name}</div>
                <div className="flex gap-4 mt-1 text-text-tertiary text-[12px]">
                  <span>Available: <span className={canReserve ? 'text-success' : 'text-danger'}>{available}</span></span>
                  <span>Reserved: {part.reservedQty}</span>
                  {(part as any).warehouseName && <span>Warehouse: {(part as any).warehouseName}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Input
                  type="number"
                  min={1}
                  value={quantities[part.id] || 1}
                  onChange={(e) => setQuantities((prev) => ({ ...prev, [part.id]: parseInt(e.target.value) || 1 }))}
                  className="w-16 h-7 text-[12px]"
                />
                {canReserve ? (
                  <Button size="sm" disabled={reservingId === part.id} onClick={() => handleReserve(part.id)}>
                    Reserve
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" disabled={reservingId === part.id} onClick={() => handleCreatePR(part.id)}>
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Order
                  </Button>
                )}
              </div>
              {status && (
                <div className={`text-[12px] ${status.ok ? 'text-success' : 'text-danger'}`}>
                  {status.msg}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryLookupPanel;
