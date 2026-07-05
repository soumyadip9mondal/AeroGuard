import { createClerkClient } from '@clerk/backend';
import { db } from './src/db/client';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function syncUsers() {
  try {
    console.log('Fetching users from Clerk...');
    const userList = await clerk.users.getUserList({
      limit: 100,
    });
    
    console.log(`Found ${userList.data.length} users in Clerk. Syncing to DB...`);

    for (const clerkUser of userList.data) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      const role = clerkUser.publicMetadata?.role as string || 'MRO Engineer';
      const dbRole = role; // Just save 'MRO Engineer' / 'Fleet Manager' directly!

      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (existingUser.length === 0) {
        await db.insert(users).values({
          email,
          passwordHash: 'clerk_sso',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          role: dbRole as any,
        });
        console.log(`Inserted user: ${email}`);
      } else {
        await db.update(users).set({ role: dbRole as any }).where(eq(users.email, email));
        console.log(`Updated user: ${email}`);
      }
    }

    console.log('Sync complete!');
  } catch (error) {
    console.error('Error syncing users:', error);
  }
}

syncUsers();
