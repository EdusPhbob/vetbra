import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { liquidarFatura } from '@/lib/payments/service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const gateway = request.headers.get('x-gateway-name') || 'ASAAS';
    
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
    const paymentData = body.payment || body;
    const numeroFatura = paymentData.externalReference || body.numeroFatura || body.data?.external_reference;
    const gatewayCobrancaId = paymentData.id || body.cobrancaId || body.data?.id;

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
      }
    });

    if (!fatura) {
      return NextResponse.json({ error: 'Fatura correspondente não encontrada.' }, { status: 404 });
    }

    // Se o evento indicar recebimento/confirmação
    const isConfirmado = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED', 'payment.created', 'payment.updated'].includes(String(tipoEvento));

    if (isConfirmado) {
      const valorPago = paymentData.value || paymentData.netValue || body.valorPago || Number(fatura.valor);
      const pixEndToEndId = paymentData.pixEndToEndId || body.pixEndToEndId || null;

      await liquidarFatura({
        faturaId: fatura.id,
        valorPago: Number(valorPago),
        gatewayTransacaoId: String(eventId),
        pixEndToEndId,
        autorEmail: `WEBHOOK_${gateway}`,
      });

      // Marca o Webhook como processado
      await prisma.webhookEvent.update({
        where: { id: webhookLog.id },
        data: {
          processado: true,
          processadoEm: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Pagamento liquidado com sucesso e assinatura ativada via webhook!'
      });
    }

    return NextResponse.json({
      success: true,
      message: `Evento ${tipoEvento} registrado sem necessidade de liquidação imediata.`
    });
  } catch (error: any) {
    console.error('Erro no processamento do webhook:', error);
    return NextResponse.json({ error: 'Erro no webhook: ' + error.message }, { status: 500 });
  }
}
