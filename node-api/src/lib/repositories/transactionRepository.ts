import { db } from '../../db/client';
import { inventoryTransactions, NewInventoryTransaction } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const TransactionRepository = {
  async create(data: NewInventoryTransaction) {
    const [created] = await db.insert(inventoryTransactions).values(data).returning();
    return created;
  },

  async getByPartId(partId: string) {
    return await db
      .select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.partId, partId))
      .orderBy(inventoryTransactions.createdAt);
  },
};
