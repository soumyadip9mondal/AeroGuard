import { db } from '../../db/client';
import { reservations, parts, NewReservation } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const ReservationRepository = {
  async create(data: NewReservation) {
    const [created] = await db.insert(reservations).values(data).returning();
    return created;
  },

  async getById(id: string) {
    const result = await db.select().from(reservations).where(eq(reservations.id, id)).limit(1);
    return result[0] ?? null;
  },

  async cancel(id: string) {
    const [cancelled] = await db
      .update(reservations)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(reservations.id, id))
      .returning();
    return cancelled ?? null;
  },

  async fulfill(id: string) {
    const [fulfilled] = await db
      .update(reservations)
      .set({ status: 'fulfilled', updatedAt: new Date() })
      .where(eq(reservations.id, id))
      .returning();
    return fulfilled ?? null;
  },

  async getActiveByPartId(partId: string) {
    return await db
      .select()
      .from(reservations)
      .where(and(eq(reservations.partId, partId), eq(reservations.status, 'active')));
  },

  async getTotalReserved(partId: string) {
    const result = await db
      .select({ total: sql<number>`COALESCE(SUM(${reservations.quantity}), 0)::int` })
      .from(reservations)
      .where(and(eq(reservations.partId, partId), eq(reservations.status, 'active')));
    return result[0]?.total ?? 0;
  },
};
