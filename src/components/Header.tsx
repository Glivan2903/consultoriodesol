import { Search, Bell, Moon, Sun, ChevronRight, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pathLabels: Record<string, string> = {
  '/': 'Dashboard Principal',
  '/produtos': 'Gestão de Produtos',
  '/categorias': 'Categorias',
  '/entradas': 'Entrada de Produtos',
  '/saidas': 'Saída de Produtos',
  '/clientes': 'Gestão de Clientes',
  '/empresas': 'Gestão de Empresas',
  '/movimentacoes': 'Log de Movimentações',
  '/relatorios': 'Relatórios & BI',
  '/configuracoes': 'Configurações do Sistema',
};

function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const location = useLocation();
  const { profile } = useAuth();
  const currentLabel = pathLabels[location.pathname] || 'Página';

  const userInitial = profile?.email ? profile.email[0].toUpperCase() : 'U';
  const userName = profile?.email ? profile.email.split('@')[0] : 'Usuário';

  return (
    <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-500"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium hidden sm:flex">
          <span>Sistema</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-bold text-lg">{currentLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group lg:w-96 hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-primary" />
          <input 
            type="text" 
            placeholder="Busca global (Produtos, Clientes, Empresas)..." 
            className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 focus:bg-white transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
          <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-brand-primary group relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          
          <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-500 hover:text-brand-primary">
            <Moon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 ml-4 bg-slate-50 p-1.5 pr-4 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-bold text-sm">
              {userInitial}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[11px] font-bold text-slate-900 leading-none capitalize">{userName}</p>
              <p className="text-[9px] text-slate-500 uppercase leading-none mt-1">{profile?.role || 'Visitante'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
