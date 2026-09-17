import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { AtendimentoStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { acao, veterinarioId, leadId, nomeTutor, telefone, procedimentoNome, valorCobrado, notaAvaliacao, comentario } = body;

    if (!veterinarioId && !leadId) {
      return NextResponse.json({ error: 'Identificador do veterinário ou do atendimento obrigatório.' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const ipAnonimizado = ip.split('.').slice(0, 3).join('.') + '.xxx';

    // 1. ESTÁGIO 1: Tutor clicou no WhatsApp (Lead Gerado)
    if (acao === 'LEAD_WHATSAPP') {
      const telefoneHash = telefone
        ? crypto.createHash('sha256').update(telefone.replace(/\D/g, '')).digest('hex')
        : null;

      const lead = await prisma.atendimentoLead.create({
        data: {
          veterinarioId,
          origem: 'WHATSAPP',
          nomeTutor: nomeTutor || 'Tutor Interessado',
          telefoneHash,
          status: AtendimentoStatus.LEAD_GERADO,
          ipAnonimizado,
        }
      });

      return NextResponse.json({ success: true, leadId: lead.id, status: lead.status });
    }

    // 2. ESTÁGIO 2: Veterinário informa no Dashboard que realizou o atendimento
    if (acao === 'DECLARAR_ATENDIMENTO') {
      if (!leadId) {
        return NextResponse.json({ error: 'leadId é obrigatório para declarar atendimento.' }, { status: 400 });
      }

      const leadAtualizado = await prisma.atendimentoLead.update({
        where: { id: leadId },
        data: {
          status: AtendimentoStatus.DECLARADO_VET,
          declaradoEm: new Date(),
          procedimentoNome: procedimentoNome || 'Atendimento Geral',
          valorCobrado: valorCobrado ? Number(valorCobrado) : undefined,
        }
      });

      // Incrementa atomicamente o contador de atendimentos declarados
      await prisma.veterinario.update({
        where: { id: leadAtualizado.veterinarioId },
        data: { atendimentosDeclaradosCount: { increment: 1 } }
      });

      return NextResponse.json({ success: true, lead: leadAtualizado });
    }

    // 3. ESTÁGIO 3 e 4: Tutor confirma atendimento realizado e/ou avalia com estrelas
    if (acao === 'CONFIRMAR_E_AVALIAR') {
      if (!leadId && !veterinarioId) {
        return NextResponse.json({ error: 'Dados insuficientes para confirmação.' }, { status: 400 });
      }

      let lead;
      if (leadId) {
        lead = await prisma.atendimentoLead.update({
          where: { id: leadId },
          data: {
            status: notaAvaliacao ? AtendimentoStatus.AVALIADO : AtendimentoStatus.CONFIRMADO_TUTOR,
            confirmadoEm: new Date(),
            notaAvaliacao: notaAvaliacao ? Number(notaAvaliacao) : undefined,
            comentarioTutor: comentario || null,
          }
        });
      } else {
        // Tutor avaliando diretamente via formulário do perfil
        const telefoneHash = telefone
          ? crypto.createHash('sha256').update(telefone.replace(/\D/g, '')).digest('hex')
          : null;

        lead = await prisma.atendimentoLead.create({
          data: {
            veterinarioId,
            origem: 'DIRETO_PERFIL',
            nomeTutor: nomeTutor || 'Tutor Verificado',
            telefoneHash,
            status: notaAvaliacao ? AtendimentoStatus.AVALIADO : AtendimentoStatus.CONFIRMADO_TUTOR,
            confirmadoEm: new Date(),
            notaAvaliacao: notaAvaliacao ? Number(notaAvaliacao) : undefined,
            comentarioTutor: comentario || null,
            ipAnonimizado,
          }
        });
      }

      // Incrementa o contador de atendimentos confirmados reais
      await prisma.veterinario.update({
        where: { id: lead.veterinarioId },
        data: { atendimentosConfirmadosCount: { increment: 1 } }
      });

      return NextResponse.json({ success: true, lead });
    }

    return NextResponse.json({ error: 'Ação não reconhecida.' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro na rota de atendimentos:', error);
    return NextResponse.json({ error: 'Erro ao processar o atendimento.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const veterinarioId = searchParams.get('veterinarioId');

    if (!veterinarioId) {
      return NextResponse.json({ error: 'veterinarioId é obrigatório.' }, { status: 400 });
    }

    const atendimentos = await prisma.atendimentoLead.findMany({
      where: { veterinarioId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, atendimentos });
  } catch (error: any) {
    console.error('Erro ao listar atendimentos:', error);
    return NextResponse.json({ error: 'Erro ao listar atendimentos.' }, { status: 500 });
  }
}
