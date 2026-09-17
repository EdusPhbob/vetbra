'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface HeroTransitionCoverProps {
  children: React.ReactNode;
}

export default function HeroTransitionCover({ children }: HeroTransitionCoverProps) {
  const [coverActive, setCoverActive] = useState(true);
  const isTransitioningRef = useRef(false);

  // Transição suave para revelar a tela de busca
  const dismissCover = () => {
    if (!coverActive || isTransitioningRef.current) return;
    setCoverActive(false);
    isTransitioningRef.current = true;
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 700);
  };

  useEffect(() => {
    // 1. Roda do Mouse (Wheel): ao rolar para baixo, previne salto brusco e inicia animação de fade
    const handleWheel = (e: WheelEvent) => {
      if (coverActive && e.deltaY > 0) {
        e.preventDefault();
        dismissCover();
      } else if (isTransitioningRef.current) {
        e.preventDefault();
      }
    };

    // 2. Teclas de Navegação (Seta para baixo, PageDown, Espaço)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (coverActive && ['ArrowDown', 'PageDown', 'Space'].includes(e.code)) {
        e.preventDefault();
        dismissCover();
      } else if (isTransitioningRef.current && ['ArrowDown', 'PageDown', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    };

    // 3. Toque no mobile / touchpads (Deslizar para cima)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (coverActive) {
        const diffY = touchStartY - e.touches[0].clientY;
        if (diffY > 15) {
          dismissCover();
        }
      }
    };

    // 4. Fallback de rolagem padrão caso ocorra
    const handleScroll = () => {
      if (coverActive && window.scrollY > 10) {
        dismissCover();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [coverActive]);

  return (
    <section
      id="busca-hero"
      className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white min-h-[calc(100vh-76px)] flex flex-col justify-between border-b border-slate-200"
    >
      {/* BACKGROUND GRID SUAVE */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#147a440a_1px,transparent_1px),linear-gradient(to_bottom,#147a440a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* 1ª CAMADA (OVERLAY): IMAGEM WIDESCREEN 100% LIMPA E TOTALMENTE CENTRALIZADA */}
      <div
        onClick={dismissCover}
        className={`absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 transition-all duration-700 ease-out cursor-pointer select-none bg-gradient-to-b from-emerald-50/95 via-slate-50/95 to-white ${
          coverActive
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {/* GRID SUTIL DA CAPA */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#147a440a_1px,transparent_1px),linear-gradient(to_bottom,#147a440a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* ÁREA CENTRAL: IMAGEM WIDESCREEN CENTRALIZADA TANTO NA VERTICAL QUANTO NA HORIZONTAL */}
        <div className="relative z-10 flex-1 w-full flex items-center justify-center my-auto">
          <div className="relative max-w-6xl w-full flex items-center justify-center p-2">
            <img
              src="/hero-widescreen.jpg"
              alt="VetBra Ilustração Widescreen Oficial"
              className="w-auto h-auto max-w-full max-h-[70vh] sm:max-h-[74vh] object-contain rounded-3xl shadow-2xl border-4 border-white transition-transform duration-300 hover:scale-[1.01]"
            />
          </div>
        </div>

        {/* BOTÃO ANIMADO 'ROLE PARA BAIXO' NO RODAPÉ DA TELA */}
        <div className="relative z-20 pt-2 pb-3 sm:pb-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dismissCover();
            }}
            className="flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-[#147A44] font-black text-xs sm:text-sm shadow-xl border-2 border-emerald-400 animate-bounce cursor-pointer hover:scale-105 transition-all"
          >
            <ChevronDown className="w-4.5 h-4.5 text-emerald-600 animate-pulse" />
            <span>Role para baixo</span>
          </button>
        </div>
      </div>

      {/* 2ª CAMADA: TELA DE BUSCA COMPLETA (PILL, TÍTULO, SUBTÍTULO, BUSCA E 4 CARDS) */}
      <div
        className={`w-full flex-1 flex flex-col justify-between transition-all duration-700 ease-out py-2 sm:py-3 ${
          coverActive
            ? 'opacity-0 scale-98 pointer-events-none'
            : 'opacity-100 scale-100 pointer-events-auto'
        }`}
      >
        {children}
      </div>
    </section>
  );
}
