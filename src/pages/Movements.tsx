import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  History, 
  Calendar,
  Download,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { useMovements } from '../hooks/useMovements';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { useFeedback } from '../context/FeedbackContext';
import Modal from '../components/Modal';
function Movements() {
  const { movements, loading, updateMovement, deleteMovement } = useMovements();
  const { categories } = useCategories();
  const { products } = useProducts();
  const { showSuccess, showError, confirmAction } = useFeedback();
  
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState(() => {
    return new URLSearchParams(location.search).get('search') || '';
  });
  const [typeFilter, setTypeFilter] = useState(() => {
    return new URLSearchParams(location.search).get('type') || 'Todos';
  });
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [selectedMove, setSelectedMove] = useState<any>(null);
  const [isEditingMove, setIsEditingMove] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const filtered = useMemo(() => 
    movements.filter(m => {
      const matchesSearch = m.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           m.origin_destination.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'Todos' || m.type === typeFilter.toLowerCase();
      // Nota: Para filtrar por categoria, precisaríamos que o supabase retornasse a categoria no movimento
      // Por simplicidade aqui faremos o filtro de tipo e busca
      return matchesSearch && matchesType;
    }),
  [movements, searchTerm, typeFilter]);

  const exportToCSV = () => {
    const headers = ['Data', 'Produto', 'Tipo', 'Quantidade', 'Origem/Destino', 'Saldo Anterior', 'Saldo Atual'];
    const rows = filtered.map(m => [
      new Date(m.created_at).toLocaleString(),
      m.product?.name,
      m.type.toUpperCase(),
      m.quantity,
      m.origin_destination,
      m.balance_before,
      m.balance_after
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `movimentacoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Histórico Geral de Movimentações</h2>
          <p className="text-slate-500 text-sm">Auditoria completa de todas as entradas e saídas do estoque.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por produto ou origem/destino..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select 
            className="bg-slate-50 border-none rounded-2xl px-4 py-2.5 text-sm text-slate-600 outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>Todos</option>
            <option>Entrada</option>
            <option>Saida</option>
          </select>
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100 text-slate-600 text-sm">
            <Calendar className="w-4 h-4" />
            <span>Hoje</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-y border-slate-100">
                <th className="px-8 py-5">Data/Hora</th>
                <th className="px-8 py-5">Produto</th>
                <th className="px-8 py-5">Tipo</th>
                <th className="px-8 py-5">Quantidade</th>
                <th className="px-8 py-5">Origem/Destino</th>
                <th className="px-8 py-5">Saldos (Ant &gt; Atual)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center animate-pulse">Carregando auditoria...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <History className="w-12 h-12 mx-auto mb-2 text-slate-200" />
                    <p className="text-slate-400">Nenhuma movimentação para os filtros aplicados.</p>
                  </td>
                </tr>
              ) : filtered.map((m) => (
                <tr key={m.id} onClick={() => setSelectedMove(m)} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{new Date(m.created_at).toLocaleDateString()}</span>
                      <span className="text-[10px] text-slate-400">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-slate-900 text-sm">{m.product?.name}</td>
                  <td className="px-8 py-5">
                    {m.type === 'entrada' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                        <ArrowDownLeft className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Entrada</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded-lg">
                        <ArrowUpRight className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase">Saída</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-sm font-black ${m.type === 'entrada' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {m.type === 'entrada' ? '+' : '-'}{m.quantity}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1 uppercase">{m.product?.unit}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">{m.origin_destination}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400">{m.balance_before}</span>
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] font-mono text-white">{m.balance_after}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={!!selectedMove} 
        onClose={() => { setSelectedMove(null); setIsEditingMove(false); }}
        title="Detalhes da Movimentação"
      >
        {selectedMove && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl col-span-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Origem / Destino</p>
                {isEditingMove ? (
                  <input 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                    value={editData.origin_destination || ''}
                    onChange={e => setEditData({...editData, origin_destination: e.target.value})}
                  />
                ) : (
                  <p className="font-bold text-slate-900 text-lg">{selectedMove.origin_destination}</p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl col-span-2 md:col-span-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Produto</p>
                {isEditingMove ? (
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                    value={editData.product_id || ''}
                    onChange={e => setEditData({...editData, product_id: e.target.value})}
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="font-bold text-slate-900">{selectedMove.product?.name}</p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Data e Hora</p>
                <p className="font-bold text-slate-900">{new Date(selectedMove.created_at).toLocaleString()}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Quantidade</p>
                {isEditingMove ? (
                  <input 
                    type="number"
                    min="1"
                    step="1"
                    className={`w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold ${selectedMove.type === 'entrada' ? 'text-emerald-600' : 'text-amber-600'}`}
                    value={editData.quantity || ''}
                    onChange={e => setEditData({...editData, quantity: parseInt(e.target.value, 10)})}
                  />
                ) : (
                  <p className={`font-bold text-lg ${selectedMove.type === 'entrada' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedMove.type === 'entrada' ? '+' : '-'}{Number(selectedMove.quantity).toString()} <span className="text-xs uppercase">{selectedMove.product?.unit}</span>
                  </p>
                )}
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Valor Unitário</p>
                {isEditingMove ? (
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                    value={editData.value_unit || ''}
                    onChange={e => setEditData({...editData, value_unit: parseFloat(e.target.value)})}
                  />
                ) : (
                  <p className="font-bold text-slate-900">
                    {selectedMove.value_unit > 0 ? `R$ ${selectedMove.value_unit.toFixed(2)}` : 'Não informado'}
                  </p>
                )}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl col-span-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Observações</p>
                {isEditingMove ? (
                  <textarea 
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none text-sm resize-none"
                    value={editData.notes || ''}
                    onChange={e => setEditData({...editData, notes: e.target.value})}
                  />
                ) : (
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedMove.notes || 'Nenhuma observação.'}</p>
                )}
              </div>
            </div>
            
            {isEditingMove ? (
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setIsEditingMove(false)}
                  className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await updateMovement(selectedMove.id, editData, selectedMove);
                      const prod = products.find(p => p.id === editData.product_id) || selectedMove.product;
                      setSelectedMove({ ...selectedMove, ...editData, product: prod });
                      setIsEditingMove(false);
                      showSuccess('Atualizado', 'Alterações salvas com sucesso!');
                    } catch (e: any) {
                      showError('Erro ao salvar', e.message);
                    }
                  }}
                  className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Salvar Alterações
                </button>
              </div>
            ) : (
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    setEditData({ 
                      origin_destination: selectedMove.origin_destination, 
                      notes: selectedMove.notes || '',
                      product_id: selectedMove.product_id,
                      quantity: selectedMove.quantity,
                      value_unit: selectedMove.value_unit
                    });
                    setIsEditingMove(true);
                  }}
                  className="flex-1 py-4 font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-2xl transition-all"
                >
                  Editar
                </button>
                <button 
                  onClick={() => {
                    confirmAction('Confirmar Exclusão', 'Tem certeza que deseja excluir esta movimentação? O estoque será revertido.', async () => {
                      try {
                        await deleteMovement(selectedMove);
                        setSelectedMove(null);
                        showSuccess('Excluída', 'A movimentação foi removida.');
                      } catch (err: any) {
                        showError('Erro ao excluir', err.message);
                      }
                    }, 'Excluir');
                  }}
                  className="flex-1 py-4 font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all"
                >
                  Excluir
                </button>
                <button 
                  onClick={() => setSelectedMove(null)}
                  className="flex-[2] py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function ArrowRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  )
}

export default Movements;