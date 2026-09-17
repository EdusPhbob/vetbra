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
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
      <div 
        className={`transition-all duration-700 ease-out transform ${
          scrolled 
            ? 'opacity-0 scale-75 blur-md' 
            : 'opacity-25 sm:opacity-30 scale-100 blur-[0.5px]'
        }`}
      >
        <img
          src="/logo-vetbra.jpg"
          alt="VetBra Marca D'água Fundo"
          className="w-[550px] h-[550px] sm:w-[800px] sm:h-[800px] md:w-[950px] md:h-[950px] lg:w-[1100px] lg:h-[1100px] object-cover rounded-full shadow-2xl border-4 border-emerald-500/20"
        />
      </div>
    </div>
  );
}
