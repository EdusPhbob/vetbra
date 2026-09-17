import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

// POST: Veterinário responde a uma avaliação (máximo 1020 caracteres)
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const { avaliacaoId, respostaVet, vetId: passedVetId } = body;

    if (!avaliacaoId) {
      return NextResponse.json({ error: 'avaliacaoId é obrigatório.' }, { status: 400 });
    }

    if (!respostaVet || !respostaVet.trim()) {
      return NextResponse.json({ error: 'O comentário de resposta não pode estar vazio.' }, { status: 400 });
    }

    const trimmedResposta = respostaVet.trim();
    if (trimmedResposta.length > 1020) {
      return NextResponse.json({
        error: `O comentário excede o limite máximo permitido de 1020 caracteres (atual: ${trimmedResposta.length}).`
      }, { status: 400 });
    }

    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId },
      include: { veterinario: true }
    });

    if (!avaliacao) {
      return NextResponse.json({ error: 'Avaliação não encontrada.' }, { status: 404 });
    }

    // Permite se o usuário é admin ou o próprio veterinário
    const effectiveVetId = session?.vetId || passedVetId;
    if (session?.role !== 'ADMIN' && effectiveVetId && avaliacao.veterinarioId !== effectiveVetId) {
      return NextResponse.json({ error: 'Você não tem permissão para responder a esta avaliação.' }, { status: 403 });
    }

    const updated = await prisma.avaliacao.update({
      where: { id: avaliacaoId },
      data: {
        respostaVet: trimmedResposta,
        respostaVetEm: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Resposta publicada com sucesso!',
      avaliacao: updated
    });
  } catch (error: any) {
    console.error('Erro ao responder avaliação:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar resposta da avaliação.' }, { status: 500 });
  }
}

// DELETE: Veterinário remove sua resposta da avaliação
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    const { searchParams } = new URL(request.url);
    const avaliacaoId = searchParams.get('id');
    const passedVetId = searchParams.get('vetId');

    if (!avaliacaoId) {
      return NextResponse.json({ error: 'id da avaliação é obrigatório.' }, { status: 400 });
    }

    const avaliacao = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId }
    });

    if (!avaliacao) {
      return NextResponse.json({ error: 'Avaliação não encontrada.' }, { status: 404 });
    }

    const effectiveVetId = session?.vetId || passedVetId;
    if (session?.role !== 'ADMIN' && effectiveVetId && avaliacao.veterinarioId !== effectiveVetId) {
      return NextResponse.json({ error: 'Você não tem permissão para alterar esta resposta.' }, { status: 403 });
    }

    const updated = await prisma.avaliacao.update({
      where: { id: avaliacaoId },
      data: {
        respostaVet: null,
        respostaVetEm: null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Resposta removida com sucesso!',
      avaliacao: updated
    });
  } catch (error: any) {
    console.error('Erro ao remover resposta da avaliação:', error);
    return NextResponse.json({ error: 'Erro ao remover resposta.' }, { status: 500 });
  }
}
