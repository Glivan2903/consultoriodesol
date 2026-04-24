import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ClinicSettings {
  id: string;
  clinic_name: string;
  address: string;
  phone: string;
  cnpj: string;
  email: string;
  instagram: string;
}

export function useSettings() {
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (data && !error) {
      setSettings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<ClinicSettings>) => {
    if (!settings) return;
    const { data, error } = await supabase
      .from('inventory_settings')
      .update(newSettings)
      .eq('id', settings.id)
      .select()
      .single();

    if (error) throw error;
    if (data) setSettings(data);
    return data;
  };

  return { settings, loading, updateSettings, refetch: fetchSettings };
}
