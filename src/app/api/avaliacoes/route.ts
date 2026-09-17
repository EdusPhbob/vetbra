import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { AvaliacaoStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      veterinarioId,
      slug,
      nomeTutor,
      telefone,
      nota,
      dataAtendimento,
      horaAtendimento,
      comentario
    } = body;

    // Localiza o veterinário por ID ou Slug
    let targetVetId = veterinarioId;
    if (!targetVetId && slug) {
      const vet = await prisma.veterinario.findFirst({
        where: { OR: [{ slug }, { id: slug }] },
        select: { id: true }
      });
      if (vet) targetVetId = vet.id;
    }

    if (!targetVetId) {
      return NextResponse.json({ error: 'Veterinário não identificado.' }, { status: 400 });
    }

    // Validação do nome do tutor
    if (!nomeTutor || typeof nomeTutor !== 'string' || nomeTutor.trim().length < 2) {
      return NextResponse.json({ error: 'Informe seu nome completo para validar a avaliação.' }, { status: 400 });
    }

    // Validação da nota (1 a 5 estrelas)
    const notaNum = parseInt(String(nota), 10);
    if (isNaN(notaNum) || notaNum < 1 || notaNum > 5) {
      return NextResponse.json({ error: 'A nota deve ser entre 1 e 5 estrelas.' }, { status: 400 });
    }

    // Validação do comentário (até 1024 caracteres)
    if (!comentario || typeof comentario !== 'string' || comentario.trim().length < 5) {
      return NextResponse.json({ error: 'O comentário deve conter pelo menos 5 caracteres relatando o atendimento.' }, { status: 400 });
    }

    if (comentario.length > 1024) {
      return NextResponse.json({ error: `O comentário excede o limite máximo de 1024 caracteres (atual: ${comentario.length}).` }, { status: 400 });
    }

    // Validação da data e hora do atendimento
    let parsedDataAtendimento: Date | null = null;
    if (dataAtendimento) {
      parsedDataAtendimento = new Date(dataAtendimento);
      if (isNaN(parsedDataAtendimento.getTime())) {
        parsedDataAtendimento = null;
      }
    }

    // Telefone hash para privacidade LGPD e prevenção de spam
    let telefoneHash: string | null = null;
    if (telefone) {
      const limpo = String(telefone).replace(/\D/g, '');
      if (limpo.length >= 8) {
        telefoneHash = crypto.createHash('sha256').update(limpo).digest('hex');
      }
    }

    // Salva a avaliação no banco de dados vinculada ao veterinário
    const novaAvaliacao = await prisma.avaliacao.create({
      data: {
        veterinarioId: targetVetId,
        nomeTutor: nomeTutor.trim(),
        telefoneHash,
        nota: notaNum,
        comentario: comentario.trim(),
        dataAtendimento: parsedDataAtendimento,
        horaAtendimento: horaAtendimento ? String(horaAtendimento).trim() : null,
        status: AvaliacaoStatus.PUBLICADA // Publicada diretamente com moderação disponível no painel admin
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Sua avaliação foi registrada com sucesso!',
      avaliacao: novaAvaliacao
    }, { status: 201 });

  } catch (err) {
    console.error('Erro ao registrar avaliação:', err);
    return NextResponse.json({ error: 'Erro interno ao processar avaliação.' }, { status: 500 });
  }
}
