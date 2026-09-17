'use client';

import React from 'react';
import { X, ShieldCheck, Check, Phone, MessageCircle } from 'lucide-react';
import { formatCrmv } from '@/lib/crmv';

interface VetCompareDrawerProps {
  vets: any[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export default function VetCompareDrawer({ vets, onRemove, onClear }: VetCompareDrawerProps) {
  if (vets.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-emerald-600 shadow-2xl transition-all animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Comparador de Profissionais ({vets.length}/4)
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Compare preços, procedimentos e CRMVs lado a lado.
            </span>
          </div>

          <button
            onClick={onClear}
            className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
          >
            Limpar Comparação
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 overflow-x-auto">
          {vets.map((v) => {
            const consulta = v.procedimentos?.find((p: any) => (p.categoria?.toString() || '').toLowerCase().includes('consulta'));
            const precoConsulta = Number(consulta?.preco ?? 120);
            const vacina = v.procedimentos?.find((p: any) => (p.categoria?.toString() || '').toLowerCase().includes('vacina'));
            const precoVacina = Number(vacina?.preco ?? 90);

            return (
              <div key={v.id} className="bg-slate-50 rounded-xl p-3 border border-slate-200 relative text-xs flex flex-col justify-between">
                <button
                  onClick={() => onRemove(v.id)}
                  className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-xs"
                  title="Remover da comparação"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                <div>
                  <h4 className="font-bold text-slate-900 pr-6 truncate">{v.nomeCompleto}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>CRMV {formatCrmv(v.crmvNumero, v.crmvUf)}</span>
                  </div>

                  <div className="space-y-1.5 mt-2.5 pt-2 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Consulta:</span>
                      <span className="font-bold text-slate-900">R$ {precoConsulta.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Vacinas a partir:</span>
                      <span className="font-bold text-slate-900">R$ {precoVacina.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Plantão 24h:</span>
                      <span className="font-semibold text-slate-700">{v.atende24h ? 'Sim' : 'Não'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500">Domiciliar:</span>
                      <span className="font-semibold text-slate-700">{v.atendeDomiciliar ? 'Sim' : 'Não'}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/55${v.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 py-1.5 px-2 bg-emerald-600 text-white rounded-lg font-bold text-[11px] text-center hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-3 h-3" /> Chamar no WhatsApp
                </a>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
