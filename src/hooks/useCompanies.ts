import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  contact_person: string;
  address: string;
  notes: string;
}

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCompanies() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_companies')
        .select('*')
        .order('name');
      if (error) throw error;
      setCompanies(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addCompany(company: Omit<Company, 'id'>) {
    const { error } = await supabase
      .from('inventory_companies')
      .insert([company]);
    if (error) throw error;
    await fetchCompanies();
  }

  async function updateCompany(id: string, updates: Partial<Company>) {
    const { error } = await supabase
      .from('inventory_companies')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchCompanies();
  }

  async function deleteCompany(id: string) {
    const { error } = await supabase
      .from('inventory_companies')
      .delete()
      .eq('id', id);
    if (error) throw error;
    fetchCompanies();
  }

  useEffect(() => {
    fetchCompanies();
  }, []);

  return { companies, loading, addCompany, updateCompany, deleteCompany, refresh: fetchCompanies };
}
