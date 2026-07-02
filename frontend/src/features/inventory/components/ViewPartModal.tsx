import React from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { usePart } from '../hooks/usePart';
import {
  Dialog,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ViewPartModal: React.FC = () => {
  const { selectedPartId, modalState, setModalState } = useInventoryStore();
  const { data: part, isLoading } = usePart(selectedPartId ?? '');

  const open = modalState.viewPart && !!selectedPartId;

  return (
    <Dialog open={open} onOpenChange={(v) => setModalState({ viewPart: v })}>
      <DialogPopup>
        <div className="flex items-center justify-between">
          <DialogTitle>Part Details</DialogTitle>
          <DialogClose render={<Button variant="ghost" size="sm" />} />
        </div>
        {isLoading ? (
          <div className="py-8 text-center text-[13px] text-text-tertiary">Loading...</div>
        ) : !part ? (
          <div className="py-8 text-center text-[13px] text-text-tertiary">Part not found.</div>
        ) : (
          <div className="space-y-3 text-[13px]">
            <DialogDescription>Details for {part.partNumber}</DialogDescription>
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              <div><span className="text-text-tertiary">Part Number:</span> <span className="font-mono text-text-primary">{part.partNumber}</span></div>
              <div><span className="text-text-tertiary">Name:</span> <span className="text-text-primary">{part.name}</span></div>
              <div><span className="text-text-tertiary">Aircraft Model:</span> <span className="text-text-primary">{part.aircraftModel ?? '-'}</span></div>
              <div><span className="text-text-tertiary">ATA Chapter:</span> <span className="text-text-primary">{part.ataChapter ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Category:</span> <span className="text-text-primary">{part.category ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Manufacturer:</span> <span className="text-text-primary">{part.manufacturer ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Serial Number:</span> <span className="text-text-primary">{part.serialNumber ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Description:</span> <span className="text-text-primary">{part.description ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Warehouse:</span> <span className="text-text-primary">{(part as any).warehouseName ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Shelf Location:</span> <span className="text-text-primary">{part.shelfLocation ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Available Qty:</span> <span className="text-text-primary font-medium">{part.availableQty}</span></div>
              <div><span className="text-text-tertiary">Reserved Qty:</span> <span className="text-text-primary">{part.reservedQty}</span></div>
              <div><span className="text-text-tertiary">Min Stock:</span> <span className="text-text-primary">{part.minStock ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Max Stock:</span> <span className="text-text-primary">{part.maxStock ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Unit Cost:</span> <span className="text-text-primary">${Number(part.unitCost ?? 0).toLocaleString()}</span></div>
              <div><span className="text-text-tertiary">Lead Time:</span> <span className="text-text-primary">{part.leadTimeDays ?? '-'} days</span></div>
              <div><span className="text-text-tertiary">Supplier:</span> <span className="text-text-primary">{(part as any).supplierName ?? '-'}</span></div>
              <div><span className="text-text-tertiary">Lifecycle Status:</span> <span className="text-text-primary">{part.lifecycleStatus ?? '-'}</span></div>
            </div>
          </div>
        )}
      </DialogPopup>
    </Dialog>
  );
};

export default ViewPartModal;
