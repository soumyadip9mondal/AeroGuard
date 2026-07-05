import { db } from './src/db/client';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

async function addConstraints() {
  try {
    console.log('Adding new role check constraint...');
    await db.execute(sql`ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('Fleet Manager', 'MRO Engineer', 'Quality Inspector'))`);
    
    // Also Drizzle wanted to add a unique constraint on jobs.r2_object_key.
    console.log('Adding unique constraint to jobs...');
    await db.execute(sql`ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_r2_object_key_unique`);
    await db.execute(sql`ALTER TABLE jobs ADD CONSTRAINT jobs_r2_object_key_unique UNIQUE (r2_object_key)`);

    console.log('Constraints added.');
  } catch (e) {
    console.error('Error (might already exist):', e);
  }
}
addConstraints();
