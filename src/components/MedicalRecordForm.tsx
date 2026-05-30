import React, { useState } from 'react';
import { MedicalRecord } from '../hooks/useMedicalRecords';
import { Client } from '../hooks/useClients';
import { useSettings } from '../hooks/useSettings';
import { clsx } from 'clsx';
import { Save, Printer } from 'lucide-react';

interface Props {
  initialData?: Partial<MedicalRecord>;
  client?: Client;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function MedicalRecordForm({ initialData, client, onSave, onCancel }: Props) {
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    queixa_principal: initialData?.queixa_principal || '',
    objetivo: initialData?.objetivo || '',
    habitos: initialData?.habitos || {
      intestino: { status: '', frequencia: '', obs: '' },
      alimentacao: { cafe: '', almoco: '', jantar: '', consumo: [] },
      hidratacao: '',
      sono: '',
      atividade_fisica: '',
      deambulacao: ''
    },
    checklist_clinico: initialData?.checklist_clinico || [],
    alergias: initialData?.alergias || '',
    avaliacao_emocional: initialData?.avaliacao_emocional || [],
    avaliacao_feridas: initialData?.avaliacao_feridas || {
      tipo: '', tecido: '', exsudato: '', dor: '', bordas: '', odor: '', desbridamento: false
    },
    plano_terapeutico: initialData?.plano_terapeutico || [],
    conduta: initialData?.conduta || '',
    sinais_vitais: initialData?.sinais_vitais || {
      pa: '', fc: '', fr: '', temp: '', spo2: '', obs: ''
    },
    evolucao: initialData?.evolucao || '',
    informacoes_adicionais: initialData?.informacoes_adicionais || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleChecklist = (item: string) => {
    setFormData(prev => ({
      ...prev,
      checklist_clinico: prev.checklist_clinico.includes(item)
        ? prev.checklist_clinico.filter(i => i !== item)
        : [...prev.checklist_clinico, item]
    }));
  };

  const toggleEmotional = (item: string) => {
    setFormData(prev => ({
      ...prev,
      avaliacao_emocional: prev.avaliacao_emocional.includes(item)
        ? prev.avaliacao_emocional.filter(i => i !== item)
        : [...prev.avaliacao_emocional, item]
    }));
  };

  const toggleConsumo = (item: string) => {
    setFormData(prev => ({
      ...prev,
      habitos: {
        ...prev.habitos,
        alimentacao: {
          ...prev.habitos.alimentacao,
          consumo: prev.habitos.alimentacao.consumo.includes(item)
            ? prev.habitos.alimentacao.consumo.filter(i => i !== item)
            : [...prev.habitos.alimentacao.consumo, item]
        }
      }
    }));
  };

  const SectionTitle = ({ number, title }: { number: string, title: string }) => (
    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest border-b-2 border-slate-800 pb-2 mb-6 mt-12 flex gap-2 print:text-xs print:mt-6 print:mb-4">
      <span>{number}.</span> {title}
    </h2>
  );

  const SubTitle = ({ title }: { title: string }) => (
    <h3 className="text-xs font-bold text-slate-600 uppercase mb-3 print:mb-1">{title}</h3>
  );

  const InputField = ({ label, value, onChange, type = "text" }: any) => (
    <div className="flex items-end gap-2 flex-1">
      <span className="text-sm font-bold text-slate-700 whitespace-nowrap print:text-[11px]">{label}:</span>
      <input 
        type={type}
        className="flex-1 border-b border-slate-300 focus:border-slate-800 outline-none bg-transparent px-1 pb-1 text-sm text-slate-900 print:text-[11px] print:border-slate-400 print:pb-0"
        value={value}
        onChange={onChange}
      />
    </div>
  );

  const CheckboxItem = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 print:text-[11px]">
      <input type="checkbox" className="hidden print:block print:w-3 print:h-3" checked={checked} onChange={onChange} />
      <div className={clsx(
        "w-4 h-4 border border-slate-400 flex items-center justify-center transition-colors shrink-0 print:hidden",
        checked ? "bg-slate-800 border-slate-800" : "bg-transparent"
      )}>
        {checked && <div className="w-2 h-2 bg-white shrink-0" />}
      </div>
      <span className="select-none">{label}</span>
    </label>
  );

