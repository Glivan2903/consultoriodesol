import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Users,
  Phone,
  Mail,
  Edit,
  Trash2,
  Calendar,
  CreditCard,
  ClipboardList,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useClients, Client } from '../hooks/useClients';
import { useFeedback } from '../context/FeedbackContext';
import Modal from '../components/Modal';
import ClientMovementsModal from '../components/ClientMovementsModal';

function Clients() {
  const navigate = useNavigate();
  const { showSuccess, showError, confirmAction } = useFeedback();
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [selectedClientForDetails, setSelectedClientForDetails] = useState<Client | null>(null);
  const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });

  const filtered = useMemo(() => 
    clients.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (c.tax_id && c.tax_id.includes(searchTerm))),
  [clients, searchTerm]);

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setFormData({
      name: c.name,
      tax_id: c.tax_id || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      notes: c.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({ name: '', tax_id: '', phone: '', email: '', address: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('[Clients] handleSubmit called. Editing:', !!editingClient, formData);
    
    // Clean data: empty strings to null for optional fields
    const dataToSave = {
      ...formData,
      tax_id: formData.tax_id?.trim() || null,
      phone: formData.phone?.trim() || null,
      email: formData.email?.trim() || null,
      address: formData.address?.trim() || null,
      notes: formData.notes?.trim() || null,
    };

    try {
      if (editingClient) {
        await updateClient(editingClient.id, dataToSave);
        showSuccess('Cliente Atualizado', 'Os dados do cliente foram salvos.');
      } else {
        await addClient(dataToSave as any);
        setFormData({ name: '', tax_id: '', phone: '', email: '', address: '', notes: '' });
        showSuccess('Cliente Salvo', 'O novo cliente foi adicionado.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving client:', err);
      showError('Erro ao salvar', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Clientes</h2>
          <p className="text-slate-500 text-sm">Pacientes e compradores frequentes do consultório.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Novo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-y border-slate-100">
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Contato</th>
                <th className="px-8 py-5">Documento</th>
                <th className="px-8 py-5">Total Compras</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users className="w-12 h-12 stroke-1 mx-auto" />
                      <p className="font-medium">Nenhum cliente encontrado.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary overflow-hidden">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{c.name}</p>
                        <p className="text-[10px] text-slate-400 max-w-[200px] truncate">{c.address || 'Sem endereço'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3.5 h-3.5" /> {c.phone || '(00) 00000-0000'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3.5 h-3.5" /> {c.email || 'Não informado'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded-md">
                      {c.tax_id || 'Sem CPF/CNPJ'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-slate-900">
                      R$ {c.total_purchases?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          navigate(`/prontuarios/${c.id}`);
                        }}
                        title="Ver Prontuários"
                        className="p-2 hover:bg-teal-50 text-slate-400 hover:text-teal-600 rounded-lg transition-colors"
                      >
                        <ClipboardList className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          navigate(`/prontuarios/${c.id}?action=new`);
                        }}
                        title="Adicionar Prontuário"
                        className="p-2 hover:bg-brand-primary/10 text-slate-400 hover:text-brand-primary rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedClientForDetails(c);
                          setIsMovementsModalOpen(true);
                        }}
                        title="Histórico de Saídas"
                        className="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleOpenEdit(c)}
                        title="Editar Cliente"
                        className="p-2 hover:bg-amber-50 text-slate-400 hover:text-amber-600 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          confirmAction('Excluir Cliente', `Tem certeza que deseja excluir o cliente ${c.name}?`, async () => {
                            await deleteClient(c.id);
                            showSuccess('Excluído', 'O cliente foi removido.');
                          }, 'Excluir');
                        }}
                        title="Excluir Cliente"
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo *</label>
              <input 
                required
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">CPF / CNPJ</label>
              <input 
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={formData.tax_id}
                onChange={e => setFormData({...formData, tax_id: e.target.value})}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
              <input 
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
              <input 
                type="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="exemplo@email.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Endereço Completo</label>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 rounded-2xl">Cancelar</button>
            <button 
              type="button" 
              onClick={() => handleSubmit()}
              className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:scale-105 hover:bg-teal-700 transition-all duration-300"
            >
              Salvar Cliente
            </button>
          </div>
        </form>
      </Modal>



      <ClientMovementsModal 
        isOpen={isMovementsModalOpen}
        onClose={() => setIsMovementsModalOpen(false)}
        client={selectedClientForDetails}
      />
    </div>
  );
}

export default Clients;