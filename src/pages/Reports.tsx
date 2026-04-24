import { useMemo } from 'react';
import { 
  FilePieChart, 
  BarChart3, 
  Download, 
  Printer, 
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useProducts } from '../hooks/useProducts';
import { useMovements } from '../hooks/useMovements';

const COLORS = ['#0d9488', '#f59e0b', '#1e3a8a', '#6366f1', '#ec4899', '#8b5cf6'];

function Reports() {
  const { products } = useProducts();
  const { movements } = useMovements();

  // Dados para Gráfico de Pizza: Produtos por Categoria
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach(p => {
      const name = p.category?.name || 'Sem Categoria';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Dados para Gráfico de Barra: Top 5 Saídas
  const topExits = useMemo(() => {
    const counts: Record<string, number> = {};
    movements.filter(m => m.type === 'saida').forEach(m => {
      const name = m.product?.name || 'Desconhecido';
      counts[name] = (counts[name] || 0) + m.quantity;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [movements]);

  const totalStockValue = useMemo(() => 
    products.reduce((acc, p) => acc + (p.stock_current * p.cost_price), 0),
  [products]);

  const totalSaleValue = useMemo(() => 
    products.reduce((acc, p) => acc + (p.stock_current * p.sale_price), 0),
  [products]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 print:bg-white print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Relatórios & BI</h2>
          <p className="text-slate-500 text-sm">Visão analítica completa do seu consultório.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <Printer className="w-5 h-5" />
            Imprimir PDF
          </button>
          <button className="flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:scale-105 transition-all">
            <Download className="w-5 h-5" />
            Exportar BI
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Valor em Custo</p>
          <p className="text-2xl font-black text-slate-900">R$ {totalStockValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Valor em Venda</p>
          <p className="text-2xl font-black text-brand-primary">R$ {totalSaleValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Margem Projetada</p>
          <p className="text-2xl font-black text-emerald-600">+{((totalSaleValue/totalStockValue - 1)*100).toFixed(1)}%</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase mb-1">Giro de Estoque</p>
          <p className="text-2xl font-black text-amber-600">Médio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Categorias */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-brand-primary/10 p-2.5 rounded-xl text-brand-primary">
              <FilePieChart className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Produtos por Categoria</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-xs text-slate-600 font-medium">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico Top Saídas */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Top 5 Produtos (Mais Saídas)</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topExits} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 10, width: 100}} width={100} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabela de Inventário Real-time */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden print:border-none">
        <div className="p-8 pb-4">
          <h3 className="text-lg font-bold text-slate-900">Status Geral de Inventário</h3>
          <p className="text-slate-500 text-xs">Posição consolidada de todos os itens cadastrados.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-y border-slate-100">
                <th className="px-8 py-5">Item</th>
                <th className="px-8 py-5">Categoria</th>
                <th className="px-8 py-5">Disp.</th>
                <th className="px-8 py-5">V. Custo Total</th>
                <th className="px-8 py-5">V. Venda Total</th>
                <th className="px-8 py-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p.id} className="text-sm">
                  <td className="px-8 py-5 font-bold text-slate-900">{p.name}</td>
                  <td className="px-8 py-5 text-slate-500">{p.category?.name || 'N/A'}</td>
                  <td className="px-8 py-5 font-mono">{p.stock_current} {p.unit}</td>
                  <td className="px-8 py-5 text-slate-400">R$ {(p.stock_current * p.cost_price).toFixed(2)}</td>
                  <td className="px-8 py-5 font-bold text-brand-primary">R$ {(p.stock_current * p.sale_price).toFixed(2)}</td>
                  <td className="px-8 py-5 text-right">
                    {p.stock_current <= p.stock_min ? (
                      <span className="text-red-500 font-bold text-[10px] uppercase">Repor Imediato</span>
                    ) : (
                      <span className="text-emerald-500 font-bold text-[10px] uppercase">Otimizado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;