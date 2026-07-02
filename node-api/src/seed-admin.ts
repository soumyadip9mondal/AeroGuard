import crypto from 'crypto';
import { db } from './db/client';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedAdminUser() {
  const email = 'admin@aeroguard.com';
  const password = 'admin123';
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (existing.length > 0) {
    console.log(`Admin user ${email} already exists. Skipping.`);
    return;
  }

  await db.insert(users).values({
    email,
    passwordHash: hashPassword(password),
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  });

  console.log(`Seeded admin user: ${email} / ${password}`);
}

seedAdminUser()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to seed admin user:', err);
    process.exit(1);
  });
