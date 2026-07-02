import { db } from '../../db/client';
import { suppliers, NewSupplier } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const SupplierRepository = {
  async getAll() {
    return await db.select().from(suppliers);
  },

  async getById(id: string) {
    const result = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    return result[0] ?? null;
  },

  async create(data: NewSupplier) {
    const [created] = await db.insert(suppliers).values(data).returning();
    return created;
  },

  async update(id: string, data: Partial<NewSupplier>) {
    const [updated] = await db
      .update(suppliers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();
    return updated;
  },

  async delete(id: string) {
    const [deleted] = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();
    return deleted ?? null;
  },
};
