'use client';

import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { formatCrmv, getCfmvConsultaUrl } from '@/lib/crmv';

interface CrmvBadgeProps {
  veterinarioId: string;
  crmvNumero: string;
  crmvUf: string;
  className?: string;
  size?: 'sm' | 'md';
  status?: string;
}

export default function CrmvBadge({
  veterinarioId,
  crmvNumero,
  crmvUf,
  className = '',
  size = 'md',
  status = 'VERIFICADO'
}: CrmvBadgeProps) {
  const handleClick = () => {
    try {
      fetch('/api/analytics/crmv-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ veterinarioId }),
        keepalive: true
      }).catch(() => {});
    } catch (e) {}
  };

  const url = getCfmvConsultaUrl(crmvNumero, crmvUf);
  const isVerificado = status === 'VERIFICADO';

  if (!isVerificado) {
    if (size === 'sm') {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          title="Registro cadastrado na plataforma, aguardando validação cadastral"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100/90 border border-amber-300 text-amber-800 text-[11px] font-bold transition-all group ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span>CRMV {formatCrmv(crmvNumero, crmvUf)} • Pendente de Verificação</span>
          <ExternalLink className="w-2.5 h-2.5 text-amber-600 opacity-60" />
        </a>
      );
    }

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title="Registro cadastrado na plataforma, aguardando validação cadastral e de fotos"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 hover:bg-amber-100/90 border border-amber-300 text-amber-800 text-xs font-bold transition-all group cursor-pointer ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span>CRMV {formatCrmv(crmvNumero, crmvUf)} • Pendente de Verificação</span>
        <ExternalLink className="w-3 h-3 text-amber-600 opacity-60" />
      </a>
    );
  }

  if (size === 'sm') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        title="Consultar autenticidade no Portal Oficial CFMV"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-[#147A44] text-[11px] font-bold transition-all group ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-[#147A44] group-hover:scale-110 transition-transform" />
        <span>CRMV {formatCrmv(crmvNumero, crmvUf)} Ativo</span>
        <ExternalLink className="w-2.5 h-2.5 text-emerald-600 opacity-60" />
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      title="Consultar autenticidade no Portal Oficial CFMV"
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-[#147A44] text-xs font-bold transition-all group cursor-pointer ${className}`}
    >
      <ShieldCheck className="w-4 h-4 text-[#147A44] group-hover:scale-110 transition-transform" />
      <span>CRMV {formatCrmv(crmvNumero, crmvUf)} Verificado</span>
      <ExternalLink className="w-3 h-3 text-emerald-600 opacity-60" />
    </a>
  );
}
