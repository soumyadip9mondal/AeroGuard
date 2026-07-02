import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { InventoryService } from '../lib/services/inventoryService';
import { InventoryRepository } from '../lib/repositories/inventoryRepository';
import { WarehouseRepository } from '../lib/repositories/warehouseRepository';
import { SupplierRepository } from '../lib/repositories/supplierRepository';
import { ReservationRepository } from '../lib/repositories/reservationRepository';
import { PurchaseRequestRepository } from '../lib/repositories/purchaseRequestRepository';
import { TransactionRepository } from '../lib/repositories/transactionRepository';

const router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Validation Schemas ───────────────────────────────────────

const createPartSchema = z.object({
  partNumber: z.string().min(1, 'partNumber is required'),
  name: z.string().min(1, 'name is required'),
  aircraftModel: z.string().optional(),
  ataChapter: z.string().optional(),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  description: z.string().optional(),
  compatibleAircraft: z.array(z.string()).optional(),
  warehouseId: z.string().uuid().optional().nullable(),
  shelfLocation: z.string().optional(),
  availableQty: z.number().int().min(0).default(0),
  reservedQty: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).optional().nullable(),
  maxStock: z.number().int().min(0).optional().nullable(),
  unitCost: z.number().min(0).optional().nullable(),
  leadTimeDays: z.number().int().min(0).optional().nullable(),
  supplierId: z.string().uuid().optional().nullable(),
  barcode: z.string().optional(),
  qrCodeUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  lifecycleStatus: z.string().optional(),
});

const updatePartSchema = createPartSchema.partial();

const reservationSchema = z.object({
  partId: z.string().uuid('Invalid part ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  inspectionId: z.string().uuid().optional().nullable(),
});

const purchaseRequestSchema = z.object({
  partId: z.string().uuid('Invalid part ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  supplierId: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
});

const inventoryUpdateSchema = z.object({
  quantityChange: z.number().int(),
  type: z.enum(['inbound', 'outbound', 'adjustment']),
  notes: z.string().optional(),
});

// ─── Dashboard ────────────────────────────────────────────────

router.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const dashboard = await InventoryService.getInventoryDashboard();
    const lowStockItems = await InventoryService.getLowStockItems();
    return res.status(200).json({ ...dashboard, lowStockItems });
  } catch (error) {
    console.error('Error fetching inventory dashboard:', error);
    return res.status(500).json({ error: 'Failed to fetch inventory dashboard.' });
  }
});

// ─── Parts CRUD ───────────────────────────────────────────────

router.get('/parts', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(req.query.pageSize as string) || 20));
    const search = (req.query.search as string) || undefined;
    const warehouseId = (req.query.warehouseId as string) || undefined;
    const categoryId = (req.query.categoryId as string) || undefined;
    const supplierId = (req.query.supplierId as string) || undefined;
    const sortField = (req.query.sortField as string) || undefined;
    const sortOrder = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';
    const offset = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      InventoryRepository.getAll({ search, warehouseId, categoryId, supplierId, sortField, sortOrder, offset, limit: pageSize }),
      InventoryRepository.count({ search, warehouseId, categoryId, supplierId }),
    ]);

    return res.status(200).json({ data, total });
  } catch (error) {
    console.error('Error fetching parts:', error);
    return res.status(500).json({ error: 'Failed to fetch parts.' });
  }
});

router.get('/parts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid part ID format.' });
    }

    const part = await InventoryRepository.getById(id);
    if (!part) {
      return res.status(404).json({ error: 'Part not found.' });
    }

    return res.status(200).json(part);
  } catch (error) {
    console.error('Error fetching part:', error);
    return res.status(500).json({ error: 'Failed to fetch part.' });
  }
});

router.post('/parts', async (req: Request, res: Response) => {
  try {
    const parsed = createPartSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const createData = {
      ...parsed.data,
      unitCost: parsed.data.unitCost != null ? String(parsed.data.unitCost) : parsed.data.unitCost,
    };
    const part = await InventoryRepository.create(createData);
    return res.status(201).json(part);
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'A part with this part number already exists.' });
    }
    console.error('Error creating part:', error);
    return res.status(500).json({ error: 'Failed to create part.' });
  }
});

router.patch('/parts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid part ID format.' });
    }

    const parsed = updatePartSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const existing = await InventoryRepository.getById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Part not found.' });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.unitCost != null) {
      updateData.unitCost = String(updateData.unitCost);
    }

    const updated = await InventoryRepository.update(id, updateData);
    return res.status(200).json(updated);
  } catch (error: any) {
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'A part with this part number already exists.' });
    }
    console.error('Error updating part:', error);
    return res.status(500).json({ error: 'Failed to update part.' });
  }
});

router.delete('/parts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid part ID format.' });
    }

    const existing = await InventoryRepository.getById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Part not found.' });
    }

    await InventoryRepository.delete(id);
    return res.status(200).json({ message: 'Part deleted successfully.' });
  } catch (error) {
    console.error('Error deleting part:', error);
    return res.status(500).json({ error: 'Failed to delete part.' });
  }
});

