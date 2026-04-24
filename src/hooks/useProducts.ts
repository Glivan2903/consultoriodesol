import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category_id: string;
  stock_current: number;
  stock_min: number;
  unit: string;
  cost_price: number;
  sale_price: number;
  status: 'ativo' | 'inativo';
  description?: string;
  image_url?: string;
  created_at?: string;
  category?: { name: string };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_products')
        .select('*, category:inventory_categories(name)')
        .order('name', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'category'>) {
    const { data, error } = await supabase
      .from('inventory_products')
      .insert([product])
      .select();
    if (error) throw error;
    await fetchProducts();
    return data;
  }

  async function updateProduct(id: string, updates: Partial<Product>) {
    const { error } = await supabase
      .from('inventory_products')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
    await fetchProducts();
  }

  async function deleteProduct(id: string) {
    const { error } = await supabase
      .from('inventory_products')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setProducts(products.filter(p => p.id !== id));
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refresh: fetchProducts
  };
}
