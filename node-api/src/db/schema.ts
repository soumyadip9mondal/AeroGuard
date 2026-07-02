import { pgTable, uuid, text, bigint, timestamp, integer, real, jsonb, json, numeric, uniqueIndex } from 'drizzle-orm/pg-core';

// Jobs Table Definition
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  r2ObjectKey: text('r2_object_key').unique().notNull(),
  originalFilename: text('original_filename'),
  fileSizeBytes: bigint('file_size_bytes', { mode: 'number' }),
  status: text('status', {
    enum: ['pending', 'uploaded', 'queued', 'processing', 'completed', 'failed', 'rejected', 'purged']
  }).notNull(),
  errorMessage: text('error_message'),
  aircraftModel: text('aircraft_model'),
  registrationNumber: text('registration_number'),
  tailNumber: text('tail_number'),
  inspectionType: text('inspection_type'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  purgedAt: timestamp('purged_at', { withTimezone: true }),
});

// Metrics Table Definition
export const metrics = pgTable('metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  frameTimestampMs: integer('frame_timestamp_ms').notNull(),
  metricType: text('metric_type').notNull(),
  label: text('label').notNull(),
  partName: text('part_name'),
  confidence: real('confidence'),
  bboxX1: real('bbox_x1'),
  bboxY1: real('bbox_y1'),
  bboxX2: real('bbox_x2'),
  bboxY2: real('bbox_y2'),
  rawValue: text('raw_value'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Types for select and insert operations
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Metric = typeof metrics.$inferSelect;
export type NewMetric = typeof metrics.$inferInsert;


// Warehouses Table Definition
export const warehouses = pgTable('warehouses', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  city: text('city'),
  country: text('country'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Parts Table Definition
export const parts = pgTable('parts', {
  id: uuid('id').primaryKey().defaultRandom(),
  partNumber: text('part_number').notNull().unique(),
  name: text('name').notNull(),
  aircraftModel: text('aircraft_model'),
  ataChapter: text('ata_chapter'),
  category: text('category'),
  manufacturer: text('manufacturer'),
  serialNumber: text('serial_number'),
  description: text('description'),
  compatibleAircraft: json('compatible_aircraft'),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id, { onDelete: 'set null' }),
  shelfLocation: text('shelf_location'),
  availableQty: integer('available_qty').notNull().default(0),
  reservedQty: integer('reserved_qty').notNull().default(0),
  minStock: integer('min_stock'),
  maxStock: integer('max_stock'),
  unitCost: numeric('unit_cost', { precision: 12, scale: 2 }),
  leadTimeDays: integer('lead_time_days'),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  barcode: text('barcode'),
  qrCodeUrl: text('qr_code_url'),
  imageUrl: text('image_url'),
  lifecycleStatus: text('lifecycle_status'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by'),
  updatedBy: uuid('updated_by'),
});

// Suppliers Table Definition
export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  contactEmail: text('contact_email'),
  location: text('location'),
  leadTimeDays: integer('lead_time_days'),
  rating: real('rating'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Reservations Table Definition
export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  partId: uuid('part_id')
    .notNull()
    .references(() => parts.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  inspectionId: uuid('inspection_id'),
  status: text('status', {
    enum: ['active', 'fulfilled', 'cancelled']
  }).notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Purchase Requests Table Definition
export const purchaseRequests = pgTable('purchase_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  partId: uuid('part_id')
    .notNull()
    .references(() => parts.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'set null' }),
  status: text('status', {
    enum: ['pending', 'approved', 'ordered', 'delivered', 'cancelled']
  }).notNull().default('pending'),
  estimatedCost: numeric('estimated_cost', { precision: 12, scale: 2 }),
  requestedBy: uuid('requested_by'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Inventory Transactions Table Definition
export const inventoryTransactions = pgTable('inventory_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  partId: uuid('part_id')
    .notNull()
    .references(() => parts.id, { onDelete: 'cascade' }),
  type: text('type', {
    enum: ['inbound', 'outbound', 'adjustment', 'reservation', 'release']
  }).notNull(),
  quantity: integer('quantity').notNull(),
  referenceId: uuid('reference_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Users Table Definition
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role', { enum: ['admin', 'engineer', 'viewer'] }).notNull().default('viewer'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({ emailUnique: uniqueIndex('idx_users_email').on(table.email) }));

// Types for select and insert operations
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Warehouse = typeof warehouses.$inferSelect;
export type NewWarehouse = typeof warehouses.$inferInsert;
export type Part = typeof parts.$inferSelect;
export type NewPart = typeof parts.$inferInsert;
export type Supplier = typeof suppliers.$inferSelect;
export type NewSupplier = typeof suppliers.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
export type PurchaseRequest = typeof purchaseRequests.$inferSelect;
export type NewPurchaseRequest = typeof purchaseRequests.$inferInsert;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type NewInventoryTransaction = typeof inventoryTransactions.$inferInsert;
