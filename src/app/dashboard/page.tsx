'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  User, 
  ShieldCheck, 
  Eye, 
  MessageCircle, 
  Plus, 
  Trash2, 
  Clock, 
  DollarSign, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Loader2
} from 'lucide-react';
import { formatCrmv } from '@/lib/crmv';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [vet, setVet] = useState<any>(null);
  const [procedimentos, setProcedimentos] = useState<any[]>([]);

  // Form para novo procedimento
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('Consulta');
  const [novoPreco, setNovoPreco] = useState('');
  const [novoTempo, setNovoTempo] = useState('30');
  const [savingProc, setSavingProc] = useState(false);

  // Carrega veterinário logado (usando o primeiro como default para teste)
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/vets?includePending=true');
        const data = await res.json();
        if (data && data.length > 0) {
          const defaultVet = data[0]; // Dr. Alexandre Mendes
          setVet(defaultVet);
          setProcedimentos(defaultVet.procedimentos || []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddProcedimento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoPreco || !vet) return;

    setSavingProc(true);
    try {
      const res = await fetch('/api/dashboard/procedimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veterinarioId: vet.id,
          nome: novoNome,
          categoria: novaCategoria,
          preco: novoPreco,
          tempoMedioMinutos: novoTempo
        })
      });

      if (res.ok) {
        const item = await res.json();
        setProcedimentos([...procedimentos, item]);
        setNovoNome('');
        setNovoPreco('');
      }
    } catch (err) {
      console.error('Erro ao adicionar procedimento:', err);
    } finally {
      setSavingProc(false);
    }
  };

  const handleDeleteProcedimento = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/procedimentos?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProcedimentos(procedimentos.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Erro ao excluir procedimento:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!vet) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-sm font-bold text-slate-600">Nenhum perfil veterinário encontrado.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const endereco = vet.enderecos?.[0] || {};

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* SUB-HEADER COM DADOS DA CONTA */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                {vet.fotoPerfilUrl ? (
                  <img src={vet.fotoPerfilUrl} alt={vet.nomeCompleto} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">Vet</div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900">{vet.nomeCompleto}</h1>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#147A44] border border-emerald-200">
                    Plano {vet.plano}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {vet.nomeSocialOuClinica} • CRMV {formatCrmv(vet.crmvNumero, vet.crmvUf)}
                </p>
              </div>
            </div>

            {/* Status do CRMV */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#147A44] text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Status do Registro: {vet.crmvStatus}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DO SAAS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* CARDS DE MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#147A44] flex items-center justify-center">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Visualizações</span>
              <span className="text-2xl font-black text-slate-900">{vet.visualizacoesCount || 0}</span>
              <span className="text-[10px] text-slate-400 block">Tutores que viram seu perfil</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contatos no WhatsApp</span>
              <span className="text-2xl font-black text-slate-900">{vet.contatosWhatsappCount || 0}</span>
              <span className="text-[10px] text-slate-400 block">Cliques diretos para conversa</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Auditoria CFMV</span>
              <span className="text-sm font-black text-emerald-700 block mt-1">Verificado & Regular</span>
              <span className="text-[10px] text-slate-400 block">CRMV {vet.crmvNumero} ({vet.crmvUf})</span>
            </div>
          </div>
        </div>

        {/* GESTÃO DE PROCEDIMENTOS E PREÇOS (SAAS TABELA) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Tabela de Procedimentos e Serviços</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Defina os procedimentos que você realiza e os preços que serão exibidos no seu perfil para os tutores.
            </p>
          </div>

          {/* Form para adicionar procedimento */}
          <form onSubmit={handleAddProcedimento} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Procedimento</label>
              <input
                type="text"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Consulta Domiciliar ou Vacina V10"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria</label>
              <select
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
              >
                <option value="Consulta">Consulta</option>
                <option value="Vacinação">Vacinação</option>
                <option value="Cirurgia">Cirurgia</option>
                <option value="Exame">Exame</option>
                <option value="Emergência">Emergência</option>
                <option value="Estética">Estética</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={novoPreco}
                onChange={(e) => setNovoPreco(e.target.value)}
                placeholder="150.00"
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={savingProc}
              className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {savingProc ? 'Salvando...' : 'Adicionar'}
            </button>
          </form>

          {/* Listagem de procedimentos ativos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-2">Procedimento</th>
                  <th className="py-3 px-2">Categoria</th>
                  <th className="py-3 px-2">Duração Média</th>
                  <th className="py-3 px-2">Preço (R$)</th>
                  <th className="py-3 px-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {procedimentos.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-2 font-bold text-slate-800">{proc.nome}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                        {proc.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-slate-500">{proc.tempoMedioMinutos || 30} min</td>
                    <td className="py-3 px-2 font-black text-slate-900">
                      R$ {Number(proc.preco).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => handleDeleteProcedimento(proc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remover procedimento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* LOCALIZAÇÃO E CONTATO DO CONSULTÓRIO */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Local de Atendimento & Contato</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Endereço Principal</span>
              <p className="font-semibold text-slate-800">
                {endereco.logradouro}, {endereco.numero} {endereco.complemento || ''}<br />
                {endereco.bairro} - {endereco.cidade}/{endereco.estado}<br />
                CEP: {endereco.cep}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">WhatsApp para Consultas</span>
              <p className="font-bold text-slate-800 text-sm">
                (11) 98888-4321
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold block">Recebendo mensagens normalmente</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Raio de Atendimento Domiciliar</span>
              <p className="font-bold text-slate-800 text-sm">
                {endereco.raioKmAtendimento || 15} km ao redor da clínica
              </p>
              <span className="text-[10px] text-slate-400 block">Exibido na busca por proximidade</span>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
