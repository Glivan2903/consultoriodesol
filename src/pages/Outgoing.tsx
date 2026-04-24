import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  ArrowUpRight, 
  Search, 
  Plus, 
  History, 
  User,
  Building2,
  Package,
  ArrowRight,
  UserPlus
} from 'lucide-react';
import { useMovements } from '../hooks/useMovements';
import { useProducts } from '../hooks/useProducts';
import { useClients } from '../hooks/useClients';
import { useCompanies } from '../hooks/useCompanies';
import { useFeedback } from '../context/FeedbackContext';
import Modal from '../components/Modal';

function Outgoing() {
  const { movements, addMovement, updateMovement, deleteMovement, loading: movesLoading } = useMovements();
  const { products } = useProducts();
  const { clients } = useClients();
  const { companies } = useCompanies();
  const { showSuccess, showError, confirmAction } = useFeedback();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMove, setSelectedMove] = useState<any>(null);
  const [isEditingMove, setIsEditingMove] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 0,
    type_entity: 'cliente', // cliente | empresa | avulsa
    entity_id: '',
    origin_destination: '',
    notes: ''
  });

  const outgoingMoves = useMemo(() => 
    movements.filter(m => m.type === 'saida'), 
  [movements]);

  const selectedProduct = useMemo(() => 
    products.find(p => p.id === formData.product_id),
  [products, formData.product_id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id || formData.quantity <= 0) return;
    
    // Validar estoque
    if (selectedProduct && formData.quantity > selectedProduct.stock_current) {
      showError('Estoque insuficiente', 'Estoque insuficiente para esta saída!');
      return;
    }

    // Definir string de destino
    let finalDestination = formData.origin_destination;
    if (formData.type_entity === 'cliente') {
      const c = clients.find(cl => cl.id === formData.entity_id);
      finalDestination = `Cliente: ${c?.name || 'Desconhecido'}`;
    } else if (formData.type_entity === 'empresa') {
      const comp = companies.find(c => c.id === formData.entity_id);
      finalDestination = `Empresa: ${comp?.name || 'Desconhecida'}`;
    }

    try {
      await addMovement({
        product_id: formData.product_id,
        type: 'saida',
        quantity: formData.quantity,
        value_unit: selectedProduct?.sale_price || 0,
        origin_destination: finalDestination,
        notes: formData.notes
      });
      setIsModalOpen(false);
      setFormData({ product_id: '', quantity: 0, type_entity: 'cliente', entity_id: '', origin_destination: '', notes: '' });
      showSuccess('Sucesso!', 'Saída registrada com sucesso!');
    } catch (err: any) {
      showError('Erro', err.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Saída de Produtos</h2>
          <p className="text-slate-500 text-sm">Registre baixas no estoque para clientes ou uso interno.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowUpRight className="w-5 h-5" />
          Registrar Nova Saída
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 md:p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
                <History className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Histórico de Saídas</h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-y border-slate-100">
                  <th className="px-8 py-4">Data</th>
                  <th className="px-8 py-4">Produto</th>
                  <th className="px-8 py-4">Qtd</th>
                  <th className="px-8 py-4">Destino</th>
                  <th className="px-8 py-4">Saldo Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {movesLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center animate-pulse">Carregando...</td></tr>
                ) : outgoingMoves.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhuma saída registrada.</td></tr>
                ) : outgoingMoves.map((move) => (
                  <tr key={move.id} onClick={() => { setSelectedMove(move); setEditData(move); }} className="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                    <td className="px-8 py-4 text-xs font-medium text-slate-500">
                      {new Date(move.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-4 font-bold text-slate-900">{move.product?.name}</td>
                    <td className="px-8 py-4 font-mono font-bold text-amber-600">
                      -{Number(move.quantity).toString()} <span className="text-xs text-slate-400 font-sans">{move.product?.unit}</span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500">{move.origin_destination}</td>
                    <td className="px-8 py-4">
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

        <div className="space-y-4">
          <div className="bg-amber-600 p-6 rounded-3xl text-white shadow-lg shadow-amber-500/20 relative overflow-hidden group">
            <ArrowUpRight className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform" />
            <h4 className="text-amber-100 text-xs font-bold uppercase tracking-widest mb-1">Saídas Total (Mês)</h4>
            <p className="text-3xl font-black">-{outgoingMoves.length}</p>
            <p className="mt-4 text-[10px] font-bold bg-white/10 w-fit px-2 py-1 rounded-full">ESTOQUE EM BAIXA</p>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Nova Saída de Estoque"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Selecionar Produto *</label>
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 appearance-none cursor-pointer"
                value={formData.product_id}
                onChange={e => setFormData({...formData, product_id: e.target.value})}
              >
                <option value="">Buscar produto...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Disp: {p.stock_current} {p.unit})</option>
                ))}
              </select>
            </div>
            {selectedProduct && (
              <p className="text-[10px] text-amber-600 font-bold ml-2">
                ESTOQUE ATUAL: {selectedProduct.stock_current} {selectedProduct.unit}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Quantidade *</label>
              <input 
                required
                type="number"
                min="1"
                step="1"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-lg"
                value={formData.quantity || ''}
                onChange={e => setFormData({...formData, quantity: parseInt(e.target.value, 10) || 0})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Tipo de Saída</label>
              <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
                {['cliente', 'empresa', 'avulsa'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData({...formData, type_entity: t, entity_id: '', origin_destination: ''})}
                    className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-xl transition-all ${
                      formData.type_entity === t ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Destino / Responsável *</label>
            <div className="relative">
              {formData.type_entity === 'cliente' ? (
                <>
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none cursor-pointer"
                    value={formData.entity_id}
                    onChange={e => setFormData({...formData, entity_id: e.target.value})}
                  >
                    <option value="">Selecionar Cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </>
              ) : formData.type_entity === 'empresa' ? (
                <>
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none appearance-none cursor-pointer"
                    value={formData.entity_id}
                    onChange={e => setFormData({...formData, entity_id: e.target.value})}
                  >
                    <option value="">Selecionar Empresa...</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </>
              ) : (
                <>
                  <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required
                    type="text"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                    value={formData.origin_destination}
                    onChange={e => setFormData({...formData, origin_destination: e.target.value})}
                    placeholder="Nome do responsável / Destino"
                  />
                </>
              )}
            </div>
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
              className="flex-[2] py-4 bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Registrar Saída
            </button>
          </div>
        </form>
      </Modal>
      <Modal 
        isOpen={!!selectedMove} 
        onClose={() => { setSelectedMove(null); setIsEditingMove(false); }}
        title="Detalhes da Saída"
      >
        {selectedMove && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl col-span-2">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Destino / Responsável</p>
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
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl outline-none font-bold text-amber-600"
                    value={editData.quantity || ''}
                    onChange={e => setEditData({...editData, quantity: parseInt(e.target.value, 10)})}
                  />
                ) : (
                  <p className="font-bold text-lg text-amber-600">
                    -{Number(selectedMove.quantity).toString()} <span className="text-xs uppercase">{selectedMove.product?.unit}</span>
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
                  className="flex-[2] py-4 bg-amber-600 text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
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

export default Outgoing;