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
  console.log('Seeding test data...\n');

  // Seed warehouses
  const wh1 = await client.query(`INSERT INTO warehouses (name, city, country) VALUES ('MRO Hangar A', 'Mumbai', 'India') RETURNING id`);
  const wh2 = await client.query(`INSERT INTO warehouses (name, city, country) VALUES ('MRO Hangar B', 'Delhi', 'India') RETURNING id`);
  const wh1Id = wh1.rows[0].id;
  const wh2Id = wh2.rows[0].id;
  console.log('Warehouses:', wh1Id, wh2Id);

  // Seed suppliers
  const s1 = await client.query(`INSERT INTO suppliers (name, contact_email, location, lead_time_days, rating) VALUES ('AeroParts Inc', 'sales@aeroparts.com', 'Chennai', 14, 4.5) RETURNING id`);
  const s2 = await client.query(`INSERT INTO suppliers (name, contact_email, location, lead_time_days, rating) VALUES ('SkySupply Co', 'orders@skysupply.com', 'Bangalore', 7, 4.2) RETURNING id`);
  const s1Id = s1.rows[0].id;
  const s2Id = s2.rows[0].id;
  console.log('Suppliers:', s1Id, s2Id);

  // Seed parts
  const p1 = await client.query(`INSERT INTO parts (part_number, name, aircraft_model, ata_chapter, category, manufacturer, description, warehouse_id, available_qty, reserved_qty, min_stock, max_stock, unit_cost, lead_time_days, supplier_id, lifecycle_status) VALUES ('AVN-001', 'Flight Computer Module', 'B737', '34', 'Avionics', 'Honeywell', 'Primary flight computer', '${wh1Id}', 25, 2, 5, 50, 12500.00, 21, '${s1Id}', 'active') RETURNING id`);
  const p2 = await client.query(`INSERT INTO parts (part_number, name, aircraft_model, ata_chapter, category, manufacturer, description, warehouse_id, available_qty, reserved_qty, min_stock, max_stock, unit_cost, lead_time_days, supplier_id, lifecycle_status) VALUES ('ENG-002', 'Turbine Blade Set', 'A320', '72', 'Engine', 'CFM International', 'High pressure turbine blades', '${wh2Id}', 3, 0, 5, 20, 45000.00, 45, '${s2Id}', 'active') RETURNING id`);
  const p3 = await client.query(`INSERT INTO parts (part_number, name, aircraft_model, ata_chapter, category, manufacturer, description, warehouse_id, available_qty, reserved_qty, min_stock, max_stock, unit_cost, lead_time_days, supplier_id, lifecycle_status) VALUES ('LND-003', 'Landing Gear Actuator', 'B777', '32', 'Landing Gear', 'Safran', 'Main gear extension actuator', '${wh1Id}', 8, 1, 3, 15, 8750.00, 30, '${s1Id}', 'active') RETURNING id`);
  const p4 = await client.query(`INSERT INTO parts (part_number, name, aircraft_model, ata_chapter, category, manufacturer, description, warehouse_id, available_qty, reserved_qty, min_stock, max_stock, unit_cost, lead_time_days, supplier_id, lifecycle_status) VALUES ('FLT-004', 'Oxygen Mask Assembly', 'A350', '35', 'Safety', 'Drager', 'Crew oxygen mask with regulator', '${wh2Id}', 40, 0, 10, 100, 320.00, 10, '${s2Id}', 'active') RETURNING id`);
  const p5 = await client.query(`INSERT INTO parts (part_number, name, aircraft_model, ata_chapter, category, manufacturer, description, warehouse_id, available_qty, reserved_qty, min_stock, max_stock, unit_cost, lead_time_days, supplier_id, lifecycle_status) VALUES ('ELC-005', 'Wire Harness Bundle', 'B787', '24', 'Electrical', 'TE Connectivity', 'Forward avionics wire harness', '${wh1Id}', 2, 0, 5, 30, 1800.00, 14, '${s1Id}', 'active') RETURNING id`);
  
  const partIds = [p1.rows[0].id, p2.rows[0].id, p3.rows[0].id, p4.rows[0].id, p5.rows[0].id];
  console.log('Parts:', partIds);

  console.log('\nSeeding complete!');
  await client.end();
}

main().catch((e) => {
  console.error('Seed error:', e.message);
  process.exit(1);
});
