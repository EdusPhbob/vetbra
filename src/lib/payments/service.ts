import prisma from '@/lib/prisma';
import { 
  MetodoPagamento, 
  FaturaStatus, 
  AssinaturaStatus, 
  PagamentoStatus, 
  VetStatusGeral 
} from '@prisma/client';
import { getOrCreateAsaasCustomer, createAsaasPayment } from './asaas';
import { registrarAuditoria } from '@/lib/audit';

export interface GerarFaturaParams {
  assinaturaId: string;
  metodo?: MetodoPagamento;
  diasValidade?: number;
}

/**
 * Gera ou atualiza uma fatura com cobrança Pix ou Boleto no Asaas
 */
export async function gerarFaturaParaAssinatura({
  assinaturaId,
  metodo = MetodoPagamento.PIX,
  diasValidade = 3,
}: GerarFaturaParams) {
  const assinatura = await prisma.assinatura.findUnique({
    where: { id: assinaturaId },
    include: {
      plano: true,
      veterinario: {
        include: { user: true },
      },
    },
  });

  if (!assinatura) {
    throw new Error('Assinatura não encontrada.');
  }

  const { veterinario, plano } = assinatura;
  const { user } = veterinario;

  // 1. Obtém ou cria cliente no Gateway Asaas
  const asaasCustomerId = await getOrCreateAsaasCustomer({
    name: veterinario.nomeCompleto,
    email: user.email,
    cpfCnpj: veterinario.cpfCnpj,
    phone: veterinario.whatsapp || veterinario.telefone,
  });

  // 2. Data de vencimento
  const dataVencimento = new Date();
  dataVencimento.setDate(dataVencimento.getDate() + diasValidade);
  const dueDateStr = dataVencimento.toISOString().split('T')[0];

  // 3. Número sequencial da fatura
  const anoAtual = new Date().getFullYear();
  const countFaturas = await prisma.faturaCobranca.count();
  const numeroFatura = `FAT-${anoAtual}-${String(countFaturas + 1).padStart(4, '0')}`;

  const valor = Number(assinatura.valorAtual || plano.precoMensal);

  // 4. Criação no gateway
  const paymentResult = await createAsaasPayment({
    customerId: asaasCustomerId,
    billingType: metodo === MetodoPagamento.BOLETO ? 'BOLETO' : 'PIX',
    value: valor,
    dueDate: dueDateStr,
    description: `Assinatura ${plano.nome} - Portal VetBra SaaS`,
    externalReference: numeroFatura,
  });

  // 5. Salva a fatura no banco de dados PostgreSQL
  const fatura = await prisma.faturaCobranca.create({
    data: {
      assinaturaId,
      numeroFatura,
      valor,
      status: FaturaStatus.PENDENTE,
      metodoPreferencial: metodo,
      gatewayCobrancaId: paymentResult.id,
      pixCopiaCola: paymentResult.pixCopiaCola || null,
      pixQrCodeUrl: paymentResult.pixQrCodeUrl || null,
      boletoCodigoBarras: paymentResult.boletoCodigoBarras || null,
      boletoLinhaDigitavel: paymentResult.boletoLinhaDigitavel || null,
      boletoPdfUrl: paymentResult.boletoPdfUrl || null,
      dataVencimento,
    },
  });

  // 6. Registra na trilha de auditoria
  await registrarAuditoria({
    entidade: 'FATURA',
    registroId: fatura.id,
    acao: 'CRIACAO',
    autorEmail: user.email,
    autorRole: user.role,
    dadosNovos: { numeroFatura, valor, metodo, gatewayCobrancaId: paymentResult.id },
    justificativa: `Emissão de fatura ${metodo} para assinatura ${plano.nome}`,
  });

  return fatura;
}

/**
 * Liquidação atômica de fatura e ativação de assinatura
 */
