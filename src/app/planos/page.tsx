import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PricingCards from '@/components/PricingCards';
import { ShieldCheck, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'Planos de Assinatura para Veterinários & Clínicas | VetBra',
  description: 'Aumente o fluxo de pacientes no seu consultório com CRMV verificado, destaque nas buscas e agendamento direto pelo WhatsApp.'
};

export default function PlanosPage() {
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
        <PricingCards mode="link" />
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
