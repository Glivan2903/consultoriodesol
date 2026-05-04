import { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, 
  Search, 
  Plus, 
  History, 
  Calendar,
  Truck,
  Package,
  ArrowRight
} from 'lucide-react';
import { useMovements } from '../hooks/useMovements';
import { useProducts } from '../hooks/useProducts';
import { useFeedback } from '../context/FeedbackContext';
import Modal from '../components/Modal';

function Incoming() {
  const { movements, addMovement, updateMovement, deleteMovement, loading: movesLoading } = useMovements();
  const { products, loading: productsLoading } = useProducts();
  const { showSuccess, showError, confirmAction } = useFeedback();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMove, setSelectedMove] = useState<any>(null);
  const [isEditingMove, setIsEditingMove] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 0,
    value_unit: 0,
    origin_destination: '',
    notes: ''
  });

  const incomingMoves = useMemo(() => 
    movements.filter(m => m.type === 'entrada'), 
  [movements]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || formData.quantity <= 0) return;
    try {
      await addMovement({
        type: 'entrada',
        ...formData
      });
      setIsModalOpen(false);
      setFormData({ product_id: '', quantity: 0, value_unit: 0, origin_destination: '', notes: '' });
      showSuccess('Sucesso!', 'Entrada registrada com sucesso!');
    } catch (err: any) {
      showError('Erro', err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Entrada de Produtos</h2>
          <p className="text-slate-500 text-sm">Registre novas aquisições e atualize seu estoque.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Registrar Nova Entrada
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Histórico Recente de Entradas */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Histórico de Entradas</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-y border-slate-100">
                  <th className="px-4 md:px-8 py-4">Data</th>
                  <th className="px-4 md:px-8 py-4">Produto</th>
                  <th className="px-4 md:px-8 py-4">Qtd</th>
                  <th className="px-4 md:px-8 py-4 hidden sm:table-cell">Valor Unit.</th>
                  <th className="px-4 md:px-8 py-4 hidden md:table-cell">Fornecedor</th>
                  <th className="px-4 md:px-8 py-4 hidden lg:table-cell">Saldo Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movesLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center animate-pulse">Carregando...</td></tr>
                ) : incomingMoves.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhuma entrada registrada.</td></tr>
                ) : incomingMoves.map((move) => (
                  <tr key={move.id} onClick={() => { setSelectedMove(move); setEditData(move); }} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                    <td className="px-4 md:px-8 py-4 text-xs font-medium text-slate-500">
                      {new Date(move.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 md:px-8 py-4 font-bold text-slate-900">{move.product?.name}</td>
                    <td className="px-4 md:px-8 py-4 font-mono font-bold text-emerald-600">+{Number(move.quantity).toString()} <span className="text-xs text-slate-400 font-sans">{move.product?.unit}</span></td>
                    <td className="px-4 md:px-8 py-4 text-sm text-slate-600 hidden sm:table-cell">
                      {move.value_unit > 0 ? `R$ ${move.value_unit.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-4 md:px-8 py-4 text-sm text-slate-500 hidden md:table-cell">{move.origin_destination}</td>
                    <td className="px-4 md:px-8 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400">{move.balance_before}</span>
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                        <span className="text-sm font-bold text-slate-900">{move.balance_after}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* resumo cards lateral */}
        <div className="space-y-4">
          <div className="bg-emerald-600 p-6 rounded-3xl text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden group">
            <ArrowDownLeft className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            <h4 className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Entradas Total (Mês)</h4>
            <p className="text-3xl font-black">+{incomingMoves.length}</p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-2 py-1 rounded-full">
              <Calendar className="w-3 h-3" /> ABRIL 2026
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Nova Entrada de Estoque"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Selecionar Produto *</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none cursor-pointer"
                value={formData.product_id}
                onChange={e => setFormData({...formData, product_id: e.target.value})}
              >
                <option value="">Buscar produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Quantidade *</label>
              <input 
                required
                type="number"
                min="1"
                step="1"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold text-lg"
                value={formData.quantity || ''}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value, 10) || 0})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Valor Unitário (Opcional)</label>
              <input 
                type="number"
                step="0.01"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={formData.value_unit}
                onChange={e => setFormData({...formData, value_unit: Number(e.target.value)})}
                placeholder="R$ 0,00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Fornecedor / Origem</label>
            <div className="relative">
              <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                value={formData.origin_destination}
                onChange={e => setFormData({...formData, origin_destination: e.target.value})}
                placeholder="Ex: MedDistribuidora Ltda"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Observações</label>
            <textarea 
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
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
              className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Registrar Entrada
            </button>
          </div>
        </form>
      </Modal>
      <Modal 
        isOpen={!!selectedMove} 
        onClose={() => { setSelectedMove(null); setIsEditingMove(false); }}
        title="Detalhes da Entrada"
      >
        {selectedMove && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl col-span-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Fornecedor / Origem</p>
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-emerald-600"
                    value={editData.quantity || ''}
                    onChange={e => setEditData({...editData, quantity: parseInt(e.target.value, 10)})}
                  />
                ) : (
                  <p className="font-bold text-lg text-emerald-600">
                    +{Number(selectedMove.quantity).toString()} <span className="text-xs uppercase">{selectedMove.product?.unit}</span>
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
                  className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
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

export default Incoming;