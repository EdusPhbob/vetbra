import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '404 - Página Não Encontrada | VetBra',
  description: 'Parece que essa página saiu para passear e não voltou...'
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-8 text-center select-none">
      <div className="max-w-2xl w-full flex flex-col items-center space-y-6 sm:space-y-8">
        
        {/* FOTO 404 DO CACHORRINHO */}
        <div className="w-full flex justify-center">
          <img
            src="/404.jpg"
            alt="404 - Parece que essa página saiu para passear e não voltou"
            className="w-full max-w-lg sm:max-w-xl h-auto object-contain rounded-3xl"
          />
        </div>

        {/* BOTÃO DE VOLTAR & CRÉDITO STEFFINITY.COM */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#111827] hover:bg-black text-white font-bold text-sm sm:text-base shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Voltar para o Início</span>
          </Link>

          <div className="pt-2 text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span>Desenvolvido por</span>
            <a
              href="https://steffinity.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-700 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              steffinity.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
