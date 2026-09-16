import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VetCard from '@/components/VetCard';
import { 
  ShieldCheck, 
  Search, 
  MapPin, 
  Star, 
  Stethoscope, 
  Clock, 
  Home, 
  Award, 
  CheckCircle2, 
  ChevronRight,
  TrendingUp,
  Users
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

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white pt-12 pb-20 border-b border-slate-200">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#147a440a_1px,transparent_1px),linear-gradient(to_bottom,#147a440a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300/50 text-[#147A44] text-xs font-bold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-[#147A44]" />
              100% dos Médicos Auditados e com CRMV Ativo no CFMV
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Encontre o melhor veterinário para o seu pet com <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#147A44] to-[#1B85B8]">CRMV Verificado</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Conectamos você a clínicas de excelência, especialistas renomados, hospitais 24h e veterinários a domicílio em todo o Brasil.
            </p>

            {/* BARRA DE BUSCA PRINCIPAL */}
            <div className="pt-6 max-w-3xl mx-auto">
              <form action="/buscar" method="GET" className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                
                {/* Campo Especialidade */}
                <div className="space-y-1 px-3 py-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    O que seu pet precisa?
                  </label>
                  <select 
                    name="especialidade" 
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Todas">Todas as Especialidades</option>
                    <option value="Clínica Geral">Clínica Geral</option>
                    <option value="Cardiologia">Cardiologia</option>
                    <option value="Dermatologia">Dermatologia</option>
                    <option value="Ortopedia">Ortopedia</option>
                    <option value="Oftalmologia">Oftalmologia</option>
                    <option value="Animais Exóticos e Silvestres">Silvestres & Exóticos</option>
                    <option value="Cirurgia Geral">Cirurgia Geral</option>
                  </select>
                </div>

                {/* Campo Cidade/Estado */}
                <div className="space-y-1 px-3 py-1 sm:border-l border-slate-200">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Localização (Cidade/UF)
                  </label>
                  <input
                    type="text"
                    name="cidade"
                    placeholder="Ex: São Paulo, SP"
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden placeholder:text-slate-400"
                  />
                </div>

                {/* Botão de Busca */}
                <div className="flex items-center">
                  <button
                    type="submit"
                    className="w-full h-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#147A44] to-[#1B85B8] hover:from-[#11693A] hover:to-[#16709C] text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    Buscar Vets
                  </button>
                </div>

              </form>

              {/* Filtros rápidos abaixo da busca */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-semibold text-slate-500">
                <span className="text-slate-400">Atalhos:</span>
                <Link href="/buscar?atende24h=true" className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 transition-colors flex items-center gap-1">
                  <Clock className="w-3 h-3 text-rose-500" /> Plantão 24 Horas
                </Link>
                <Link href="/buscar?domiciliar=true" className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center gap-1">
                  <Home className="w-3 h-3 text-blue-500" /> Atendimento Domiciliar
                </Link>
                <Link href="/buscar?especialidade=Dermatologia" className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 transition-colors">
                  Dermatologia Pet
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-slate-900 text-white py-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-black text-emerald-400">+3.500</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Veterinários Cadastrados</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">CRMV Auditado no CFMV</div>
            </div>
            <div>
              <div className="text-3xl font-black text-blue-400">+120 mil</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Pets Atendidos</div>
            </div>
            <div>
              <div className="text-3xl font-black text-amber-400">4.9 ★</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Avaliação dos Tutores</div>
            </div>
          </div>
        </div>
      </section>

      {/* ESPECIALIDADES GRID */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
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

      {/* COMO FUNCIONA A AUDITORIA DE CRMV */}
      <section id="como-funciona" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Segurança & Ética Profissional</span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Como o VetBra protege a saúde do seu pet</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              O exercício ilegal da profissão coloca animais em risco. Na VetBra, nenhum profissional é exibido sem aprovação prévia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/60 p-8 rounded-3xl border border-slate-700/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Cadastro do Profissional</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                O médico veterinário ou gestor da clínica informa seu CRMV, estado de registro (UF), envia a cédula de identidade profissional e cadastra seus procedimentos.
              </p>
            </div>

            <div className="bg-slate-800/60 p-8 rounded-3xl border border-slate-700/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Auditoria Oficial no CFMV</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nossa equipe de moderação confere a inscrição no Siscad do Conselho Federal de Medicina Veterinária, atestando status ativo e anuidade regular.
              </p>
            </div>

            <div className="bg-slate-800/60 p-8 rounded-3xl border border-slate-700/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Selo de Verificado Concedido</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                O veterinário ganha o selo oficial VetBra, aparece nas primeiras posições de busca e o tutor tem a certeza de um atendimento capacitado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA PARA CLÍNICAS & VETERINÁRIOS (MONETIZAÇÃO SAAS) */}
      <section className="py-20 bg-gradient-to-tr from-emerald-800 via-[#147A44] to-[#1B85B8] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 sm:p-14 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                Para Médicos Veterinários & Clínicas
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Receba mais pacientes em seu consultório todos os dias
              </h2>
              <p className="text-sm text-slate-200 leading-relaxed">
                Tenha um perfil oficial com CRMV verificado, gerencie seus procedimentos e receba contatos diretos no seu WhatsApp de tutores da sua região.
              </p>
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-emerald-200">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem intermediários nas consultas</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Painel SaaS exclusivo de métricas</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href="/planos"
                className="px-8 py-4 rounded-2xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 shadow-xl transition-all text-center cursor-pointer"
              >
                Conhecer Planos
              </Link>
              <Link
                href="/cadastro"
                className="px-8 py-4 rounded-2xl bg-emerald-700/60 hover:bg-emerald-700 border border-white/20 text-white font-bold text-sm shadow-xl transition-all text-center cursor-pointer"
              >
                Cadastrar Consultório
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
