import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    let vetId = session.vetId;
    if (!vetId) {
      const vet = await prisma.veterinario.findUnique({
        where: { userId: session.userId }
      });
      vetId = vet?.id;
    }

    if (!vetId) {
      return NextResponse.json({ error: 'Perfil de veterinário não encontrado.' }, { status: 404 });
    }

    const tickets = await prisma.ticketSuporte.findMany({
      where: { veterinarioId: vetId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Erro ao listar tickets:', error);
    return NextResponse.json({ error: 'Erro ao listar chamados.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    let vetId = session.vetId;
    if (!vetId) {
      const vet = await prisma.veterinario.findUnique({
        where: { userId: session.userId }
      });
      vetId = vet?.id;
    }

    if (!vetId) {
      return NextResponse.json({ error: 'Perfil de veterinário não encontrado.' }, { status: 404 });
    }

    const body = await request.json();
    const { assunto, categoria = 'DUVIDA', mensagem } = body;

    if (!assunto || !mensagem) {
      return NextResponse.json({ error: 'Assunto e mensagem são obrigatórios.' }, { status: 400 });
    }

    const ticket = await prisma.ticketSuporte.create({
      data: {
        veterinarioId: vetId,
        assunto,
        categoria,
        mensagem,
        status: 'ABERTO'
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error('Erro ao abrir chamado:', error);
    return NextResponse.json({ error: 'Erro ao abrir chamado.' }, { status: 500 });
  }
}
