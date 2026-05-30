import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Client } from '../../hooks/useClients';
import { User, MapPin } from 'lucide-react';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSave: (clientData: any) => Promise<void>;
}

export default function ClientModal({ isOpen, onClose, client, onSave }: ClientModalProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'address'>('personal');
  const [formData, setFormData] = useState({
    name: '', tax_id: '', phone: '', email: '', address: '', zip_code: '',
    street: '', number: '', neighborhood: '', state: '', notes: '',
    birth_date: '', age: '', profession: '', city: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('personal');
      if (client) {
        setFormData({
          name: client.name, tax_id: client.tax_id || '', phone: client.phone || '',
          email: client.email || '', address: client.address || '', zip_code: client.zip_code || '',
          street: client.street || '', number: client.number || '', neighborhood: client.neighborhood || '',
          state: client.state || '', notes: client.notes || '', birth_date: client.birth_date || '',
          age: client.age || '', profession: client.profession || '', city: client.city || ''
        });
      } else {
        setFormData({
          name: '', tax_id: '', phone: '', email: '', address: '', zip_code: '',
          street: '', number: '', neighborhood: '', state: '', notes: '',
          birth_date: '', age: '', profession: '', city: ''
        });
      }
    }
  }, [isOpen, client]);

  const handleBirthDateChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;

    let age = formData.age;
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

    setFormData({ ...formData, birth_date: formatted, age });
  };

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, zip_code: cleanCep }));

    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
          setTimeout(() => document.getElementById('numero-input')?.focus(), 100);
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? 'Editar Paciente' : 'Novo Paciente'}
      size="xl"
    >
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'personal'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <User className="w-4 h-4" /> Dados Pessoais
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('address')}
          className={`flex-1 min-w-[150px] py-2.5 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'address'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <MapPin className="w-4 h-4" /> Endereço
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className={activeTab === 'personal' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              containerClassName="md:col-span-2"
              label="Nome Completo *"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="CPF / CNPJ"
              placeholder="000.000.000-00"
              value={formData.tax_id}
              onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
            />
            <Input
              label="Telefone"
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              containerClassName="md:col-span-2"
              label="E-mail"
              type="email"
              placeholder="exemplo@email.com"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Data de Nascimento"
              placeholder="DD/MM/AAAA"
              value={formData.birth_date}
              onChange={e => handleBirthDateChange(e.target.value)}
            />
            <Input
              label="Idade"
              placeholder="Ex: 25 anos"
              value={formData.age}
              onChange={e => setFormData({ ...formData, age: e.target.value })}
            />
            <Input
              containerClassName="md:col-span-2"
              label="Profissão"
              value={formData.profession}
              onChange={e => setFormData({ ...formData, profession: e.target.value })}
            />
          </div>
        </div>

        <div className={activeTab === 'address' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="CEP"
              placeholder="00000-000"
              maxLength={9}
              value={formData.zip_code}
              onChange={e => handleCepSearch(e.target.value)}
            />
            <Input
              containerClassName="md:col-span-2"
              label="Rua"
              value={formData.street}
              onChange={e => setFormData({ ...formData, street: e.target.value })}
            />
            <Input
              id="numero-input"
              label="Número"
              value={formData.number}
              onChange={e => setFormData({ ...formData, number: e.target.value })}
            />
            <Input
              label="Bairro"
              value={formData.neighborhood}
              onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
            />
            <Input
              label="Cidade"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Estado"
              placeholder="UF"
              maxLength={2}
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              containerClassName="md:col-span-2"
              label="Complemento"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 ml-1">Observações Internas</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm text-slate-700 shadow-sm resize-none hover:border-slate-300"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-100">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting} className="flex-[2]">
            Salvar Paciente
          </Button>
        </div>
      </form>
    </Modal>
  );
}
