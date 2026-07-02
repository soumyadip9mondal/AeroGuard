import { db } from '../../db/client';
import { reservations as reservationsTable, Part } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { InventoryRepository } from '../repositories/inventoryRepository';
import { ReservationRepository } from '../repositories/reservationRepository';
import { PurchaseRequestRepository } from '../repositories/purchaseRequestRepository';
import { TransactionRepository } from '../repositories/transactionRepository';

export class InventoryService {
  static async checkStock(partId: string) {
    const part = await InventoryRepository.getById(partId);
    if (!part) return null;

    const totalReserved = await ReservationRepository.getTotalReserved(partId);
    const available = part.availableQty - totalReserved;

    return {
      partId: part.id,
      partNumber: part.partNumber,
      name: part.name,
      availableQty: part.availableQty,
      reservedQty: totalReserved,
      effectiveAvailable: available,
      minStock: part.minStock ?? null,
      isLowStock: part.minStock != null && available <= part.minStock,
    };
  }

  static async reservePart(partId: string, quantity: number, inspectionId?: string) {
    const part = await InventoryRepository.getById(partId);
    if (!part) throw new Error('Part not found');

    const totalReserved = await ReservationRepository.getTotalReserved(partId);
    const effectiveAvailable = part.availableQty - totalReserved;

    if (quantity <= 0) throw new Error('Quantity must be positive');
    if (effectiveAvailable < quantity) {
      throw new Error(`Insufficient stock. Available: ${effectiveAvailable}, requested: ${quantity}`);
    }

    const reservation = await ReservationRepository.create({
      partId,
      quantity,
      inspectionId: inspectionId ?? null,
      status: 'active',
    });

    await InventoryRepository.update(partId, {
      reservedQty: totalReserved + quantity,
    });

    await TransactionRepository.create({
      partId,
      type: 'reservation',
      quantity,
      referenceId: reservation.id,
      notes: `Reserved ${quantity} units for inspection ${inspectionId ?? 'N/A'}`,
    });

    return reservation;
  }

  static async releaseReservation(reservationId: string) {
    const reservation = await ReservationRepository.getById(reservationId);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'active') throw new Error('Reservation is not active');

    const updated = await ReservationRepository.cancel(reservationId);
    if (!updated) throw new Error('Failed to cancel reservation');

    const part = await InventoryRepository.getById(reservation.partId);
    if (part) {
      const newReserved = Math.max(0, part.reservedQty - reservation.quantity);
      await InventoryRepository.update(reservation.partId, { reservedQty: newReserved });
    }

    await TransactionRepository.create({
      partId: reservation.partId,
      type: 'release',
      quantity: reservation.quantity,
      referenceId: reservationId,
      notes: `Released reservation of ${reservation.quantity} units`,
    });

    return updated;
  }

  static async createPurchaseRequest(partId: string, quantity: number, supplierId?: string, notes?: string) {
    const part = await InventoryRepository.getById(partId);
    if (!part) throw new Error('Part not found');

    if (quantity <= 0) throw new Error('Quantity must be positive');

    let estimatedCost = null;
    if (part.unitCost && quantity) {
      estimatedCost = (Number(part.unitCost) * quantity).toString();
    }

    const pr = await PurchaseRequestRepository.create({
      partId,
      quantity,
      supplierId: supplierId ?? part.supplierId ?? null,
      estimatedCost,
      notes: notes ?? null,
      status: 'pending',
    });

    await TransactionRepository.create({
      partId,
      type: 'inbound',
      quantity,
      referenceId: pr.id,
      notes: `Purchase request created for ${quantity} units`,
    });

    return pr;
  }

  static async updateInventory(partId: string, quantityChange: number, type: 'inbound' | 'outbound' | 'adjustment', notes?: string) {
    const part = await InventoryRepository.getById(partId);
    if (!part) throw new Error('Part not found');

    const newQty = part.availableQty + quantityChange;
    if (newQty < 0) throw new Error(`Insufficient stock. Current: ${part.availableQty}, change: ${quantityChange}`);

    const updated = await InventoryRepository.update(partId, { availableQty: newQty });
    if (!updated) throw new Error('Failed to update inventory');

    await TransactionRepository.create({
      partId,
      type,
      quantity: Math.abs(quantityChange),
      notes: notes ?? `${type} of ${Math.abs(quantityChange)} units`,
    });

    return updated;
  }

  static async getInventoryDashboard() {
    return await InventoryRepository.getDashboardStats();
  }

  static async getLowStockItems() {
    return await InventoryRepository.getLowStockItems();
  }

  static async lookupPartByInspection(inspectionId: string) {
    const reservationList = await db
      .select()
      .from(reservationsTable)
      .where(eq(reservationsTable.inspectionId, inspectionId));

    if (reservationList.length === 0) return [];

    const partIds = [...new Set(reservationList.map((r) => r.partId))];
    const partsList: Part[] = [];
    for (const pid of partIds) {
      const part = await InventoryRepository.getById(pid);
      if (part) partsList.push(part);
    }

    return partsList;
  }
}
