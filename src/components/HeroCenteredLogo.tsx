'use client';

import React, { useState, useEffect } from 'react';

export default function HeroCenteredLogo() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`flex justify-center transition-all duration-500 ease-out transform ${
        scrolled 
          ? 'opacity-0 scale-50 max-h-0 pointer-events-none overflow-hidden my-0 py-0' 
          : 'opacity-100 scale-100 max-h-[380px] my-2 py-1'
      }`}
    >
      <div className="relative group">
        {/* Glow tridimensional de brilho animado em degradê verde/azul */}
        <div className="absolute -inset-2 bg-gradient-to-r from-[#147A44] via-[#16807B] to-[#1B85B8] rounded-[2.5rem] blur-xl opacity-40 group-hover:opacity-85 transition duration-500 group-hover:scale-105 animate-pulse" />
        
        {/* Logo VetBra Oficial centralizada em tamanho super amplo */}
        <img
          src="/logo-vetbra.jpg"
          alt="VetBra Logo Ilustração Oficial"
          className="relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-[2.5rem] object-cover shadow-2xl border-4 border-white transition-transform duration-300 group-hover:scale-105 shrink-0"
        />
      </div>
    </div>
  );
}
