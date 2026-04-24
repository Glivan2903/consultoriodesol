import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Database, 
  Download,
  Save,
  ToggleLeft,
  ToggleRight,
  Building,
  UserPlus
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth, UserPermissions, UserRole } from '../context/AuthContext';
import { useFeedback } from '../context/FeedbackContext';
import { useSettings } from '../hooks/useSettings';

function Settings() {
  const { profile: myProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('empresa');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const { showSuccess, showError } = useFeedback();

  const { settings, updateSettings } = useSettings();
  const [companyData, setCompanyData] = useState({
    clinic_name: '',
    address: '',
    phone: '',
    cnpj: '',
    email: '',
    instagram: ''
  });

  // Novo Usuário Form
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [creatingUser, setCreatingUser] = useState(false);

  useEffect(() => {
    if (settings) {
      setCompanyData({
        clinic_name: settings.clinic_name || '',
        address: settings.address || '',
        phone: settings.phone || '',
        cnpj: settings.cnpj || '',
        email: settings.email || '',
        instagram: settings.instagram || ''
      });
    }
  }, [settings]);

  useEffect(() => {
    if (activeTab === 'usuarios' && myProfile?.role === 'superadmin') {
      fetchProfiles();
    }
  }, [activeTab]);

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    const { data } = await supabase.from('inventory_profiles').select('*').order('created_at');
    if (data) setProfiles(data);
    setLoadingProfiles(false);
  };

  const handleSaveCompany = async () => {
    try {
      await updateSettings(companyData);
      showSuccess('Dados Salvos', 'As informações da empresa foram atualizadas.');
    } catch (e: any) {
      showError('Erro ao salvar', e.message);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.password) return;
    setCreatingUser(true);
    try {
      // Cria usuário. OBS: dependendo da config do supabase, isso pode logar o adm na conta nova.
      const { error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            name: newUser.name
          }
        }
      });
      if (error) throw error;
      showSuccess('Usuário Criado', 'O usuário foi criado com sucesso (verifique o e-mail se necessário).');
      setNewUser({ name: '', email: '', password: '' });
      fetchProfiles();
    } catch (e: any) {
      showError('Erro ao criar usuário', e.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const updateProfileRole = async (id: string, role: UserRole) => {
    const { error } = await supabase.from('inventory_profiles').update({ role }).eq('id', id);
    if (!error) fetchProfiles();
  };

  const togglePermission = async (id: string, currentPermissions: UserPermissions, key: keyof UserPermissions) => {
    const newPermissions = { ...currentPermissions, [key]: !currentPermissions[key] };
    const { error } = await supabase.from('inventory_profiles').update({ permissions: newPermissions }).eq('id', id);
    if (!error) fetchProfiles();
  };

  const downloadBackup = async () => {
    try {
      const { data: p } = await supabase.from('inventory_products').select('*');
      const { data: m } = await supabase.from('inventory_movements').select('*');
      const backup = { timestamp: new Date().toISOString(), products: p, movements: m };
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_consultorio_sol_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      showSuccess('Backup Concluído', 'O download do backup foi iniciado.');
    } catch (e) {
      showError('Erro', 'Erro ao gerar backup');
    }
  };

  const menuItems = [
    { id: 'empresa', label: 'Dados da Empresa', icon: Building },
    { id: 'usuarios', label: 'Gestão de Usuários', icon: Shield },
    { id: 'dados', label: 'Dados & Backup', icon: Database },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Configurações</h2>
        <p className="text-slate-500 text-sm">Gerencie preferências do sistema, usuários e dados da empresa.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-64 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-brand-primary text-white shadow-lg shadow-teal-500/20' 
                  : 'text-slate-500 hover:bg-white hover:text-slate-900'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-4 md:p-10 min-h-[500px]">
          
          {/* DADOS DA EMPRESA */}
          {activeTab === 'empresa' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Dados da Empresa / Clínica</h3>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">
                  Essas informações aparecerão no cabeçalho do prontuário impresso
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nome da Clínica/Instituição</label>
                  <input type="text" value={companyData.clinic_name} onChange={e => setCompanyData({...companyData, clinic_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Endereço Completo</label>
                  <input type="text" value={companyData.address} onChange={e => setCompanyData({...companyData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">CNPJ</label>
                  <input type="text" value={companyData.cnpj} onChange={e => setCompanyData({...companyData, cnpj: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Telefone / WhatsApp</label>
                  <input type="text" value={companyData.phone} onChange={e => setCompanyData({...companyData, phone: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
                  <input type="email" value={companyData.email} onChange={e => setCompanyData({...companyData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Instagram / Redes Sociais</label>
                  <input type="text" value={companyData.instagram} onChange={e => setCompanyData({...companyData, instagram: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
              </div>

              <button onClick={handleSaveCompany} className="flex items-center gap-2 bg-brand-primary text-white px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all">
                <Save className="w-5 h-5" /> Salvar Dados da Empresa
              </button>
            </div>
          )}

          {/* GESTÃO DE USUÁRIOS */}
          {activeTab === 'usuarios' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4 flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Gestão de Usuários</h3>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Crie e gerencie acessos do sistema</p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold">
                  {profiles.length} Usuários
                </div>
              </div>

              {/* Form de Criação de Usuário */}
              <form onSubmit={handleCreateUser} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-4"><UserPlus className="w-5 h-5 text-brand-primary"/> Criar Novo Usuário</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500">Nome</label>
                    <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full px-4 py-2 mt-1 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">E-mail</label>
                    <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-4 py-2 mt-1 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500">Senha</label>
                    <input required minLength={6} type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full px-4 py-2 mt-1 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-primary" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={creatingUser} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:scale-105 transition-all disabled:opacity-50">
                    {creatingUser ? 'Criando...' : 'Adicionar Usuário'}
                  </button>
                </div>
              </form>

              <div className="space-y-6">
                {loadingProfiles ? (
                  <div className="py-20 text-center animate-pulse text-slate-400">Carregando usuários...</div>
                ) : profiles.map((p) => (
                  <div key={p.id} className="p-6 border border-slate-100 rounded-3xl bg-white shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                          {p.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.email}</p>
                          <p className="text-[10px] text-slate-400 italic">ID: {p.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                        {['user', 'admin', 'superadmin'].map((role) => (
                          <button
                            key={role}
                            onClick={() => updateProfileRole(p.id, role as UserRole)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                              p.role === role ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-white'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {Object.keys(p.permissions).map((key) => (
                        <button
                          key={key}
                          onClick={() => togglePermission(p.id, p.permissions, key as keyof UserPermissions)}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border transition-all ${
                            p.permissions[key] 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                              : 'bg-white border-slate-100 text-slate-400'
                          }`}
                        >
                          <span className="text-[9px] font-bold uppercase tracking-tight">{key}</span>
                          {p.permissions[key] ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {activeTab === 'dados' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Backup & Integridade</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border border-slate-100 rounded-3xl bg-slate-50/50 flex flex-col items-start">
                  <Download className="w-8 h-8 text-brand-primary mb-4" />
                  <h4 className="font-bold text-slate-900 mb-2">Exportar Backup</h4>
                  <button onClick={downloadBackup} className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-sm hover:bg-brand-primary hover:text-white transition-all shadow-sm mt-auto">Baixar Backup (.json)</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Settings;