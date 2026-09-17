'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  ShieldCheck, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Stethoscope, 
  Filter,
  Loader2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  MessageSquare,
  Award
} from 'lucide-react';
import { formatCrmv, getCfmvConsultaUrl } from '@/lib/crmv';

export default function AdminCrmvModerationPage() {
  const [activeTab, setActiveTab] = useState<'CRMV' | 'AVALIACOES'>('CRMV');
  const [vets, setVets] = useState<any[]>([]);
  const [avaliacoesData, setAvaliacoesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAvaliacaoId, setProcessingAvaliacaoId] = useState<string | null>(null);

  const loadVets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vets?includePending=true');
      const data = await res.json();
      if (Array.isArray(data)) {
        setVets(data);
      }
    } catch (err) {
      console.error('Erro ao listar veterinários:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAvaliacoes = async () => {
    setLoadingAvaliacoes(true);
    try {
      const res = await fetch('/api/admin/avaliacoes');
      const data = await res.json();
      if (res.ok) {
        setAvaliacoesData(data);
      }
    } catch (err) {
      console.error('Erro ao carregar avaliações no admin:', err);
    } finally {
      setLoadingAvaliacoes(false);
    }
  };

  useEffect(() => {
    loadVets();
    loadAvaliacoes();
  }, []);

  const handleUpdateStatus = async (veterinarioId: string, novoStatus: string) => {
    setProcessingId(veterinarioId);
    try {
      const res = await fetch('/api/admin/crmv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veterinarioId,
          novoStatus,
          validade: novoStatus === 'VERIFICADO' ? new Date('2027-12-31').toISOString() : undefined,
          notas: `Moderação via Painel Admin VetBra: ${novoStatus}`
        })
      });

      if (res.ok) {
        await loadVets();
      }
    } catch (err) {
      console.error('Erro ao atualizar status CRMV:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateAvaliacaoStatus = async (avaliacaoId: string, novoStatus: string) => {
    setProcessingAvaliacaoId(avaliacaoId);
    try {
      const res = await fetch('/api/admin/avaliacoes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avaliacaoId, novoStatus })
      });

      if (res.ok) {
        await loadAvaliacoes();
        await loadVets();
      }
    } catch (err) {
      console.error('Erro ao moderar avaliação:', err);
    } finally {
      setProcessingAvaliacaoId(null);
    }
  };

  const filteredVets = vets.filter(v => {
    if (statusFilter === 'TODOS') return true;
    return v.crmvStatus === statusFilter;
  });

  const totalPendentes = vets.filter(v => v.crmvStatus === 'PENDENTE').length;
  const totalVerificados = vets.filter(v => v.crmvStatus === 'VERIFICADO').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* HEADER DO BACKOFFICE */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2 border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#147A44]" /> Backoffice de Auditoria
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Controle de Cadastros e Auditoria de CRMV
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Validação de registros profissionais perante o Sistema CFMV/CRMVs e controle de procedimentos.
              </p>
            </div>

            {/* Badges de Contagem */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Pendentes</span>
                <span className="text-xl font-black text-amber-800">{totalPendentes}</span>
              </div>
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-[#147A44] uppercase tracking-wider block">Verificados</span>
                <span className="text-xl font-black text-emerald-800">{totalVerificados}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE ABAS DO ADMIN */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('CRMV')}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'CRMV'
                ? 'border-[#147A44] text-[#147A44]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoria CRMV & Cadastros</span>
            {totalPendentes > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                {totalPendentes}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AVALIACOES')}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'AVALIACOES'
                ? 'border-[#147A44] text-[#147A44]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Reputação & Avaliações (Ranking e Reclamações)</span>
            {(avaliacoesData?.ranking?.totalReclamacoes || 0) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                {avaliacoesData.ranking.totalReclamacoes} alertas
              </span>
            )}
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {activeTab === 'CRMV' && (
          <>
            {/* BARRA DE FILTROS RÁPIDOS */}
            <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Filtrar por Status:</span>
                <div className="flex gap-1.5">
                  {['TODOS', 'PENDENTE', 'VERIFICADO', 'SUSPENSO', 'REJEITADO'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        statusFilter === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <a
                href="https://siscad.cfmv.gov.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 border border-slate-200"
              >
                Abrir Portal Siscad CFMV <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>

            {/* LISTAGEM DETALHADA DOS VETERINÁRIOS */}
            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-200">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-slate-500">Carregando cadastros do PostgreSQL...</span>
              </div>
            ) : filteredVets.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
                <p className="text-sm font-bold text-slate-700">Nenhum registro encontrado para este filtro.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVets.map((vet) => {
                  const endereco = vet.enderecos?.[0] || {};
                  const procedimentosCount = vet.procedimentos?.length || 0;
                  const isPendente = vet.crmvStatus === 'PENDENTE';
                  const isVerificado = vet.crmvStatus === 'VERIFICADO';

                  return (
                    <div
                      key={vet.id}
                      className={`bg-white rounded-3xl border p-6 transition-all space-y-4 shadow-xs ${
                        isPendente ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Informações Principais */}
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {vet.fotoPerfilUrl ? (
                              <img src={vet.fotoPerfilUrl} alt={vet.nomeCompleto} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">Vet</div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">{vet.nomeCompleto}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isVerificado
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : isPendente
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                {vet.crmvStatus}
                              </span>
                            </div>

                            <p className="text-xs font-semibold text-slate-500">
                              {vet.nomeSocialOuClinica} • Plano {vet.plano}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                                CRMV {formatCrmv(vet.crmvNumero, vet.crmvUf)}
                              </span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {endereco.cidade ? `${endereco.cidade}/${endereco.estado}` : 'Endereço não informado'}
                              </span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                                {procedimentosCount} procedimentos cadastrados
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Ações de Moderação */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          
                          {/* Botão de consulta rápida no CFMV */}
                          <a
                            href={getCfmvConsultaUrl(vet.crmvNumero, vet.crmvUf)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-200"
                            title="Verificar registro no Siscad CFMV"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Checar no CFMV
                          </a>

                          {/* Botão Aprovar */}
                          <button
                            onClick={() => handleUpdateStatus(vet.id, 'VERIFICADO')}
                            disabled={processingId === vet.id || isVerificado}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isVerificado ? 'Aprovado' : 'Aprovar CRMV'}
                          </button>

                          {/* Botão Rejeitar / Suspender */}
                          <button
                            onClick={() => handleUpdateStatus(vet.id, 'REJEITADO')}
                            disabled={processingId === vet.id || vet.crmvStatus === 'REJEITADO'}
                            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rejeitar
                          </button>

                        </div>

                      </div>

                      {/* Resumo de Procedimentos e Endereço */}
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Localização & Atendimento:</span>
                          <p className="text-slate-500 leading-relaxed">
                            {endereco.logradouro ? `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}` : 'Logradouro não informado'}<br />
                            Atendimento Domiciliar: <strong>{vet.atendeDomiciliar ? 'Sim' : 'Não'}</strong> • Plantão 24h: <strong>{vet.atende24h ? 'Sim' : 'Não'}</strong>
                          </p>
                        </div>

                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Procedimentos Oferecidos:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {vet.procedimentos?.map((p: any) => (
                              <span key={p.id} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700 font-medium">
                                {p.nome} (R$ {Number(p.preco).toFixed(2)})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ABA 2: REPUTAÇÃO, RANKING & MONITORAMENTO DE RECLAMAÇÕES */}
        {activeTab === 'AVALIACOES' && (
          <div className="space-y-6">
            {/* CARDS DE RESUMO DE REPUTAÇÃO */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total de Avaliações</span>
                <span className="text-2xl font-black text-slate-900">{avaliacoesData?.ranking?.totalGeralAvaliacoes || 0}</span>
                <span className="text-[10px] text-slate-500 block">Enviadas por tutores</span>
              </div>

              <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Melhores Avaliados</span>
                <span className="text-2xl font-black text-emerald-900">{avaliacoesData?.ranking?.melhoresVets?.length || 0}</span>
                <span className="text-[10px] text-emerald-700 block">Com notas 4.0 a 5.0</span>
              </div>

              <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">Alertas de Reclamação</span>
                <span className="text-2xl font-black text-rose-900">{avaliacoesData?.ranking?.totalReclamacoes || 0}</span>
                <span className="text-[10px] text-rose-700 block">Notas 1 e 2 estrelas</span>
              </div>

              <div className="p-5 rounded-3xl bg-slate-100 border border-slate-200 shadow-xs space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Sem Avaliações</span>
                <span className="text-2xl font-black text-slate-800">{avaliacoesData?.ranking?.semAvaliacoes?.length || 0}</span>
                <span className="text-[10px] text-slate-500 block">Perfis novos na rede</span>
              </div>
            </div>

            {/* RANKING COMPARATIVO: MELHORES VS MAIS RECLAMADOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* COLUNA 1: TOP VETERINÁRIOS (QUEM ESTÁ SE SAINDO MELHOR) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#147A44] flex items-center justify-center font-bold">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Melhores Avaliados (Top Desempenho)</h3>
                      <p className="text-[11px] text-slate-500">Profissionais com maior satisfação de tutores</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {avaliacoesData?.ranking?.melhoresVets?.length || 0} destaques
                  </span>
                </div>

                {(!avaliacoesData?.ranking?.melhoresVets || avaliacoesData.ranking.melhoresVets.length === 0) ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Nenhum profissional possui avaliações positivas no momento.</p>
                ) : (
                  <div className="space-y-3">
                    {avaliacoesData.ranking.melhoresVets.map((v: any, index: number) => (
                      <div key={v.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            index === 0 ? 'bg-amber-400 text-amber-950 shadow-xs' : index === 1 ? 'bg-slate-300 text-slate-900' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{v.nomeCompleto}</h4>
                            <p className="text-[10px] text-slate-500 truncate">
                              CRMV {formatCrmv(v.crmvNumero, v.crmvUf)} • {v.totalAvaliacoes} avaliações
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="flex items-center text-amber-500 font-black text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                            <span>{v.mediaNota?.toFixed(1)}</span>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-bold block">
                            {v.positivas} elogios ({v.estrelas5}★ / {v.estrelas4}★)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COLUNA 2: ALERTA DE RECLAMAÇÕES (MAIS CRÍTICOS / PROBLEMAS) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                      <ThumbsDown className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Alerta de Reclamações & Críticas</h3>
                      <p className="text-[11px] text-slate-500">Profissionais com notas 1★ ou 2★ registradas</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    {avaliacoesData?.ranking?.maisReclamados?.length || 0} sob alerta
                  </span>
                </div>

                {(!avaliacoesData?.ranking?.maisReclamados || avaliacoesData.ranking.maisReclamados.length === 0) ? (
                  <div className="py-8 text-center space-y-1">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Zero Reclamações Registradas</p>
                    <p className="text-[11px] text-slate-400">Todos os profissionais avaliados possuem boa reputação.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {avaliacoesData.ranking.maisReclamados.map((v: any) => (
                      <div key={v.id} className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{v.nomeCompleto}</h4>
                          <p className="text-[10px] text-slate-600 truncate">
                            CRMV {formatCrmv(v.crmvNumero, v.crmvUf)} • Média: <strong>{v.mediaNota?.toFixed(1) || '0.0'}★</strong>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg block">
                            {v.reclamacoes} {v.reclamacoes === 1 ? 'reclamação' : 'reclamações'}
                          </span>
                          <span className="text-[10px] text-rose-600 block mt-0.5">
                            ({v.estrelas1} de 1★ • {v.estrelas2} de 2★)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* MESA DE MODERAÇÃO DE AVALIAÇÕES */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">Mesa de Moderação de Avaliações</h3>
                  <p className="text-xs text-slate-500">Auditoria completa dos depoimentos postados por tutores</p>
                </div>
                <button
                  type="button"
                  onClick={loadAvaliacoes}
                  disabled={loadingAvaliacoes}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Loader2 className={`w-3.5 h-3.5 ${loadingAvaliacoes ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>
              </div>

              {(!avaliacoesData?.avaliacoes || avaliacoesData.avaliacoes.length === 0) ? (
                <p className="text-xs text-slate-400 py-8 text-center">Nenhuma avaliação registrada ainda.</p>
              ) : (
                <div className="space-y-4">
                  {avaliacoesData.avaliacoes.map((av: any) => {
                    const isRejeitada = av.status === 'REJEITADA';
                    const isPublicada = av.status === 'PUBLICADA';
                    const isPendente = av.status === 'PENDENTE_MODERACAO';

                    return (
                      <div key={av.id} className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        isRejeitada ? 'bg-slate-100/60 border-slate-200 opacity-60' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                              {av.veterinario?.fotoPerfilUrl ? (
                                <img src={av.veterinario.fotoPerfilUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">Vet</div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900">
                                  Tutor: {av.nomeTutor}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isPublicada ? 'bg-emerald-100 text-emerald-800' : isPendente ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {av.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Para: <strong>{av.veterinario?.nomeCompleto}</strong> (CRMV {formatCrmv(av.veterinario?.crmvNumero, av.veterinario?.crmvUf)})
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center text-amber-500 font-black text-xs bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                              <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                              <span>{av.nota}.0</span>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex gap-1.5">
                              {av.status !== 'PUBLICADA' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAvaliacaoStatus(av.id, 'PUBLICADA')}
                                  disabled={processingAvaliacaoId === av.id}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Aprovar
                                </button>
                              )}

                              {av.status !== 'REJEITADA' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateAvaliacaoStatus(av.id, 'REJEITADA')}
                                  disabled={processingAvaliacaoId === av.id}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                  Rejeitar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Dados do atendimento */}
                        {(av.dataAtendimento || av.horaAtendimento) && (
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 bg-white/80 p-2 rounded-xl border border-slate-200/60">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            <span>
                              Data informada do atendimento: <strong>{av.dataAtendimento ? new Date(av.dataAtendimento).toLocaleDateString('pt-BR') : 'Não especificada'}</strong>
                              {av.horaAtendimento ? ` às ${av.horaAtendimento}` : ''}
                            </span>
                          </div>
                        )}

                        {/* Comentário (até 1024 caracteres) */}
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                          {av.comentario}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
