import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Users, 
  Building2, 
  History, 
  FileBarChart, 
  Settings,
  Sun,
  LogOut,
  ClipboardList
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth, UserPermissions } from '../context/AuthContext';

interface MenuItem {
  icon: any;
  label: string;
  path: string;
  permission: keyof UserPermissions;
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', permission: 'dashboard' },
  { icon: Package, label: 'Produtos', path: '/produtos', permission: 'products' },
  { icon: Tags, label: 'Categorias', path: '/categorias', permission: 'categories' },
  { icon: ArrowDownLeft, label: 'Entradas', path: '/entradas', permission: 'incoming' },
  { icon: ArrowUpRight, label: 'Saídas', path: '/saidas', permission: 'outgoing' },
  { icon: Users, label: 'Clientes', path: '/clientes', permission: 'clients' },
  { icon: Building2, label: 'Empresas', path: '/empresas', permission: 'companies' },
  { icon: History, label: 'Movimentações', path: '/movimentacoes', permission: 'movements' },
  { icon: FileBarChart, label: 'Relatórios', path: '/relatorios', permission: 'reports' },
  { icon: ClipboardList, label: 'Prontuários', path: '/prontuarios', permission: 'clients' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes', permission: 'settings' },
];

function Sidebar() {
  const { profile, signOut } = useAuth();

  const filteredItems = menuItems; // Todos têm acesso a tudo

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out border-r border-slate-800">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-secondary rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Sun className="text-white w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-tight">Consultório</h1>
          <p className="text-brand-secondary font-medium tracking-wider text-[10px] uppercase">de Sol</p>
        </div>
      </div>

      <nav className="flex-1 mt-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              twMerge(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-brand-primary/10 text-white" 
                  : "hover:bg-slate-800/50 hover:text-white"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={clsx("w-5 h-5", isActive ? "text-brand-primary" : "group-hover:text-brand-primary")} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-brand-primary rounded-full" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto space-y-4">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white font-bold shrink-0">
              {profile?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-[11px] font-bold text-white truncate">{profile?.email?.split('@')[0] || 'Carregando...'}</p>
              <p className="text-[9px] text-brand-primary uppercase font-black tracking-tighter">
                {profile?.role || 'Aguardando SQL...'}
              </p>
            </div>
          </div>
          <button 
            onClick={async () => {
              await signOut();
              window.location.href = '/login'; // Força o redirecionamento
            }}
            className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-3 h-3" />
            Sair do Sistema
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
