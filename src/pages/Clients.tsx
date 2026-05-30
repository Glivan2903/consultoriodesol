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
import ClientModal from '../components/modals/ClientModal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

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
    zip_code: '',
    street: '',
    number: '',
    neighborhood: '',
    state: '',
    notes: '',
    birth_date: '',
    age: '',
    profession: '',
    city: ''
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
      zip_code: c.zip_code || '',
      street: c.street || '',
      number: c.number || '',
      neighborhood: c.neighborhood || '',
      state: c.state || '',
      notes: c.notes || '',
      birth_date: c.birth_date || '',
      age: c.age || '',
      profession: c.profession || '',
      city: c.city || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleSaveClient = async (formData: any) => {
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
        showSuccess('Paciente Atualizado', 'Os dados do paciente foram salvos.');
      } else {
        await addClient(formData);
        showSuccess('Paciente Salvo', 'O novo paciente foi adicionado.');
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
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Pacientes</h2>
          <p className="text-slate-500 text-sm">Pacientes e compradores frequentes do consultório.</p>
        </div>
        <Button onClick={handleOpenCreate} icon={<Plus className="w-5 h-5" />}>
          Novo Paciente
        </Button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <Input
          icon={<Search className="w-5 h-5" />}
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-y border-slate-100">
                <th className="px-4 md:px-8 py-4 md:py-5">Paciente</th>
                <th className="px-4 md:px-8 py-4 md:py-5 hidden md:table-cell">Contato</th>
                <th className="px-4 md:px-8 py-4 md:py-5 hidden lg:table-cell">Documento</th>
                <th className="px-4 md:px-8 py-4 md:py-5 hidden xl:table-cell">Total Compras</th>
                <th className="px-4 md:px-8 py-4 md:py-5 text-right">Ações</th>
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
                    <div className="flex flex-col items-center gap-4 text-slate-400">
                      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-slate-300" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-600 text-lg">Nenhum paciente encontrado</p>
                        <p className="text-sm">Cadastre um novo paciente para começar.</p>
                      </div>
                      <Button onClick={handleOpenCreate} variant="secondary" className="mt-2" icon={<Plus className="w-4 h-4" />}>
                        Adicionar Paciente
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group block md:table-row bg-white border md:border-none border-slate-100 rounded-2xl mb-4 md:mb-0 shadow-sm md:shadow-none p-4 md:p-0">
                  <td className="px-4 md:px-8 py-2 md:py-5 block md:table-cell border-b md:border-none border-slate-50 pb-4 md:pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary overflow-hidden shrink-0">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{c.name}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{c.street ? `${c.street}, ${c.number || 'S/N'} - ${c.neighborhood || ''}` : (c.address || 'Sem endereço')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-2 md:py-5 block md:table-cell pt-4 md:pt-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Phone className="w-4 h-4 text-slate-400" /> {c.phone || '(00) 00000-0000'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                        <Mail className="w-4 h-4 text-slate-400" /> {c.email || 'Não informado'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-2 md:py-5 block md:table-cell">
                    <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      {c.tax_id || 'Sem CPF/CNPJ'}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-2 md:py-5 block md:table-cell">
                    <span className="text-sm font-black text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-lg">
                      R$ {c.total_purchases?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-2 md:py-5 block md:table-cell mt-4 md:mt-0 border-t md:border-none border-slate-50 pt-4 md:pt-5">
                    <div className="flex items-center justify-end md:justify-end gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/prontuarios/${c.id}`)}
                        title="Ver Prontuários"
                        className="p-2.5 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-xl transition-colors"
                      >
                        <ClipboardList className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/prontuarios/${c.id}?action=new`)}
                        title="Adicionar Prontuário"
                        className="p-2.5 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClientForDetails(c);
                          setIsMovementsModalOpen(true);
                        }}
                        title="Histórico de Saídas"
                        className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-colors"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="Editar Paciente"
                        className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          confirmAction('Excluir Paciente', `Tem certeza que deseja excluir o paciente ${c.name}?`, async () => {
                            await deleteClient(c.id);
                            showSuccess('Excluído', 'O paciente foi removido.');
                          }, 'Excluir');
                        }}
                        title="Excluir Paciente"
                        className="p-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
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

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={editingClient}
        onSave={handleSaveClient}
      />



      <ClientMovementsModal
        isOpen={isMovementsModalOpen}
        onClose={() => setIsMovementsModalOpen(false)}
        client={selectedClientForDetails}
      />
    </div>
  );
}

export default Clients;