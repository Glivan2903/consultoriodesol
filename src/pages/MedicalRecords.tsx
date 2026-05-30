import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Calendar,
  FileText,
  Plus,
  ChevronRight,
  History,
  ClipboardList,
  ArrowLeft,
  User
} from 'lucide-react';
import { useClients, Client } from '../hooks/useClients';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { useFeedback } from '../context/FeedbackContext';
import MedicalRecordForm from '../components/MedicalRecordForm';
import Modal from '../components/Modal';
import { clsx } from 'clsx';

export default function MedicalRecords() {
  const { clients, loading: loadingClients, addClient } = useClients();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'history' | 'form'>('history');
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientFormData, setClientFormData] = useState({
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

  const { records, loading: loadingRecords, addRecord, updateRecord } = useMedicalRecords(selectedClient?.id);
  const { showSuccess, showError } = useFeedback();

  const { clientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (clientId && clients.length > 0) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setSelectedClient(client);
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('action') === 'new') {
          setCurrentView('form');
        } else {
          setCurrentView('history');
        }
      }
    }
  }, [clientId, clients, location.search]);

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.tax_id?.includes(searchTerm)
  );

  const handleSaveRecord = async (data: any) => {
    try {
      if (editingRecord) {
        await updateRecord(editingRecord.id, data);
        showSuccess('Prontuário Atualizado', 'O prontuário foi salvo.');
      } else {
        await addRecord({ ...data, client_id: selectedClient!.id });
        showSuccess('Prontuário Criado', 'Novo prontuário registrado com sucesso.');
      }
      setCurrentView('history');
      setEditingRecord(null);
      // Remove a query string the action=new se existir
      if (location.search.includes('action=new')) {
        navigate(`/prontuarios/${selectedClient!.id}`);
      }
    } catch (err: any) {
      showError('Erro ao salvar prontuário', err.message);
    }
  };

  const handleCancelForm = () => {
    setCurrentView('history');
    setEditingRecord(null);
    if (location.search.includes('action=new')) {
      navigate(`/prontuarios/${selectedClient!.id}`);
    }
  };

  const handleOpenCreateClient = () => {
    setClientFormData({
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
    setIsClientModalOpen(true);
  };

  const handleSubmitClient = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const dataToSave = {
      ...clientFormData,
      tax_id: clientFormData.tax_id?.trim() || null,
      phone: clientFormData.phone?.trim() || null,
      email: clientFormData.email?.trim() || null,
      address: clientFormData.address?.trim() || null,
      zip_code: clientFormData.zip_code?.trim() || null,
      street: clientFormData.street?.trim() || null,
      number: clientFormData.number?.trim() || null,
      neighborhood: clientFormData.neighborhood?.trim() || null,
      state: clientFormData.state?.trim() || null,
      notes: clientFormData.notes?.trim() || null,
      birth_date: clientFormData.birth_date?.trim() || null,
      age: clientFormData.age?.trim() || null,
      profession: clientFormData.profession?.trim() || null,
      city: clientFormData.city?.trim() || null,
    };

    try {
      const newClient = await addClient(dataToSave as any);
      showSuccess('Paciente Salvo', 'O novo paciente foi adicionado.');
      setIsClientModalOpen(false);

      // Inicia automaticamente o prontuário para o novo cliente
      setSelectedClient(newClient);
      setEditingRecord(null);
      setCurrentView('form');
    } catch (err: any) {
      showError('Erro ao salvar paciente', err.message);
    }
  };

  const handleBirthDateChange = (val: string) => {
    // Formata DD/MM/AAAA
    const digits = val.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;

    let age = clientFormData.age;
    if (formatted.length === 10) {
      const [d, m, y] = formatted.split('/').map(Number);
      const birth = new Date(y, m - 1, d);
      if (!isNaN(birth.getTime())) {
        const today = new Date();
        let calculatedAge = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          calculatedAge--;
        }
        age = calculatedAge >= 0 ? `${calculatedAge} anos` : '';
      }
    }

    setClientFormData({
      ...clientFormData,
      birth_date: formatted,
      age: age
    });
  };

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setClientFormData(prev => ({ ...prev, zip_code: cleanCep }));

    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          setClientFormData(prev => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));

          setTimeout(() => {
            document.getElementById('numero-input')?.focus();
          }, 100);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // ESTADO 3: FORMULÁRIO EM TELA CHEIA
  if (selectedClient && currentView === 'form') {
    return (
      <div className="h-[calc(100vh-120px)] animate-in fade-in slide-in-from-bottom-2 duration-500 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col relative print:h-auto print:overflow-visible print:border-none print:shadow-none print:rounded-none print:bg-transparent">
        <button
          onClick={handleCancelForm}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-bold shadow-sm border border-slate-200 transition-all hover:scale-105 print:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>
        <MedicalRecordForm
          initialData={editingRecord}
          client={selectedClient}
          onSave={handleSaveRecord}
          onCancel={handleCancelForm}
        />
      </div>
    );
  }

  // ESTADO 2: DETALHES DO CLIENTE E LISTA DE PRONTUÁRIOS
  if (selectedClient && currentView === 'history') {
    return (
      <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={() => {
              setSelectedClient(null);
              navigate('/prontuarios');
            }}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900 hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Histórico do Paciente</h1>
        </div>

        {/* Card do Cliente Topo */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
              <UserIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">{selectedClient.name}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-0.5 sm:mt-1">
                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">CPF: {selectedClient.tax_id || 'N/I'}</p>
                <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{selectedClient.phone || 'Sem fone'}</p>
                {(selectedClient.street || selectedClient.address || selectedClient.city) && (
                  <>
                    <span className="hidden sm:block w-1 h-1 bg-slate-300 rounded-full" />
                    <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">
                      {selectedClient.street ? `${selectedClient.street}, ${selectedClient.number || 'S/N'} - ${selectedClient.neighborhood || ''}, ${selectedClient.city || ''} - ${selectedClient.state || ''}` : [selectedClient.address, selectedClient.city].filter(Boolean).join(', ')}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingRecord(null);
              setCurrentView('form');
            }}
            className="flex items-center justify-center gap-2 bg-brand-primary text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Novo Prontuário
          </button>
        </div>

        {/* Lista de Prontuários Abaixo */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-brand-primary" /> Prontuários Anteriores
            </h3>
            <span className="text-[10px] sm:text-xs font-bold text-brand-primary bg-brand-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
              {records.length} {records.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 custom-scrollbar">
            {loadingRecords ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl animate-pulse" />)
            ) : records.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                <FileText className="w-16 h-16 mb-4 stroke-1 text-slate-200" />
                <p className="text-lg font-medium text-slate-400">Nenhum prontuário registrado.</p>
                <p className="text-sm mt-1">Clique em "Novo Prontuário" para criar o primeiro registro.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {records.map(record => (
                  <div
                    key={record.id}
                    className="group bg-white hover:bg-slate-50 shadow-sm hover:shadow-md border border-slate-200 hover:border-brand-primary/30 p-3 sm:p-4 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
                    onClick={() => {
                      setEditingRecord(record);
                      setCurrentView('form');
                    }}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="bg-brand-primary/10 p-2.5 sm:p-3 rounded-xl text-brand-primary group-hover:scale-110 transition-transform shrink-0">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="shrink-0">
                        <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Data
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">
                          {new Date(record.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                          <span className="hidden sm:inline">/{new Date(record.date).getFullYear()}</span>
                        </p>
                      </div>

                      <div className="flex-1 bg-slate-50 p-2 sm:p-3 rounded-xl border border-slate-100 min-w-0 ml-auto sm:ml-0">
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mb-0.5 sm:mb-1 truncate">Queixa:</p>
                        <h4 className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                          {record.queixa_principal || 'N/I'}
                        </h4>
                      </div>
                    </div>

                    <ChevronRight className="hidden sm:block w-5 h-5 text-slate-300 group-hover:text-brand-primary transition-colors shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ESTADO 1: LISTA DE CLIENTES
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Prontuários</h1>
          <p className="text-slate-500 text-sm">Selecione um paciente para acessar ou criar novos prontuários médicos.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar paciente por nome ou CPF..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleOpenCreateClient}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Adicionar Paciente
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Users className="w-4 h-4" /> Pacientes Cadastrados
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30 custom-scrollbar">
          {loadingClients ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-white border border-slate-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
              <Search className="w-12 h-12 mb-4 stroke-1 opacity-50" />
              <p>Nenhum paciente encontrado com "{searchTerm}".</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredClients.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedClient(c);
                    setCurrentView('history');
                  }}
                  className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl hover:shadow-md hover:border-brand-primary/50 transition-all flex items-center gap-4 text-left group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-colors shrink-0">
                    {c.name[0]}
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-brand-primary transition-colors sm:w-1/3 shrink-0">
                      {c.name}
                    </p>
                    <p className="text-xs text-slate-500 sm:w-1/4 shrink-0 truncate">
                      <span className="sm:hidden font-bold">CPF: </span>{c.tax_id || 'Sem CPF'}
                    </p>
                    <p className="text-xs text-slate-500 hidden sm:block shrink-0 truncate">
                      {c.phone || 'Sem telefone'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-brand-primary transition-all -translate-x-2 group-hover:translate-x-0 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        formData={clientFormData}
        setFormData={setClientFormData}
        onSubmit={handleSubmitClient}
        onBirthDateChange={handleBirthDateChange}
        onCepSearch={handleCepSearch}
      />
    </div>
  );
}

function ClientModal({ isOpen, onClose, formData, setFormData, onSubmit, onBirthDateChange, onCepSearch }: any) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Paciente"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nome Completo *</label>
            <input
              required
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">CPF / CNPJ</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.tax_id}
              onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
              placeholder="000.000.000-00"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Telefone</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">E-mail</label>
            <input
              type="email"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="exemplo@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Data de Nascimento</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.birth_date}
              onChange={e => onBirthDateChange(e.target.value)}
              placeholder="DD/MM/AAAA"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Idade</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
              placeholder="Ex: 25 anos"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Profissão</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.profession}
              onChange={e => setFormData({ ...formData, profession: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">CEP</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.zip_code}
              onChange={e => onCepSearch(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Rua</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.street}
              onChange={e => setFormData({ ...formData, street: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Número</label>
            <input
              id="numero-input"
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.number}
              onChange={e => setFormData({ ...formData, number: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Bairro</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.neighborhood}
              onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Cidade</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Estado</label>
            <input
              type="text"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
              placeholder="UF"
              maxLength={2}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Complemento</label>
          <input
            type="text"
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Observações Internas</label>
          <textarea
            rows={2}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm resize-none"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
        <div className="flex gap-4 pt-4">
          <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-slate-500 rounded-2xl">Cancelar</button>
          <button
            type="submit"
            className="flex-[2] py-4 bg-brand-primary text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:scale-105 hover:bg-teal-700 transition-all duration-300"
          >
            Salvar e Iniciar Prontuário
          </button>
        </div>
      </form>
    </Modal>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
