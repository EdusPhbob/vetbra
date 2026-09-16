import React from 'react';
import Link from 'next/link';
import { Stethoscope, ShieldCheck, Heart, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Coluna 1 - Sobre */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#147A44] to-[#1B85B8] flex items-center justify-center text-white font-black shadow-lg">
                <Stethoscope className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Vet<span className="text-emerald-400">Bra</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              O ecossistema oficial que conecta tutores responsáveis aos melhores médicos veterinários e clínicas do Brasil, com auditoria e verificação rigorosa de CRMV ativo.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" /> CRMV Verificado no CFMV
            </div>
          </div>

          {/* Coluna 2 - Para Tutores */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Para Tutores</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/buscar" className="hover:text-emerald-400 transition-colors">Encontrar Clínicas Próximas</Link></li>
              <li><Link href="/buscar?atende24h=true" className="hover:text-emerald-400 transition-colors">Hospitais Veterinários 24h</Link></li>
              <li><Link href="/buscar?domiciliar=true" className="hover:text-emerald-400 transition-colors">Atendimento em Domicílio</Link></li>
              <li><Link href="/buscar?especialidade=Cardiologia" className="hover:text-emerald-400 transition-colors">Especialistas e Exames</Link></li>
              <li><Link href="/#como-funciona" className="hover:text-emerald-400 transition-colors">Como Checamos o CRMV</Link></li>
            </ul>
          </div>

          {/* Coluna 3 - Para Profissionais (SaaS) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Para Veterinários</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/planos" className="hover:text-emerald-400 transition-colors">Planos de Assinatura</Link></li>
              <li><Link href="/cadastro" className="hover:text-emerald-400 transition-colors">Cadastrar meu Consultório</Link></li>
              <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors">Acessar Meu Painel (SaaS)</Link></li>
              <li><Link href="/dashboard/procedimentos" className="hover:text-emerald-400 transition-colors">Tabela de Procedimentos</Link></li>
              <li><Link href="/admin" className="hover:text-emerald-400 transition-colors">Auditoria de CRMVs</Link></li>
            </ul>
          </div>

          {/* Coluna 4 - Contato e Suporte */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Atendimento</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>contato@vetbra.com.br</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>(11) 3090-5000</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>São Paulo - SP • Atendimento em todo território nacional</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} VetBra Tecnologia Veterinária Ltda. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>para a saúde dos pets e valorização médica.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
