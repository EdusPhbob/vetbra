'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Stethoscope, Search, ShieldCheck, User, Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo VetBra Oficial (Formato Quadrado) */}
          <Link href="/" className="flex items-center gap-3 group">
            <img
              src="/logo-vetbra.jpg"
              alt="VetBra Logo Oficial"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-slate-200 shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Vet<span className="text-[#147A44]">Bra</span></span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#147A44] border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Oficial
                </span>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wider uppercase -mt-0.5">
                Veterinária Mais Perto De Você
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/buscar" 
              className="text-sm font-semibold text-slate-600 hover:text-[#147A44] transition-colors"
            >
              Buscar Veterinários
            </Link>
            <Link 
              href="/planos" 
              className="text-sm font-semibold text-slate-600 hover:text-[#147A44] transition-colors"
            >
              Planos para Clínicas & Vets
            </Link>
            <Link 
              href="/#como-funciona" 
              className="text-sm font-semibold text-slate-600 hover:text-[#147A44] transition-colors"
            >
              Como Funciona
            </Link>
            <Link 
              href="/admin" 
              className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors uppercase tracking-wider"
            >
              Moderação CRMV
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
            >
              <User className="w-3.5 h-3.5 text-[#147A44]" />
              Área do Veterinário
            </Link>

            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1B85B8] to-[#147A44] hover:from-[#16709C] hover:to-[#11693A] shadow-md shadow-emerald-700/10 transition-all hover:scale-[1.02]"
            >
              <Search className="w-3.5 h-3.5" />
              Encontrar Vet
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-3">
            <Link
              href="/buscar"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Buscar Veterinários
            </Link>
            <Link
              href="/planos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Planos para Clínicas & Vets
            </Link>
            <Link
              href="/#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Como Funciona
            </Link>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
              >
                Área do Veterinário
              </Link>
              <Link
                href="/buscar"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#1B85B8] to-[#147A44]"
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
