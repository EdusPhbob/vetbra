import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CrmvStatus } from '@prisma/client';
import { sendCrmvRenewalWarningEmail } from '@/lib/email';
import { registrarAuditoria } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const agora = new Date();
    const daquiA30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Busca veterinários verificados cujo CRMV vence nos próximos 30 dias e ainda não receberam alerta
    const vetsParaAlertar = await prisma.veterinario.findMany({
      where: {
        crmvStatus: CrmvStatus.VERIFICADO,
        crmvValidade: {
          gte: agora,
          lte: daquiA30Dias,
        },
        crmvAlerta30diasEnviado: false,
      },
      include: {
        user: true,
      },
    });

    let avisosEnviados = 0;

    for (const vet of vetsParaAlertar) {
      if (!vet.user?.email || !vet.crmvValidade) continue;

      // Envia o e-mail de alerta
      await sendCrmvRenewalWarningEmail({
        to: vet.user.email,
        nome: vet.nomeCompleto,
        crmvNumero: vet.crmvNumero,
        crmvUf: vet.crmvUf,
        validade: vet.crmvValidade,
      });

      // Marca o alerta como enviado
      await prisma.veterinario.update({
        where: { id: vet.id },
        data: { crmvAlerta30diasEnviado: true },
      });

      // Registra na trilha de auditoria
      await registrarAuditoria({
        entidade: 'VETERINARIO',
        registroId: vet.id,
        acao: 'EDICAO',
        autorEmail: 'CRON_CRMV_RENOVACAO',
        autorRole: 'ADMIN',
        dadosNovos: { crmvAlerta30diasEnviado: true, crmvValidade: vet.crmvValidade },
        justificativa: `Disparo automático de alerta preventivo de renovação de CRMV (30 dias antes do vencimento)`,
      });

      avisosEnviados++;
    }

    return NextResponse.json({
      success: true,
      dataExecucao: agora.toISOString(),
      avisosEnviados,
      totalAnalisado: vetsParaAlertar.length,
    });
  } catch (error: any) {
    console.error('Erro na cron de renovação de CRMV:', error);
    return NextResponse.json({ error: 'Erro no disparo de alertas: ' + error.message }, { status: 500 });
  }
}
