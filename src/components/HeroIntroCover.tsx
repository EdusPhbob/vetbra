'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function HeroIntroCover() {
  const scrollToSearch = () => {
    const searchSection = document.getElementById('busca-hero');
    if (searchSection) {
      const headerOffset = 80;
      const elementPosition = searchSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative w-full h-[calc(100vh-80px)] min-h-[520px] max-h-[960px] bg-gradient-to-b from-emerald-50/50 via-slate-50 to-white flex flex-col justify-between items-center py-3 px-3 sm:px-6 lg:px-8 overflow-hidden select-none border-b border-slate-200">
      
      {/* BACKGROUND GRID SUTIL */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#147a440a_1px,transparent_1px),linear-gradient(to_bottom,#147a440a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* APENAS A IMAGEM WIDESCREEN LIMPA, 100% VIVA, SEM NADA ESCRITO EM CIMA */}
      <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden my-auto z-10">
        <img
          src="/hero-widescreen.jpg"
          alt="VetBra Ilustração Widescreen Oficial"
          className="w-full h-full max-w-7xl max-h-[82vh] object-contain sm:object-cover rounded-3xl shadow-2xl border-4 border-white"
        />
      </div>

      {/* APENAS O BOTÃO ANIMADO 'ROLE PARA BAIXO' */}
      <div className="pt-2 pb-1 z-20">
        <button
          type="button"
          onClick={scrollToSearch}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-[#147A44] font-black text-xs sm:text-sm shadow-xl border-2 border-emerald-400 animate-bounce cursor-pointer hover:scale-105 transition-all"
        >
          <ChevronDown className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Role para baixo</span>
        </button>
      </div>
    </section>
  );
}
