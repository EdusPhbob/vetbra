import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CrmvStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { veterinarioId, novoStatus, validade, notas, adminEmail } = body;

    if (!veterinarioId || !novoStatus) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes.' }, { status: 400 });
    }

    const vetAtual = await prisma.veterinario.findUnique({
      where: { id: veterinarioId }
    });

    if (!vetAtual) {
      return NextResponse.json({ error: 'Veterinário não encontrado.' }, { status: 404 });
    }

    const statusAnterior = vetAtual.crmvStatus;

    // Atualiza o veterinário
    const vetAtualizado = await prisma.veterinario.update({
      where: { id: veterinarioId },
      data: {
        crmvStatus: novoStatus as CrmvStatus,
        crmvValidade: validade ? new Date(validade) : vetAtual.crmvValidade,
        crmvNotasAuditoria: notas || vetAtual.crmvNotasAuditoria,
        crmvUltimaVerificacao: new Date(),
        destaqueBusca: novoStatus === CrmvStatus.VERIFICADO ? true : vetAtual.destaqueBusca
      }
    });

    // Registra o log de auditoria
    await prisma.crmvAuditoriaLog.create({
      data: {
        veterinarioId,
        adminEmail: adminEmail || 'admin@vetbra.com.br',
        statusAnterior,
        statusNovo: novoStatus as CrmvStatus,
        motivo: notas || 'Auditoria de regularidade no CFMV/CRMV'
      }
    });

    return NextResponse.json({
      success: true,
      message: `Status do CRMV alterado com sucesso para ${novoStatus}`,
      veterinario: vetAtualizado
    });
  } catch (error: any) {
    console.error('Erro na auditoria de CRMV:', error);
    return NextResponse.json({ error: 'Erro ao processar auditoria.' }, { status: 500 });
  }
}
