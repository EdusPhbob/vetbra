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

    if (!veterinarioId || !nome || preco === undefined || preco === null || preco === '') {
      return NextResponse.json({ error: 'Nome e valor do procedimento são obrigatórios.' }, { status: 400 });
    }

    let parsedPreco = 0;
    if (typeof preco === 'number') {
      parsedPreco = preco;
    } else if (typeof preco === 'string') {
      // Tratar formatos brasileiros: "150,00", "R$ 150,00", "1.200,50" ou "150.00"
      let clean = preco.replace(/[R$\s]/gi, '').trim();
      if (clean.includes(',') && clean.includes('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else if (clean.includes(',')) {
        clean = clean.replace(',', '.');
      }
      parsedPreco = parseFloat(clean);
    }

    if (isNaN(parsedPreco) || parsedPreco < 0) {
      return NextResponse.json({ error: 'Valor inválido. Por favor, digite um número válido (ex: 150,00).' }, { status: 400 });
    }

    const novo = await prisma.procedimento.create({
      data: {
        veterinarioId,
        nome: String(nome).trim(),
        categoria: categoria || 'Consulta',
        preco: parsedPreco,
        tempoMedioMinutos: tempoMedioMinutos ? parseInt(tempoMedioMinutos) : 30,
        descricao: descricao ? String(descricao).trim() : null
      }
    });

    return NextResponse.json(novo);
  } catch (error: any) {
    console.error('Erro ao cadastrar procedimento:', error);
    return NextResponse.json({ error: error?.message || 'Erro ao cadastrar procedimento' }, { status: 500 });
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
