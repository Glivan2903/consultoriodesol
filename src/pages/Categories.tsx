import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tags,
  ChevronRight,
  Info
} from 'lucide-react';
import { useCategories, Category } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { useFeedback } from '../context/FeedbackContext';
import Modal from '../components/Modal';

function Categories() {
  const { categories, loading, addCategory, deleteCategory, refresh } = useCategories();
  const { products } = useProducts();
  const { showSuccess, confirmAction } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '' });

  const filteredCategories = useMemo(() => {
    return categories.filter(c => 
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  // Contagem de produtos por categoria
  const productCount = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      if (p.category_id) {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      }
    });
    return counts;
  }, [products]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name) return;
    await addCategory(newCat.name, newCat.description);
    setIsModalOpen(false);
    setNewCat({ name: '', description: '' });
    showSuccess('Categoria Criada', 'A nova categoria foi adicionada.');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Categorias</h2>
          <p className="text-slate-500 text-sm">Organize seus produtos por grupos lógicos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nova Categoria
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary" />
          <input 
            type="text" 
            placeholder="Buscar categorias..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
          ))
        ) : filteredCategories.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-2xl">
                <Tags className="w-5 h-5" />
              </div>
              <button 
                onClick={() => {
                  confirmAction('Excluir Categoria', `Tem certeza que deseja excluir a categoria "${cat.name}"?`, async () => {
                    await deleteCategory(cat.id);
                    showSuccess('Excluída', 'A categoria foi removida com sucesso.');
                  }, 'Excluir');
                }}
                className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 mb-1">{cat.name}</h3>
            <p className="text-slate-500 text-xs line-clamp-2 mb-6">
              {cat.description || 'Sem descrição definida.'}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Produtos</span>
                <span className="text-xl font-bold text-slate-900">{productCount[cat.id] || 0}</span>
              </div>
              <button className="flex items-center gap-1 text-xs font-bold text-brand-primary hover:gap-2 transition-all">
                Ver Produtos <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Nova Categoria"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome da Categoria *</label>
            <input 
              required
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
              value={newCat.name}
              onChange={e => setNewCat({...newCat, name: e.target.value})}
              placeholder="Ex: Curativos e Bandagens"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none"
              value={newCat.description}
              onChange={e => setNewCat({...newCat, description: e.target.value})}
              placeholder="Descreva o tipo de produtos desta categoria..."
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 text-blue-600">
            <Info className="w-5 h-5 shrink-0" />
            <p className="text-xs leading-relaxed">
              Categorias ajudam na organização e geração de relatórios detalhados por departamento.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Criar Categoria
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Categories;