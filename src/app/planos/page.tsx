import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check, Sparkles, ShieldCheck, ArrowRight, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Planos de Assinatura para Veterinários & Clínicas | VetBra',
  description: 'Aumente o fluxo de pacientes no seu consultório com CRMV verificado, destaque nas buscas e agendamento direto pelo WhatsApp.'
};

export default function PlanosPage() {
  const planos = [
    {
      nome: 'Básico',
      preco: '79,90',
      periodo: '/mês',
      descricao: 'Ideal para profissionais autônomos ou recém-formados iniciando divulgação.',
      destaque: false,
      recursos: [
        'Perfil oficial na plataforma VetBra',
        'Selo de CRMV Verificado no CFMV',
        'Exibição de Telefone e WhatsApp',
        'Tabela básica de procedimentos e preços',
        'Localização no mapa e raio de atendimento',
        'Suporte via e-mail'
      ]
    },
    {
      nome: 'Profissional',
      preco: '149,90',
      periodo: '/mês',
      descricao: 'O plano mais procurado por clínicas e especialistas para atração contínua.',
      destaque: true,
      popularTag: 'Mais Escolhido',
      recursos: [
        'Tudo do Plano Básico',
        'Destaque preferencial nas buscas da sua cidade',
        'Galeria de fotos do consultório (até 10 fotos)',
        'Links para Instagram, Facebook e Site',
        'Recebimento e moderação de avaliações de tutores',
        'Painel SaaS de estatísticas (visitas e cliques)',
        'Perfil 100% limpo sem anúncios de concorrentes'
      ]
    },
    {
      nome: 'Premium',
      preco: '299,90',
      periodo: '/mês',
      descricao: 'Máxima visibilidade para hospitais veterinários 24h e clínicas de referência.',
      destaque: false,
      recursos: [
        'Tudo do Plano Profissional',
        'Destaque MÁXIMO no topo das buscas regionais',
        'Prioridade absoluta no mapa interativo',
        'Selo de Prestígio Premium com borda dourada',
        'Relatórios analíticos semanais de desempenho',
        'Botão de agendamento de contato prioritário',
        'Suporte dedicado com gerente de conta'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      {/* HERO SECTION */}
      <section className="bg-gradient-to-b from-emerald-50 via-white to-slate-50 pt-16 pb-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-[#147A44] text-xs font-bold border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" /> Planos Transparentes e Sem Fidelidade
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Multiplique a visibilidade da sua clínica veterinária
          </h1>

          <p className="text-base text-slate-600 font-medium">
            Milhares de tutores buscam atendimento veterinário todos os dias na VetBra. Escolha o plano ideal para o seu momento profissional.
          </p>
        </div>
      </section>

      {/* CARDS DE PLANOS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {planos.map((plano) => (
            <div
              key={plano.nome}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative bg-white border ${
                plano.destaque
                  ? 'border-emerald-600 shadow-2xl ring-2 ring-emerald-600/30 scale-105 z-10'
                  : 'border-slate-200 shadow-xs hover:border-slate-300'
              }`}
            >
              {plano.popularTag && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {plano.popularTag}
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold text-slate-900">{plano.nome}</h3>
                <p className="text-xs text-slate-500 mt-1 min-h-[36px]">{plano.descricao}</p>

                <div className="my-6 pt-6 border-t border-slate-100 flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-500">R$</span>
                  <span className="text-4xl font-black text-slate-900">{plano.preco}</span>
                  <span className="text-xs font-semibold text-slate-400">{plano.periodo}</span>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    O que está incluído:
                  </span>
                  {plano.recursos.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-emerald-50 text-[#147A44] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 mt-8 border-t border-slate-100">
                <Link
                  href={`/cadastro?plano=${plano.nome.toLowerCase()}`}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    plano.destaque
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-700/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  Começar com {plano.nome}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[10px] text-center text-slate-400 font-semibold mt-2.5">
                  Cancele quando quiser • Sem taxas ocultas
                </p>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* PERGUNTAS FREQUENTES (FAQ) */}
      <section className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Dúvidas Frequentes sobre os Planos</h2>
            <p className="text-xs text-slate-500 font-medium">Tudo o que você precisa saber antes de cadastrar seu consultório.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#147A44]" /> Como é feita a cobrança dos pacientes?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você não paga nenhuma comissão sobre suas consultas ou procedimentos! O tutor fala diretamente com seu WhatsApp ou telefone, e você recebe 100% do valor cobrado.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#147A44]" /> Quanto tempo demora a verificação do CRMV?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nossa equipe audita os dados no Siscad/CFMV em até 24 horas úteis. Assim que aprovado, o selo verde de verificação é ativado no seu perfil.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#147A44]" /> Posso alterar meus preços e procedimentos?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sim! Pelo seu painel SaaS você tem total autonomia para cadastrar, editar ou ocultar procedimentos e valores sempre que desejar.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#147A44]" /> Existe fidelidade ou contrato de longo prazo?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Não. A assinatura é mensal e pode ser cancelada a qualquer momento diretamente pelo painel do veterinário, sem multas.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
