/**
 * Utilitários para auditoria, formatação e verificação de CRMV (Conselho Regional de Medicina Veterinária)
 */

export interface CrmvStatusInfo {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number | null;
  statusLabel: string;
  badgeColor: string;
}

export function formatCrmv(numero: string, uf: string): string {
  const cleanNum = numero.replace(/\D/g, '');
  return `${uf.toUpperCase()}-${cleanNum}`;
}

export function checkCrmvValidity(validade: Date | string | null): CrmvStatusInfo {
  if (!validade) {
    return {
      isActive: false,
      isExpired: false,
      daysRemaining: null,
      statusLabel: 'Pendente de Verificação',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    };
  }

  const dataValidade = new Date(validade);
  const hoje = new Date();
  const diffTime = dataValidade.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      isActive: false,
      isExpired: true,
      daysRemaining: 0,
      statusLabel: 'CRMV Expirado / Anuidade Pendente',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
    };
  }

  return {
    isActive: true,
    isExpired: false,
    daysRemaining: diffDays,
    statusLabel: 'CRMV Ativo & Verificado',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
}

/**
 * Retorna a URL oficial do Portal de Consulta de Profissionais do CFMV (Siscad Web)
 */
export function getCfmvConsultaUrl(numero?: string, uf?: string): string {
  return 'https://siscad.cfmv.gov.br/';
}
