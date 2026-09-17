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
  AlertTriangle,
  Save,
  Loader2, 
  BookOpen, 
  FileText, 
  Image as ImageIcon,
  Edit3,
  Lock,
  X,
  KeyRound,
  ExternalLink,
  Car,
  Check,
  Headphones,
  Send,
  Inbox,
  Sparkles
} from 'lucide-react';
import { formatCrmv } from '@/lib/crmv';
import { parseUserAgent, formatOrigem } from '@/lib/deviceDetector';

// Catálogo de procedimentos sugeridos para preenchimento rápido
const SUGESTOES_PROCEDIMENTOS = [
  { nome: 'Consulta Clínica Geral', categoria: 'Consulta', tempo: '30' },
  { nome: 'Consulta Domiciliar', categoria: 'Consulta', tempo: '60' },
  { nome: 'Vacina V8 / V10 (Cães)', categoria: 'Vacinação', tempo: '20' },
  { nome: 'Vacina Antirrábica', categoria: 'Vacinação', tempo: '15' },
  { nome: 'Vacina Quádrupla Felina', categoria: 'Vacinação', tempo: '20' },
  { nome: 'Castração Macho', categoria: 'Cirurgia', tempo: '60' },
  { nome: 'Castração Fêmea', categoria: 'Cirurgia', tempo: '90' },
  { nome: 'Limpeza de Tártaro (Profilaxia)', categoria: 'Cirurgia', tempo: '60' },
  { nome: 'Hemograma Completo', categoria: 'Exame', tempo: '15' },
  { nome: 'Ultrassonografia Abdominal', categoria: 'Exame', tempo: '45' },
  { nome: 'Plantão Noturno / Emergência', categoria: 'Emergência', tempo: '45' },
  { nome: 'Aplicação de Microchip', categoria: 'Consulta', tempo: '20' },
  { nome: 'Corte de Unhas e Limpeza Otológica', categoria: 'Estética', tempo: '30' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [vet, setVet] = useState<any>(null);
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [artigos, setArtigos] = useState<any[]>([]);

  // Modais
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Estados de formulários auxiliares
  const [savingProc, setSavingProc] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('Consulta');
  const [novoPreco, setNovoPreco] = useState('');
  const [novoTempo, setNovoTempo] = useState('30');
  const [procError, setProcError] = useState<string | null>(null);
  const [procSuccess, setProcSuccess] = useState<string | null>(null);

  const [savingArtigo, setSavingArtigo] = useState(false);
  const [artigoTitulo, setArtigoTitulo] = useState('');
  const [artigoCategoria, setArtigoCategoria] = useState('Clínica Geral');
  const [artigoFoto, setArtigoFoto] = useState('');
  const [artigoResumo, setArtigoResumo] = useState('');
  const [artigoConteudo, setArtigoConteudo] = useState('');

  // Chamados / Tickets de Suporte
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [showNovoTicketModal, setShowNovoTicketModal] = useState(false);
  const [novoTicketAssunto, setNovoTicketAssunto] = useState('');
  const [novoTicketCategoria, setNovoTicketCategoria] = useState('DUVIDA');
  const [novoTicketMensagem, setNovoTicketMensagem] = useState('');
  const [savingTicket, setSavingTicket] = useState(false);
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState<string | null>(null);
  const [ticketErrorMsg, setTicketErrorMsg] = useState<string | null>(null);

  // Edição de Perfil com Bloqueio Anti-Fraude
  const [editForm, setEditForm] = useState({
    nomeSocialOuClinica: '',
    bio: '',
    whatsapp: '',
    telefone: '',
    instagram: '',
    site: '',
    horarioFuncionamento: '',
    raioAtendimentoKm: 15,
    atende24h: false,
    atendeDomiciliar: true,
    fotoPerfilUrl: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

  // Login & Recuperação de Senha
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginSenha, setLoginSenha] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetCodigo, setResetCodigo] = useState('');
  const [resetNovaSenha, setResetNovaSenha] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Carrega dados do veterinário
  const loadVetData = async (vetId?: string) => {
    setLoading(true);
    try {
      const url = vetId ? `/api/dashboard/perfil?vetId=${vetId}` : '/api/dashboard/perfil';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVet(data);
        setProcedimentos(data.procedimentos || []);
        setArtigos(data.artigos || []);
        setEditForm({
          nomeSocialOuClinica: data.nomeSocialOuClinica || '',
          bio: data.bio || '',
          whatsapp: data.whatsapp || '',
          telefone: data.telefone || '',
          instagram: data.instagram || '',
          site: data.site || '',
          horarioFuncionamento: data.horarioFuncionamento || 'Segunda a Sexta - 08:00 às 18:00',
          raioAtendimentoKm: data.raioAtendimentoKm || 15,
          atende24h: !!data.atende24h,
          atendeDomiciliar: !!data.atendeDomiciliar,
          fotoPerfilUrl: data.fotoPerfilUrl || ''
        });
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setTickets(data);
      }
    } catch (e) {
      console.error('Erro ao carregar tickets:', e);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTicketAssunto.trim() || !novoTicketMensagem.trim()) return;
    setSavingTicket(true);
    setTicketErrorMsg(null);
    setTicketSuccessMsg(null);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assunto: novoTicketAssunto.trim(),
          categoria: novoTicketCategoria,
          mensagem: novoTicketMensagem.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao abrir chamado');
      setTicketSuccessMsg('Chamado aberto com sucesso! A moderação responderá em breve.');
      setNovoTicketAssunto('');
      setNovoTicketMensagem('');
      await loadTickets();
      setTimeout(() => {
        setShowNovoTicketModal(false);
        setTicketSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setTicketErrorMsg(err.message || 'Erro ao abrir chamado.');
    } finally {
      setSavingTicket(false);
    }
  };

  useEffect(() => {
    loadVetData();
    loadTickets();
  }, []);

  // Salvar Edição com proteção anti-fraude
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vet) return;
    setSavingEdit(true);
    setEditErrorMsg(null);
    setEditSuccessMsg(null);

    try {
      const res = await fetch('/api/dashboard/perfil', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vetId: vet.id,
          ...editForm
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setEditSuccessMsg('Perfil atualizado com sucesso!');
        setVet((prev: any) => ({ ...prev, ...data.vet }));
        setTimeout(() => {
          setShowEditModal(false);
          setEditSuccessMsg(null);
        }, 1500);
      } else {
        setEditErrorMsg(data.error || 'Erro ao salvar alterações.');
      }
    } catch (err) {
      console.error(err);
      setEditErrorMsg('Erro de conexão ao salvar.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Login de veterinário
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginOrEmail: loginIdentifier,
          senha: loginSenha
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.vet?.id) {
          await loadVetData(data.vet.id);
        }
        setShowLoginModal(false);
      } else {
        setLoginError(data.error || 'Credenciais inválidas.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Erro de conexão ao fazer login.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Solicitar recuperação de senha
  const handleForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotMsg(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier })
      });

      const data = await res.json();
      if (res.ok) {
        setForgotMsg(data.message + (data.debugCodigo ? ` (Código teste: ${data.debugCodigo})` : ''));
        setForgotStep('reset');
      } else {
        setForgotError(data.error || 'Erro ao solicitar código.');
      }
    } catch (err) {
      console.error(err);
      setForgotError('Erro de conexão.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Redefinir senha com código
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotMsg(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: resetCodigo,
          novaSenha: resetNovaSenha
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setForgotMsg(data.message);
        setTimeout(() => {
          setShowForgotModal(false);
          setShowLoginModal(true);
          setForgotStep('request');
        }, 2000);
      } else {
        setForgotError(data.error || 'Código inválido.');
      }
    } catch (err) {
      console.error(err);
      setForgotError('Erro de conexão.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Procedimentos
  const handleSelectSugestao = (sugestao: typeof SUGESTOES_PROCEDIMENTOS[0]) => {
    setNovoNome(sugestao.nome);
    setNovaCategoria(sugestao.categoria);
    setNovoTempo(sugestao.tempo);
    setProcError(null);
    const precoInput = document.getElementById('input-novo-preco');
    if (precoInput) {
      precoInput.focus();
    }
  };

  const handleAddProcedimento = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcError(null);
    setProcSuccess(null);

    if (!novoNome.trim()) {
      setProcError('Por favor, informe o nome do procedimento.');
      return;
    }
    if (!novoPreco || !novoPreco.trim()) {
      setProcError('Por favor, informe o valor do procedimento.');
      return;
    }
    if (!vet) {
      setProcError('Sessão do veterinário não identificada. Por favor, recarregue a página.');
      return;
    }

    setSavingProc(true);
    try {
      const res = await fetch('/api/dashboard/procedimentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veterinarioId: vet.id,
          nome: novoNome.trim(),
          categoria: novaCategoria,
          preco: novoPreco.trim(),
          tempoMedioMinutos: novoTempo
        })
      });

      const data = await res.json();
      if (res.ok && data.id) {
        setProcedimentos(prev => [...prev, data]);
        setNovoNome('');
        setNovoPreco('');
        setProcSuccess(`Procedimento "${data.nome}" adicionado com sucesso!`);
        setTimeout(() => setProcSuccess(null), 4000);
      } else {
        setProcError(data.error || 'Erro ao adicionar procedimento.');
      }
    } catch (err: any) {
      console.error(err);
      setProcError('Erro de conexão ao salvar procedimento.');
    } finally {
      setSavingProc(false);
    }
  };

  const handleDeleteProcedimento = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/procedimentos?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProcedimentos(procedimentos.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Artigos
  const handleAddArtigo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artigoTitulo || !artigoResumo || !artigoConteudo || !vet) return;

    setSavingArtigo(true);
    try {
      const res = await fetch('/api/dashboard/artigos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veterinarioId: vet.id,
          titulo: artigoTitulo,
          categoria: artigoCategoria,
          fotoUrl: artigoFoto,
          resumo: artigoResumo,
          conteudo: artigoConteudo
        })
      });

      if (res.ok) {
        const item = await res.json();
        setArtigos([item, ...artigos]);
        setArtigoTitulo('');
        setArtigoFoto('');
        setArtigoResumo('');
        setArtigoConteudo('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingArtigo(false);
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
          <div className="max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Acesse sua Área do Veterinário</h2>
            <p className="text-xs text-slate-500">
              Faça login com seu e-mail e senha para gerenciar seu consultório ou crie seu cadastro.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full py-3 rounded-xl bg-[#147A44] text-white font-bold text-xs hover:bg-[#11693A]"
              >
                Entrar com Login e Senha
              </button>
              <a
                href="/cadastro"
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Criar Novo Cadastro Profissional
              </a>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const enderecoPrincipal = vet.enderecos?.find((e: any) => e.tipoEndereco === 'PRINCIPAL') || vet.enderecos?.[0] || {};
  const enderecoFilial = vet.enderecos?.find((e: any) => e.tipoEndereco === 'FILIAL');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* SUB-HEADER COM IDENTIFICAÇÃO E AÇÕES */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Foto e Titularidade */}
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
                  {vet.nomeSocialOuClinica || 'Atendimento Particular'} • CRMV {formatCrmv(vet.crmvNumero, vet.crmvUf)}
                </p>
              </div>
            </div>

            {/* Ações: Editar Perfil e Trocar de Conta */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Editar Perfil
              </button>

              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                title="Trocar de conta"
              >
                Alternar Conta
              </button>

              <a
                href={`/vets/${vet.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Ver Perfil Público</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DO DASHBOARD */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {/* BANNER DE TESTE GRATUITO (TRIAL DE 7 DIAS) */}
        {vet.assinaturaAtiva?.status === 'TRIAL' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-indigo-950 flex items-center gap-2">
                  <span>Período de Teste Gratuito Ativo (Trial de 7 Dias)</span>
                  <span className="px-2 py-0.5 bg-indigo-200 text-indigo-900 rounded-full text-[10px] font-bold">
                    Restam {vet.diasRestantesTrial ?? 7} dias
                  </span>
                </h3>
                <p className="text-xs text-indigo-800 mt-0.5 leading-relaxed">
                  Você está usufruindo do período de cortesia liberado pela administração. Para garantir a continuidade da sua presença no mapa e nos resultados de busca sem bloqueios, efetue o pagamento do seu plano.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ALERTA DE TRIAL EXPIRADO / PAGAMENTO BLOQUEADO */}
        {vet.statusGeral === 'BLOQUEADO' && (
          <div className="p-4 sm:p-5 rounded-3xl bg-rose-50 border-2 border-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-rose-950">
                  Acesso Bloqueado: Período de Teste Expirado
                </h3>
                <p className="text-xs text-rose-800 mt-0.5 leading-relaxed">
                  Seu período de teste gratuito de 7 dias expirou e o pagamento da sua assinatura ainda não foi confirmado. Realize o pagamento via Pix para reativar seu perfil imediatamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ALERTA DE RENOVAÇÃO DO CRMV (POPUP / BANNER 30 DIAS ANTES) */}
        {vet.alerta30DiasAtivo && (
          <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-amber-950">
                  Atenção: Renovação de CRMV Necessária
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Seu registro profissional CRMV-{vet.crmvUf} está próximo do vencimento (faltam {vet.diasParaVencerCrmv ?? 30} dias). 
                  Para manter seu selo verificado e posição no mapa, envie o novo comprovante de renovação.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 self-start sm:self-center shadow-xs"
            >
              Atualizar Documentos
            </button>
          </div>
        )}

        {/* CARDS DE MÉTRICAS ANALÍTICAS (MÉTRICAS DO SAAS) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* 1. VISUALIZAÇÕES */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#147A44] flex items-center justify-center shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visualizações</span>
              <span className="text-2xl font-black text-slate-900">{vet.visualizacoesCount || 0}</span>
              <span className="text-[10px] text-slate-400 block">Tutores que viram seu perfil</span>
            </div>
          </div>

          {/* 2. CLIQUES NO WHATSAPP (MÉTRICA DE CONVERSÃO REAL) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contatos WhatsApp</span>
              <span className="text-2xl font-black text-teal-700">{vet.contatosWhatsappCount || 0}</span>
              <span className="text-[10px] text-slate-400 block">Cliques diretos para conversa</span>
            </div>
          </div>

          {/* 3. AUDITORIA CFMV */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Auditoria CFMV</span>
              <span className="text-xs font-black text-slate-900 block mt-0.5">
                {vet.crmvStatus === 'VERIFICADO' ? '✅ Verificado Regular' : '⏳ Em Auditoria'}
              </span>
              <span className="text-[10px] text-slate-400 block">CRMV {vet.crmvNumero}/{vet.crmvUf}</span>
            </div>
          </div>

          {/* 4. RAIO & DESLOCAMENTO */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deslocamento</span>
              <span className="text-xs font-black text-slate-900 block mt-0.5">
                {vet.raioAtendimentoKm ? `Raio de ${vet.raioAtendimentoKm} km` : 'Sem Limites'}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {vet.meiosTransporte?.join(', ') || vet.meioTransporte || 'Carro'}
              </span>
            </div>
          </div>

        </div>

        {/* HISTÓRICO DE CLIQUES NO WHATSAPP RECENTES */}
        {vet.cliquesWhatsapp && vet.cliquesWhatsapp.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-600" /> Últimos Tutores que Clicaram no seu WhatsApp
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Rastreamento em tempo real dos contatos gerados com identificação do dispositivo e origem do clique.
                </p>
              </div>
              <span className="text-xs font-bold text-[#147A44] bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shrink-0">
                {vet.contatosWhatsappCount || vet.cliquesWhatsapp.length} cliques totais
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {vet.cliquesWhatsapp.map((log: any) => {
                const origemInfo = formatOrigem(log.origem);
                const deviceInfo = parseUserAgent(log.userAgent);
                return (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 hover:border-slate-300 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${origemInfo.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${origemInfo.dotColor}`} />
                        {origemInfo.badge}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {new Date(log.createdAt).toLocaleDateString('pt-BR')} às {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-0.5 pt-0.5">
                      <p className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="text-sm">{deviceInfo.icone}</span>
                        <span>{deviceInfo.aparelho}</span>
                        <span className="text-[10px] font-normal text-slate-500">({deviceInfo.sistema})</span>
                      </p>
                      <p className="text-[10px] text-slate-500 pl-5">
                        Navegador: <strong className="text-slate-700 font-semibold">{deviceInfo.navegador}</strong>
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-slate-200/70">
                      <p className="text-[9.5px] text-slate-500 leading-tight">
                        <span className="font-semibold text-slate-600">Local do clique:</span> {origemInfo.descricao}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TABELA DE PROCEDIMENTOS E PREÇOS */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" /> Tabela de Procedimentos e Serviços
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Defina os procedimentos que você realiza e os preços que serão exibidos no seu perfil para os tutores.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
              {procedimentos.length} procedimentos cadastrados
            </span>
          </div>

          {/* Sugestões Rápidas de Procedimentos (Catálogo Pronto) */}
          <div className="space-y-2 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Sugestões Rápidas (Clique para preencher):
              </span>
              <span className="text-[10px] text-slate-400">Clique para selecionar e informe apenas o valor</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {SUGESTOES_PROCEDIMENTOS.map((sug, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSugestao(sug)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 border border-slate-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                >
                  + {sug.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagens de feedback */}
          {procSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {procSuccess}
            </div>
          )}
          {procError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              {procError}
            </div>
          )}

          {/* Form para adicionar procedimento */}
          <form onSubmit={handleAddProcedimento} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <datalist id="lista-sugestoes-procedimentos">
              {SUGESTOES_PROCEDIMENTOS.map((s, idx) => (
                <option key={idx} value={s.nome} />
              ))}
            </datalist>

            <div className="sm:col-span-4 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Nome do Procedimento</label>
              <input
                type="text"
                list="lista-sugestoes-procedimentos"
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Consulta Clínica Geral, Vacina V10..."
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
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

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Duração (min)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={novoTempo}
                onChange={(e) => setNovoTempo(e.target.value)}
                placeholder="30"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">R$</span>
                <input
                  id="input-novo-preco"
                  type="text"
                  inputMode="decimal"
                  value={novoPreco}
                  onChange={(e) => setNovoPreco(e.target.value)}
                  placeholder="150,00"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="sm:col-span-1">
              <button
                type="submit"
                disabled={savingProc}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                title="Adicionar Procedimento"
              >
                {savingProc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span className="sm:hidden">Adicionar</span>
              </button>
            </div>
          </form>

          {/* Listagem de procedimentos ativos com numeração */}
          <div className="overflow-x-auto">
            {procedimentos.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-2">
                <p className="text-sm font-semibold">Nenhum procedimento cadastrado ainda.</p>
                <p className="text-xs">Utilize as sugestões acima ou adicione novos serviços para que apareçam em seu perfil.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-2 w-12 text-center">Nº</th>
                    <th className="py-3 px-2">Procedimento</th>
                    <th className="py-3 px-2">Categoria</th>
                    <th className="py-3 px-2">Duração Média</th>
                    <th className="py-3 px-2">Preço (R$)</th>
                    <th className="py-3 px-2 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {procedimentos.map((proc, index) => (
                    <tr key={proc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                          #{index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-bold text-slate-800">{proc.nome}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                          {proc.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-500">{proc.tempoMedioMinutos || 30} min</td>
                      <td className="py-3 px-2 font-black text-emerald-700">
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
            )}
          </div>
        </div>

        {/* BLOG DO VETERINÁRIO */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2 border border-emerald-200">
                <BookOpen className="w-3.5 h-3.5" /> Blog Oficial VetBra
              </div>
              <h2 className="text-lg font-bold text-slate-900">Publicar Artigos no Portal</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Escreva textos educativos e orientações para tutores. Seus artigos são exibidos na página inicial e no seu perfil médico.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start">
              {artigos.length} artigo(s) publicado(s)
            </div>
          </div>

          {/* Form para novo artigo */}
          <form onSubmit={handleAddArtigo} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Título do Artigo</label>
                <input
                  type="text"
                  value={artigoTitulo}
                  onChange={(e) => setArtigoTitulo(e.target.value)}
                  placeholder="Ex: Como identificar problemas respiratórios precoces em gatos"
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Especialidade / Categoria</label>
                <select
                  value={artigoCategoria}
                  onChange={(e) => setArtigoCategoria(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="Clínica Geral">Clínica Geral</option>
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Dermatologia">Dermatologia Pet</option>
                  <option value="Medicina Felina">Medicina Felina</option>
                  <option value="Nutrição Animal">Nutrição Animal</option>
                  <option value="Ortopedia">Ortopedia</option>
                  <option value="Animais Silvestres">Animais Silvestres</option>
                  <option value="Cirurgia">Cirurgia</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-slate-400" /> Foto de Capa (Link / URL da Imagem)
              </label>
              <input
                type="url"
                value={artigoFoto}
                onChange={(e) => setArtigoFoto(e.target.value)}
                placeholder="https://exemplo.com/foto-do-artigo.jpg"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Resumo Curto (Aparece na página inicial)</label>
              <input
                type="text"
                value={artigoResumo}
                onChange={(e) => setArtigoResumo(e.target.value)}
                placeholder="Breve introdução que desperte o interesse do tutor em 2 frases..."
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Conteúdo Completo do Artigo</label>
              <textarea
                value={artigoConteudo}
                onChange={(e) => setArtigoConteudo(e.target.value)}
                rows={4}
                placeholder="Explique os sintomas, cuidados preventivos e quando o tutor deve procurar atendimento..."
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-normal focus:outline-hidden resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingArtigo}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {savingArtigo ? 'Publicando...' : 'Publicar Artigo no Portal'}
              </button>
            </div>
          </form>
        </div>

        {/* ======================================================== */}
        {/* SEÇÃO: CENTRAL DE ATENDIMENTO, SUPORTE & TICKETS CRMV */}
        {/* ======================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-emerald-600" />
                Central de Ajuda, Suporte & Chamados
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Precisa de suporte com seu registro CRMV, contestação de avaliação de tutor, dúvidas sobre planos ou faturamento? Fale diretamente com a moderação do VetBra.
              </p>
            </div>

            <button
              onClick={() => {
                setTicketErrorMsg(null);
                setTicketSuccessMsg(null);
                setShowNovoTicketModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Abrir Novo Chamado
            </button>
          </div>

          {loadingTickets ? (
            <div className="py-8 text-center flex items-center justify-center gap-2 text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              Carregando seus chamados...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-600">Nenhum chamado aberto no momento</p>
              <p className="text-[11px] text-slate-400">Quando você tiver dúvidas ou contestações, seus chamados e respostas da equipe aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tickets.map((t: any) => {
                const isRespondido = t.status === 'RESPONDIDO';
                const isAberto = t.status === 'ABERTO';

                return (
                  <div key={t.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{t.assunto}</span>
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600 uppercase">
                          {t.categoria}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isRespondido ? 'bg-emerald-100 text-emerald-800' : isAberto ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(t.createdAt).toLocaleDateString('pt-BR')} às {new Date(t.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-line">
                      {t.mensagem}
                    </div>

                    {t.respostaAdmin && (
                      <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-emerald-900">
                          <span>Resposta da Administração:</span>
                          <span className="text-[10px] text-emerald-700 font-normal">
                            {t.respondidoEm ? new Date(t.respondidoEm).toLocaleDateString('pt-BR') : ''}
                          </span>
                        </div>
                        <p className="text-slate-800 text-xs leading-relaxed whitespace-pre-line">
                          {t.respostaAdmin}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* ======================================================== */}
      {/* MODAL 1: EDIÇÃO DE PERFIL COM TRAVA ANTI-FRAUDE */}
      {/* ======================================================== */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-emerald-600" /> Alteração Cadastral do Perfil
                </h3>
                <p className="text-xs text-slate-400">
                  Atualize suas informações de contato, horários e atendimento.
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AVISO LEGAL ANTI-FRAUDE */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Segurança Anti-Fraude:</strong> Dados legais de titularidade (Nome Oficial, CRMV e UF) são protegidos contra alteração direta para prevenir fraudes. Para atualizar documentos ou sobrenome, solicite revisão à auditoria da VetBra.
              </p>
            </div>

            {editErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {editErrorMsg}
              </div>
            )}

            {editSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {editSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              {/* CAMPOS TRAVADOS (SOMENTE LEITURA ANTI-FRAUDE) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-100 border border-slate-200 opacity-90">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> Nome Completo Oficial (Bloqueado)
                  </label>
                  <input
                    type="text"
                    value={vet.nomeCompleto}
                    disabled
                    className="w-full px-3 py-2 bg-slate-200/70 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" /> Registro CRMV / UF (Bloqueado)
                  </label>
                  <input
                    type="text"
                    value={`${vet.crmvNumero} - ${vet.crmvUf}`}
                    disabled
                    className="w-full px-3 py-2 bg-slate-200/70 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* CAMPOS LIVRES PARA EDIÇÃO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nome Social ou Nome da Clínica</label>
                  <input
                    type="text"
                    value={editForm.nomeSocialOuClinica}
                    onChange={(e) => setEditForm({ ...editForm, nomeSocialOuClinica: e.target.value })}
                    placeholder="Clínica Veterinária Silva"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">WhatsApp para Consultas</label>
                  <input
                    type="text"
                    value={editForm.whatsapp}
                    onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                    placeholder="11999998888"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Biografia / Apresentação Profissional</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={3}
                  placeholder="Conte um pouco sobre sua formação, experiência e carinho no atendimento..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-normal focus:outline-hidden focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Horário de Funcionamento</label>
                  <input
                    type="text"
                    value={editForm.horarioFuncionamento}
                    onChange={(e) => setEditForm({ ...editForm, horarioFuncionamento: e.target.value })}
                    placeholder="Seg a Sex: 08h às 18h"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Raio de Atendimento (km no Mapa)</label>
                  <select
                    value={editForm.raioAtendimentoKm}
                    onChange={(e) => setEditForm({ ...editForm, raioAtendimentoKm: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold focus:outline-hidden"
                  >
                    <option value="5">Raio de 5 km</option>
                    <option value="15">Raio de 15 km (Padrão)</option>
                    <option value="30">Raio de 30 km</option>
                    <option value="99999">Sem Limites (Todo o Brasil)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.atende24h}
                    onChange={(e) => setEditForm({ ...editForm, atende24h: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm"
                  />
                  <span>Plantão 24 Horas</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editForm.atendeDomiciliar}
                    onChange={(e) => setEditForm({ ...editForm, atendeDomiciliar: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded-sm"
                  />
                  <span>Atendimento Domiciliar / Home Care</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savingEdit ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: LOGIN DO VETERINÁRIO (BCRYPT SEGURO) */}
      {/* ======================================================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Acessar Área do Veterinário</h3>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">E-mail ou Login de Usuário</label>
                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="seuemail@veterinaria.com.br"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Senha</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setShowForgotModal(true);
                    }}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                {loginLoading ? 'Verificando...' : 'Entrar no Painel'}
              </button>

              <div className="text-center pt-2">
                <a href="/cadastro" className="text-slate-500 hover:text-emerald-700 text-[11px] font-semibold">
                  Ainda não tem cadastro? Crie sua conta aqui
                </a>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ESQUECEU A SENHA (CÓDIGO DE 6 DÍGITOS) */}
      {/* ======================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">Recuperação de Senha</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {forgotError}
              </div>
            )}

            {forgotMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                {forgotMsg}
              </div>
            )}

            {forgotStep === 'request' ? (
              <form onSubmit={handleForgotRequest} className="space-y-4 text-xs">
                <p className="text-slate-500 text-xs leading-relaxed">
                  Digite seu e-mail, login ou WhatsApp cadastrado para receber o código de 6 dígitos de recuperação.
                </p>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Identificador Cadastrado</label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="email@exemplo.com ou 11999998888"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  {forgotLoading ? 'Enviando Código...' : 'Enviar Código de Recuperação'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Código de 6 Dígitos</label>
                  <input
                    type="text"
                    value={resetCodigo}
                    onChange={(e) => setResetCodigo(e.target.value)}
                    placeholder="Ex: 849201"
                    required
                    maxLength={6}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-base tracking-widest font-black focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nova Senha</label>
                  <input
                    type="password"
                    value={resetNovaSenha}
                    onChange={(e) => setResetNovaSenha(e.target.value)}
                    placeholder="•••••••• (mínimo 6 dígitos)"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {forgotLoading ? 'Atualizando...' : 'Definir Nova Senha Criptografada'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL NOVO TICKET / CHAMADO DE SUPORTE */}
      {/* ======================================================== */}
      {showNovoTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Headphones className="w-5 h-5 text-emerald-600" />
                Novo Chamado para a Moderação
              </h3>
              <button
                onClick={() => setShowNovoTicketModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {ticketErrorMsg}
              </div>
            )}

            {ticketSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {ticketSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Assunto</label>
                <input
                  type="text"
                  value={novoTicketAssunto}
                  onChange={(e) => setNovoTicketAssunto(e.target.value)}
                  placeholder="Ex: Regularização de CRMV ou Dúvida sobre Fatura"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Categoria</label>
                <select
                  value={novoTicketCategoria}
                  onChange={(e) => setNovoTicketCategoria(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="CRMV">Regularização ou Dúvida de CRMV</option>
                  <option value="AVALIACAO">Contestação de Avaliação</option>
                  <option value="FINANCEIRO">Financeiro / Plano / Fatura</option>
                  <option value="DUVIDA">Dúvida Geral do Sistema</option>
                  <option value="OUTROS">Outros Assuntos</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Mensagem Detalhada</label>
                <textarea
                  value={novoTicketMensagem}
                  onChange={(e) => setNovoTicketMensagem(e.target.value)}
                  rows={4}
                  placeholder="Descreva o motivo do seu contato com o máximo de detalhes..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNovoTicketModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTicket}
                  className="px-5 py-2.5 rounded-xl bg-[#147A44] hover:bg-[#11693A] text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {savingTicket ? 'Enviando...' : 'Enviar Chamado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
