import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        
        {/* TOPO: SLOGAN GRANDE & LINKS MINIMALISTAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-100">
          
          {/* IDENTIDADE COM SLOGAN GRANDE */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo-vetbra.jpg"
                alt="VetBra Logo Oficial"
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
              />
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                Vet<span className="text-[#147A44]">Bra</span>
              </span>
            </div>

            {/* SLOGAN GRANDE EM DESTAQUE */}
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              VETERINÁRIA MAIS PERTO DE VOCÊ
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-md">
              Conectando tutores aos melhores médicos veterinários e clínicas credenciadas com auditoria oficial de CRMV no CFMV.
            </p>
          </div>

          {/* COLUNAS MINIMALISTAS (POUCOS LINKS ESSENCIAIS) */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Coluna 1: Plataforma */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Plataforma
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 font-medium">
                <li>
                  <Link href="/buscar" className="hover:text-emerald-700 transition-colors">
                    Buscar Clínicas & Vets
                  </Link>
                </li>
                <li>
                  <Link href="/planos" className="hover:text-emerald-700 transition-colors">
                    Tabela de Planos
                  </Link>
                </li>
                <li>
                  <Link href="/cadastro" className="hover:text-emerald-700 transition-colors">
                    Cadastrar Consultório
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 2: Profissionais */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Médicos
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 font-medium">
                <li>
                  <Link href="/login" className="hover:text-emerald-700 transition-colors">
                    Painel do Veterinário
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-emerald-700 transition-colors">
                    Área do Especialista
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-emerald-700 transition-colors">
                    Central de Suporte
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Institucional */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Segurança
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 font-medium">
                <li>
                  <Link href="/termos" className="hover:text-emerald-700 transition-colors">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="hover:text-emerald-700 transition-colors">
                    Privacidade
                  </Link>
                </li>
                <li>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 inline-block">
                    ✓ CFMV Auditado
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* RODAPÉ INFERIOR MINIMALISTA COM FEITO POR STEFFINITY.COM */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} VetBra Brasil. Todos os direitos reservados.
          </p>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Feito por</span>
            <a
              href="https://steffinity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-800 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              steffinity.com
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
