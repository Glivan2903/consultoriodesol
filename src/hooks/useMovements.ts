import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Movement {
  id: string;
  product_id: string;
  type: 'entrada' | 'saida';
  quantity: number;
  value_unit: number;
  origin_destination: string;
  balance_before: number;
  balance_after: number;
  notes?: string;
  created_at: string;
  product?: { name: string, unit: string };
}

export function useMovements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchMovements() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory_movements')
        .select('*, product:inventory_products(name, unit)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setMovements(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function addMovement(move: Omit<Movement, 'id' | 'created_at' | 'balance_before' | 'balance_after'>) {
    // Pegar saldo atual do produto
    const { data: product } = await supabase
      .from('inventory_products')
      .select('stock_current')
      .eq('id', move.product_id)
      .single();
    
    if (!product) throw new Error('Produto não encontrado');

    const balance_before = product.stock_current;
    const balance_after = move.type === 'entrada' 
      ? balance_before + move.quantity 
      : balance_before - move.quantity;

    if (balance_after < 0) throw new Error('Estoque insuficiente');

    const { error } = await supabase
      .from('inventory_movements')
      .insert([{
        ...move,
        balance_before,
        balance_after
      }]);
    
    if (error) throw error;
    await fetchMovements();
  }

  async function updateMovement(id: string, newData: Partial<Movement>, oldData: Movement) {
    // Se mudou o produto ou a quantidade, precisamos ajustar o estoque
    if (newData.product_id !== undefined || newData.quantity !== undefined || newData.type !== undefined) {
      const type = newData.type || oldData.type;
      const newQty = newData.quantity !== undefined ? newData.quantity : oldData.quantity;
      const newProductId = newData.product_id || oldData.product_id;
      
      if (newProductId === oldData.product_id && type === oldData.type) {
        // Mesmo produto e mesmo tipo, apenas ajusta a diferença
        const { data: product } = await supabase.from('inventory_products').select('stock_current').eq('id', oldData.product_id).single();
        if (product) {
          const diff = newQty - oldData.quantity;
          const newStock = type === 'entrada' ? product.stock_current + diff : product.stock_current - diff;
          if (newStock < 0) throw new Error('Estoque insuficiente para esta alteração. O saldo ficaria negativo.');
          await supabase.from('inventory_products').update({ stock_current: newStock }).eq('id', oldData.product_id);
        }
      } else {
        // Reverte o antigo
        const { data: oldProduct } = await supabase.from('inventory_products').select('stock_current').eq('id', oldData.product_id).single();
        if (oldProduct) {
          const revertedStock = oldData.type === 'entrada' ? oldProduct.stock_current - oldData.quantity : oldProduct.stock_current + oldData.quantity;
          await supabase.from('inventory_products').update({ stock_current: revertedStock }).eq('id', oldData.product_id);
        }
        // Aplica o novo
        const { data: newProduct } = await supabase.from('inventory_products').select('stock_current').eq('id', newProductId).single();
        if (newProduct) {
          const appliedStock = type === 'entrada' ? newProduct.stock_current + newQty : newProduct.stock_current - newQty;
          if (appliedStock < 0) throw new Error('Estoque insuficiente no novo produto para esta alteração.');
          await supabase.from('inventory_products').update({ stock_current: appliedStock }).eq('id', newProductId);
        }
      }
    }

    const { error } = await supabase
      .from('inventory_movements')
      .update(newData)
      .eq('id', id);
      
    if (error) throw error;
    await fetchMovements();
  }

  async function deleteMovement(move: Movement) {
    // Reverter estoque
    const { data: product } = await supabase
      .from('inventory_products')
      .select('stock_current')
      .eq('id', move.product_id)
      .single();
    
    if (product) {
      const newStock = move.type === 'entrada' 
        ? product.stock_current - move.quantity 
        : product.stock_current + move.quantity;
      
      await supabase
        .from('inventory_products')
        .update({ stock_current: newStock })
        .eq('id', move.product_id);
    }

    const { error } = await supabase
      .from('inventory_movements')
      .delete()
      .eq('id', move.id);
      
    if (error) throw error;
    await fetchMovements();
  }

  useEffect(() => {
    fetchMovements();
  }, []);

  return { movements, loading, addMovement, updateMovement, deleteMovement, refresh: fetchMovements };
}
