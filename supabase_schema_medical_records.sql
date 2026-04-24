-- Migration to create medical records table
CREATE TABLE IF NOT EXISTS inventory_medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES inventory_clients(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Section 2: Complaint and Objective
    queixa_principal TEXT,
    objetivo TEXT,
    
    -- Section 3: Integrative Assessment (Systems and Habits)
    habitos JSONB DEFAULT '{
        "intestino": {"status": "", "frequencia": "", "obs": ""},
        "alimentacao": {"cafe": "", "almoco": "", "jantar": "", "consumo": []},
        "hidratacao": "",
        "sono": "",
        "atividade_fisica": "",
        "deambulacao": ""
    }'::jsonb,
    
    -- Section 4: Clinical Checklist
    checklist_clinico JSONB DEFAULT '[]'::jsonb, -- Array of condition strings
    alergias TEXT,
    
    -- Section 5: Emotional Assessment
    avaliacao_emocional JSONB DEFAULT '[]'::jsonb, -- Array of emotional states
    
    -- Section 6: Wound Assessment
    avaliacao_feridas JSONB DEFAULT '{
        "tipo": "",
        "tecido": "",
        "exsudato": "",
        "dor": "",
        "bordas": "",
        "odor": "",
        "desbridamento": false
    }'::jsonb,
    
    -- Section 7 & 8: Plan and Conduct
    plano_terapeutico JSONB DEFAULT '[]'::jsonb,
    conduta TEXT,
    
    -- Section 9: Vital Signs
    sinais_vitais JSONB DEFAULT '{
        "pa": "",
        "fc": "",
        "fr": "",
        "temp": "",
        "spo2": "",
        "obs": ""
    }'::jsonb,
    
    -- Section 10: Evolution
    evolucao TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookup by client
CREATE INDEX IF NOT EXISTS idx_medical_records_client_id ON inventory_medical_records(client_id);
