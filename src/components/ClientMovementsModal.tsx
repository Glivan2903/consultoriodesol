import React, { useMemo } from 'react';
import { History, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import Modal from './Modal';
import { useMovements } from '../hooks/useMovements';
import { Client } from '../hooks/useClients';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
}

export default function ClientMovementsModal({ isOpen, onClose, client }: Props) {
  const { movements, loading } = useMovements();

  const filteredMovements = useMemo(() => {
    if (!client) return [];
    // O sistema registra origin_destination com o prefixo "Cliente: " na página Outgoing.tsx
    return movements.filter(m => 
      (m.origin_destination === client.name || m.origin_destination === `Cliente: ${client.name}`) && m.type === 'saida'
    );
  }, [movements, client]);

  if (!client) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Histórico de Saídas - ${client.name}`}
      size="lg"
    >
      <div className="flex flex-col h-[60vh] max-h-[600px]">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-4 shrink-0 border-b border-slate-100 pb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-600" /> Histórico de Compras (Saídas)
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full">
            {filteredMovements.length} {filteredMovements.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)
            ) : filteredMovements.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 py-12">
                <History className="w-12 h-12 mb-2 stroke-1" />
                <p>Nenhuma saída de produto registrada para este paciente.</p>
              </div>
            ) : filteredMovements.map(m => (
              <div 
                key={m.id} 
                className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-lg">
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase">Saída</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">{m.product?.name}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                    {m.notes && <span className="text-xs text-slate-500 mt-1">{m.notes}</span>}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-black text-amber-600">
                    -{m.quantity} <span className="text-xs uppercase">{m.product?.unit}</span>
                  </p>
                  <p className="text-xs font-bold text-slate-400">
                    {m.value_unit > 0 ? `R$ ${(m.value_unit * m.quantity).toFixed(2)}` : 'S/ Valor'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
