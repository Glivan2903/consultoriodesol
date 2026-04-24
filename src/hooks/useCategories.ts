import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchCategories() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addCategory(name: string, description?: string) {
    const { error } = await supabase
      .from('inventory_categories')
      .insert([{ name, description }]);
    if (error) throw error;
    await fetchCategories();
  }

  async function deleteCategory(id: string) {
    const { error } = await supabase
      .from('inventory_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setCategories(categories.filter(c => c.id !== id));
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, addCategory, deleteCategory, refresh: fetchCategories };
}
