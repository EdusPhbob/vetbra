import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vetId = searchParams.get('vetId');

    if (!vetId) {
      return NextResponse.json({ error: 'vetId obrigatório' }, { status: 400 });
    }

    const procedimentos = await prisma.procedimento.findMany({
      where: { veterinarioId: vetId },
      orderBy: { categoria: 'asc' }
    });

    return NextResponse.json(procedimentos);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao listar procedimentos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { veterinarioId, nome, categoria, preco, tempoMedioMinutos, descricao } = body;

    if (!veterinarioId || !nome || preco === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    const novo = await prisma.procedimento.create({
      data: {
        veterinarioId,
        nome,
        categoria: categoria || 'Consulta',
        preco: parseFloat(preco),
        tempoMedioMinutos: tempoMedioMinutos ? parseInt(tempoMedioMinutos) : 30,
        descricao
      }
    });

    return NextResponse.json(novo);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cadastrar procedimento' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
    }

    await prisma.procedimento.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir procedimento' }, { status: 500 });
  }
}
