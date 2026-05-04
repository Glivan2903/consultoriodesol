-- SQL to add patient details to inventory_clients table
ALTER TABLE inventory_clients 
ADD COLUMN IF NOT EXISTS birth_date TEXT,
ADD COLUMN IF NOT EXISTS age TEXT,
ADD COLUMN IF NOT EXISTS profession TEXT,
ADD COLUMN IF NOT EXISTS city TEXT;
