import React, { useState } from 'react';
import { Product } from '../hooks/useProducts';
import { Category } from '../hooks/useCategories';
import { useFeedback } from '../context/FeedbackContext';

interface ProductFormProps {
  initialData?: Partial<Product>;
  categories: Category[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({ initialData, categories, onSubmit, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    sku: initialData?.sku || '',
    name: initialData?.name || '',
    category_id: initialData?.category_id || '',
    stock_current: initialData?.stock_current || 0,
    stock_min: initialData?.stock_min || 0,
    unit: initialData?.unit || 'un',
    cost_price: initialData?.cost_price || 0,
    sale_price: initialData?.sale_price || 0,
    status: initialData?.status || 'ativo',
    description: initialData?.description || '',
    image_url: initialData?.image_url || '',
  });

  const [loading, setLoading] = useState(false);
  const { showError } = useFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (err: any) {
      console.error(err);
      showError('Erro ao salvar', err.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Código / SKU</label>
          <input 
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            value={formData.sku}
            onChange={e => setFormData({...formData, sku: e.target.value})}
            placeholder="Ex: MED-001"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Nome do Produto *</label>
          <input 
            required
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="Ex: Amoxicilina 500mg"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Categoria *</label>
          <select 
            required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all appearance-none cursor-pointer"
            value={formData.category_id}
            onChange={e => setFormData({...formData, category_id: e.target.value})}
          >
            <option value="">Selecionar...</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Unidade de Medida</label>
          <select 
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all appearance-none cursor-pointer"
            value={formData.unit}
            onChange={e => setFormData({...formData, unit: e.target.value})}
          >
            <option value="un">Unidade (un)</option>
            <option value="kg">Quilograma (kg)</option>
            <option value="l">Litro (l)</option>
            <option value="cx">Caixa (cx)</option>
            <option value="pct">Pacote (pct)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-primary/5 p-6 rounded-[2rem] border border-brand-primary/10">
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-primary uppercase">Estoque Mínimo</label>
          <input 
            type="number"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            value={formData.stock_min}
            onChange={e => setFormData({...formData, stock_min: Number(e.target.value)})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold text-brand-primary uppercase">Valor de Venda (R$)</label>
          <input 
            type="number"
            step="0.01"
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            value={formData.sale_price}
            onChange={e => setFormData({...formData, sale_price: Number(e.target.value)})}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
        <textarea 
          rows={3}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
          placeholder="Detalhes adicionais sobre o produto..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button 
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
        >
          Cancelar
        </button>
        <button 
          type="submit"
          disabled={loading}
          className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </form>
  );
}
