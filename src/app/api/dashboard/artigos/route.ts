import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const veterinarioId = searchParams.get('veterinarioId');

    if (!veterinarioId) {
      return NextResponse.json({ error: 'veterinarioId obrigatório' }, { status: 400 });
    }

    const artigos = await prisma.artigo.findMany({
      where: { veterinarioId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(artigos);
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    return NextResponse.json({ error: 'Erro interno ao buscar artigos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { veterinarioId, titulo, categoria, resumo, conteudo, fotoUrl } = body;

    if (!veterinarioId || !titulo || !resumo || !conteudo) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 });
    }

    // Gerar slug amigável
    const baseSlug = titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const novoArtigo = await prisma.artigo.create({
      data: {
        veterinarioId,
        titulo,
        slug,
        categoria: categoria || 'Clínica Geral',
        resumo,
        conteudo,
        fotoUrl: fotoUrl || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
        publicado: true
      }
    });

    return NextResponse.json(novoArtigo, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar artigo:', error);
    return NextResponse.json({ error: 'Erro ao cadastrar artigo' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id obrigatório' }, { status: 400 });
    }

    await prisma.artigo.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Artigo removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar artigo:', error);
    return NextResponse.json({ error: 'Erro ao excluir artigo' }, { status: 500 });
  }
}
