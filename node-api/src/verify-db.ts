import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('=== DATABASE VERIFICATION ===\n');

  const res = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.log('TABLES:');
  res.rows.forEach((r: any) => console.log('  ' + r.table_name));

  const expectedTables = ['inventory_transactions', 'jobs', 'metrics', 'parts', 'purchase_requests', 'reservations', 'suppliers', 'warehouses'];
  const foundTables = res.rows.map((r: any) => r.table_name);
  const missing = expectedTables.filter(t => !foundTables.includes(t));
  if (missing.length > 0) {
    console.log('  MISSING TABLES:', missing.join(', '));
  } else {
    console.log('  All expected tables present.');
  }

  const idx = await client.query(
    "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname"
  );
  console.log('\nINDEXES:');
  idx.rows.forEach((r: any) => console.log('  ' + r.indexname));

  const fks = await client.query(
    `SELECT tc.table_name, kcu.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_col
     FROM information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
     JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
     WHERE tc.constraint_type = 'FOREIGN KEY' ORDER BY tc.table_name`
  );
  console.log('\nFOREIGN KEYS:');
  fks.rows.forEach((r: any) => console.log('  ' + r.table_name + '.' + r.column_name + ' -> ' + r.ref_table + '.' + r.ref_col));

  await client.end();
  console.log('\n=== VERIFICATION COMPLETE ===');
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
