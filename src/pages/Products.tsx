import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertCircle,
  PackageCheck,
  PackageX,
  Eye
} from 'lucide-react';
import { useProducts, Product } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useFeedback } from '../context/FeedbackContext';
import Modal from '../components/Modal';
import ProductForm from '../components/ProductForm';

function Products() {
  const { products, loading, error, addProduct, updateProduct, deleteProduct, refresh } = useProducts();
  const { categories } = useCategories();
  const { showSuccess, confirmAction } = useFeedback();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'Todas' || p.category?.name === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const categoryNames = useMemo(() => {
    return ['Todas', ...categories.map(c => c.name)];
  }, [categories]);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, data);
      showSuccess('Produto Atualizado', 'Os dados do produto foram salvos.');
    } else {
      await addProduct(data);
      showSuccess('Produto Criado', 'Novo produto adicionado com sucesso.');
    }
    setIsModalOpen(false);
    refresh();
  };

  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-2xl">Erro: {error}</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Estoque de Produtos</h2>
          <p className="text-slate-500 text-sm">Gerencie seu catálogo, estoque mínimo e valores.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Produto
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-transparent border-none text-sm text-slate-600 outline-none pr-4"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categoryNames.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-y border-slate-100">
                <th className="px-8 py-5">Produto</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5">Stock Atual</th>
                <th className="px-8 py-5">Est. Mínimo</th>
                <th className="px-8 py-5">Custo/Venda</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <PackageX className="w-12 h-12 stroke-1" />
                      <p className="font-medium">Nenhum produto encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.map((product) => {
                const isLowStock = product.stock_current <= product.stock_min;
                return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <PackageCheck className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{product.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{product.sku || 'Sem SKU'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {product.category?.name || 'Geral'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${isLowStock ? 'text-red-600' : 'text-slate-900'}`}>
                          {product.stock_current} {product.unit}
                        </span>
                        {isLowStock && (
                          <span className="text-[9px] font-bold text-red-400 uppercase flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" /> Baixo
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                      {product.stock_min} {product.unit}
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-xs">
                        <p className="text-slate-400 mb-0.5">C: {formatBRL(product.cost_price)}</p>
                        <p className="text-brand-primary font-bold">V: {formatBRL(product.sale_price)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                        product.status === 'ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-primary transition-all">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            confirmAction('Excluir Produto', `Tem certeza que deseja excluir "${product.name}"?`, async () => {
                              await deleteProduct(product.id);
                              showSuccess('Excluído', 'O produto foi removido.');
                            }, 'Excluir');
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
      >
        <ProductForm 
          initialData={editingProduct || {}} 
          categories={categories}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

export default Products;