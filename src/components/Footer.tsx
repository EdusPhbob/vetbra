import React from 'react';
import Link from 'next/link';
import { Stethoscope } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-slate-600 pt-16 pb-12 border-t border-slate-200 mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-slate-100">
          
          {/* Coluna 1 - Serviço */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Serviço</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link href="/privacidade" className="hover:text-emerald-700 transition-colors">Privacidade e cookies</Link></li>
              <li><Link href="/configuracoes" className="hover:text-emerald-700 transition-colors">Configurar</Link></li>
              <li><Link href="/privacidade-profissionais" className="hover:text-emerald-700 transition-colors">Privacidade para profissionais não cadastrados</Link></li>
              <li><Link href="/sobre" className="hover:text-emerald-700 transition-colors">Sobre nós</Link></li>
              <li><Link href="/contato" className="hover:text-emerald-700 transition-colors">Contato</Link></li>
              <li>
                <Link href="/carreiras" className="hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5">
                  Vagas <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-bold text-[10px]">Estamos contratando!</span>
                </Link>
              </li>
              <li><Link href="/termos" className="hover:text-emerald-700 transition-colors">Termos e Condições</Link></li>
              <li><Link href="/imprensa" className="hover:text-emerald-700 transition-colors">Imprensa</Link></li>
              <li><Link href="/igualdade-salarial" className="hover:text-emerald-700 transition-colors">Lei da Igualdade Salarial</Link></li>
            </ul>
          </div>

          {/* Coluna 2 - Tutores & Pacientes */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Tutores & Pacientes</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link href="/buscar" className="hover:text-emerald-700 transition-colors">Especialistas</Link></li>
              <li><Link href="/buscar?tipo=Clinica" className="hover:text-emerald-700 transition-colors">Clínicas e Hospitais</Link></li>
              <li><Link href="/buscar?atende24h=true" className="hover:text-emerald-700 transition-colors">Pronto-Socorro 24h</Link></li>
              <li><Link href="/duvidas" className="hover:text-emerald-700 transition-colors">Pergunte ao veterinário</Link></li>
              <li><Link href="/buscar" className="hover:text-emerald-700 transition-colors">Vacinas e Medicamentos</Link></li>
              <li><Link href="/buscar" className="hover:text-emerald-700 transition-colors">Serviços e Procedimentos</Link></li>
              <li><Link href="/doencas-pet" className="hover:text-emerald-700 transition-colors">Prevenção e Doenças</Link></li>
              <li><Link href="/faq" className="hover:text-emerald-700 transition-colors">Perguntas frequentes</Link></li>
              <li><Link href="/app" className="hover:text-emerald-700 transition-colors">Aplicações móveis</Link></li>
              <li><Link href="/#blog-tutores" className="hover:text-emerald-700 transition-colors">Blog para tutores</Link></li>
            </ul>
          </div>

          {/* Coluna 3 - Para Especialistas e Clínicas */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">Para especialistas e clínicas</h4>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><Link href="/planos" className="hover:text-emerald-700 transition-colors">Preço dos Planos</Link></li>
              <li><Link href="/cadastro" className="hover:text-emerald-700 transition-colors">Solução para especialistas autônomos</Link></li>
              <li><Link href="/cadastro" className="hover:text-emerald-700 transition-colors">Solução para clínicas e hospitais</Link></li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-700 transition-colors inline-flex items-center gap-1.5">
                  VetBra Notes <span className="px-1.5 py-0.2 rounded-md bg-emerald-700 text-white font-bold text-[9px] uppercase">novo</span>
                </Link>
              </li>
              <li><Link href="/dashboard" className="hover:text-emerald-700 transition-colors">Painel do Médico (SaaS)</Link></li>
              <li><Link href="/termos" className="hover:text-emerald-700 transition-colors">Termos de uso médico</Link></li>
              <li><Link href="/seguranca" className="hover:text-emerald-700 transition-colors">Alerta de segurança e CRMV</Link></li>
              <li><Link href="/suporte" className="hover:text-emerald-700 transition-colors">Central de Ajuda para clientes</Link></li>
            </ul>
          </div>

          {/* Coluna 4 - Identidade e Marca VetBra */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/logo-vetbra.jpg"
                alt="VetBra Logo Oficial"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
              <div className="flex flex-col">
                <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                  Vet<span className="text-[#147A44]">Bra</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                  Veterinária Mais Perto
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1 leading-relaxed">
              <p className="font-semibold text-slate-700">VetBra Brasil Serviços Online e Software Veterinário Ltda</p>
              <p>Rua Joaquim Floriano, 466 - Itaim Bibi</p>
              <p>04534-000 São Paulo (SP), Brasil</p>
            </div>

            {/* Ícones de Redes Sociais */}
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition-colors" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-center transition-colors" aria-label="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

        </div>

        {/* Linha inferior de copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} VetBra Brasil. Todos os direitos reservados. Plataforma auditada em conformidade com o CFMV.</p>
          <p className="text-slate-400">www.vetbra.duosat.com.br</p>
        </div>
      </div>
    </footer>
  );
}
