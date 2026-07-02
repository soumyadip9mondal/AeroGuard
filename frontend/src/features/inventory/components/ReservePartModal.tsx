import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';

const ReservePartModal: React.FC = () => {
  const { selectedPartId, modalState, setModalState } = useInventoryStore();
  const { data: part } = usePart(selectedPartId ?? '');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const open = modalState.reservePart && !!selectedPartId;

  const handleOpenChange = (v: boolean) => {
    setModalState({ reservePart: v });
    if (!v) {
      setQuantity(1);
      setError('');
      setSuccess(false);
    }
  };

  const handleReserve = async () => {
    if (!selectedPartId || !part) return;
    if (quantity < 1) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (quantity > part.availableQty) {
      setError(`Only ${part.availableQty} units available.`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/v1/inventory/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partId: selectedPartId, quantity }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create reservation.');
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create reservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogPopup>
        <div className="flex items-center justify-between">
          <DialogTitle>Reserve Part</DialogTitle>
          <DialogClose render={<Button variant="ghost" size="sm" />} />
        </div>
        {!part ? (
          <div className="py-4 text-[13px] text-text-tertiary">Loading part details...</div>
        ) : success ? (
          <div className="space-y-3">
            <DialogDescription>Reservation created successfully.</DialogDescription>
            <div className="rounded-md bg-success-subtle p-3 text-[13px] text-success">
              Reserved {quantity} unit{quantity > 1 ? 's' : ''} of {part.partNumber}.
            </div>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <DialogDescription>
              Reserve units of {part.partNumber} ({part.name}).
            </DialogDescription>
            <div className="text-[13px]">
              <span className="text-text-tertiary">Available: </span>
              <span className="text-text-primary font-medium">{part.availableQty}</span>
            </div>
            <div>
              <label className="text-[12px] text-text-tertiary mb-1 block">Quantity</label>
              <Input
                type="number"
                min={1}
                max={part.availableQty}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full"
              />
            </div>
            {error && (
              <div className="rounded-md bg-danger-subtle p-2 text-[12px] text-danger">{error}</div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button onClick={handleReserve} disabled={loading}>
                {loading ? 'Reserving...' : 'Reserve'}
              </Button>
            </div>
          </div>
        )}
      </DialogPopup>
    </Dialog>
  );
};

export default ReservePartModal;
