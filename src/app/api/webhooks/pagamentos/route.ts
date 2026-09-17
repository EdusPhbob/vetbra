import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { 
  FaturaStatus, 
  AssinaturaStatus, 
  PagamentoStatus, 
  MetodoPagamento, 
  VetStatusGeral 
} from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const gateway = request.headers.get('x-gateway-name') || 'MERCADOPAGO_OU_ASAAS';
    
    // Identificador único do evento fornecido pelo gateway
    const eventId = body.id || body.eventId || body.data?.id || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const tipoEvento = body.event || body.type || body.action || 'PAYMENT_RECEIVED';

    // 1. Verificação de Idempotência
    const eventoExistente = await prisma.webhookEvent.findUnique({
      where: { eventId: String(eventId) }
    });

    if (eventoExistente && eventoExistente.processado) {
      return NextResponse.json({
        success: true,
        message: 'Evento já processado com sucesso anteriormente (Idempotente).'
      }, { status: 200 });
    }

    // Registra o evento recebido
    const webhookLog = await prisma.webhookEvent.upsert({
      where: { eventId: String(eventId) },
      update: {},
      create: {
        gateway,
        eventId: String(eventId),
        tipoEvento: String(tipoEvento),
        payloadJson: body,
        processado: false
      }
    });

    // Identifica a fatura pelo número da fatura ou ID externo da cobrança
    const numeroFatura = body.numeroFatura || body.data?.external_reference || body.externalReference;
    const gatewayCobrancaId = body.cobrancaId || body.data?.id;

    if (!numeroFatura && !gatewayCobrancaId) {
      // Confirma recebimento para o gateway mesmo que não seja um evento de cobrança direta
      return NextResponse.json({ success: true, message: 'Evento registrado para telemetria.' });
    }

    const fatura = await prisma.faturaCobranca.findFirst({
      where: {
        OR: [
          ...(numeroFatura ? [{ numeroFatura: String(numeroFatura) }] : []),
          ...(gatewayCobrancaId ? [{ gatewayCobrancaId: String(gatewayCobrancaId) }] : [])
        ]
      },
      include: {
        assinatura: true
      }
    });

    if (!fatura) {
      return NextResponse.json({ error: 'Fatura correspondente não encontrada.' }, { status: 404 });
    }

    // Processamento da Liquidação (Pix ou Boleto Compensado)
    const valorPago = body.valorPago || body.data?.transaction_amount || Number(fatura.valor);
    const pixEndToEndId = body.pixEndToEndId || body.data?.charges?.[0]?.last_transaction?.gateway_response?.end_to_end_id || null;

    await prisma.$transaction(async (tx) => {
      // 1. Atualiza Fatura para PAGA
      await tx.faturaCobranca.update({
        where: { id: fatura.id },
        data: {
          status: FaturaStatus.PAGA,
          dataLiquidacao: new Date()
        }
      });

      // 2. Registra o Pagamento com chave de idempotência
      await tx.pagamento.create({
        data: {
          faturaId: fatura.id,
          metodo: fatura.metodoPreferencial || MetodoPagamento.PIX,
          status: PagamentoStatus.APROVADO,
          valorPago,
          idempotencyKey: `pay-${eventId}`,
          gatewayTransacaoId: String(eventId),
          pixEndToEndId,
          pagoEm: new Date()
        }
      });

      // 3. Cancela qualquer outra assinatura ativa anterior do mesmo veterinário
      await tx.assinatura.updateMany({
        where: {
          veterinarioId: fatura.assinatura.veterinarioId,
          status: AssinaturaStatus.ATIVA,
          id: { not: fatura.assinaturaId }
        },
        data: {
          status: AssinaturaStatus.CANCELADA,
          canceladaEm: new Date()
        }
      });

      // 4. Ativa a Assinatura atual
      await tx.assinatura.update({
        where: { id: fatura.assinaturaId },
        data: {
          status: AssinaturaStatus.ATIVA,
          dataFimPeriodo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
        }
      });

      // 5. Atualiza o status geral do Veterinário para ATIVO
      await tx.veterinario.update({
        where: { id: fatura.assinatura.veterinarioId },
        data: {
          statusGeral: VetStatusGeral.ATIVO
        }
      });

      // 6. Marca o Webhook como processado
      await tx.webhookEvent.update({
        where: { id: webhookLog.id },
        data: {
          processado: true,
          processadoEm: new Date()
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Pagamento liquidado com sucesso e assinatura ativada!'
    });
  } catch (error: any) {
    console.error('Erro no processamento do webhook:', error);
    return NextResponse.json({ error: 'Erro no webhook: ' + error.message }, { status: 500 });
  }
}
