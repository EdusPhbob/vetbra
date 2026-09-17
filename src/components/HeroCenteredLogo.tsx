'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function HeroCenteredLogo({ children }: { children?: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* BANNER WIDESCREEN 100% VIVO NO TOPO (DESAPARECE TOTALMENTE AO ROLAR) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none overflow-hidden select-none z-0 transition-all duration-500 ease-out transform ${
          scrolled 
            ? 'opacity-0 scale-95 blur-md pointer-events-none' 
            : 'opacity-100 scale-100 blur-0'
        }`}
      >
        <img
          src="/hero-widescreen.jpg"
          alt="VetBra Ilustração Widescreen Oficial"
          className="w-full h-full max-w-6xl max-h-[72vh] object-cover rounded-3xl shadow-2xl border-4 border-white/80"
        />
      </div>

      {/* CONTEÚDO DE TEXTOS (EXIBIDO COM CLAREZA APÓS ROLAR OU EM MODO CLEAN) */}
      <div 
        className={`relative z-10 transition-all duration-500 ease-out ${
          scrolled 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-2 pointer-events-none invisible'
        }`}
      >
        {children}
      </div>

      {/* ANIMAÇÃO DA SETA 'ROLE PARA BAIXO' PISCANDO NO INÍCIO */}
      <div 
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 transition-all duration-500 ${
          scrolled ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border-2 border-emerald-500 text-xs sm:text-sm font-black text-[#147A44] animate-bounce cursor-pointer">
          <ChevronDown className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
          <span>Role para baixo para buscar e ver o mapa</span>
        </div>
      </div>
    </>
  );
}
