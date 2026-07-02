-- DDL Schema for AeroGuard NeonDB (dev branch)

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'engineer', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    r2_object_key TEXT UNIQUE NOT NULL,
    original_filename TEXT,
    file_size_bytes BIGINT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'uploaded', 'queued', 'processing', 'completed', 'failed', 'rejected', 'purged')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    purged_at TIMESTAMPTZ
);

-- Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    frame_timestamp_ms INTEGER NOT NULL,
    metric_type TEXT NOT NULL,
    label TEXT NOT NULL,
    confidence FLOAT,
    bbox_x1 FLOAT,
    bbox_y1 FLOAT,
    bbox_x2 FLOAT,
    bbox_y2 FLOAT,
    raw_value TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index on jobs status for quick queue/processing lookups
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

-- Create index on metrics job_id for quick retrieval of video frames metrics
CREATE INDEX IF NOT EXISTS idx_metrics_job_id ON metrics(job_id);

-- Table for warehouses
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    city TEXT,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for parts
CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    aircraft_model TEXT,
    ata_chapter TEXT,
    category TEXT,
    manufacturer TEXT,
    serial_number TEXT,
    description TEXT,
    compatible_aircraft JSONB,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    shelf_location TEXT,
    available_qty INTEGER NOT NULL DEFAULT 0,
    reserved_qty INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER,
    max_stock INTEGER,
    unit_cost NUMERIC(12,2),
    lead_time_days INTEGER,
    supplier_id UUID,
    barcode TEXT,
    qr_code_url TEXT,
    image_url TEXT,
    lifecycle_status TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Indexes for parts
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_warehouse_id ON parts(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_parts_ata_chapter ON parts(ata_chapter);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_supplier_id ON parts(supplier_id);

-- Add missing FK constraint for parts.supplier_id
DO $$ BEGIN
    ALTER TABLE parts ADD CONSTRAINT parts_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Table for suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    contact_email TEXT,
    location TEXT,
    lead_time_days INTEGER,
    rating FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for reservations
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    inspection_id UUID,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for purchase_requests
CREATE TABLE IF NOT EXISTS purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'delivered', 'cancelled')),
    estimated_cost NUMERIC(12,2),
    requested_by UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for inventory_transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID NOT NULL REFERENCES parts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('inbound', 'outbound', 'adjustment', 'reservation', 'release')),
    quantity INTEGER NOT NULL,
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reservations
CREATE INDEX IF NOT EXISTS idx_reservations_part_id ON reservations(part_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- Indexes for purchase_requests
CREATE INDEX IF NOT EXISTS idx_purchase_requests_part_id ON purchase_requests(part_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON purchase_requests(status);

-- Indexes for inventory_transactions
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_part_id ON inventory_transactions(part_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(type);
