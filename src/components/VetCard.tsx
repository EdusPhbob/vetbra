'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Clock, MessageCircle, Star, Sparkles, Check, Plus } from 'lucide-react';
import { formatCrmv } from '@/lib/crmv';

interface VetCardProps {
  vet: any;
  isCompared?: boolean;
  onToggleCompare?: (vet: any) => void;
}

export default function VetCard({ vet, isCompared, onToggleCompare }: VetCardProps) {
  const enderecoPrincipal = vet.enderecos?.[0] || {};
  const consulta = vet.procedimentos?.find((p: any) => (p.categoria?.toString() || '').toLowerCase().includes('consulta'));
  const precoConsulta = Number(consulta?.preco ?? 120);

  const totalReviews = vet.avaliacoes?.length || 0;
  const mediaNota = totalReviews > 0
    ? (vet.avaliacoes.reduce((acc: number, item: any) => acc + item.nota, 0) / totalReviews).toFixed(1)
    : null;

  const whatsappMessage = encodeURIComponent(
    `Olá Dr(a). ${vet.nomeCompleto}, encontrei seu perfil no portal VetBra e gostaria de tirar uma dúvida sobre atendimento.`
  );

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg hover:border-emerald-200 flex flex-col justify-between overflow-hidden relative ${
      vet.destaqueBusca ? 'ring-2 ring-emerald-500/20 border-emerald-300' : 'border-slate-200'
    }`}>
      
      {/* Badge de Destaque / CRMV */}
      <div className="p-5 pb-0">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#147A44] text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#147A44]" />
            <span>CRMV {formatCrmv(vet.crmvNumero, vet.crmvUf)} Ativo</span>
          </div>

          {vet.atende24h && (
            <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold uppercase">
              24 Horas
            </span>
          )}

          {vet.atendeDomiciliar && !vet.atende24h && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-extrabold">
              Domiciliar
            </span>
          )}
        </div>

        {/* Top Perfil Info */}
        <div className="flex gap-3.5">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
            {vet.fotoPerfilUrl ? (
              <img
                src={vet.fotoPerfilUrl}
                alt={vet.nomeCompleto}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-slate-400">
                Vet
              </div>
            )}
            {vet.plano === 'PREMIUM' && (
              <div className="absolute bottom-0 right-0 bg-amber-400 text-amber-950 p-0.5 rounded-tl-md">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-[#147A44]">
              {vet.nomeCompleto}
            </h3>
            {vet.nomeSocialOuClinica && (
              <p className="text-xs font-semibold text-slate-500 truncate">
                {vet.nomeSocialOuClinica}
              </p>
            )}

            {totalReviews > 0 ? (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-600">
                <div className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 mr-0.5" />
                  <span>{mediaNota}</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-400">({totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-medium">
                <Star className="w-3.5 h-3.5 text-slate-300 mr-0.5" />
                <span className="text-[11px]">Novo perfil (Sem avaliações)</span>
              </div>
            )}
          </div>
        </div>

        {/* Especialidades */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {vet.especialidades?.slice(0, 3).map((esp: any) => (
            <span
              key={esp.id || esp.nome}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
            >
              {esp.nome}
            </span>
          ))}
          {vet.especialidades?.length > 3 && (
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] font-semibold">
              +{vet.especialidades.length - 3}
            </span>
          )}
        </div>

        {/* Endereço */}
        <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-2.5">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {enderecoPrincipal.bairro ? `${enderecoPrincipal.bairro}, ` : ''}
              {enderecoPrincipal.cidade || 'São Paulo'} - {enderecoPrincipal.estado || 'SP'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1.5 truncate text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 truncate">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{vet.horarioFuncionamento || 'Seg a Sex 08h às 18h'}</span>
            </div>
            {vet.atendeDomiciliar && (
              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px] shrink-0">
                Raio: {enderecoPrincipal.raioKmAtendimento || 15} km
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preço e Ações */}
      <div className="p-5 pt-3 mt-3 bg-slate-50 border-t border-slate-100">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-500">Consulta a partir de</span>
          <span className="text-lg font-black text-slate-900">
            R$ {precoConsulta.toFixed(2).replace('.', ',')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {onToggleCompare && (
            <button
              onClick={() => onToggleCompare(vet)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 border ${
                isCompared
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              {isCompared ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {isCompared ? 'Comparando' : 'Comparar'}
            </button>
          )}

          <Link
            href={`/vets/${vet.slug || vet.id}`}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-center transition-colors"
          >
            Ver Detalhes
          </Link>
        </div>

        <a
          href={`https://wa.me/55${vet.whatsapp}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Falar no WhatsApp
        </a>
      </div>
    </div>
  );
}
