import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const tickets = await prisma.ticketSuporte.findMany({
      include: {
        veterinario: {
          select: {
            id: true,
            nomeCompleto: true,
            crmvNumero: true,
            crmvUf: true,
            telefone: true,
            whatsapp: true,
            user: {
              select: {
                email: true,
                login: true,
                ativo: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Erro ao listar tickets no admin:', error);
    return NextResponse.json({ error: 'Erro ao buscar chamados.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    const body = await request.json();
    const { ticketId, respostaAdmin, status } = body;

    if (!ticketId) {
      return NextResponse.json({ error: 'ticketId é obrigatório.' }, { status: 400 });
    }

    const ticketAtualizado = await prisma.ticketSuporte.update({
      where: { id: ticketId },
      data: {
        ...(respostaAdmin !== undefined && { respostaAdmin }),
        ...(status && { status }),
        respondidoPor: session.email || 'admin@vetbra.com.br',
        respondidoEm: new Date(),
      }
    });

    return NextResponse.json({ success: true, ticket: ticketAtualizado });
  } catch (error: any) {
    console.error('Erro ao responder chamado no admin:', error);
    return NextResponse.json({ error: 'Erro ao atualizar chamado.' }, { status: 500 });
  }
}
