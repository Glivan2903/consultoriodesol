import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Client {
  id: string;
  name: string;
  tax_id: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  total_purchases: number;
}

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchClients() {
    const maxRetries = 3;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('inventory_clients')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setClients(data || []);
        return; // Success!
      } catch (e: any) {
        console.error(`[useClients] fetchClients attempt ${retries + 1} failed:`, e);
        if (e.message?.includes('Lock') || e.name?.includes('Lock')) {
          retries++;
          await new Promise(r => setTimeout(r, 1000 * retries)); // Exponential backoff
        } else {
          throw e; // Non-lock error, stop retrying
        }
      } finally {
        setLoading(false);
      }
    }
  }

  async function addClient(client: Omit<Client, 'id' | 'total_purchases'>) {
    console.log('[useClients] addClient initiating...', client);
    
    try {
      // First, try the insert
      const { error: insertError } = await supabase
        .from('inventory_clients')
        .insert([client]);
      
      if (insertError) {
        console.error('[useClients] Supabase Insert Error:', insertError);
        throw insertError;
      }
      
      console.log('[useClients] Insert success');
      
      // Try to refresh the list, but don't crash if it fails
      try {
        await fetchClients();
      } catch (fetchErr) {
        console.warn('[useClients] Post-insert fetch failed, but data was saved:', fetchErr);
      }
    } catch (err: any) {
      console.error('[useClients] addClient error:', err);
      throw err;
    }
  }

  async function updateClient(id: string, updates: Partial<Client>) {
    const { error } = await supabase
      .from('inventory_clients')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchClients();
  }

  async function deleteClient(id: string) {
    const { error } = await supabase
      .from('inventory_clients')
      .delete()
      .eq('id', id);
    if (error) throw error;
    fetchClients();
  }

  useEffect(() => {
    fetchClients();
  }, []);

  return { clients, loading, addClient, updateClient, deleteClient, refresh: fetchClients };
}
