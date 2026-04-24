-- Table to store Clinic/Company settings
CREATE TABLE IF NOT EXISTS inventory_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_name TEXT NOT NULL DEFAULT 'Instituto Sol Alves',
    address TEXT,
    phone TEXT,
    cnpj TEXT,
    email TEXT,
    instagram TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default row if it doesn't exist
INSERT INTO inventory_settings (clinic_name, address, phone, email, instagram)
SELECT 'INSTITUTO SOL ALVES', 'Rua José Januário, N° 31 - Centro, Nossa Senhora da Glória/SE', '79 99948-2706', 'nurse.sol@outlook.com', '@solalvesenfermeira'
WHERE NOT EXISTS (SELECT 1 FROM inventory_settings);

-- RLS policies
ALTER TABLE inventory_settings ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read settings
CREATE POLICY "Allow authenticated read settings" 
ON inventory_settings FOR SELECT 
TO authenticated USING (true);

-- Allow authenticated users to update settings (simplificado)
CREATE POLICY "Allow authenticated update settings" 
ON inventory_settings FOR UPDATE 
TO authenticated USING (true);
