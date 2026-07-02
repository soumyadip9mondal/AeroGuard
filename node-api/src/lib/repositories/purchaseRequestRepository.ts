import { db } from '../../db/client';
import { purchaseRequests, NewPurchaseRequest } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const PurchaseRequestRepository = {
  async create(data: NewPurchaseRequest) {
    const [created] = await db.insert(purchaseRequests).values(data).returning();
    return created;
  },

  async getById(id: string) {
    const result = await db.select().from(purchaseRequests).where(eq(purchaseRequests.id, id)).limit(1);
    return result[0] ?? null;
  },

  async getByPartId(partId: string) {
    return await db.select().from(purchaseRequests).where(eq(purchaseRequests.partId, partId));
  },

  async updateStatus(id: string, status: string) {
    const [updated] = await db
      .update(purchaseRequests)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(purchaseRequests.id, id))
      .returning();
    return updated ?? null;
  },
};
