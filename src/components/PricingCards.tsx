'use client';

import React from 'react';
import Link from 'next/link';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

export interface PlanItem {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  periodo: string;
  destaque?: boolean;
  tagDestaque?: string;
  recursos: string[];
}

export const PLANOS_DISPONIVEIS: PlanItem[] = [
  {
    id: 'BASICO',
    nome: 'Básico',
    descricao: 'Ideal para profissionais autônomos ou recém-formados iniciando divulgação.',
    preco: '79,90',
    periodo: '/mês',
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
    id: 'PROFISSIONAL',
    nome: 'Profissional',
    descricao: 'O plano mais procurado por clínicas e especialistas para atração contínua.',
    preco: '149,90',
    periodo: '/mês',
    destaque: true,
    tagDestaque: 'MAIS ESCOLHIDO',
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
    id: 'PREMIUM',
    nome: 'Premium',
    descricao: 'Máxima visibilidade para hospitais veterinários 24h e clínicas de referência.',
    preco: '299,90',
    periodo: '/mês',
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

interface PricingCardsProps {
  mode?: 'link' | 'select';
  selectedPlan?: string;
  onSelectPlan?: (planId: string) => void;
  className?: string;
}

export default function PricingCards({
  mode = 'link',
  selectedPlan,
  onSelectPlan,
  className = ''
}: PricingCardsProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch ${className}`}>
      {PLANOS_DISPONIVEIS.map((plano) => {
        const isSelected = selectedPlan === plano.id;

        return (
          <div
            key={plano.id}
            onClick={() => mode === 'select' && onSelectPlan && onSelectPlan(plano.id)}
            className={`relative rounded-[32px] bg-white p-8 sm:p-9 flex flex-col justify-between transition-all duration-300 ${
              mode === 'select' ? 'cursor-pointer' : ''
            } ${
              plano.destaque
                ? 'border-2 border-[#00875A] shadow-xl md:-translate-y-2'
                : 'border border-slate-200/80 shadow-sm hover:border-slate-300'
            } ${
              isSelected ? 'ring-4 ring-[#00875A]/30 border-[#00875A] scale-[1.02]' : ''
            }`}
          >
            {/* BADGE FLUTUANTE CENTRALIZADA NO TOPO */}
            {plano.tagDestaque && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00875A] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5 whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 fill-white text-white" />
                <span>{plano.tagDestaque}</span>
              </div>
            )}

            <div>
              {/* NOME & SUBTÍTULO */}
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {plano.nome}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed min-h-[38px]">
                  {plano.descricao}
                </p>
              </div>

              {/* PREÇO */}
              <div className="my-6 pt-4 flex items-baseline gap-1">
                <span className="text-xs font-bold text-slate-900 self-baseline mr-1">R$</span>
                <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  {plano.preco}
                </span>
                <span className="text-xs font-semibold text-slate-400 ml-1">
                  {plano.periodo}
                </span>
              </div>

              {/* LISTA DE RECURSOS */}
              <div className="space-y-3.5 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  O QUE ESTÁ INCLUÍDO:
                </span>
                <ul className="space-y-2.5">
                  {plano.recursos.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium leading-relaxed">
                      <Check className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* BOTÃO CTA & RODAPÉ */}
            <div className="pt-8 mt-8 border-t border-slate-100">
              {mode === 'link' ? (
                <Link
                  href={`/cadastro?plano=${plano.nome.toLowerCase()}`}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    plano.destaque
                      ? 'bg-[#00875A] hover:bg-[#00704A] text-white shadow-emerald-700/20'
                      : 'bg-[#111827] hover:bg-black text-white'
                  }`}
                >
                  <span>Começar com {plano.nome}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectPlan && onSelectPlan(plano.id)}
                  className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-[#00875A] text-white shadow-emerald-700/25 ring-2 ring-[#00875A]/40'
                      : plano.destaque
                      ? 'bg-[#00875A] hover:bg-[#00704A] text-white shadow-emerald-700/20'
                      : 'bg-[#111827] hover:bg-black text-white'
                  }`}
                >
                  <span>{isSelected ? `Plano ${plano.nome} Selecionado ✓` : `Começar com ${plano.nome} →`}</span>
                </button>
              )}

              <p className="text-[11px] text-center text-slate-400 font-medium mt-3">
                Cancele quando quiser • Sem taxas ocultas
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
