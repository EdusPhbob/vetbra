'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Stethoscope, Search, ShieldCheck, User, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#147A44] shadow-lg border-b border-emerald-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-3">
          
          {/* Logo VetBra Oficial (Apenas a imagem grande do logo, sem texto) */}
          <Link href="/" className="flex items-center group">
            <img
              src="/logo-vetbra.jpg"
              alt="VetBra Logo Oficial"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/30 shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
          </Link>

          {/* Desktop Nav (Letras Brancas) */}
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
            <Link 
              href="/admin" 
              className="text-xs font-bold text-emerald-200/80 hover:text-white transition-colors uppercase tracking-wider"
            >
              Moderação CRMV
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-sm transition-all"
            >
              <User className="w-3.5 h-3.5 text-white" />
              Área do Veterinário
            </Link>

            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#147A44] bg-white hover:bg-emerald-50 shadow-md transition-all hover:scale-[1.02]"
            >
              <Search className="w-3.5 h-3.5 text-[#147A44]" />
              Encontrar Vet
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
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
          <div className="md:hidden py-4 border-t border-emerald-600 space-y-3">
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
            <div className="pt-2 border-t border-emerald-600 flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-white/15 border border-white/20"
              >
                Área do Veterinário
              </Link>
              <Link
                href="/buscar"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-[#147A44] bg-white"
              >
                Encontrar Vet Agora
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
