import { useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock 
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { useProducts } from '../hooks/useProducts';
import { useMovements } from '../hooks/useMovements';

function Dashboard() {
  const { products, loading: productsLoading } = useProducts();
  const { movements, loading: movementsLoading } = useMovements();

  const {
    totalProducts,
    lowStockAlerts,
    totalStockValue,
    monthEntriesCount,
    monthExitsCount,
    chartData,
    latestMovements
  } = useMemo(() => {
    // 1. Produtos Cadastrados
    const totalProducts = products.length;

    // 2. Estoque Baixo
    const lowStockAlerts = products.filter(p => p.stock_current <= p.stock_min);

    // 3. Valor Total Stock
    const totalStockValue = products.reduce((acc, p) => acc + (Number(p.stock_current) * Number(p.cost_price || 0)), 0);

    // 4. Entradas / Saídas do mês atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthEntriesCount = 0;
    let monthExitsCount = 0;

    movements.forEach(m => {
      const d = new Date(m.created_at);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (m.type === 'entrada') monthEntriesCount += Number(m.quantity);
        if (m.type === 'saida') monthExitsCount += Number(m.quantity);
      }
    });

    // Recharts Data (last 6 meses)
    const chartDataMap = new Map<string, { name: string, entradas: number, saidas: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const monthName = d.toLocaleString('pt-BR', { month: 'short' });
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      chartDataMap.set(key, { name: monthName, entradas: 0, saidas: 0 });
    }

    movements.forEach(m => {
      const d = new Date(m.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (chartDataMap.has(key)) {
        const dataPoint = chartDataMap.get(key)!;
        if (m.type === 'entrada') dataPoint.entradas += Number(m.quantity);
        if (m.type === 'saida') dataPoint.saidas += Number(m.quantity);
      }
    });

    const chartData = Array.from(chartDataMap.values()).map(d => ({
      ...d,
      name: d.name.charAt(0).toUpperCase() + d.name.slice(1)
    }));

    // Últimas Movimentações
    const latestMovements = movements.slice(0, 5).map(m => ({
      id: m.id,
      product: m.product?.name || 'Produto Desconhecido',
      type: m.type,
      qty: m.quantity,
      date: new Date(m.created_at).toLocaleDateString('pt-BR'),
      source: m.origin_destination || 'N/A'
    }));

    return {
      totalProducts,
      lowStockAlerts,
      totalStockValue,
      monthEntriesCount,
      monthExitsCount,
      chartData,
      latestMovements
    };
  }, [products, movements]);

  const cards = [
    { title: 'Produtos Cadastrados', value: totalProducts.toString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', trend: '', trendColor: 'text-slate-500' },
    { title: 'Estoque Baixo', value: lowStockAlerts.length.toString(), icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', trend: lowStockAlerts.length > 0 ? 'Atenção' : 'Ok', trendColor: lowStockAlerts.length > 0 ? 'text-red-600' : 'text-green-600' },
    { title: 'Entradas (Mês)', value: monthEntriesCount.toString(), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Qtd', trendColor: 'text-green-600' },
    { title: 'Saídas (Mês)', value: monthExitsCount.toString(), icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Qtd', trendColor: 'text-amber-600' },
    { title: 'Valor Total Stock', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalStockValue), icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Estável', trendColor: 'text-slate-500' },
  ];

  if (productsLoading || movementsLoading) {
    return <div className="p-8 flex justify-center text-slate-500">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.bg} ${card.color} p-3 rounded-2xl`}>
                <card.icon className="w-6 h-6" />
              </div>
              {card.trend && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-slate-50 ${card.trendColor}`}>
                  {card.trend}
                </span>
              )}
            </div>
            <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">{card.title}</h3>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico */}
        <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Movimentação de Estoque</h3>
              <p className="text-sm text-slate-500">Fluxo de entradas e saídas (últimos 6 meses)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="entradas" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorEntradas)" />
                <Area type="monotone" dataKey="saidas" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white p-4 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-50 p-2.5 rounded-xl text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Alertas de Estoque</h3>
          </div>
          <div className="space-y-4">
            {lowStockAlerts.slice(0, 4).map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">Mínimo: {item.stock_min} un</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-red-600">{item.stock_current}</p>
                  <p className="text-[10px] text-red-400 font-bold uppercase">
                    {Number(item.stock_current) <= 0 ? 'Esgotado' : 'Abaixo do Mín'}
                  </p>
                </div>
              </div>
            ))}
            {lowStockAlerts.length === 0 && (
              <div className="p-4 text-center text-slate-500 text-sm">
                Nenhum alerta no momento. O estoque está adequado.
              </div>
            )}
            {lowStockAlerts.length > 4 && (
              <button className="w-full mt-4 py-3 rounded-2xl bg-brand-primary/10 text-brand-primary text-sm font-bold hover:bg-brand-primary hover:text-white transition-all">
                Ver Todos os {lowStockAlerts.length} Alertas
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Últimas Movimentações */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-8 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-2.5 rounded-xl text-slate-600">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Últimas Movimentações</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-y border-slate-100">
                <th className="px-8 py-4">Produto</th>
                <th className="px-8 py-4">Tipo</th>
                <th className="px-8 py-4">Quantidade</th>
                <th className="px-8 py-4">Origem/Destino</th>
                <th className="px-8 py-4 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {latestMovements.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-8 text-center text-slate-500 text-sm">
                    Nenhuma movimentação registrada ainda.
                  </td>
                </tr>
              ) : (
                latestMovements.map((move) => (
                  <tr key={move.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-900 text-sm">{move.product}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        move.type === 'entrada' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {move.type}
                      </span>
                    </td>
                    <td className="px-8 py-4 font-mono font-bold text-slate-600">{move.qty}</td>
                    <td className="px-8 py-4 text-slate-500 text-xs">{move.source}</td>
                    <td className="px-8 py-4 text-right text-slate-400 text-xs">{move.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;