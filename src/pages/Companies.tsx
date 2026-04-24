import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Building2, 
  Phone,
  Mail,
  Edit,
  Trash2,
  Briefcase,
  MapPin
} from 'lucide-react';
import { useCompanies, Company } from '../hooks/useCompanies';
import { useFeedback } from '../context/FeedbackContext';
import Modal from '../components/Modal';

function Companies() {
  const { companies, loading, addCompany, updateCompany, deleteCompany } = useCompanies();
  const { showSuccess, showError, confirmAction } = useFeedback();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<Company | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    contact_person: '',
    address: '',
    notes: ''
  });

  const filtered = useMemo(() => 
    companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       c.cnpj.includes(searchTerm)),
  [companies, searchTerm]);

  const handleOpenEdit = (c: Company) => {
    setEditingComp(c);
    setFormData({
      name: c.name,
      cnpj: c.cnpj || '',
      phone: c.phone || '',
      email: c.email || '',
      contact_person: c.contact_person || '',
      address: c.address || '',
      notes: c.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingComp(null);
    setFormData({ name: '', cnpj: '', phone: '', email: '', contact_person: '', address: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingComp) {
        await updateCompany(editingComp.id, formData);
        showSuccess('Empresa Atualizada', 'Os dados da empresa foram salvos.');
      } else {
        await addCompany(formData);
        showSuccess('Empresa Criada', 'A nova empresa foi adicionada com sucesso.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showError('Erro ao salvar', err.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Gestão de Empresas</h2>
          <p className="text-slate-500 text-sm">Parceiros, fornecedores e convênios corporativos.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Nova Empresa
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary" />
          <input 
            type="text" 
            placeholder="Buscar por razão social ou CNPJ..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-slate-100 rounded-3xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
            <Building2 className="w-12 h-12 mx-auto mb-2 stroke-1" />
            <p>Nenhuma empresa encontrada.</p>
          </div>
        ) : filtered.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenEdit(c)}
                  className="p-2 hover:bg-amber-50 text-slate-300 hover:text-amber-600 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    confirmAction('Excluir Empresa', `Tem certeza que deseja excluir a empresa ${c.name}?`, async () => {
                      await deleteCompany(c.id);
                      showSuccess('Excluída', 'A empresa foi removida com sucesso.');
                    }, 'Excluir');
                  }}
                  className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">{c.name}</h3>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mb-4">{c.cnpj || 'Sem CNPJ'}</p>
            
            <div className="space-y-2 mb-6 text-xs text-slate-500">
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {c.phone || '(00) 00000-0000'}</div>
              <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {c.email || 'Não informado'}</div>
              <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Resp: {c.contact_person || 'N/A'}</div>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <div className="flex items-start gap-2 text-[10px] text-slate-400">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="line-clamp-1">{c.address || 'Endereço não cadastrado'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingComp ? 'Editar Empresa' : 'Nova Empresa'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Razão Social / Nome *</label>
              <input 
                required
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">CNPJ</label>
              <input 
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={formData.cnpj}
                onChange={e => setFormData({...formData, cnpj: e.target.value})}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Pessoa de Contato</label>
              <input 
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={formData.contact_person}
                onChange={e => setFormData({...formData, contact_person: e.target.value})}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
              <input 
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail Corporativo</label>
              <input 
                type="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Endereço da Empresa</label>
            <input 
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500 rounded-2xl">Cancelar</button>
            <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20">Salvar Empresa</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Companies;