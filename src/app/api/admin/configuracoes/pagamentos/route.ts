import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { registrarAuditoria } from '@/lib/audit';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    let config = await prisma.configuracaoPagamento.findUnique({
      where: { id: 'default' }
    });

    if (!config) {
      config = await prisma.configuracaoPagamento.create({
        data: {
          id: 'default',
          gatewayPadrao: 'ASAAS',
          ambienteGateway: 'PRODUCAO',
          pixAtivo: true,
          boletoAtivo: true,
          cartaoAtivo: true,
          pixTipoChave: 'CNPJ',
          pixChave: '50.123.456/0001-89',
          pixBeneficiario: 'VetBra Tecnologia e Intermediações Ltda',
          pixCidade: 'São Paulo',
          pixInstrucoes: 'Pague via Pix Copia e Cola ou QR Code e anexe o comprovante no painel.',
          descontoPixPercentual: 0,
          diasVencimentoBoleto: 3,
          diasTrialPadrao: 7
        }
      });
    }

    return NextResponse.json(config);
  } catch (error: any) {
    console.error('Erro ao buscar configurações de pagamento:', error);
    return NextResponse.json({ error: 'Erro ao buscar configurações.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const body = await request.json();
    const adminEmail = session.login || session.nome || session.email || 'admin';

    const {
      gatewayPadrao,
      ambienteGateway,
      pixAtivo,
      boletoAtivo,
      cartaoAtivo,
      pixChave,
      pixTipoChave,
      pixBeneficiario,
      pixCidade,
      pixInstrucoes,
      descontoPixPercentual,
      diasVencimentoBoleto,
      diasTrialPadrao,
      boletoMaxParcelas,
      boletoJurosAoMes,
      cartaoMaxParcelas,
      cartaoParcelasSemJuros,
      cartaoJurosAoMes,
      instrucoesCadastroConta
    } = body;

    const anterior = await prisma.configuracaoPagamento.findUnique({
      where: { id: 'default' }
    });

    const updated = await prisma.configuracaoPagamento.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        gatewayPadrao: gatewayPadrao || 'ASAAS',
        ambienteGateway: ambienteGateway || 'PRODUCAO',
        pixAtivo: pixAtivo ?? true,
        boletoAtivo: boletoAtivo ?? true,
        cartaoAtivo: cartaoAtivo ?? true,
        pixChave: pixChave?.trim() || null,
        pixTipoChave: pixTipoChave || 'CNPJ',
        pixBeneficiario: pixBeneficiario?.trim() || null,
        pixCidade: pixCidade?.trim() || 'São Paulo',
        pixInstrucoes: pixInstrucoes?.trim() || null,
        descontoPixPercentual: Number(descontoPixPercentual || 0),
        diasVencimentoBoleto: Number(diasVencimentoBoleto || 3),
        diasTrialPadrao: Number(diasTrialPadrao || 7),
        boletoMaxParcelas: Number(boletoMaxParcelas || 1),
        boletoJurosAoMes: Number(boletoJurosAoMes || 0),
        cartaoMaxParcelas: Number(cartaoMaxParcelas || 12),
        cartaoParcelasSemJuros: Number(cartaoParcelasSemJuros || 1),
        cartaoJurosAoMes: Number(cartaoJurosAoMes || 2.99),
        instrucoesCadastroConta: instrucoesCadastroConta?.trim() || null,
        updatedBy: adminEmail
      },
      update: {
        gatewayPadrao: gatewayPadrao || undefined,
        ambienteGateway: ambienteGateway || undefined,
        pixAtivo: pixAtivo !== undefined ? Boolean(pixAtivo) : undefined,
        boletoAtivo: boletoAtivo !== undefined ? Boolean(boletoAtivo) : undefined,
        cartaoAtivo: cartaoAtivo !== undefined ? Boolean(cartaoAtivo) : undefined,
        pixChave: pixChave !== undefined ? String(pixChave).trim() : undefined,
        pixTipoChave: pixTipoChave || undefined,
        pixBeneficiario: pixBeneficiario !== undefined ? String(pixBeneficiario).trim() : undefined,
        pixCidade: pixCidade !== undefined ? String(pixCidade).trim() : undefined,
        pixInstrucoes: pixInstrucoes !== undefined ? String(pixInstrucoes).trim() : undefined,
        descontoPixPercentual: descontoPixPercentual !== undefined ? Number(descontoPixPercentual) : undefined,
        diasVencimentoBoleto: diasVencimentoBoleto !== undefined ? Number(diasVencimentoBoleto) : undefined,
        diasTrialPadrao: diasTrialPadrao !== undefined ? Number(diasTrialPadrao) : undefined,
        boletoMaxParcelas: boletoMaxParcelas !== undefined ? Number(boletoMaxParcelas) : undefined,
        boletoJurosAoMes: boletoJurosAoMes !== undefined ? Number(boletoJurosAoMes) : undefined,
        cartaoMaxParcelas: cartaoMaxParcelas !== undefined ? Number(cartaoMaxParcelas) : undefined,
        cartaoParcelasSemJuros: cartaoParcelasSemJuros !== undefined ? Number(cartaoParcelasSemJuros) : undefined,
        cartaoJurosAoMes: cartaoJurosAoMes !== undefined ? Number(cartaoJurosAoMes) : undefined,
        instrucoesCadastroConta: instrucoesCadastroConta !== undefined ? String(instrucoesCadastroConta).trim() : undefined,
        updatedBy: adminEmail
      }
    });

    await registrarAuditoria({
      entidade: 'SISTEMA',
      registroId: 'configuracao_pagamentos',
      acao: 'EDICAO',
      autorId: session.userId,
      autorEmail: adminEmail,
      autorRole: 'ADMIN',
      dadosAnteriores: anterior ? (anterior as any) : null,
      dadosNovos: updated as any,
      justificativa: 'Atualização das diretrizes e meios de cobrança pelo painel admin'
    });

    return NextResponse.json({
      success: true,
      message: 'Configurações de pagamento atualizadas com sucesso!',
      config: updated
    });
  } catch (error: any) {
    console.error('Erro ao atualizar configurações de pagamento:', error);
    return NextResponse.json({ error: error.message || 'Erro ao salvar configurações.' }, { status: 500 });
  }
}
