import { db } from '../../db/client';
import { parts, NewPart } from '../../db/schema';
import { eq, or, like } from 'drizzle-orm';

export const PartRepository = {
  async getAll({ search, offset = 0, limit = 20 }: { search?: string; offset?: number; limit?: number }) {
    const whereClause = search
      ? or(like(parts.partNumber, `%${search}%`), like(parts.name, `%${search}%`))
      : undefined;
    const query = whereClause
      ? db.select().from(parts).where(whereClause).offset(offset).limit(limit)
      : db.select().from(parts).offset(offset).limit(limit);
    return await query;
  },
  async getById(id: string) {
    const result = await db.select().from(parts).where(eq(parts.id, id)).limit(1);
    return result[0] ?? null;
  },
  async create(data: NewPart) {
    const [created] = await db.insert(parts).values(data).returning();
    return created;
  },
  async update(id: string, data: Partial<NewPart>) {
    const [updated] = await db.update(parts).set(data).where(eq(parts.id, id)).returning();
    return updated;
  },
};