export async function liquidarFatura({
  faturaId,
  valorPago,
  gatewayTransacaoId,
  pixEndToEndId,
  autorEmail = 'GATEWAY_WEBHOOK',
}: {
  faturaId: string;
  valorPago?: number;
  gatewayTransacaoId?: string;
  pixEndToEndId?: string | null;
  autorEmail?: string;
}) {
  const fatura = await prisma.faturaCobranca.findUnique({
    where: { id: faturaId },
    include: {
      assinatura: {
        include: { plano: true, veterinario: { include: { user: true } } },
      },
    },
  });

  if (!fatura) {
    throw new Error('Fatura não encontrada.');
  }

  if (fatura.status === FaturaStatus.PAGA) {
    return { success: true, alreadyPaid: true, fatura };
  }

  const finalValue = valorPago ?? Number(fatura.valor);
  const diasPlano = fatura.assinatura.ciclo === 'ANUAL' ? 365 : 30;

  const result = await prisma.$transaction(async (tx) => {
    // 1. Atualiza Fatura para PAGA
    const faturaAtualizada = await tx.faturaCobranca.update({
      where: { id: fatura.id },
      data: {
        status: FaturaStatus.PAGA,
        dataLiquidacao: new Date(),
      },
    });

    // 2. Registra Pagamento
    const idUnico = gatewayTransacaoId || `pay-${fatura.id}-${Date.now()}`;
    await tx.pagamento.create({
      data: {
        faturaId: fatura.id,
        metodo: fatura.metodoPreferencial,
        status: PagamentoStatus.APROVADO,
        valorPago: finalValue,
        idempotencyKey: `idemp-${idUnico}`,
        gatewayTransacaoId: idUnico,
        pixEndToEndId: pixEndToEndId || null,
        pagoEm: new Date(),
      },
    });

    // 3. Cancela qualquer outra assinatura ativa prévia
    await tx.assinatura.updateMany({
      where: {
        veterinarioId: fatura.assinatura.veterinarioId,
        status: AssinaturaStatus.ATIVA,
        id: { not: fatura.assinaturaId },
      },
      data: {
        status: AssinaturaStatus.CANCELADA,
        canceladaEm: new Date(),
      },
    });

    // 4. Ativa a assinatura atual por 30 ou 365 dias
    const dataFimPeriodo = new Date();
    dataFimPeriodo.setDate(dataFimPeriodo.getDate() + diasPlano);

    await tx.assinatura.update({
      where: { id: fatura.assinaturaId },
      data: {
        status: AssinaturaStatus.ATIVA,
        dataInicio: new Date(),
        dataFimPeriodo,
      },
    });

    // 5. Ativa o veterinário caso esteja aguardando
    await tx.veterinario.update({
      where: { id: fatura.assinatura.veterinarioId },
      data: { statusGeral: VetStatusGeral.ATIVO },
    });

    // 6. Auditoria
    await tx.auditoriaLog.create({
      data: {
        entidade: 'ASSINATURA',
        registroId: fatura.assinaturaId,
        acao: 'APROVACAO',
        autorEmail,
        autorRole: 'ADMIN',
        dadosNovos: {
          faturaId: fatura.id,
          numeroFatura: fatura.numeroFatura,
          valorPago: finalValue,
          statusAssinatura: AssinaturaStatus.ATIVA,
          dataFimPeriodo,
        },
        justificativa: `Liquidação confirmada de fatura ${fatura.numeroFatura}`,
      },
    });

    return { success: true, fatura: faturaAtualizada, dataFimPeriodo };
  });

  // Dispara e-mail de confirmação de pagamento para o veterinário
  if (result.success && fatura.assinatura?.veterinario?.user?.email) {
    try {
      const { sendPaymentConfirmedEmail } = await import('@/lib/email');
      await sendPaymentConfirmedEmail({
        to: fatura.assinatura.veterinario.user.email,
        nome: fatura.assinatura.veterinario.nomeCompleto,
        planoNome: fatura.assinatura.plano.nome,
        valor: finalValue,
        proximoVencimento: result.dataFimPeriodo,
      });
    } catch (emailError) {
      console.error('Falha ao enviar e-mail de confirmação de pagamento:', emailError);
    }
  }

  return result;
}
