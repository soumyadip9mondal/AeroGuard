import React from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { useQuery } from '@tanstack/react-query';
import { inventoryFetch } from '../lib/inventoryFetch';
import {
  Dialog,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  partId: string;
  type: string;
  quantity: number;
  referenceId: string | null;
  notes: string | null;
  createdAt: string;
}

const typeColor = (type: string) => {
  if (type === 'inbound') return 'text-success';
  if (type === 'outbound') return 'text-danger';
  if (type === 'reservation') return 'text-warning';
  if (type === 'release') return 'text-info';
  return 'text-text-tertiary';
};

const PartHistoryModal: React.FC = () => {
  const { selectedPartId, modalState, setModalState } = useInventoryStore();
  const open = modalState.partHistory && !!selectedPartId;

  const { data: history, isLoading } = useQuery<Transaction[]>({
    queryKey: ['partHistory', selectedPartId],
    queryFn: async () => {
      const res = await inventoryFetch(`/api/v1/inventory/parts/${selectedPartId}/history`);
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    },
    enabled: open && !!selectedPartId,
  });

  return (
    <Dialog open={open} onOpenChange={(v) => setModalState({ partHistory: v })}>
      <DialogPopup>
        <div className="flex items-center justify-between">
          <DialogTitle>Part History</DialogTitle>
          <DialogClose render={<Button variant="ghost" size="sm" />} />
        </div>
        <DialogDescription>Transaction history for this part.</DialogDescription>
        {isLoading ? (
          <div className="py-8 text-center text-[13px] text-text-tertiary">Loading history...</div>
        ) : !history || history.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-text-tertiary">No transactions recorded.</div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-2">
            {history.map((tx) => (
              <div key={tx.id} className="rounded-md border border-border-subtle p-3 text-[13px]">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium uppercase text-[11px] ${typeColor(tx.type)}`}>{tx.type}</span>
                  <span className="text-text-tertiary text-[11px]">{new Date(tx.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span><span className="text-text-tertiary">Qty:</span> <span className="text-text-primary">{tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity}</span></span>
                  {tx.referenceId && <span><span className="text-text-tertiary">Ref:</span> <span className="font-mono text-text-primary text-[11px]">{tx.referenceId.slice(0, 8)}...</span></span>}
                </div>
                {tx.notes && <div className="mt-1 text-text-secondary text-[12px]">{tx.notes}</div>}
              </div>
            ))}
          </div>
        )}
      </DialogPopup>
    </Dialog>
  );
};

export default PartHistoryModal;
