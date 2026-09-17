import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FaturaStatus, AssinaturaStatus, VetStatusGeral } from '@prisma/client';
import { checkAsaasPaymentStatus } from '@/lib/payments/asaas';
import { liquidarFatura } from '@/lib/payments/service';
import { registrarAuditoria } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Se houver CRON_SECRET configurado, valida a autorização
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const agora = new Date();
    const quinzeDiasAtras = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

    let faturasLiquidadas = 0;
    let faturasExpiradas = 0;
    let assinaturasSuspensas = 0;

    // 1. Busca todas as faturas pendentes emitidas nos últimos 15 dias
    const faturasPendentes = await prisma.faturaCobranca.findMany({
      where: {
        status: FaturaStatus.PENDENTE,
        createdAt: { gte: quinzeDiasAtras },
        gatewayCobrancaId: { not: null },
      },
      include: {
        assinatura: true,
      },
    });

    for (const fatura of faturasPendentes) {
      if (!fatura.gatewayCobrancaId) continue;

      // Consulta status no gateway (Asaas)
      const statusGateway = await checkAsaasPaymentStatus(fatura.gatewayCobrancaId);

      if (statusGateway) {
        if (statusGateway.status === 'RECEIVED' || statusGateway.status === 'CONFIRMED') {
          // Dinheiro caiu no banco! Liquida e ativa a assinatura
          await liquidarFatura({
            faturaId: fatura.id,
            valorPago: statusGateway.value,
            gatewayTransacaoId: statusGateway.id,
            autorEmail: 'CRON_CONCILIACAO_DIARIA',
          });
          faturasLiquidadas++;
        } else if (statusGateway.status === 'OVERDUE' || (fatura.dataVencimento && fatura.dataVencimento < agora)) {
          // Venceu e não foi paga
          await prisma.faturaCobranca.update({
            where: { id: fatura.id },
            data: { status: FaturaStatus.EXPIRADA },
          });
          faturasExpiradas++;
        }
      }
    }

    // 2. Verifica Assinaturas Ativas cujo período expirou
    const assinaturasVencidas = await prisma.assinatura.findMany({
      where: {
        status: AssinaturaStatus.ATIVA,
        dataFimPeriodo: { lt: agora },
      },
      include: { veterinario: true },
    });

    const cincoDiasAtras = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    for (const ass of assinaturasVencidas) {
      if (ass.dataFimPeriodo && ass.dataFimPeriodo < cincoDiasAtras) {
        // Tolerância de 5 dias expirou: Suspende assinatura e oculta do portal
        await prisma.$transaction([
          prisma.assinatura.update({
            where: { id: ass.id },
            data: { status: AssinaturaStatus.EXPIRADA },
          }),
          prisma.veterinario.update({
            where: { id: ass.veterinarioId },
            data: {
              statusGeral: VetStatusGeral.SUSPENSO,
              destaqueBusca: false,
            },
          }),
        ]);
        assinaturasSuspensas++;
      } else {
        // Ainda dentro da carência de 5 dias: Marca em atraso sem tirar do ar
        await prisma.assinatura.update({
          where: { id: ass.id },
          data: { status: AssinaturaStatus.EM_ATRASO },
        });
      }
    }

    // 3. Registra log de auditoria global da conciliação
    await registrarAuditoria({
      entidade: 'SISTEMA',
      registroId: 'CRON_CONCILIACAO',
      acao: 'EDICAO',
      autorEmail: 'CRON_JOB',
      autorRole: 'ADMIN',
      dadosNovos: {
        faturasVerificadas: faturasPendentes.length,
        faturasLiquidadas,
        faturasExpiradas,
        assinaturasSuspensas,
      },
      justificativa: 'Execução de rotina diária de conciliação financeira e verificação de expirações',
    });

    return NextResponse.json({
      success: true,
      timestamp: agora.toISOString(),
      metricas: {
        faturasVerificadas: faturasPendentes.length,
        faturasLiquidadas,
        faturasExpiradas,
        assinaturasSuspensas,
      },
    });
  } catch (error: any) {
    console.error('Erro no job de conciliação diária:', error);
    return NextResponse.json({ error: 'Erro na conciliação: ' + error.message }, { status: 500 });
  }
}
