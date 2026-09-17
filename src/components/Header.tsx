'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Stethoscope, Search, ShieldCheck, User, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#147A44] via-[#16807B] to-[#1B85B8] shadow-lg border-b border-emerald-800/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-1.5 sm:py-2' : 'py-2 sm:py-2.5'}`}>
          
          {/* Logo VetBra Oficial (Esconde suavemente ao rolar a página) */}
          <Link 
            href="/" 
            className={`flex items-center transition-all duration-300 transform origin-left ${
              isScrolled 
                ? 'w-0 h-0 opacity-0 scale-75 pointer-events-none overflow-hidden mr-0' 
                : 'w-14 h-14 sm:w-16 sm:h-16 opacity-100 scale-100 mr-3.5'
            }`}
          >
            <img
              src="/logo-vetbra.jpg"
              alt="VetBra Logo Oficial"
              className="w-full h-full rounded-2xl object-cover border-2 border-white/40 shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
          </Link>

          {/* Desktop Nav (Letras Brancas - Mantidas no topo e na rolagem) */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/buscar" 
              className="text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
            >
              Buscar Veterinários
            </Link>
            <Link 
              href="/planos" 
              className="text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
            >
              Planos para Clínicas & Vets
            </Link>
            <Link 
              href="/#como-funciona" 
              className="text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
            >
              Como Funciona
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm transition-all"
            >
              <User className="w-3.5 h-3.5 text-white" />
              Área do Veterinário
            </Link>

            <Link
              href="/cadastro"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#147A44] bg-white hover:bg-emerald-50 shadow-md transition-all hover:scale-[1.02]"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#147A44]" />
              Novo Aqui? Cadastre-se
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-white hover:bg-white/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20 space-y-3">
            <Link
              href="/buscar"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10"
            >
              Buscar Veterinários
            </Link>
            <Link
              href="/planos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10"
            >
              Planos para Clínicas & Vets
            </Link>
            <Link
              href="/#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-white hover:bg-white/10"
            >
              Como Funciona
            </Link>
            <div className="pt-2 border-t border-white/20 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-white/15 border border-white/20"
              >
                Área do Veterinário
              </Link>
              <Link
                href="/cadastro"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-[#147A44] bg-white"
              >
                Novo Aqui? Cadastre-se
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
