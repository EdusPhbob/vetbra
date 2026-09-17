import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export interface RegistrarAuditoriaParams {
  entidade: 'VETERINARIO' | 'ASSINATURA' | 'FATURA' | 'PAGAMENTO' | 'DOCUMENTO' | 'USUARIO' | 'SISTEMA';
  registroId: string;
  acao: 'CRIACAO' | 'EDICAO' | 'APROVACAO' | 'REJEICAO' | 'SUSPENSAO' | 'CANCELAMENTO' | 'ESTORNO';
  autorId?: string | null;
  autorEmail?: string | null;
  autorRole?: Role | null;
  dadosAnteriores?: any;
  dadosNovos?: any;
  justificativa?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}

/**
 * Registra uma entrada na trilha de auditoria universal do sistema
 */
export async function registrarAuditoria(params: RegistrarAuditoriaParams) {
  try {
    return await prisma.auditoriaLog.create({
      data: {
        entidade: params.entidade,
        registroId: params.registroId,
        acao: params.acao,
        autorId: params.autorId || null,
        autorEmail: params.autorEmail || null,
        autorRole: params.autorRole || null,
        dadosAnteriores: params.dadosAnteriores ? JSON.parse(JSON.stringify(params.dadosAnteriores)) : undefined,
        dadosNovos: params.dadosNovos ? JSON.parse(JSON.stringify(params.dadosNovos)) : undefined,
        justificativa: params.justificativa || null,
        ip: params.ip || null,
        userAgent: params.userAgent || null,
      },
    });
  } catch (error) {
    console.error('Falha ao gravar log de auditoria:', error);
    return null;
  }
}