// ─── Part History ─────────────────────────────────────────────

router.get('/parts/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid part ID format.' });
    }

    const existing = await InventoryRepository.getById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Part not found.' });
    }

    const history = await TransactionRepository.getByPartId(id);
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching part history:', error);
    return res.status(500).json({ error: 'Failed to fetch part history.' });
  }
});

// ─── Warehouses ───────────────────────────────────────────────

router.get('/warehouses', async (_req: Request, res: Response) => {
  try {
    const warehouses = await WarehouseRepository.getAll();
    return res.status(200).json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return res.status(500).json({ error: 'Failed to fetch warehouses.' });
  }
});

// ─── Categories ───────────────────────────────────────────────

router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const categoryStrings = await InventoryRepository.getDistinctCategories();
    const categories = categoryStrings.map((c) => ({ id: c, name: c }));
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// ─── Suppliers ────────────────────────────────────────────────

router.get('/suppliers', async (_req: Request, res: Response) => {
  try {
    const suppliersList = await SupplierRepository.getAll();
    return res.status(200).json(suppliersList);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return res.status(500).json({ error: 'Failed to fetch suppliers.' });
  }
});

router.get('/suppliers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid supplier ID format.' });
    }

    const supplier = await SupplierRepository.getById(id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found.' });
    }

    return res.status(200).json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    return res.status(500).json({ error: 'Failed to fetch supplier.' });
  }
});

// ─── Reservations ─────────────────────────────────────────────

router.post('/reservations', async (req: Request, res: Response) => {
  try {
    const parsed = reservationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const { partId, quantity, inspectionId } = parsed.data;
    const reservation = await InventoryService.reservePart(partId, quantity, inspectionId ?? undefined);
    return res.status(201).json(reservation);
  } catch (error: any) {
    const msg = error?.message || 'Failed to create reservation.';
    if (msg.includes('not found')) {
      return res.status(404).json({ error: msg });
    }
    if (msg.includes('Insufficient') || msg.includes('Quantity must')) {
      return res.status(409).json({ error: msg });
    }
    console.error('Error creating reservation:', error);
    return res.status(500).json({ error: 'Failed to create reservation.' });
  }
});

router.delete('/reservations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid reservation ID format.' });
    }

    const result = await InventoryService.releaseReservation(id);
    return res.status(200).json(result);
  } catch (error: any) {
    const msg = error?.message || 'Failed to release reservation.';
    if (msg.includes('not found')) {
      return res.status(404).json({ error: msg });
    }
    if (msg.includes('not active')) {
      return res.status(409).json({ error: msg });
    }
    console.error('Error releasing reservation:', error);
    return res.status(500).json({ error: 'Failed to release reservation.' });
  }
});

// ─── Purchase Requests ────────────────────────────────────────

router.post('/purchase-requests', async (req: Request, res: Response) => {
  try {
    const parsed = purchaseRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const { partId, quantity, supplierId, notes } = parsed.data;
    const pr = await InventoryService.createPurchaseRequest(partId, quantity, supplierId ?? undefined, notes);
    return res.status(201).json(pr);
  } catch (error: any) {
    const msg = error?.message || 'Failed to create purchase request.';
    if (msg.includes('not found')) {
      return res.status(404).json({ error: msg });
    }
    if (msg.includes('Quantity must')) {
      return res.status(400).json({ error: msg });
    }
    console.error('Error creating purchase request:', error);
    return res.status(500).json({ error: 'Failed to create purchase request.' });
  }
});

// ─── Inspection Lookup ────────────────────────────────────────

router.get('/lookup/:inspectionId', async (req: Request, res: Response) => {
  try {
    const { inspectionId } = req.params;
    if (!UUID_REGEX.test(inspectionId)) {
      return res.status(400).json({ error: 'Invalid inspection ID format.' });
    }

    const parts = await InventoryService.lookupPartByInspection(inspectionId);
    return res.status(200).json(parts);
  } catch (error) {
    console.error('Error looking up parts by inspection:', error);
    return res.status(500).json({ error: 'Failed to look up parts.' });
  }
});

// ─── Inventory Update ─────────────────────────────────────────

router.patch('/parts/:id/inventory', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({ error: 'Invalid part ID format.' });
    }

    const parsed = inventoryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const { quantityChange, type, notes } = parsed.data;
    const updated = await InventoryService.updateInventory(id, quantityChange, type, notes);
    return res.status(200).json(updated);
  } catch (error: any) {
    const msg = error?.message || 'Failed to update inventory.';
    if (msg.includes('not found')) {
      return res.status(404).json({ error: msg });
    }
    if (msg.includes('Insufficient')) {
      return res.status(409).json({ error: msg });
    }
    console.error('Error updating inventory:', error);
    return res.status(500).json({ error: 'Failed to update inventory.' });
  }
});

export default router;
