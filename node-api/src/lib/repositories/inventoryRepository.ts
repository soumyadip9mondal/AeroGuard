import { db } from '../../db/client';
import { parts, warehouses, suppliers, NewPart } from '../../db/schema';
import { eq, and, sql, SQL, asc, desc } from 'drizzle-orm';

interface GetAllParams {
  search?: string;
  warehouseId?: string;
  categoryId?: string;
  supplierId?: string;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}

export const InventoryRepository = {
  async getAll({ search, warehouseId, categoryId, supplierId, sortField, sortOrder, offset = 0, limit = 20 }: GetAllParams) {
    const conditions: SQL[] = [];

    if (search) {
      conditions.push(
        sql`(${parts.partNumber} ILIKE ${'%' + search + '%'} OR ${parts.name} ILIKE ${'%' + search + '%'} OR ${parts.description} ILIKE ${'%' + search + '%'})`
      );
    }
    if (warehouseId) {
      conditions.push(eq(parts.warehouseId, warehouseId));
    }
    if (categoryId) {
      conditions.push(eq(parts.category, categoryId));
    }
    if (supplierId) {
      conditions.push(eq(parts.supplierId, supplierId));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Build sort order
    let orderClause: SQL;
    const direction = sortOrder === 'desc' ? desc : asc;
    switch (sortField) {
      case 'partNumber':
        orderClause = direction(parts.partNumber);
        break;
      case 'availableQty':
        orderClause = direction(parts.availableQty);
        break;
      case 'createdAt':
        orderClause = direction(parts.createdAt);
        break;
      default:
        orderClause = asc(parts.name);
    }

    // Query with LEFT JOINs to get warehouse and supplier names
    const baseQuery = db
      .select({
        id: parts.id,
        partNumber: parts.partNumber,
        name: parts.name,
        aircraftModel: parts.aircraftModel,
        ataChapter: parts.ataChapter,
        category: parts.category,
        manufacturer: parts.manufacturer,
        serialNumber: parts.serialNumber,
        description: parts.description,
        compatibleAircraft: parts.compatibleAircraft,
        warehouseId: parts.warehouseId,
        warehouseName: warehouses.name,
        shelfLocation: parts.shelfLocation,
        availableQty: parts.availableQty,
        reservedQty: parts.reservedQty,
        minStock: parts.minStock,
        maxStock: parts.maxStock,
        unitCost: parts.unitCost,
        leadTimeDays: parts.leadTimeDays,
        supplierId: parts.supplierId,
        supplierName: suppliers.name,
        barcode: parts.barcode,
        qrCodeUrl: parts.qrCodeUrl,
        imageUrl: parts.imageUrl,
        lifecycleStatus: parts.lifecycleStatus,
        createdAt: parts.createdAt,
        updatedAt: parts.updatedAt,
        createdBy: parts.createdBy,
        updatedBy: parts.updatedBy,
      })
      .from(parts)
      .leftJoin(warehouses, eq(parts.warehouseId, warehouses.id))
      .leftJoin(suppliers, eq(parts.supplierId, suppliers.id));

    const query = where
      ? baseQuery.where(where).orderBy(orderClause).offset(offset).limit(limit)
      : baseQuery.orderBy(orderClause).offset(offset).limit(limit);

    return await query;
  },

  async count({ search, warehouseId, categoryId, supplierId }: Omit<GetAllParams, 'sortField' | 'sortOrder' | 'offset' | 'limit'>) {
    const conditions: SQL[] = [];

    if (search) {
      conditions.push(
        sql`(${parts.partNumber} ILIKE ${'%' + search + '%'} OR ${parts.name} ILIKE ${'%' + search + '%'} OR ${parts.description} ILIKE ${'%' + search + '%'})`
      );
    }
    if (warehouseId) {
      conditions.push(eq(parts.warehouseId, warehouseId));
    }
    if (categoryId) {
      conditions.push(eq(parts.category, categoryId));
    }
    if (supplierId) {
      conditions.push(eq(parts.supplierId, supplierId));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const result = where
      ? await db.select({ count: sql<number>`count(*)::int` }).from(parts).where(where)
      : await db.select({ count: sql<number>`count(*)::int` }).from(parts);

    return result[0]?.count ?? 0;
  },

  async getById(id: string) {
    const result = await db
      .select({
        id: parts.id,
        partNumber: parts.partNumber,
        name: parts.name,
        aircraftModel: parts.aircraftModel,
        ataChapter: parts.ataChapter,
        category: parts.category,
        manufacturer: parts.manufacturer,
        serialNumber: parts.serialNumber,
        description: parts.description,
        compatibleAircraft: parts.compatibleAircraft,
        warehouseId: parts.warehouseId,
        warehouseName: warehouses.name,
        shelfLocation: parts.shelfLocation,
        availableQty: parts.availableQty,
        reservedQty: parts.reservedQty,
        minStock: parts.minStock,
        maxStock: parts.maxStock,
        unitCost: parts.unitCost,
        leadTimeDays: parts.leadTimeDays,
        supplierId: parts.supplierId,
        supplierName: suppliers.name,
        barcode: parts.barcode,
        qrCodeUrl: parts.qrCodeUrl,
        imageUrl: parts.imageUrl,
        lifecycleStatus: parts.lifecycleStatus,
        createdAt: parts.createdAt,
        updatedAt: parts.updatedAt,
        createdBy: parts.createdBy,
        updatedBy: parts.updatedBy,
      })
      .from(parts)
      .leftJoin(warehouses, eq(parts.warehouseId, warehouses.id))
      .leftJoin(suppliers, eq(parts.supplierId, suppliers.id))
      .where(eq(parts.id, id))
      .limit(1);
    return result[0] ?? null;
  },

  async create(data: NewPart) {
    const [created] = await db.insert(parts).values(data).returning();
    return created;
  },

  async update(id: string, data: Partial<NewPart>) {
    const [updated] = await db
      .update(parts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(parts.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(parts).where(eq(parts.id, id)).returning();
    return deleted ?? null;
  },

  async getDistinctCategories() {
    const result = await db
      .selectDistinct({ category: parts.category })
      .from(parts)
      .where(sql`${parts.category} IS NOT NULL`);
    return result.map((r) => r.category).filter(Boolean) as string[];
  },

  async getWarehouseOptions() {
    return await db.select({ id: warehouses.id, name: warehouses.name }).from(warehouses);
  },

  async getSupplierOptions() {
    return await db.select({ id: suppliers.id, name: suppliers.name }).from(suppliers);
  },

  async getLowStockItems() {
    return await db
      .select()
      .from(parts)
      .where(
        and(
          sql`${parts.minStock} IS NOT NULL`,
          sql`${parts.availableQty} <= ${parts.minStock}`
        )
      );
  },

  async getDashboardStats() {
    const totalParts = await db.select({ count: sql<number>`count(*)::int` }).from(parts);
    const lowStockParts = await this.getLowStockItems();
    const warehouseCount = await db.select({ count: sql<number>`count(*)::int` }).from(warehouses);

    const totalValue = await db
      .select({
        total: sql<string>`COALESCE(SUM(${parts.unitCost} * ${parts.availableQty}), 0)::text`,
      })
      .from(parts);

    const categoryCounts = await db
      .select({
        category: parts.category,
        count: sql<number>`count(*)::int`,
      })
      .from(parts)
      .where(sql`${parts.category} IS NOT NULL`)
      .groupBy(parts.category);

    return {
      totalParts: totalParts[0]?.count ?? 0,
      lowStockCount: lowStockParts.length,
      warehouseCount: warehouseCount[0]?.count ?? 0,
      totalValue: totalValue[0]?.total ?? '0',
      categoryCounts: categoryCounts.map((c) => ({ category: c.category!, count: c.count })),
    };
  },
};
