import { db } from '../../db/client';
import { warehouses, NewWarehouse } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const WarehouseRepository = {
  async getAll() {
    return await db.select().from(warehouses);
  },

  async getById(id: string) {
    const result = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
    return result[0] ?? null;
  },

  async create(data: NewWarehouse) {
    const [created] = await db.insert(warehouses).values(data).returning();
    return created;
  },

  async update(id: string, data: Partial<NewWarehouse>) {
    const [updated] = await db
      .update(warehouses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(warehouses.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(warehouses).where(eq(warehouses.id, id)).returning();
    return deleted ?? null;
  },
};
