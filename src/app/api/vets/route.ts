import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CrmvStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const cidade = searchParams.get('cidade');
    const especialidade = searchParams.get('especialidade');
    const atende24h = searchParams.get('atende24h') === 'true';
    const atendeDomiciliar = searchParams.get('domiciliar') === 'true';
    const tipoPet = searchParams.get('tipoPet');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const q = searchParams.get('q');
    const includePending = searchParams.get('includePending') === 'true';

    const where: any = {};

    // Apenas aprovados e ativos no portal público a menos que seja modo moderação
    if (!includePending) {
      where.crmvStatus = CrmvStatus.VERIFICADO;
      where.statusGeral = 'ATIVO';
      where.user = { ativo: true };
    }

    if (atende24h) {
      where.atende24h = true;
    }

    if (atendeDomiciliar) {
      where.atendeDomiciliar = true;
    }

    if (tipoPet && tipoPet !== 'Todos') {
      where.tiposPets = {
        hasSome: [tipoPet, 'Todos', 'Outros']
      };
    }

    if (estado && estado !== 'Todos') {
      where.enderecos = {
        some: {
          estado: { equals: estado, mode: 'insensitive' }
        }
      };
    }

    if (cidade && cidade !== 'Todas') {
      const termoLimpo = cidade.replace(/[^a-zA-Z0-9\s]/g, '').trim();
      where.enderecos = {
        some: {
          OR: [
            { cidade: { contains: cidade, mode: 'insensitive' } },
            { bairro: { contains: cidade, mode: 'insensitive' } },
            { cep: { contains: termoLimpo, mode: 'insensitive' } }
          ]
        }
      };
    }

    if (especialidade && especialidade !== 'Todas') {
      where.especialidades = {
        some: {
          especialidade: {
            nome: { contains: especialidade, mode: 'insensitive' }
          }
        }
      };
    }

    if (q) {
      where.OR = [
        { nomeCompleto: { contains: q, mode: 'insensitive' } },
        { nomeSocialOuClinica: { contains: q, mode: 'insensitive' } },
        { bio: { contains: q, mode: 'insensitive' } },
        { crmvNumero: { contains: q } }
      ];
    }

    const vets = await prisma.veterinario.findMany({
      where,
      include: {
        enderecos: true,
        especialidades: {
          include: { especialidade: true }
        },
        assinaturas: {
          include: { plano: true },
          where: { status: 'ATIVA' }
        },
        documentosCrmv: true,
        procedimentos: {
          where: { ativo: true }
        },
        avaliacoes: true,
        user: {
          select: {
            id: true,
            email: true,
            login: true,
            ativo: true,
            role: true,
            ultimoLoginEm: true,
            ultimoAcessoEm: true,
          }
        }
      },
      orderBy: [
        { destaqueBusca: 'desc' },
        { visualizacoesCount: 'desc' }
      ]
    });

    // Filtro adicional por faixa de preço de consulta se especificado
    let filtered = vets;
    if (minPrice !== undefined || maxPrice !== undefined) {
      filtered = vets.filter(v => {
        const consulta = v.procedimentos.find(p => p.categoria.toLowerCase().includes('consulta'));
        const price = consulta ? Number(consulta.preco) : 120;
        if (minPrice !== undefined && price < minPrice) return false;
        if (maxPrice !== undefined && price > maxPrice) return false;
        return true;
      });
    }

    // Normaliza para o formato esperado pelo frontend mantendo 100% de compatibilidade
    const mapped = filtered.map(v => ({
      ...v,
      plano: v.assinaturas?.[0]?.plano?.nome?.replace('Plano ', '') || 'Profissional',
      especialidades: v.especialidades.map(ve => ve.especialidade)
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('Erro ao buscar veterinários:', error);
    return NextResponse.json({ error: 'Erro interno ao consultar veterinários' }, { status: 500 });
  }
}
