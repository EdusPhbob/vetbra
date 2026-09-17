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
}

export default function CrmvBadge({
  veterinarioId,
  crmvNumero,
  crmvUf,
  className = '',
  size = 'md'
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
