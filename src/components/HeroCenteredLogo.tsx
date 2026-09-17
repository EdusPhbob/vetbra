'use client';

import React, { useState, useEffect } from 'react';

export default function HeroCenteredLogo() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`flex justify-center transition-all duration-500 ease-out transform ${
        scrolled 
          ? 'opacity-0 scale-50 max-h-0 pointer-events-none overflow-hidden my-0 py-0' 
          : 'opacity-100 scale-100 max-h-[220px] my-2 py-0.5'
      }`}
    >
      <div className="relative group">
        {/* Glow tridimensional de brilho animado em degradê verde/azul */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-[#147A44] via-[#16807B] to-[#1B85B8] rounded-3xl blur-md opacity-40 group-hover:opacity-80 transition duration-500 group-hover:scale-105 animate-pulse" />
        
        {/* Logo VetBra Oficial centralizada com iluminação e cantos suaves */}
        <img
          src="/logo-vetbra.jpg"
          alt="VetBra Logo Ilustração Oficial"
          className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-3xl object-cover shadow-2xl border-4 border-white transition-transform duration-300 group-hover:scale-105 shrink-0"
        />
      </div>
    </div>
  );
}
