'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  X, 
  Home, 
  Search, 
  UserPlus, 
  LayoutDashboard, 
  ShieldCheck, 
  CreditCard, 
  Stethoscope,
  ChevronRight
} from 'lucide-react';

export default function DevRouteNavigator() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const rotas = [
    {
      categoria: 'Tutores & Busca',
      items: [
        { path: '/', label: 'Home Page & Mapa', icon: Home, badge: 'Principal' },
        { path: '/buscar', label: 'Busca Avançada & Filtros', icon: Search, badge: 'Filtros' }
      ]
    },
    {
      categoria: 'Médicos & Clínicas',
      items: [
        { path: '/cadastro', label: 'Cadastro com CRMV & Veículo', icon: UserPlus, badge: 'Form' },
        { path: '/dashboard', label: 'Painel do Médico (SaaS)', icon: LayoutDashboard, badge: 'Painel' },
        { path: '/planos', label: 'Planos & Preços', icon: CreditCard, badge: 'Preços' }
      ]
    },
    {
      categoria: 'Moderação & Funcionário',
      items: [
        { path: '/admin', label: 'Moderação de CRMV', icon: ShieldCheck, badge: 'Admin' }
      ]
    },
    {
      categoria: 'Perfis Reais do Banco',
      items: [
        { path: '/vets/dr-alexandre-mendes-sp-14839', label: 'Dr. Alexandre (Fixo + Carro)', icon: Stethoscope },
        { path: '/vets/dra-camila-barros-sp-22180', label: 'Dra. Camila (Moto Express)', icon: Stethoscope },
        { path: '/vets/dr-roberto-silveira-sp-34991', label: 'Dr. Roberto (Hospital 24h)', icon: Stethoscope }
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-50 font-sans">
      {/* BOTÃO FLUTUANTE DE ABERTURA NA LATERAL ESQUERDA */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-900/95 hover:bg-slate-900 text-white py-3 px-3 rounded-r-2xl shadow-2xl border-y border-r border-slate-700/80 backdrop-blur-md flex items-center gap-2 group transition-all cursor-pointer hover:pl-4"
          title="Abrir Navegador de Páginas do Site"
        >
          <Compass className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-wide pr-1">Páginas</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* PAINEL LATERAL EXPANDIDO */}
      {isOpen && (
        <div className="bg-slate-900/98 backdrop-blur-xl text-white w-72 sm:w-80 rounded-r-3xl shadow-2xl border-y border-r border-slate-800 p-5 space-y-5 animate-in slide-in-from-left duration-200">
          
          {/* HEADER DO MENU */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight text-white leading-tight">
                  Páginas do Site
                </h3>
                <span className="text-[10px] font-semibold text-emerald-400">
                  Navegador em Construção
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* LISTA DE ROTAS AGRUPADAS */}
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1 text-xs">
            {rotas.map((grupo) => (
              <div key={grupo.categoria} className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-2">
                  {grupo.categoria}
                </span>

                <div className="space-y-1">
                  {grupo.items.map((item) => {
                    const isActive = pathname === item.path;
                    const IconComp = item.icon;

                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                          isActive
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <IconComp className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md ${
                            isActive ? 'bg-slate-950/20 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800'
                          }`}>
                            {item.path}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* RODAPÉ DO NAVEGADOR */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Servidor Dev Ativo</span>
            <span className="text-emerald-400 font-bold">Porta 3000</span>
          </div>

        </div>
      )}
    </aside>
  );
}
