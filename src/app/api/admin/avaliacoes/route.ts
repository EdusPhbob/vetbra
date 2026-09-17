import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AvaliacaoStatus } from '@prisma/client';
import { registrarAuditoria } from '@/lib/audit';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        veterinario: {
          select: {
            id: true,
            nomeCompleto: true,
            slug: true,
            crmvNumero: true,
            crmvUf: true,
            fotoPerfilUrl: true,
            nomeSocialOuClinica: true
          }
        }
      }
    });

    const todosVets = await prisma.veterinario.findMany({
      select: {
        id: true,
        nomeCompleto: true,
        slug: true,
        crmvNumero: true,
        crmvUf: true,
        fotoPerfilUrl: true,
        nomeSocialOuClinica: true,
        statusGeral: true,
        avaliacoes: {
          select: { id: true, nota: true, status: true, createdAt: true }
        }
      }
    });

    const ranking = todosVets.map(v => {
      const total = v.avaliacoes.length;
      const validas = v.avaliacoes.filter(a => a.status !== AvaliacaoStatus.REJEITADA);
      const soma = validas.reduce((acc, a) => acc + a.nota, 0);
      const media = validas.length > 0 ? Number((soma / validas.length).toFixed(2)) : null;
      const estrelas5 = v.avaliacoes.filter(a => a.nota === 5).length;
      const estrelas4 = v.avaliacoes.filter(a => a.nota === 4).length;
      const estrelas3 = v.avaliacoes.filter(a => a.nota === 3).length;
      const estrelas2 = v.avaliacoes.filter(a => a.nota === 2).length;
      const estrelas1 = v.avaliacoes.filter(a => a.nota === 1).length;
      const positivas = estrelas5 + estrelas4;
      const reclamacoes = estrelas1 + estrelas2;
      return {
        id: v.id, nomeCompleto: v.nomeCompleto, slug: v.slug,
        crmvNumero: v.crmvNumero, crmvUf: v.crmvUf,
        fotoPerfilUrl: v.fotoPerfilUrl, nomeSocialOuClinica: v.nomeSocialOuClinica,
        statusGeral: v.statusGeral, totalAvaliacoes: total,
        mediaNota: media, positivas, reclamacoes,
        estrelas5, estrelas4, estrelas3, estrelas2, estrelas1
      };
    });

    const melhoresVets = [...ranking]
      .filter(r => r.totalAvaliacoes > 0)
      .sort((a, b) => (b.mediaNota || 0) - (a.mediaNota || 0) || b.totalAvaliacoes - a.totalAvaliacoes);

    const maisReclamados = [...ranking]
      .filter(r => r.reclamacoes > 0)
      .sort((a, b) => b.reclamacoes - a.reclamacoes || (a.mediaNota || 5) - (b.mediaNota || 5));

    const semAvaliacoes = ranking.filter(r => r.totalAvaliacoes === 0);

    return NextResponse.json({
      avaliacoes,
      ranking: {
        totalGeralAvaliacoes: avaliacoes.length,
        totalReclamacoes: ranking.reduce((acc, r) => acc + r.reclamacoes, 0),
        melhoresVets, maisReclamados, semAvaliacoes
      }
    });
  } catch (err) {
    console.error('Erro ao listar avaliações no admin:', err);
    return NextResponse.json({ error: 'Erro interno ao listar avaliações.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();
    const body = await request.json();
    const { avaliacaoId, novoStatus, motivo, comentarioAdmin, notaAdmin, removerComentarioAdmin } = body;

    if (!avaliacaoId) {
      return NextResponse.json({ error: 'Informe o ID da avaliação.' }, { status: 400 });
    }

    const avaliacaoExiste = await prisma.avaliacao.findUnique({
      where: { id: avaliacaoId },
      include: { veterinario: true }
    });

    if (!avaliacaoExiste) {
      return NextResponse.json({ error: 'Avaliação não encontrada.' }, { status: 404 });
    }

    const updateData: any = {};

    if (novoStatus) {
      updateData.status = novoStatus as AvaliacaoStatus;
    }

    if (removerComentarioAdmin) {
      updateData.comentarioAdmin = null;
      updateData.notaAdmin = null;
      updateData.comentarioAdminEm = null;
      updateData.comentarioAdminPor = null;
    } else if (comentarioAdmin !== undefined) {
      if (comentarioAdmin.trim()) {
        updateData.comentarioAdmin = comentarioAdmin.trim().substring(0, 1020);
        updateData.comentarioAdminEm = new Date();
        updateData.comentarioAdminPor = session?.email || session?.login || 'admin@vetbra.com.br';
      }
      if (notaAdmin !== undefined && notaAdmin !== null && Number(notaAdmin) >= 1 && Number(notaAdmin) <= 5) {
        updateData.notaAdmin = Number(notaAdmin);
      }
    }

    const atualizada = await prisma.avaliacao.update({
      where: { id: avaliacaoId },
      data: updateData
    });

    if (novoStatus) {
      await registrarAuditoria({
        acao: novoStatus === 'PUBLICADA' ? 'APROVACAO' : 'REJEICAO',
        entidade: 'SISTEMA',
        registroId: avaliacaoId,
        dadosAnteriores: { status: avaliacaoExiste.status },
        dadosNovos: { status: novoStatus, motivo: motivo || null },
        justificativa: `Moderação de avaliação de ${avaliacaoExiste.nomeTutor} para ${avaliacaoExiste.veterinario.nomeCompleto}: ${novoStatus}`
      });
    }

    return NextResponse.json({ success: true, avaliacao: atualizada });
  } catch (err) {
    console.error('Erro ao atualizar moderação da avaliação:', err);
    return NextResponse.json({ error: 'Erro interno ao atualizar avaliação.' }, { status: 500 });
  }
}
