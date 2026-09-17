import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CrmvStatus, VetStatusGeral, DocumentoStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { veterinarioId, novoStatus, validade, notas, adminEmail = 'admin@vetbra.com.br' } = body;

    if (!veterinarioId || !novoStatus) {
      return NextResponse.json({ error: 'Parâmetros obrigatórios ausentes.' }, { status: 400 });
    }

    const vetAtual = await prisma.veterinario.findUnique({
      where: { id: veterinarioId },
      include: { assinaturas: { where: { status: 'ATIVA' } } }
    });

    if (!vetAtual) {
      return NextResponse.json({ error: 'Veterinário não encontrado.' }, { status: 404 });
    }

    const statusAnterior = vetAtual.crmvStatus;
    const isAprovado = novoStatus === CrmvStatus.VERIFICADO;

    // Atualiza o veterinário
    const vetAtualizado = await prisma.veterinario.update({
      where: { id: veterinarioId },
      data: {
        crmvStatus: novoStatus as CrmvStatus,
        statusGeral: isAprovado ? VetStatusGeral.ATIVO : (novoStatus === CrmvStatus.REJEITADO ? VetStatusGeral.BLOQUEADO : vetAtual.statusGeral),
        crmvValidade: validade ? new Date(validade) : vetAtual.crmvValidade,
        crmvNotasAuditoria: notas || vetAtual.crmvNotasAuditoria,
        crmvUltimaVerificacao: new Date(),
        destaqueBusca: isAprovado ? true : vetAtual.destaqueBusca
      }
    });

    // Atualiza o status dos documentos vinculados
    await prisma.crmvDocumento.updateMany({
      where: { veterinarioId },
      data: {
        status: isAprovado ? DocumentoStatus.APROVADO : (novoStatus === CrmvStatus.REJEITADO ? DocumentoStatus.REJEITADO : DocumentoStatus.EM_ANALISE),
        analisadoPor: adminEmail,
        analisadoEm: new Date(),
        observacoes: notas || null
      }
    });

    // Registra o log de auditoria especializado de CRMV
    await prisma.crmvAuditoriaLog.create({
      data: {
        veterinarioId,
        adminEmail,
        statusAnterior,
        statusNovo: novoStatus as CrmvStatus,
        motivo: notas || 'Auditoria de regularidade no CFMV/CRMV'
      }
    });

    // Registra na Trilha de Auditoria Global do SaaS
    const { registrarAuditoria } = await import('@/lib/audit');
    await registrarAuditoria({
      entidade: 'DOCUMENTO',
      registroId: veterinarioId,
      acao: isAprovado ? 'APROVACAO' : (novoStatus === CrmvStatus.REJEITADO ? 'REJEICAO' : 'EDICAO'),
      autorEmail: adminEmail,
      autorRole: 'ADMIN',
      dadosAnteriores: { crmvStatus: statusAnterior, statusGeral: vetAtual.statusGeral },
      dadosNovos: { crmvStatus: novoStatus, statusGeral: vetAtualizado.statusGeral, crmvValidade: vetAtualizado.crmvValidade },
      justificativa: notas || 'Auditoria de regularidade no CFMV/CRMV',
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
