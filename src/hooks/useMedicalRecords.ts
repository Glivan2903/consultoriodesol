import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MedicalRecord {
  id: string;
  client_id: string;
  date: string;
  queixa_principal: string;
  objetivo: string;
  habitos: {
    intestino: { status: string; frequencia: string; obs: string };
    alimentacao: { cafe: string; almoco: string; jantar: string; consumo: string[] };
    hidratacao: string;
    sono: string;
    atividade_fisica: string;
    deambulacao: string;
  };
  checklist_clinico: string[];
  alergias: string;
  avaliacao_emocional: string[];
  avaliacao_feridas: {
    tipo: string;
    tecido: string;
    exsudato: string;
    dor: string;
    bordas: string;
    odor: string;
    desbridamento: boolean;
  };
  plano_terapeutico: string[];
  conduta: string;
  sinais_vitais: {
    pa: string;
    fc: string;
    fr: string;
    temp: string;
    spo2: string;
    obs: string;
  };
  evolucao: string;
  informacoes_adicionais?: string;
  created_at: string;
}

export function useMedicalRecords(clientId?: string) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRecords() {
    if (!clientId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_medical_records')
        .select('*')
        .eq('client_id', clientId)
        .order('date', { ascending: false });
      if (error) throw error;
      setRecords(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addRecord(record: Omit<MedicalRecord, 'id' | 'created_at'>) {
    const { error } = await supabase
      .from('inventory_medical_records')
      .insert([record]);
    if (error) throw error;
    await fetchRecords();
  }

  async function updateRecord(id: string, updates: Partial<MedicalRecord>) {
    const { error } = await supabase
      .from('inventory_medical_records')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchRecords();
  }

  async function deleteRecord(id: string) {
    const { error } = await supabase
      .from('inventory_medical_records')
      .delete()
      .eq('id', id);
    if (error) throw error;
    await fetchRecords();
  }

  useEffect(() => {
    fetchRecords();
  }, [clientId]);

  return { records, loading, addRecord, updateRecord, deleteRecord, refresh: fetchRecords };
}
