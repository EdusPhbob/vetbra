'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export default function HeroCenteredLogo() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* IMAGEM DA ARTE GIGANTE VIVA NO FUNDO DA PRIMEIRA TELA (DESAPARECE 100% AO ROLAR) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
        <div 
          className={`transition-all duration-500 ease-out transform ${
            scrolled 
              ? 'opacity-0 scale-90 blur-md pointer-events-none' 
              : 'opacity-90 sm:opacity-95 scale-100 blur-0'
          }`}
        >
          <img
            src="/logo-vetbra.jpg"
            alt="VetBra Arte Ilustração Oficial"
            className="w-[500px] h-[500px] sm:w-[750px] sm:h-[750px] md:w-[900px] md:h-[900px] lg:w-[1000px] lg:h-[1000px] object-cover rounded-[3rem] shadow-2xl border-4 border-white/60"
          />
        </div>
      </div>

      {/* ANIMAÇÃO DA SETA 'ROLE PARA BAIXO' PISCANDO E QUICANDO NO CENTRO INFERIOR */}
      <div 
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10 transition-all duration-500 ${
          scrolled ? 'opacity-0 translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-xl border-2 border-emerald-400 text-xs font-black text-[#147A44] animate-bounce cursor-pointer">
          <ChevronDown className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span>Role para baixo para explorar o mapa</span>
        </div>
      </div>
    </>
  );
}
