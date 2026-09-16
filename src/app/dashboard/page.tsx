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
  Loader2,
  BookOpen,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { formatCrmv } from '@/lib/crmv';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [vet, setVet] = useState<any>(null);
  const [procedimentos, setProcedimentos] = useState<any[]>([]);
  const [artigos, setArtigos] = useState<any[]>([]);

  // Form para novo procedimento
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('Consulta');
  const [novoPreco, setNovoPreco] = useState('');
  const [novoTempo, setNovoTempo] = useState('30');
  const [savingProc, setSavingProc] = useState(false);

  // Form para novo artigo no blog
  const [artigoTitulo, setArtigoTitulo] = useState('');
  const [artigoCategoria, setArtigoCategoria] = useState('Clínica Geral');
  const [artigoFoto, setArtigoFoto] = useState('');
  const [artigoResumo, setArtigoResumo] = useState('');
  const [artigoConteudo, setArtigoConteudo] = useState('');
  const [savingArtigo, setSavingArtigo] = useState(false);

  // Carrega veterinário logado e seus artigos
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/vets?includePending=true');
        const data = await res.json();
        if (data && data.length > 0) {
          const defaultVet = data[0]; // Dr. Alexandre Mendes
          setVet(defaultVet);
          setProcedimentos(defaultVet.procedimentos || []);

          // Carrega artigos do vet
          const resArtigos = await fetch(`/api/dashboard/artigos?veterinarioId=${defaultVet.id}`);
          if (resArtigos.ok) {
            const artigosData = await resArtigos.json();
            setArtigos(artigosData || []);
          }
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
      console.error('Erro ao salvar artigo:', err);
    } finally {
      setSavingArtigo(false);
    }
  };

  const handleDeleteArtigo = async (id: string) => {
    try {
      const res = await fetch(`/api/dashboard/artigos?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setArtigos(artigos.filter(a => a.id !== id));
      }
    } catch (err) {
      console.error('Erro ao excluir artigo:', err);
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

        {/* BLOG DO VETERINÁRIO (ARTIGOS & EDUCAÇÃO DE TUTORES) */}
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
                placeholder="https://exemplo.com/foto-do-artigo.jpg (Deixe em branco para imagem automática)"
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
              <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" /> Conteúdo Completo do Artigo
              </label>
              <textarea
                rows={4}
                value={artigoConteudo}
                onChange={(e) => setArtigoConteudo(e.target.value)}
                placeholder="Escreva as explicações médicas, orientações práticas de prevenção e quando procurar ajuda profissional..."
                required
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-normal focus:outline-hidden leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingArtigo}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-[#147A44] to-[#1B85B8] hover:from-[#11693A] hover:to-[#16709C] text-white text-xs font-bold transition-all shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                {savingArtigo ? 'Publicando...' : 'Publicar Artigo no Portal'}
              </button>
            </div>
          </form>

          {/* Listagem de artigos publicados */}
          {artigos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {artigos.map((art) => (
                <div key={art.id} className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all bg-white flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        {art.categoria}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {art.titulo}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {art.resumo}
                      </p>
                    </div>
                    {art.fotoUrl && (
                      <img
                        src={art.fotoUrl}
                        alt={art.titulo}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" /> {art.visualizacoes || 0} visualizações
                    </span>
                    <button
                      onClick={() => handleDeleteArtigo(art.id)}
                      className="text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              Você ainda não publicou nenhum artigo. Escreva seu primeiro texto acima!
            </div>
          )}

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