  return (
    <div className="flex flex-col h-full bg-slate-100 p-2 sm:p-6 overflow-y-auto custom-scrollbar print:bg-white print:p-0 print:overflow-visible">
      {/* Paper Sheet */}
      <form id="medical-record-form" onSubmit={handleSubmit} className="bg-white max-w-4xl w-full mx-auto shadow-2xl border border-slate-200 p-4 md:p-14 mb-20 font-sans print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
        
        {/* Header */}
        <div className="text-center pb-6 mb-8 print:pb-4 print:mb-4">
          <h1 className="text-lg md:text-xl font-bold text-slate-900 uppercase">
            {settings?.clinic_name || 'NOME DA CLÍNICA'}
          </h1>
          <p className="text-xs md:text-sm font-bold text-slate-800 mt-1">
            {settings?.address || 'Endereço da clínica'}
          </p>
          <p className="text-xs md:text-sm font-bold text-slate-800">
            {settings?.phone || 'Telefone'} | {settings?.instagram || 'Instagram'} | <span className="text-blue-800 underline">{settings?.email || 'email@exemplo.com'}</span>
          </p>
          
          <h2 className="text-left text-lg font-normal text-slate-900 mt-4 md:mt-10 print:mt-6">PRONTUÁRIO</h2>
          <div className="flex items-end gap-2 mt-2 print:mt-1 text-left">
            <span className="text-sm font-bold text-slate-800 whitespace-nowrap print:text-[10px]">Data de admissão:</span>
            <input 
              type="date"
              className="w-32 md:w-auto border-b border-slate-400 outline-none bg-transparent px-1 text-sm text-slate-900 font-bold print:text-[10px] print:pb-0"
              value={formData.date}
              onChange={(e: any) => setFormData({...formData, date: e.target.value})}
            />
          </div>
        </div>

        {/* 1. IDENTIFICAÇÃO DO PACIENTE */}
        <div className="print:break-inside-avoid">
          <h2 className="text-base md:text-lg font-bold text-slate-900 uppercase border-b-0 pb-2 mb-4 mt-8 flex gap-2 print:mt-2 print:mb-1 print:pb-0 print:text-sm">
            <span>1.</span> IDENTIFICAÇÃO DO PACIENTE
          </h2>
          <div className="flex flex-col gap-4 mb-8 print:gap-1 print:mb-2">
            <div className="flex flex-col md:flex-row print:flex-row gap-4 print:gap-2">
              <div className="flex items-end gap-2 flex-[2]">
                <span className="text-sm font-bold text-slate-800 print:text-[10px]">Nome:</span>
                <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.name || ''}</div>
              </div>
              <div className="flex items-end gap-2 flex-1">
                <span className="text-sm font-bold text-slate-800 whitespace-nowrap print:text-[10px]">Data nasc:</span>
                <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.birth_date || '____/____/____'}</div>
              </div>
              <div className="flex items-end gap-2 flex-[0.5]">
                <span className="text-sm font-bold text-slate-800 print:text-[10px]">Idade:</span>
                <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.age || ''}</div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row print:flex-row gap-4 mt-2 print:mt-0 print:gap-2">
              <div className="flex items-end gap-2 flex-1">
                <span className="text-sm font-bold text-slate-800 print:text-[10px]">CPF:</span>
                <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.tax_id || ''}</div>
              </div>
              <div className="flex items-end gap-2 flex-1">
                <span className="text-sm font-bold text-slate-800 print:text-[10px]">Profissão:</span>
                <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.profession || ''}</div>
              </div>
              <div className="flex items-end gap-2 flex-1">
                <span className="text-sm font-bold text-slate-800 print:text-[10px]">Telefone:</span>
                <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.phone || ''}</div>
              </div>
            </div>

            {client?.street || client?.zip_code ? (
              <>
                <div className="flex flex-col md:flex-row print:flex-row gap-4 mt-2 print:mt-0 print:gap-2">
                  <div className="flex items-end gap-2 flex-[2]">
                    <span className="text-sm font-bold text-slate-800 print:text-[10px]">Rua:</span>
                    <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.street || ''}</div>
                  </div>
                  <div className="flex items-end gap-2 flex-1">
                    <span className="text-sm font-bold text-slate-800 print:text-[10px]">Nº:</span>
                    <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.number || ''}</div>
                  </div>
                  <div className="flex items-end gap-2 flex-1">
                    <span className="text-sm font-bold text-slate-800 print:text-[10px]">CEP:</span>
                    <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.zip_code || ''}</div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row print:flex-row gap-4 mt-2 print:mt-0 print:gap-2">
                  <div className="flex items-end gap-2 flex-[1.5]">
                    <span className="text-sm font-bold text-slate-800 print:text-[10px]">Bairro:</span>
                    <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.neighborhood || ''}</div>
                  </div>
                  <div className="flex items-end gap-2 flex-[1.5]">
                    <span className="text-sm font-bold text-slate-800 print:text-[10px]">Cidade:</span>
                    <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.city || ''}</div>
                  </div>
                  <div className="flex items-end gap-2 flex-1">
                    <span className="text-sm font-bold text-slate-800 print:text-[10px]">Estado:</span>
                    <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">{client?.state || ''}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col md:flex-row print:flex-row gap-4 mt-2 print:mt-0 print:gap-2">
                <div className="flex items-end gap-2 flex-1">
                  <span className="text-sm font-bold text-slate-800 whitespace-nowrap print:text-[10px]">Endereço:</span>
                  <div className="flex-1 border-b border-slate-400 pb-1 px-2 text-sm text-slate-900 print:text-[10px] print:pb-0">
                    {[client?.address, client?.city].filter(Boolean).join(', ')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 2. QUEIXA PRINCIPAL E OBJETIVO DO PACIENTE */}
        <div className="print:break-inside-avoid">
          <SectionTitle number="2" title="QUEIXA PRINCIPAL E OBJETIVO DO PACIENTE" />
          <div className="space-y-6 mb-8 print:space-y-3 print:mb-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 print:text-[11px]">Queixa Principal:</label>
              <textarea 
                rows={3}
                className="w-full border border-slate-300 bg-slate-50/50 p-3 text-sm outline-none focus:border-slate-800 transition-colors print:bg-transparent print:border-slate-400 print:text-[11px] print:p-2"
                value={formData.queixa_principal}
                onChange={e => setFormData({...formData, queixa_principal: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 print:text-[11px]">Objetivo do Paciente:</label>
              <textarea 
                rows={3}
                className="w-full border border-slate-300 bg-slate-50/50 p-3 text-sm outline-none focus:border-slate-800 transition-colors print:bg-transparent print:border-slate-400 print:text-[11px] print:p-2"
                value={formData.objetivo}
                onChange={e => setFormData({...formData, objetivo: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* 3. AVALIAÇÃO INTEGRATIVA – SISTEMAS E HÁBITOS */}
        <SectionTitle number="3" title="AVALIAÇÃO INTEGRATIVA – SISTEMAS E HÁBITOS" />
        <div className="space-y-8 mb-8 print:space-y-2 print:mb-4 print:text-[11px]">
          
          <div className="p-4 border border-slate-200 bg-slate-50/30 print:p-2 print:border-slate-400 print:bg-transparent print:break-inside-avoid">
            <SubTitle title="INTESTINO" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
              <div className="space-y-2 print:space-y-1">
                <CheckboxItem label="Evacua diariamente" checked={formData.habitos.intestino.status === 'diariamente'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, intestino: {...formData.habitos.intestino, status: 'diariamente'}}})} />
                <CheckboxItem label="Constipado" checked={formData.habitos.intestino.status === 'constipado'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, intestino: {...formData.habitos.intestino, status: 'constipado'}}})} />
                <CheckboxItem label="Diarreia" checked={formData.habitos.intestino.status === 'diarreia'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, intestino: {...formData.habitos.intestino, status: 'diarreia'}}})} />
                <CheckboxItem label="Uso de laxantes" checked={formData.habitos.intestino.status === 'laxantes'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, intestino: {...formData.habitos.intestino, status: 'laxantes'}}})} />
              </div>
              <div className="space-y-2 border-l border-slate-200 pl-4 print:space-y-1 print:border-slate-400">
                <p className="text-xs font-bold text-slate-500 mb-2 print:mb-1 print:text-[10px]">Frequência:</p>
                <CheckboxItem label="1x/dia" checked={formData.habitos.intestino.frequencia === '1x'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, intestino: {...formData.habitos.intestino, frequencia: '1x'}}})} />
                <CheckboxItem label="2x/dia" checked={formData.habitos.intestino.frequencia === '2x'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, intestino: {...formData.habitos.intestino, frequencia: '2x'}}})} />
                <CheckboxItem label="Dias alternados" checked={formData.habitos.intestino.frequencia === 'alternados'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, intestino: {...formData.habitos.intestino, frequencia: 'alternados'}}})} />
                <CheckboxItem label=">3 dias sem evacuar" checked={formData.habitos.intestino.frequencia === '>3dias'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, intestino: {...formData.habitos.intestino, frequencia: '>3dias'}}})} />
              </div>
            </div>
            <div className="mt-4 print:mt-2">
              <InputField label="Outras observações abdominais (Dor/Distensão)" value={formData.habitos.intestino.obs} onChange={(e: any) => setFormData({...formData, habitos: {...formData.habitos, intestino: {...formData.habitos.intestino, obs: e.target.value}}})} />
            </div>
          </div>

          <div className="p-4 border border-slate-200 bg-slate-50/30 print:p-2 print:border-slate-400 print:bg-transparent print:break-inside-avoid">
            <SubTitle title="ALIMENTAÇÃO" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4 print:grid-cols-3 print:gap-2 print:mb-2">
              <div className="print:space-y-1">
                <p className="text-xs font-bold text-slate-500 mb-2 print:mb-1 print:text-[10px]">CAFÉ DA MANHÃ:</p>
                <CheckboxItem label="Regular" checked={formData.habitos.alimentacao.cafe === 'regular'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, alimentacao: {...formData.habitos.alimentacao, cafe: 'regular'}}})} />
                <CheckboxItem label="Irregular" checked={formData.habitos.alimentacao.cafe === 'irregular'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, alimentacao: {...formData.habitos.alimentacao, cafe: 'irregular'}}})} />
                <CheckboxItem label="Inexistente" checked={formData.habitos.alimentacao.cafe === 'inexistente'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, alimentacao: {...formData.habitos.alimentacao, cafe: 'inexistente'}}})} />
              </div>
              <div className="print:space-y-1">
                <p className="text-xs font-bold text-slate-500 mb-2 print:mb-1 print:text-[10px]">ALMOÇO:</p>
                <CheckboxItem label="Regular" checked={formData.habitos.alimentacao.almoco === 'regular'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, alimentacao: {...formData.habitos.alimentacao, almoco: 'regular'}}})} />
                <CheckboxItem label="Irregular" checked={formData.habitos.alimentacao.almoco === 'irregular'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, alimentacao: {...formData.habitos.alimentacao, almoco: 'irregular'}}})} />
                <CheckboxItem label="Inadequado" checked={formData.habitos.alimentacao.almoco === 'inadequado'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, alimentacao: {...formData.habitos.alimentacao, almoco: 'inadequado'}}})} />
              </div>
              <div className="print:space-y-1">
                <p className="text-xs font-bold text-slate-500 mb-2 print:mb-1 print:text-[10px]">JANTAR:</p>
                <CheckboxItem label="Regular" checked={formData.habitos.alimentacao.jantar === 'regular'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, alimentacao: {...formData.habitos.alimentacao, jantar: 'regular'}}})} />
                <CheckboxItem label="Irregular" checked={formData.habitos.alimentacao.jantar === 'irregular'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, alimentacao: {...formData.habitos.alimentacao, jantar: 'irregular'}}})} />
                <CheckboxItem label="Inadequado" checked={formData.habitos.alimentacao.jantar === 'inadequado'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, alimentacao: {...formData.habitos.alimentacao, jantar: 'inadequado'}}})} />
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 print:border-slate-400 print:pt-2">
              <p className="text-xs font-bold text-slate-500 mb-2 print:mb-1 print:text-[10px]">Consumo de:</p>
              <div className="flex flex-wrap gap-4 print:gap-2">
                {['Proteína', 'Verduras', 'Frutas', 'Ultraprocessados', 'Açúcar excessivo'].map(item => (
                  <CheckboxItem key={item} label={item} checked={formData.habitos.alimentacao.consumo.includes(item)} onChange={() => toggleConsumo(item)} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-2">
            <div className="p-4 border border-slate-200 bg-slate-50/30 print:p-2 print:border-slate-400 print:bg-transparent print:break-inside-avoid">
              <SubTitle title="INGESTÃO HÍDRICA" />
              <div className="space-y-2 print:space-y-1">
                <CheckboxItem label="< 1L" checked={formData.habitos.hidratacao === '<1L'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, hidratacao: '<1L'}})} />
                <CheckboxItem label="1–2L" checked={formData.habitos.hidratacao === '1-2L'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, hidratacao: '1-2L'}})} />
                <CheckboxItem label="> 2L" checked={formData.habitos.hidratacao === '>2L'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, hidratacao: '>2L'}})} />
                <CheckboxItem label="Não sabe informar" checked={formData.habitos.hidratacao === 'nao_sabe'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, hidratacao: 'nao_sabe'}})} />
              </div>
            </div>
            
            <div className="p-4 border border-slate-200 bg-slate-50/30 print:p-2 print:border-slate-400 print:bg-transparent print:break-inside-avoid">
              <SubTitle title="SONO" />
              <div className="space-y-2 print:space-y-1">
                <CheckboxItem label="Satisfatório" checked={formData.habitos.sono === 'satisfatorio'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, sono: 'satisfatorio'}})} />
                <CheckboxItem label="Insatisfatório" checked={formData.habitos.sono === 'insatisfatorio'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, sono: 'insatisfatorio'}})} />
                <CheckboxItem label="Insônia" checked={formData.habitos.sono === 'insonia'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, sono: 'insonia'}})} />
                <CheckboxItem label="Sono interrompido" checked={formData.habitos.sono === 'interrompido'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, sono: 'interrompido'}})} />
                <CheckboxItem label="Uso de medicação para dormir" checked={formData.habitos.sono === 'medicacao'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, sono: 'medicacao'}})} />
              </div>
            </div>

            <div className="p-4 border border-slate-200 bg-slate-50/30 print:p-2 print:border-slate-400 print:bg-transparent print:break-inside-avoid">
              <SubTitle title="ATIVIDADE FÍSICA" />
              <div className="space-y-2 print:space-y-1">
                <CheckboxItem label="Sedentário" checked={formData.habitos.atividade_fisica === 'sedentario'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, atividade_fisica: 'sedentario'}})} />
                <CheckboxItem label="Caminhadas" checked={formData.habitos.atividade_fisica === 'caminhadas'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, atividade_fisica: 'caminhadas'}})} />
                <CheckboxItem label="Exercícios regulares" checked={formData.habitos.atividade_fisica === 'regular'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, atividade_fisica: 'regular'}})} />
                <CheckboxItem label="Restrição de mobilidade" checked={formData.habitos.atividade_fisica === 'restricao'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, atividade_fisica: 'restricao'}})} />
              </div>
            </div>

            <div className="p-4 border border-slate-200 bg-slate-50/30 print:p-2 print:border-slate-400 print:bg-transparent print:break-inside-avoid">
              <SubTitle title="DEAMBULAÇÃO" />
              <div className="space-y-2 print:space-y-1">
                <CheckboxItem label="Independente" checked={formData.habitos.deambulacao === 'independente'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, deambulacao: 'independente'}})} />
                <CheckboxItem label="Com auxílio" checked={formData.habitos.deambulacao === 'auxilio'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, deambulacao: 'auxilio'}})} />
                <CheckboxItem label="Não deambula" checked={formData.habitos.deambulacao === 'nao'} onChange={() => setFormData({...formData, habitos: {...formData.habitos, deambulacao: 'nao'}})} />
              </div>
            </div>
          </div>
        </div>

        {/* 4. CHECKLIST CLÍNICO */}
        <div className="print:break-inside-avoid">
          <SectionTitle number="4" title="CHECKLIST CLÍNICO" />
          <div className="p-4 border border-slate-200 bg-slate-50/30 mb-8 print:p-2 print:border-slate-400 print:bg-transparent print:mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 print:grid-cols-3 print:gap-y-1 print:gap-x-2">
              <CheckboxItem label="Diabetes" checked={formData.checklist_clinico.includes('Diabetes')} onChange={() => toggleChecklist('Diabetes')} />
              <CheckboxItem label="Diabetes Controlada" checked={formData.checklist_clinico.includes('Diabetes Controlada')} onChange={() => toggleChecklist('Diabetes Controlada')} />
              <CheckboxItem label="HAS" checked={formData.checklist_clinico.includes('HAS')} onChange={() => toggleChecklist('HAS')} />
              <CheckboxItem label="HAS Controlada" checked={formData.checklist_clinico.includes('HAS Controlada')} onChange={() => toggleChecklist('HAS Controlada')} />
              <CheckboxItem label="Doença cardiovascular" checked={formData.checklist_clinico.includes('Doença cardiovascular')} onChange={() => toggleChecklist('Doença cardiovascular')} />
              <CheckboxItem label="Doença vascular" checked={formData.checklist_clinico.includes('Doença vascular')} onChange={() => toggleChecklist('Doença vascular')} />
              <CheckboxItem label="Obesidade" checked={formData.checklist_clinico.includes('Obesidade')} onChange={() => toggleChecklist('Obesidade')} />
              <CheckboxItem label="Insuficiência renal" checked={formData.checklist_clinico.includes('Insuficiência renal')} onChange={() => toggleChecklist('Insuficiência renal')} />
              <CheckboxItem label="Insuficiência Hepática" checked={formData.checklist_clinico.includes('Insuficiência Hepática')} onChange={() => toggleChecklist('Insuficiência Hepática')} />
              <CheckboxItem label="Neoplasia" checked={formData.checklist_clinico.includes('Neoplasia')} onChange={() => toggleChecklist('Neoplasia')} />
              <CheckboxItem label="Tabagismo" checked={formData.checklist_clinico.includes('Tabagismo')} onChange={() => toggleChecklist('Tabagismo')} />
              <CheckboxItem label="Etilismo" checked={formData.checklist_clinico.includes('Etilismo')} onChange={() => toggleChecklist('Etilismo')} />
              <CheckboxItem label="Uso crônico de medicamentos" checked={formData.checklist_clinico.includes('Uso crônico de medicamentos')} onChange={() => toggleChecklist('Uso crônico de medicamentos')} />
              <CheckboxItem label="Histórico de feridas" checked={formData.checklist_clinico.includes('Histórico de feridas')} onChange={() => toggleChecklist('Histórico de feridas')} />
            </div>
            <div className="mt-6 border-t border-slate-200 pt-4 print:mt-2 print:pt-2 print:border-slate-400">
              <InputField label="Alergias (Não / Sim, quais?)" value={formData.alergias} onChange={(e: any) => setFormData({...formData, alergias: e.target.value})} />
            </div>
          </div>
        </div>

        {/* 5. AVALIAÇÃO EMOCIONAL */}
        <div className="print:break-inside-avoid">
          <SectionTitle number="5" title="AVALIAÇÃO EMOCIONAL, SISTÊMICA E ESPIRITUAL" />
          <div className="p-4 border border-slate-200 bg-slate-50/30 mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 print:p-2 print:border-slate-400 print:bg-transparent print:mb-4 print:grid-cols-3 print:gap-y-1 print:gap-x-2">
            {[
              'Ansiedade', 'Tristeza', 'Medo', 'Culpa', 'Raiva', 'Sentimento de impotência',
              'Baixa autoestima', 'Autossabotagem', 'Falta de esperança', 'Crenças limitantes',
              'Conflitos familiares', 'Sobrecarga emocional', 'Luto', 'Traumas',
              'Abertura à espiritualidade', 'Resistência', 'Em busca de sentido',
              'Padrões repetitivos percebidos', 'Lealdades familiares'
            ].map(item => (
              <CheckboxItem key={item} label={item} checked={formData.avaliacao_emocional.includes(item)} onChange={() => toggleEmotional(item)} />
            ))}
          </div>
        </div>

        {/* 6. AVALIAÇÃO DE FERIDAS */}
        <div className="print:break-inside-avoid">
          <SectionTitle number="6" title="AVALIAÇÃO DE FERIDAS (quando aplicável)" />
          <div className="p-4 border border-slate-200 bg-slate-50/30 mb-8 space-y-6 print:p-2 print:border-slate-400 print:bg-transparent print:mb-4 print:space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase print:mb-0 print:text-[10px]">Tipo:</p>
                <select className="w-full border-b border-slate-300 bg-transparent py-1 text-sm outline-none focus:border-slate-800 print:text-[11px] print:border-slate-400 print:py-0" value={formData.avaliacao_feridas.tipo} onChange={e => setFormData({...formData, avaliacao_feridas: {...formData.avaliacao_feridas, tipo: e.target.value}})}>
                  <option value="">Selecione</option>
                  <option value="Lesão por pressão">Lesão por pressão</option>
                  <option value="Pé diabético">Pé diabético</option>
                  <option value="Úlcera venosa">Úlcera venosa</option>
                  <option value="Arterial">Arterial</option>
                  <option value="Mista">Mista</option>
                  <option value="Traumática">Traumática</option>
                  <option value="Operatória">Operatória</option>
                </select>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase print:mb-0 print:text-[10px]">Tecido:</p>
                <select className="w-full border-b border-slate-300 bg-transparent py-1 text-sm outline-none focus:border-slate-800 print:text-[11px] print:border-slate-400 print:py-0" value={formData.avaliacao_feridas.tecido} onChange={e => setFormData({...formData, avaliacao_feridas: {...formData.avaliacao_feridas, tecido: e.target.value}})}>
                  <option value="">Selecione</option>
                  <option value="Necrose">Necrose</option>
                  <option value="Esfacelo">Esfacelo</option>
                  <option value="Granulação">Granulação</option>
                  <option value="Epitelização">Epitelização</option>
                  <option value="Fibrina">Fibrina</option>
                </select>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase print:mb-0 print:text-[10px]">Exsudato:</p>
                <select className="w-full border-b border-slate-300 bg-transparent py-1 text-sm outline-none focus:border-slate-800 print:text-[11px] print:border-slate-400 print:py-0" value={formData.avaliacao_feridas.exsudato} onChange={e => setFormData({...formData, avaliacao_feridas: {...formData.avaliacao_feridas, exsudato: e.target.value}})}>
                  <option value="">Selecione</option>
                  <option value="Ausente">Ausente</option>
                  <option value="Seroso">Seroso</option>
                  <option value="Serossanguinolento">Serossanguinolento</option>
                  <option value="Purulento">Purulento</option>
                  <option value="Abundante">Abundante</option>
                </select>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase print:mb-0 print:text-[10px]">Dor:</p>
                <select className="w-full border-b border-slate-300 bg-transparent py-1 text-sm outline-none focus:border-slate-800 print:text-[11px] print:border-slate-400 print:py-0" value={formData.avaliacao_feridas.dor} onChange={e => setFormData({...formData, avaliacao_feridas: {...formData.avaliacao_feridas, dor: e.target.value}})}>
                  <option value="">Selecione</option>
                  <option value="Ausente">Ausente</option>
                  <option value="Leve">Leve</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Intensa">Intensa</option>
                </select>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase print:mb-0 print:text-[10px]">Bordas:</p>
                <select className="w-full border-b border-slate-300 bg-transparent py-1 text-sm outline-none focus:border-slate-800 print:text-[11px] print:border-slate-400 print:py-0" value={formData.avaliacao_feridas.bordas} onChange={e => setFormData({...formData, avaliacao_feridas: {...formData.avaliacao_feridas, bordas: e.target.value}})}>
                  <option value="">Selecione</option>
                  <option value="Íntegras">Íntegras</option>
                  <option value="Maceradas">Maceradas</option>
                  <option value="Irregulares">Irregulares</option>
                  <option value="Epitelizadas">Epitelizadas</option>
                </select>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-2 uppercase print:mb-0 print:text-[10px]">Odor:</p>
                <select className="w-full border-b border-slate-300 bg-transparent py-1 text-sm outline-none focus:border-slate-800 print:text-[11px] print:border-slate-400 print:py-0" value={formData.avaliacao_feridas.odor} onChange={e => setFormData({...formData, avaliacao_feridas: {...formData.avaliacao_feridas, odor: e.target.value}})}>
                  <option value="">Selecione</option>
                  <option value="Ausente">Ausente</option>
                  <option value="Leve">Leve</option>
                  <option value="Fétido">Fétido</option>
                </select>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-4 flex gap-4 items-center print:border-slate-400 print:pt-2">
              <span className="text-sm font-bold text-slate-700 print:text-[11px]">Necessita desbridamento?</span>
              <CheckboxItem label="Sim" checked={formData.avaliacao_feridas.desbridamento === true} onChange={() => setFormData({...formData, avaliacao_feridas: {...formData.avaliacao_feridas, desbridamento: true}})} />
              <CheckboxItem label="Não" checked={formData.avaliacao_feridas.desbridamento === false} onChange={() => setFormData({...formData, avaliacao_feridas: {...formData.avaliacao_feridas, desbridamento: false}})} />
            </div>
          </div>
        </div>

        {/* 7. PLANO TERAPÊUTICO INTEGRADO */}
        <div className="print:break-inside-avoid">
          <SectionTitle number="7" title="PLANO TERAPÊUTICO INTEGRADO" />
          <div className="p-4 border border-slate-200 bg-slate-50/30 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 print:p-2 print:border-slate-400 print:bg-transparent print:mb-4 print:grid-cols-2 print:gap-y-1 print:gap-x-2">
            {[
              'Curativos avançados', 'Suplementação', 'Ajustes alimentares', 'Protocolo integrativo',
              'Apoio emocional', 'Orientações domiciliares', 'Encaminhamentos', 'Acompanhamento contínuo'
            ].map(item => (
              <CheckboxItem 
                key={item} 
                label={item} 
                checked={formData.plano_terapeutico.includes(item)} 
                onChange={() => setFormData(prev => ({
                  ...prev,
                  plano_terapeutico: prev.plano_terapeutico.includes(item)
                    ? prev.plano_terapeutico.filter(i => i !== item)
                    : [...prev.plano_terapeutico, item]
                }))} 
              />
            ))}
          </div>
        </div>

        {/* 8. CONDUTA */}
        <div className="print:break-inside-avoid">
          <SectionTitle number="8" title="CONDUTA" />
          <div className="mb-8 print:mb-4">
            <textarea 
              rows={4}
              className="w-full border border-slate-300 bg-slate-50/50 p-4 text-sm outline-none focus:border-slate-800 print:bg-transparent print:border-slate-400 print:text-[11px] print:p-2"
              value={formData.conduta}
              onChange={e => setFormData({...formData, conduta: e.target.value})}
            />
          </div>
        </div>

        {/* 9. SINAIS VITAIS */}
        <div className="print:break-inside-avoid">
          <SectionTitle number="9" title="SINAIS VITAIS" />
          <div className="mb-8 overflow-x-auto print:mb-4 border border-slate-200 rounded-2xl md:border-none">
            <table className="w-full border-collapse border border-slate-300 text-sm text-center min-w-[600px] md:min-w-0 print:border-slate-400 print:text-[11px]">
              <thead>
                <tr className="bg-slate-100 print:bg-transparent">
                  <th className="border border-slate-300 p-2 print:border-slate-400 print:p-1">Data</th>
                  <th className="border border-slate-300 p-2 print:border-slate-400 print:p-1">PA</th>
                  <th className="border border-slate-300 p-2 print:border-slate-400 print:p-1">FC</th>
                  <th className="border border-slate-300 p-2 print:border-slate-400 print:p-1">FR</th>
                  <th className="border border-slate-300 p-2 print:border-slate-400 print:p-1">Temp</th>
                  <th className="border border-slate-300 p-2 print:border-slate-400 print:p-1">SpO2</th>
                  <th className="border border-slate-300 p-2 print:border-slate-400 print:p-1">Obs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 p-1 print:border-slate-400"><input type="date" className="w-full bg-transparent text-center outline-none print:text-[11px]" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></td>
                  <td className="border border-slate-300 p-1 print:border-slate-400"><input className="w-full bg-transparent text-center outline-none print:text-[11px]" value={formData.sinais_vitais.pa} onChange={e => setFormData({...formData, sinais_vitais: {...formData.sinais_vitais, pa: e.target.value}})} /></td>
                  <td className="border border-slate-300 p-1 print:border-slate-400"><input className="w-full bg-transparent text-center outline-none print:text-[11px]" value={formData.sinais_vitais.fc} onChange={e => setFormData({...formData, sinais_vitais: {...formData.sinais_vitais, fc: e.target.value}})} /></td>
                  <td className="border border-slate-300 p-1 print:border-slate-400"><input className="w-full bg-transparent text-center outline-none print:text-[11px]" value={formData.sinais_vitais.fr} onChange={e => setFormData({...formData, sinais_vitais: {...formData.sinais_vitais, fr: e.target.value}})} /></td>
                  <td className="border border-slate-300 p-1 print:border-slate-400"><input className="w-full bg-transparent text-center outline-none print:text-[11px]" value={formData.sinais_vitais.temp} onChange={e => setFormData({...formData, sinais_vitais: {...formData.sinais_vitais, temp: e.target.value}})} /></td>
                  <td className="border border-slate-300 p-1 print:border-slate-400"><input className="w-full bg-transparent text-center outline-none print:text-[11px]" value={formData.sinais_vitais.spo2} onChange={e => setFormData({...formData, sinais_vitais: {...formData.sinais_vitais, spo2: e.target.value}})} /></td>
                  <td className="border border-slate-300 p-1 print:border-slate-400"><input className="w-full bg-transparent text-center outline-none print:text-[11px]" value={formData.sinais_vitais.obs} onChange={e => setFormData({...formData, sinais_vitais: {...formData.sinais_vitais, obs: e.target.value}})} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 10. EVOLUÇÃO DE ENFERMAGEM */}
        <div className="print:break-inside-avoid">
          <SectionTitle number="10" title="EVOLUÇÃO DE ENFERMAGEM" />
          <div className="mb-12 print:mb-0">
            <textarea 
              rows={10}
              className="w-full border border-slate-300 bg-slate-50/50 p-4 text-sm outline-none focus:border-slate-800 print:bg-transparent print:border-slate-400 print:text-[11px] print:p-2"
              value={formData.evolucao}
              onChange={e => setFormData({...formData, evolucao: e.target.value})}
            />
          </div>
        </div>

        {/* 11. INFORMAÇÕES ADICIONAIS */}
        <div className="print:break-inside-avoid">
          <SectionTitle number="11" title="INFORMAÇÕES ADICIONAIS" />
          <div className="mb-12 print:mb-0">
            <textarea 
              rows={6}
              className="w-full border border-slate-300 bg-slate-50/50 p-4 text-sm outline-none focus:border-slate-800 print:bg-transparent print:border-slate-400 print:text-[11px] print:p-2"
              value={formData.informacoes_adicionais}
              onChange={e => setFormData({...formData, informacoes_adicionais: e.target.value})}
            />
          </div>
        </div>

      </form>

      {/* Floating Actions - Escondido na impressão */}
      <div className="sticky bottom-0 mt-auto left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex flex-wrap justify-center gap-4 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] print:hidden">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-3 font-bold text-slate-500 rounded-xl hover:bg-slate-100 transition-all border border-transparent"
        >
          Voltar
        </button>
        <button 
          type="button" 
          onClick={handlePrint}
          className="px-6 py-3 bg-white text-slate-800 border border-slate-200 font-bold rounded-xl shadow-sm flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Printer className="w-5 h-5" />
          Imprimir Prontuário
        </button>
        <button 
          type="button"
          onClick={handleSubmit}
          className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-xl flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Save className="w-5 h-5" />
          Salvar Prontuário
        </button>
      </div>

    </div>
  );
}
