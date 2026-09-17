import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VetCard from '@/components/VetCard';
import HeroSearch from '@/components/HeroSearch';
import VetMapExplorer from '@/components/VetMapExplorer';
import HeroCenteredLogo from '@/components/HeroCenteredLogo';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  Star, 
  Stethoscope, 
  Clock, 
  Home, 
  Award, 
  ChevronRight,
  TrendingUp,
  Users,
  Calendar,
  Bell,
  ThumbsUp,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const revalidate = 60; // Regeneração ISR a cada 60s para SEO máximo

export default async function HomePage() {
  // Puxa os veterinários em destaque diretamente do PostgreSQL do Coolify
  const vetsDestaque = await prisma.veterinario.findMany({
    where: { crmvStatus: 'VERIFICADO' },
    include: {
      enderecos: true,
      especialidades: true,
      procedimentos: { where: { ativo: true } },
      avaliacoes: true
    },
    take: 6,
    orderBy: [{ destaqueBusca: 'desc' }, { visualizacoesCount: 'desc' }]
  });

  // Todos os veterinários verificados para o mapa interativo
  const todosVets = await prisma.veterinario.findMany({
    where: { crmvStatus: 'VERIFICADO' },
    include: {
      enderecos: true,
      especialidades: true,
      procedimentos: { where: { ativo: true } },
      avaliacoes: true
    }
  });

  // Veterinários recém-cadastrados (Novos perfis no VetBra)
  const novosVets = await prisma.veterinario.findMany({
    where: { crmvStatus: 'VERIFICADO' },
    include: {
      enderecos: true,
      especialidades: true
    },
    orderBy: { createdAt: 'desc' },
    take: 6
  });

  // Artigos recentes do Blog publicados pelos veterinários
  const artigos = await prisma.artigo.findMany({
    where: { publicado: true },
    include: {
      veterinario: true
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  // Avaliações mais recentes de tutores
  const avaliacoes = await prisma.avaliacao.findMany({
    include: {
      veterinario: true
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  });

  const especialidades = [
    { nome: 'Clínica Geral', icon: '🩺', desc: 'Consultas de rotina, vacinas e check-ups' },
    { nome: 'Cardiologia', icon: '❤️', desc: 'Eletrocardiograma e ecocardiograma' },
    { nome: 'Dermatologia', icon: '🐾', desc: 'Alergias, coceiras e problemas de pele' },
    { nome: 'Ortopedia', icon: '🦴', desc: 'Fraturas, ligamentos e cirurgias ósseas' },
    { nome: 'Oftalmologia', icon: '👁️', desc: 'Catarata, úlceras de córnea e visão' },
    { nome: 'Animais Silvestres', icon: '🦜', desc: 'Aves, répteis, roedores e exóticos' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Header />

      {/* HERO SECTION PRINCIPAL (100% DA ALTURA DA TELA - SEM CORTAR CARDS OU EXIBIR MAPA) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white min-h-[calc(100vh-80px)] flex flex-col justify-between py-4 sm:py-6 border-b border-slate-200">
        
        {/* BACKGROUND GRID SUAVE */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#147a440a_1px,transparent_1px),linear-gradient(to_bottom,#147a440a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* LOGO OFICIAL VETBRA COMO MARCA D'ÁGUA ELEGANTE NO FUNDO */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <img
            src="/logo-vetbra.jpg"
            alt=""
            className="w-[420px] h-[420px] sm:w-[580px] sm:h-[580px] object-cover rounded-full opacity-[0.05] blur-[1px] scale-105"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full flex-1 flex flex-col justify-between py-1 space-y-4">
          
          {/* CONTEÚDO CENTRALIZADO (Pill Animada, Logo Central com Efeito Scroll, Título, Subtítulo e Busca) */}
          <div className="text-center max-w-4xl mx-auto space-y-3 my-auto">
            
            {/* LOGO CENTRALIZADO COM GLOW E EFEITO DE DESAPARECER AO ROLAR O MAPA */}
            <HeroCenteredLogo />

            {/* BOTÃO ANIMADO DE CADASTRO DO VETERINÁRIO/CLÍNICA */}
            <div className="flex justify-center">
              <Link
                href="/cadastro"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white hover:bg-emerald-50 text-[#147A44] border border-emerald-300 font-bold text-xs shadow-xs hover:shadow-md transition-all hover:scale-[1.02] group relative overflow-hidden"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#147A44]"></span>
                </span>
                <Stethoscope className="w-3.5 h-3.5 text-[#147A44] group-hover:rotate-12 transition-transform shrink-0" />
                <span>É Médico Veterinário ou Clínica? Cadastre-se aqui</span>
                <ChevronRight className="w-3 h-3 text-emerald-600 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Encontre veterinários perto de você em <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#147A44] to-[#1B85B8]">poucos segundos.</span>
            </h1>

            <p className="text-xs sm:text-sm lg:text-base text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              A maior plataforma brasileira para conectar tutores de pets aos melhores veterinários e clínicas veterinárias próximas.
            </p>

            {/* BARRA DE BUSCA PRINCIPAL COM SELETOR DE PET, ESPECIALIDADE E CEP */}
            <HeroSearch />

          </div>

          {/* CARDS DE ESTATÍSTICAS (SEÇÃO INTEGRADA NO LIMITE INFERIOR DA PRIMEIRA TELA) */}
          <div className="max-w-7xl mx-auto w-full pt-1 pb-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              {/* Card 1: Vets Cadastrados */}
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#147A44] flex items-center justify-center font-bold">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ativos hoje
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight group-hover:text-[#147A44] transition-colors">
                    +3.500
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Veterinários Cadastrados
                  </div>
                </div>
              </div>

              {/* Card 2: CRMV Auditado */}
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#147A44] flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    CFMV / Siscad
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-[#147A44] tracking-tight">
                    100%
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    CRMV Auditado no CFMV
                  </div>
                </div>
              </div>

              {/* Card 3: Pets Atendidos */}
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    Em todo o Brasil
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    +120 mil
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Pets Atendidos
                  </div>
                </div>
              </div>

              {/* Card 4: Avaliação */}
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group flex flex-col justify-between space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                    5 Estrelas
                  </span>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-1 group-hover:text-amber-500 transition-colors">
                    4.9 <span className="text-amber-400 text-xl">★</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                    Avaliação dos Tutores
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* MAPA INTERATIVO COM GEOLOCALIZAÇÃO E DESLOCAMENTO SUAVE */}
      <VetMapExplorer vets={todosVets} />

      {/* ESPECIALIDADES GRID */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase text-[#147A44] tracking-wider">Categorias de Atendimento</span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-1">Especialidades Mais Procuradas</h2>
            </div>
            <Link href="/buscar" className="text-xs font-bold text-[#147A44] hover:underline flex items-center gap-1">
              Ver todas as especialidades <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {especialidades.map((esp) => (
              <Link
                key={esp.nome}
                href={`/buscar?especialidade=${encodeURIComponent(esp.nome)}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all group flex flex-col items-center text-center space-y-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 group-hover:scale-110 transition-transform flex items-center justify-center text-2xl">
                  {esp.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#147A44]">{esp.nome}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-snug">{esp.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VETERINÁRIOS EM DESTAQUE (DO BANCO POSTGRESQL REAL) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#147A44] text-xs font-bold mb-2 border border-emerald-200">
                <Award className="w-3.5 h-3.5" /> Profissionais em Destaque
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Médicos Veterinários Verificados</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Perfis completos com tabela de procedimentos e agendamento via WhatsApp.</p>
            </div>
            <Link href="/buscar" className="text-xs font-bold text-[#147A44] hover:underline flex items-center gap-1">
              Explorar todos os veterinários <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vetsDestaque.map((vet) => (
              <VetCard key={vet.id} vet={vet} />
            ))}
          </div>
        </div>
      </section>

      {/* 4 BENEFÍCIOS ESSENCIAIS (ESTILO DOCTORALIA) */}
      <section className="py-12 bg-white border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#147A44] flex items-center justify-center shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Encontre especialistas</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Busque por especialistas de saúde animal em sua região. Filtre por especialidades, valores ou disponibilidade.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#147A44] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Marque consultas</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Escolha o profissional, dia e horário que desejar, falando diretamente no WhatsApp sem taxas intermediárias.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#147A44] flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Receba lembretes</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Confirmação ágil e acompanhamento das datas de vacinação, retorno e check-up com facilidade.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#147A44] flex items-center justify-center shrink-0">
                <ThumbsUp className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Avalie o serviço</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Após o atendimento veterinário você pode deixar sua opinião para ajudar outros tutores. Tudo gratuito e transparente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG PARA TUTORES & OPINIÕES MAIS RECENTES */}
      <section id="blog-tutores" className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Coluna 1: Blog para pacientes / tutores */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Blog para pacientes</h2>
                <Link href="/buscar" className="text-xs font-bold text-[#147A44] hover:underline flex items-center gap-1">
                  Ver todos os artigos <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-6">
                {artigos.map((artigo) => (
                  <div key={artigo.id} className="space-y-2 group">
                    <div className="flex items-start gap-3">
                      {artigo.veterinario?.fotoPerfilUrl ? (
                        <img
                          src={artigo.veterinario.fotoPerfilUrl}
                          alt={artigo.veterinario.nomeCompleto}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 mt-1"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                          {artigo.veterinario?.nomeCompleto?.charAt(0) || 'V'}
                        </div>
                      )}

                      <div className="space-y-1">
                        <Link href={`/vets/${artigo.veterinario?.slug || ''}`}>
                          <h3 className="text-base font-bold text-[#147A44] group-hover:text-emerald-600 transition-colors leading-snug">
                            {artigo.titulo}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 font-medium">
                          De <span className="text-slate-700 font-semibold">{artigo.veterinario?.nomeCompleto}</span>
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {artigo.resumo}
                        </p>
                        <div className="pt-1">
                          <Link 
                            href={`/buscar?especialidade=${encodeURIComponent(artigo.categoria)}`}
                            className="text-xs font-semibold text-[#147A44] hover:underline"
                          >
                            Todos os textos sobre <span className="font-bold">{artigo.categoria}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coluna 2: Opiniões mais recentes */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Opiniões mais recentes</h2>
                <span className="text-xs font-semibold text-slate-400">Avaliações verificadas</span>
              </div>

              <div className="space-y-6">
                {avaliacoes.map((av) => (
                  <div key={av.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {av.veterinario?.fotoPerfilUrl ? (
                          <img
                            src={av.veterinario.fotoPerfilUrl}
                            alt={av.veterinario.nomeCompleto}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                            {av.veterinario?.nomeCompleto?.charAt(0) || 'V'}
                          </div>
                        )}
                        <span className="text-sm font-bold text-slate-900">
                          {av.veterinario?.nomeCompleto}
                        </span>
                      </div>

                      {/* Estrelas Verdes */}
                      <div className="flex items-center gap-0.5 text-emerald-600">
                        {Array.from({ length: av.nota || 5 }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                        ))}
                      </div>
                    </div>

                    {/* Balão de Depoimento Cinza Claro */}
                    <div className="bg-slate-100/80 rounded-2xl p-4 text-xs text-slate-700 leading-relaxed">
                      <p>"{av.comentario}"</p>
                      <p className="mt-2 text-slate-400 italic text-[11px] font-medium">
                        {av.nomeTutor}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NOVOS PERFIS NO VETBRA (CADASTROS RECENTES DO BANCO) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Novos perfis no VetBra</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Médicos veterinários auditados e recém-integrados à plataforma.
              </p>
            </div>
            <Link href="/buscar" className="text-xs font-bold text-[#147A44] hover:underline flex items-center gap-1">
              Ver todos <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Cards dos novos veterinários */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {novosVets.map((novVet) => {
              const espPrincipal = novVet.especialidades?.[0]?.nome || 'Clínica Geral';
              const endPrincipal = novVet.enderecos?.[0];
              const localidade = endPrincipal ? `${endPrincipal.cidade}, ${endPrincipal.estado}` : 'São Paulo, SP';

              return (
                <div
                  key={novVet.id}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:shadow-xs transition-all bg-white flex items-center gap-3.5"
                >
                  {novVet.fotoPerfilUrl ? (
                    <img
                      src={novVet.fotoPerfilUrl}
                      alt={novVet.nomeCompleto}
                      className="w-14 h-14 rounded-full object-cover shrink-0 border border-slate-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#147A44] flex items-center justify-center font-bold text-lg shrink-0">
                      {novVet.nomeCompleto.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h3 className="text-sm font-bold text-slate-900 truncate" title={novVet.nomeCompleto}>
                      {novVet.nomeCompleto}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">
                      {espPrincipal}, {localidade}
                    </p>
                    <Link
                      href={`/vets/${novVet.slug}`}
                      className="text-xs font-semibold text-[#147A44] hover:underline block pt-1"
                    >
                      Mostrar perfil
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indicadores sutis de carrossel estilo Doctoralia */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            <span className="w-2 h-2 rounded-full bg-[#147A44]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
