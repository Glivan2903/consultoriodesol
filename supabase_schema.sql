-- SQL Schema for Consultório de Sol - Inventory Management System

-- Drop existing tables to start fresh if needed
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS inventory_products CASCADE;
DROP TABLE IF EXISTS inventory_categories CASCADE;
DROP TABLE IF EXISTS inventory_clients CASCADE;
DROP TABLE IF EXISTS inventory_companies CASCADE;

-- Categories
CREATE TABLE inventory_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE inventory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE,
    name TEXT NOT NULL,
    category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
    stock_current DECIMAL(10,2) DEFAULT 0,
    stock_min DECIMAL(10,2) DEFAULT 0,
    unit TEXT DEFAULT 'un',
    cost_price DECIMAL(10,2) DEFAULT 0,
    sale_price DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'ativo',
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients
CREATE TABLE inventory_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tax_id TEXT UNIQUE, -- CPF/CNPJ
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    total_purchases DECIMAL(10,2) DEFAULT 0,
    last_purchase TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies
CREATE TABLE inventory_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    phone TEXT,
    email TEXT,
    contact_person TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Movements
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES inventory_products(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('entrada', 'saida')),
    quantity DECIMAL(10,2) NOT NULL,
    value_unit DECIMAL(10,2),
    origin_destination TEXT, -- Fornecedor, Cliente ID, Empresa ID, ou Nome Avulso
    balance_before DECIMAL(10,2),
    balance_after DECIMAL(10,2),
    user_id UUID, -- If auth is implemented
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers to update stock automatically
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'entrada') THEN
            UPDATE inventory_products 
            SET stock_current = stock_current + NEW.quantity 
            WHERE id = NEW.product_id;
        ELSIF (NEW.type = 'saida') THEN
            UPDATE inventory_products 
            SET stock_current = stock_current - NEW.quantity 
            WHERE id = NEW.product_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
AFTER INSERT ON inventory_movements
FOR EACH ROW
EXECUTE FUNCTION update_product_stock();

-- Insert Sample Data
INSERT INTO inventory_categories (name, description) VALUES
('Medicamentos', 'Remédios e compostos químicos'),
('Descartáveis', 'Luvas, máscaras e itens de uso único'),
('Equipamentos', 'Aparelhos e ferramentas médicas'),
('Estética', 'Produtos para procedimentos estéticos'),
('Laboratório', 'Reagentes e materiais de coleta');
