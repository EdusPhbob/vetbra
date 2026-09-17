import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.veterinarioId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mes = searchParams.get('mes'); // formato: "2026-09"
    const limite = parseInt(searchParams.get('limite') || '100');

    let whereData: any = { veterinarioId: session.veterinarioId };

    if (mes) {
      const [ano, mesNum] = mes.split('-').map(Number);
      const inicio = new Date(ano, mesNum - 1, 1);
      const fim = new Date(ano, mesNum, 1);
      whereData.data = { gte: inicio, lt: fim };
    }

    const registros = await prisma.registroFinanceiro.findMany({
      where: whereData,
      orderBy: { data: 'desc' },
      take: limite
    });

    // Calcular totais
    const totalReceitas = registros
      .filter((r: any) => r.tipo === 'RECEITA')
      .reduce((sum: number, r: any) => sum + r.valor, 0);

    const totalDespesas = registros
      .filter((r: any) => r.tipo === 'DESPESA')
      .reduce((sum: number, r: any) => sum + r.valor, 0);

    const qtdAtendimentos = registros.filter(
      (r: any) => r.tipo === 'RECEITA'
    ).length;

    const lucroLiquido = totalReceitas - totalDespesas;
    const mediaAtendimento =
      qtdAtendimentos > 0 ? totalReceitas / qtdAtendimentos : 0;
    const margemLucro =
      totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0;

    return NextResponse.json({
      registros,
      resumo: {
        totalReceitas,
        totalDespesas,
        lucroLiquido,
        qtdAtendimentos,
        mediaAtendimento,
        margemLucro
      }
    });
  } catch (error) {
    console.error('Erro ao buscar financeiro:', error);
    return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.veterinarioId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { tipo, descricao, valor, data, paciente, categoria, observacoes } = body;

    if (!tipo || !descricao || valor === undefined || valor === null || valor === '') {
      return NextResponse.json(
        { error: 'Tipo, descrição e valor são obrigatórios.' },
        { status: 400 }
      );
    }

    if (!['RECEITA', 'DESPESA'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo inválido.' }, { status: 400 });
    }

    // Parse valor
    let parsedValor = 0;
    if (typeof valor === 'number') {
      parsedValor = valor;
    } else {
      let clean = String(valor).replace(/[R$\s]/gi, '').trim();
      if (clean.includes(',') && clean.includes('.')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else if (clean.includes(',')) {
        clean = clean.replace(',', '.');
      }
      parsedValor = parseFloat(clean);
    }

    if (isNaN(parsedValor) || parsedValor <= 0) {
      return NextResponse.json(
        { error: 'Valor inválido. Digite um número positivo (ex: 150,00).' },
        { status: 400 }
      );
    }

    const registro = await prisma.registroFinanceiro.create({
      data: {
        veterinarioId: session.veterinarioId,
        tipo: tipo as 'RECEITA' | 'DESPESA',
        descricao: String(descricao).trim(),
        valor: parsedValor,
        data: data ? new Date(data) : new Date(),
        paciente: paciente ? String(paciente).trim() : null,
        categoria: categoria ? String(categoria).trim() : null,
        observacoes: observacoes ? String(observacoes).trim() : null
      }
    });

    return NextResponse.json({ success: true, registro });
  } catch (error: any) {
    console.error('Erro ao criar registro financeiro:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao salvar lançamento.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.veterinarioId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
    }

    // Verifica se pertence ao vet logado
    const registro = await prisma.registroFinanceiro.findFirst({
      where: { id, veterinarioId: session.veterinarioId }
    });

    if (!registro) {
      return NextResponse.json({ error: 'Registro não encontrado.' }, { status: 404 });
    }

    await prisma.registroFinanceiro.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir registro financeiro:', error);
    return NextResponse.json({ error: 'Erro ao excluir lançamento.' }, { status: 500 });
  }
}
