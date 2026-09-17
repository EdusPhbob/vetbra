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
  Award,
  DollarSign,
  TrendingUp,
  Headphones,
  Send,
  UserX,
  UserCheck,
  Trash2,
  Eye,
  MessageCircle,
  Activity,
  Check,
  AlertCircle
} from 'lucide-react';
import { formatCrmv, getCfmvConsultaUrl } from '@/lib/crmv';

export default function AdminCrmvModerationPage() {
  const [activeTab, setActiveTab] = useState<'CRMV' | 'AVALIACOES' | 'TICKETS' | 'FINANCEIRO'>('CRMV');
  const [vets, setVets] = useState<any[]>([]);
  const [avaliacoesData, setAvaliacoesData] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [financeiroData, setFinanceiroData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingFinanceiro, setLoadingFinanceiro] = useState(false);

  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [ticketStatusFilter, setTicketStatusFilter] = useState('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAvaliacaoId, setProcessingAvaliacaoId] = useState<string | null>(null);
  const [processingActionId, setProcessingActionId] = useState<string | null>(null);

  // Resposta a tickets
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

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

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch('/api/admin/tickets');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (err) {
      console.error('Erro ao carregar tickets no admin:', err);
    } finally {
      setLoadingTickets(false);
    }
  };

  const loadFinanceiro = async () => {
    setLoadingFinanceiro(true);
    try {
      const res = await fetch('/api/admin/financeiro');
      const data = await res.json();
      if (res.ok) {
        setFinanceiroData(data);
      }
    } catch (err) {
      console.error('Erro ao carregar métricas financeiras:', err);
    } finally {
      setLoadingFinanceiro(false);
    }
  };

  useEffect(() => {
    loadVets();
    loadAvaliacoes();
    loadTickets();
    loadFinanceiro();
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

  const handleVetAction = async (veterinarioId: string, acao: 'SUSPENDER' | 'REATIVAR' | 'BLOQUEAR' | 'DESBLOQUEAR' | 'EXCLUIR') => {
    if (acao === 'EXCLUIR') {
      const conf = window.confirm('TEM CERTEZA QUE DESEJA EXCLUIR DEFINITIVAMENTE ESTE VETERINÁRIO? Todas as informações, dados e acessos serão apagados.');
      if (!conf) return;
    } else if (acao === 'SUSPENDER') {
      const conf = window.confirm('Deseja suspender este veterinário? Ele deixará de aparecer no mapa e na busca pública até ser reativado.');
      if (!conf) return;
    } else if (acao === 'BLOQUEAR') {
      const conf = window.confirm('Deseja bloquear o login deste usuário? Ele não conseguirá mais entrar na plataforma.');
      if (!conf) return;
    }

    setProcessingActionId(veterinarioId);
    try {
      const res = await fetch('/api/admin/vets/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veterinarioId,
          acao,
          motivo: `Ação ${acao} executada pelo painel administrativo`
        })
      });

      if (res.ok) {
        await loadVets();
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao executar ação.');
      }
    } catch (err) {
      console.error('Erro na ação administrativa:', err);
    } finally {
      setProcessingActionId(null);
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

  const handleSendTicketReply = async (ticketId: string, novoStatus: string = 'RESPONDIDO') => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          respostaAdmin: replyText.trim(),
          status: novoStatus
        })
      });

      if (res.ok) {
        setReplyingTicketId(null);
        setReplyText('');
        await loadTickets();
      }
    } catch (err) {
      console.error('Erro ao responder chamado:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const filteredVets = vets.filter(v => {
    const matchesFilter = 
      statusFilter === 'TODOS' ? true :
      statusFilter === 'SUSPENSO' ? v.statusGeral === 'SUSPENSO' :
      statusFilter === 'BLOQUEADO' ? v.user?.ativo === false :
      v.crmvStatus === statusFilter;

    if (!matchesFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const nome = (v.nomeCompleto || '').toLowerCase();
      const clinica = (v.nomeSocialOuClinica || '').toLowerCase();
      const crmv = (v.crmvNumero || '').toLowerCase();
      const email = (v.user?.email || '').toLowerCase();
      return nome.includes(term) || clinica.includes(term) || crmv.includes(term) || email.includes(term);
    }

    return true;
  });

  const totalPendentes = vets.filter(v => v.crmvStatus === 'PENDENTE').length;
  const totalVerificados = vets.filter(v => v.crmvStatus === 'VERIFICADO').length;
  const totalSuspensos = vets.filter(v => v.statusGeral === 'SUSPENSO').length;
  const totalBloqueados = vets.filter(v => v.user?.ativo === false).length;
  const ticketsAbertosCount = tickets.filter(t => t.status === 'ABERTO').length;

  const filteredTickets = tickets.filter(t => {
    if (ticketStatusFilter === 'TODOS') return true;
    return t.status === ticketStatusFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* HEADER DO BACKOFFICE */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2 border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-[#147A44]" /> Backoffice Geral do SaaS VetBra
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Painel Administrativo & Gestão Geral
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Moderação de CRMV, Ações em Lote, Presença Online, Central de Chamados e Projeção Financeira de 10 Anos.
              </p>
            </div>

            {/* Badges de Contagem */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">CRMV Pendente</span>
                <span className="text-lg font-black text-amber-800">{totalPendentes}</span>
              </div>
              <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-[#147A44] uppercase tracking-wider block">Verificados</span>
                <span className="text-lg font-black text-emerald-800">{totalVerificados}</span>
              </div>
              <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Chamados Abertos</span>
                <span className="text-lg font-black text-rose-800">{ticketsAbertosCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NAVEGAÇÃO ENTRE ABAS DO ADMIN */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('CRMV')}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'CRMV'
                ? 'border-[#147A44] text-[#147A44]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoria CRMV & Gestão de Profissionais</span>
            {totalPendentes > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black">
                {totalPendentes}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AVALIACOES')}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'AVALIACOES'
                ? 'border-[#147A44] text-[#147A44]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Reputação & Avaliações</span>
            {(avaliacoesData?.ranking?.totalReclamacoes || 0) > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                {avaliacoesData.ranking.totalReclamacoes} alertas
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('TICKETS')}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'TICKETS'
                ? 'border-[#147A44] text-[#147A44]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Central de Chamados</span>
            {ticketsAbertosCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black">
                {ticketsAbertosCount} novos
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FINANCEIRO')}
            className={`py-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'FINANCEIRO'
                ? 'border-[#147A44] text-[#147A44]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Financeiro & Métricas 10 Anos</span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {activeTab === 'CRMV' && (
          <>
            {/* BARRA DE FILTRO E BUSCA */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
                <span className="text-xs font-bold text-slate-700 shrink-0">Filtrar:</span>
                {['TODOS', 'PENDENTE', 'VERIFICADO', 'SUSPENSO', 'BLOQUEADO'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      statusFilter === status
                        ? 'bg-[#147A44] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status === 'TODOS' ? 'Todos' : status}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, CRMV ou e-mail..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#147A44]/20"
                />
              </div>
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
                  const isSuspenso = vet.statusGeral === 'SUSPENSO';
                  const isBloqueado = vet.user?.ativo === false;

                  // Presença Online (últimos 15 minutos)
                  const ultimoLogin = vet.user?.ultimoLoginEm ? new Date(vet.user.ultimoLoginEm) : null;
                  const agora = new Date().getTime();
                  const isOnline = ultimoLogin && (agora - ultimoLogin.getTime() < 15 * 60 * 1000);

                  return (
                    <div
                      key={vet.id}
                      className={`bg-white rounded-3xl border p-6 transition-all space-y-4 shadow-xs ${
                        isBloqueado ? 'border-rose-300 bg-rose-50/20' :
                        isSuspenso ? 'border-amber-300 bg-amber-50/20' :
                        isPendente ? 'border-amber-300 ring-2 ring-amber-400/20' : 
                        'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        
                        {/* Informações Principais */}
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
                            {vet.fotoPerfilUrl ? (
                              <img src={vet.fotoPerfilUrl} alt={vet.nomeCompleto} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">Vet</div>
                            )}
                            {isOnline && (
                              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-600" title="Online Agora" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">{vet.nomeCompleto}</h3>

                              {/* Status CRMV */}
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                isVerificado
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : isPendente
                                  ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}>
                                CRMV {vet.crmvStatus}
                              </span>

                              {/* Status de Suspensão / Bloqueio */}
                              {isBloqueado && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-900 border border-rose-300">
                                  🚫 Login Bloqueado
                                </span>
                              )}
                              {isSuspenso && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                                  ⚠️ Suspenso do Mapa
                                </span>
                              )}

                              {/* Presença Online */}
                              {isOnline ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" /> Online Agora
                                </span>
                              ) : ultimoLogin ? (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                                  <Clock className="w-3 h-3" /> Último login: {ultimoLogin.toLocaleDateString('pt-BR')} às {ultimoLogin.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400 font-medium">
                                  ⚪ Nunca logou
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-slate-500">
                              {vet.nomeSocialOuClinica} • Plano {vet.plano} • Email: <span className="font-mono text-slate-700">{vet.user?.email || 'N/D'}</span>
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

                        {/* Telemetria e Métricas de Engajamento */}
                        <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs shrink-0">
                          <div className="text-center px-2">
                            <span className="text-[10px] font-bold text-slate-400 block">Views Perfil</span>
                            <span className="font-black text-slate-800 flex items-center justify-center gap-1">
                              <Eye className="w-3 h-3 text-slate-400" /> {vet.visualizacoesCount || 0}
                            </span>
                          </div>
                          <div className="h-6 w-px bg-slate-200" />
                          <div className="text-center px-2">
                            <span className="text-[10px] font-bold text-slate-400 block">Cliques Whats</span>
                            <span className="font-black text-teal-700 flex items-center justify-center gap-1">
                              <MessageCircle className="w-3 h-3 text-teal-600" /> {vet.contatosWhatsappCount || 0}
                            </span>
                          </div>
                          <div className="h-6 w-px bg-slate-200" />
                          <div className="text-center px-2">
                            <span className="text-[10px] font-bold text-slate-400 block">Cliques CRMV</span>
                            <span className="font-black text-emerald-700 flex items-center justify-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> {vet.cliquesCrmvCount || 0}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* BOTÕES DE MODERAÇÃO E CONTROLE TOTAL */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Checar CFMV */}
                          <a
                            href={getCfmvConsultaUrl(vet.crmvNumero, vet.crmvUf)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors border border-slate-200"
                            title="Verificar registro no Siscad CFMV"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Checar no CFMV
                          </a>

                          {/* Aprovar CRMV */}
                          {!isVerificado && (
                            <button
                              onClick={() => handleUpdateStatus(vet.id, 'VERIFICADO')}
                              disabled={processingId === vet.id}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Aprovar CRMV
                            </button>
                          )}

                          {/* Suspender do Mapa */}
                          {!isSuspenso ? (
                            <button
                              onClick={() => handleVetAction(vet.id, 'SUSPENDER')}
                              disabled={processingActionId === vet.id}
                              className="px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Retira o veterinário da busca pública e do mapa sem apagar a conta"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              Suspender do Mapa
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVetAction(vet.id, 'REATIVAR')}
                              disabled={processingActionId === vet.id}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Reativa perfil para voltar a aparecer na busca pública"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Reativar no Mapa
                            </button>
                          )}

                          {/* Bloquear / Desbloquear Login */}
                          {!isBloqueado ? (
                            <button
                              onClick={() => handleVetAction(vet.id, 'BLOQUEAR')}
                              disabled={processingActionId === vet.id}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Impede o veterinário de efetuar login no sistema"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              Bloquear Login
                            </button>
                          ) : (
                            <button
                              onClick={() => handleVetAction(vet.id, 'DESBLOQUEAR')}
                              disabled={processingActionId === vet.id}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Restaura a permissão de login do usuário"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Desbloquear Login
                            </button>
                          )}
                        </div>

                        {/* Excluir Definitivamente */}
                        <button
                          onClick={() => handleVetAction(vet.id, 'EXCLUIR')}
                          disabled={processingActionId === vet.id}
                          className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-100/80 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                          title="Exclui definitivamente o médico e seus dados"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Excluir Conta
                        </button>
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

        {/* ======================================================== */}
        {/* ABA 3: CENTRAL DE CHAMADOS / TICKETS DE SUPORTE */}
        {/* ======================================================== */}
        {activeTab === 'TICKETS' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Filtrar Chamados:</span>
                {['TODOS', 'ABERTO', 'RESPONDIDO', 'FECHADO'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTicketStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      ticketStatusFilter === st
                        ? 'bg-[#147A44] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'TODOS' ? 'Todos' : st}
                  </button>
                ))}
              </div>

              <span className="text-xs font-medium text-slate-500">
                {tickets.length} chamados registrados no total
              </span>
            </div>

            {loadingTickets ? (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-slate-200 p-8">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                <span className="text-xs font-bold text-slate-500">Carregando chamados...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
                <Headphones className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nenhum chamado encontrado para este filtro.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => {
                  const isAberto = ticket.status === 'ABERTO';
                  const isRespondido = ticket.status === 'RESPONDIDO';
                  const vet = ticket.veterinario || {};

                  return (
                    <div
                      key={ticket.id}
                      className={`bg-white rounded-3xl border p-6 space-y-4 shadow-xs transition-all ${
                        isAberto ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-black text-slate-900">{ticket.assunto}</span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                              {ticket.categoria}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isAberto ? 'bg-amber-100 text-amber-800' :
                              isRespondido ? 'bg-emerald-100 text-emerald-800' :
                              'bg-slate-200 text-slate-700'
                            }`}>
                              {ticket.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 flex-wrap">
                            <span className="font-bold text-slate-800">{vet.nomeCompleto}</span>
                            <span>•</span>
                            <span className="font-mono">CRMV {vet.crmvNumero}/{vet.crmvUf}</span>
                            <span>•</span>
                            <span>Email: {vet.user?.email}</span>
                            <span>•</span>
                            <a
                              href={`https://wa.me/55${(vet.whatsapp || '').replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-teal-700 font-bold flex items-center gap-1 hover:underline"
                            >
                              <MessageCircle className="w-3.5 h-3.5" /> Whats: {vet.whatsapp}
                            </a>
                          </div>
                        </div>

                        <span className="text-[11px] text-slate-400">
                          {new Date(ticket.createdAt).toLocaleDateString('pt-BR')} às {new Date(ticket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Mensagem do veterinário */}
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Mensagem do Profissional:</span>
                        {ticket.mensagem}
                      </div>

                      {/* Resposta do Admin existente */}
                      {ticket.respostaAdmin && (
                        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs space-y-1">
                          <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px]">
                            <span>Resposta Oficial Enviada ({ticket.respondidoPor}):</span>
                            <span className="font-normal text-[10px] text-emerald-700">
                              {ticket.respondidoEm ? new Date(ticket.respondidoEm).toLocaleDateString('pt-BR') : ''}
                            </span>
                          </div>
                          <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                            {ticket.respostaAdmin}
                          </p>
                        </div>
                      )}

                      {/* Caixa de Resposta / Ação */}
                      {replyingTicketId === ticket.id ? (
                        <div className="pt-2 space-y-3">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            rows={3}
                            placeholder="Digite sua resposta oficial para o veterinário..."
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-hidden resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTicketId(null);
                                setReplyText('');
                              }}
                              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendTicketReply(ticket.id, 'RESPONDIDO')}
                              disabled={sendingReply || !replyText.trim()}
                              className="px-4 py-2 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {sendingReply ? 'Enviando...' : 'Enviar Resposta'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTicketId(ticket.id);
                              setReplyText(ticket.respostaAdmin || '');
                            }}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            {ticket.respostaAdmin ? 'Editar Resposta' : 'Responder ao Chamado'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ABA 4: CONTROLE FINANCEIRO & PROJEÇÃO DE 10 ANOS */}
        {/* ======================================================== */}
        {activeTab === 'FINANCEIRO' && (
          <div className="space-y-6">
            
            {/* CARDS DE FATURAMENTO: DIA, SEMANA, MÊS, ANO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* HOJE */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Hoje</span>
                <span className="text-2xl font-black text-emerald-800 block">
                  R$ {(financeiroData?.metricas?.receitaHoje || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">Total liquidado no dia</span>
              </div>

              {/* SEMANA */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Esta Semana</span>
                <span className="text-2xl font-black text-emerald-800 block">
                  R$ {(financeiroData?.metricas?.receitaSemana || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">Segunda até hoje</span>
              </div>

              {/* MÊS */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Este Mês</span>
                <span className="text-2xl font-black text-emerald-800 block">
                  R$ {(financeiroData?.metricas?.receitaMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400">Mês corrente</span>
              </div>

              {/* ANO ATUAL */}
              <div className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Faturamento Ano 2026</span>
                <span className="text-2xl font-black text-emerald-900 block">
                  R$ {(financeiroData?.metricas?.receitaAnoAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Acumulado anual realizado</span>
              </div>

            </div>

            {/* SEGUNDA LINHA: MRR, ARR, ASSINANTES ATIVOS E INADIMPLÊNCIA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MRR & ARR SaaS</span>
                  <span className="text-lg font-black text-slate-900 block">
                    R$ {(financeiroData?.metricas?.mrrAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-500">/mês</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ARR: R$ {(financeiroData?.metricas?.arrAtual || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/ano
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assinantes Ativos</span>
                  <span className="text-lg font-black text-slate-900 block">
                    {financeiroData?.metricas?.assinantesAtivosCount || 0} veterinários
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {financeiroData?.metricas?.totalFaturasCount || 0} faturas geradas
                  </span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Faturas Pendentes</span>
                  <span className="text-lg font-black text-amber-900 block">
                    R$ {(financeiroData?.metricas?.totalPendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-amber-700 block">Aguardando compensação</span>
                </div>
              </div>
            </div>

            {/* TABELA DE CONTROLE E PROJEÇÃO DE 10 ANOS (2026 A 2036) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Controle Histórico e Projeção Executiva de 10 Anos (2026 — 2036)
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Comparativo de faturamento real auditado vs run-rate projetado com crescimento composto do SaaS.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Projeção 10 Anos
                </span>
              </div>

              {loadingFinanceiro ? (
                <div className="py-12 text-center text-xs text-slate-400">Carregando projeção de 10 anos...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-3">Ano</th>
                        <th className="py-3 px-3">Faturamento Real</th>
                        <th className="py-3 px-3">Projeção Anual SaaS</th>
                        <th className="py-3 px-3">Assinantes Estimados</th>
                        <th className="py-3 px-3">Evolução Gráfica</th>
                        <th className="py-3 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {financeiroData?.anosHistoricoEProjecao?.map((item: any) => {
                        const maxVal = financeiroData?.anosHistoricoEProjecao[financeiroData.anosHistoricoEProjecao.length - 1]?.faturadoProjetado || 10000;
                        const pct = Math.min(100, Math.max(8, (item.faturadoProjetado / maxVal) * 100));

                        return (
                          <tr key={item.ano} className={`hover:bg-slate-50 transition-colors ${item.ano === 2026 ? 'bg-emerald-50/40 font-bold' : ''}`}>
                            <td className="py-3.5 px-3 font-black text-slate-900 text-sm">
                              {item.ano}
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-emerald-800">
                              {item.faturadoReal > 0 
                                ? `R$ ${item.faturadoReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                                : item.ehFuturo ? '—' : 'R$ 0,00'
                              }
                            </td>
                            <td className="py-3.5 px-3 font-bold text-slate-800">
                              R$ {item.faturadoProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3.5 px-3 text-slate-600 font-medium">
                              {item.estimativaAssinantes} profissionais
                            </td>
                            <td className="py-3.5 px-3 w-48">
                              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div 
                                  className={`h-2.5 rounded-full ${item.ano === 2026 ? 'bg-emerald-600' : 'bg-teal-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                item.ano === 2026
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.ano === 2026 ? 'Ano Vigente' : 'Projeção'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* TABELA DE FATURAS RECENTES */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Histórico de Cobranças & Faturas Emitidas
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  {financeiroData?.faturasRecentes?.length || 0} faturas listadas
                </span>
              </div>

              {!financeiroData?.faturasRecentes?.length ? (
                <p className="text-xs text-slate-400 py-8 text-center">Nenhuma fatura registrada no banco de dados.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-3 px-2">Fatura</th>
                        <th className="py-3 px-2">Médico Veterinário</th>
                        <th className="py-3 px-2">Plano</th>
                        <th className="py-3 px-2">Valor</th>
                        <th className="py-3 px-2">Método</th>
                        <th className="py-3 px-2">Vencimento</th>
                        <th className="py-3 px-2">Liquidação</th>
                        <th className="py-3 px-2 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {financeiroData.faturasRecentes.map((fat: any) => {
                        const isPaga = fat.status === 'PAGA';
                        const isPendente = fat.status === 'PENDENTE';

                        return (
                          <tr key={fat.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-2 font-mono font-bold text-slate-800">
                              {fat.numeroFatura}
                            </td>
                            <td className="py-3 px-2">
                              <span className="font-bold text-slate-900 block">{fat.veterinarioNome}</span>
                              <span className="text-[10px] text-slate-400 font-mono">CRMV {fat.veterinarioCrmv}</span>
                            </td>
                            <td className="py-3 px-2 text-slate-600 font-medium">
                              {fat.planoNome}
                            </td>
                            <td className="py-3 px-2 font-black text-slate-900">
                              R$ {fat.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-2 text-slate-600 font-bold">
                              {fat.metodo}
                            </td>
                            <td className="py-3 px-2 text-slate-500">
                              {fat.vencimento ? new Date(fat.vencimento).toLocaleDateString('pt-BR') : '—'}
                            </td>
                            <td className="py-3 px-2 text-slate-500">
                              {fat.liquidacao ? new Date(fat.liquidacao).toLocaleDateString('pt-BR') : '—'}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                isPaga ? 'bg-emerald-100 text-emerald-800' :
                                isPendente ? 'bg-amber-100 text-amber-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {fat.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
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
