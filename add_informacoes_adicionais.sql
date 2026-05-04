-- SQL to add informacoes_adicionais column to medical records table
ALTER TABLE inventory_medical_records 
ADD COLUMN IF NOT EXISTS informacoes_adicionais TEXT;
