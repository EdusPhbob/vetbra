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

    // Validação da data do atendimento (obrigatória e restrita aos últimos 60 dias vigentes)
    if (!dataAtendimento) {
      return NextResponse.json({ error: 'Informe a data em que o atendimento foi realizado.' }, { status: 400 });
    }

    const dataParts = String(dataAtendimento).split('-');
    if (dataParts.length !== 3) {
      return NextResponse.json({ error: 'Formato de data inválido. Use AAAA-MM-DD.' }, { status: 400 });
    }

    const ano = parseInt(dataParts[0], 10);
    const mes = parseInt(dataParts[1], 10) - 1;
    const dia = parseInt(dataParts[2], 10);
    const parsedDataAtendimento = new Date(ano, mes, dia, 12, 0, 0);

    if (isNaN(parsedDataAtendimento.getTime())) {
      return NextResponse.json({ error: 'Data de atendimento inválida.' }, { status: 400 });
    }

    // Limites de data: máximo de 60 dias atrás e não pode ser futura
    const agora = new Date();
    const hojeFim = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 23, 59, 59, 999);
    const limite60Dias = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 60, 0, 0, 0, 0);

    if (parsedDataAtendimento < limite60Dias) {
      return NextResponse.json({
        error: `A data do atendimento não pode ser anterior a 60 dias da data vigente (limite mínimo: ${limite60Dias.toLocaleDateString('pt-BR')}).`
      }, { status: 400 });
    }

    if (parsedDataAtendimento > hojeFim) {
      return NextResponse.json({
        error: 'A data do atendimento não pode ser uma data futura.'
      }, { status: 400 });
    }

    // Validação e formatação estrita de Telefone / WhatsApp
    let telefoneFormatado: string | null = null;
    let telefoneHash: string | null = null;

    if (telefone) {
      let limpo = String(telefone).replace(/\D/g, '');
      
      // Remove zeros à esquerda (ex: 011 -> 11)
      while (limpo.startsWith('0')) {
        limpo = limpo.slice(1);
      }

      if (limpo.length > 0) {
        // Validação de comprimento (DDD de 2 dígitos + 8 ou 9 dígitos = 10 ou 11 dígitos no total)
        if (limpo.length < 10 || limpo.length > 11) {
          return NextResponse.json({
            error: 'O telefone/WhatsApp não pode ultrapassar o tamanho correto: informe o DDD de 2 dígitos (sem 0 na frente) e o número com 8 ou 9 dígitos (ex: 11987654321).'
          }, { status: 400 });
        }

        // Validação do DDD (não pode começar com 0, dígitos de 11 a 99)
        const ddd = parseInt(limpo.slice(0, 2), 10);
        if (isNaN(ddd) || ddd < 11 || ddd > 99) {
          return NextResponse.json({
            error: 'DDD inválido. O DDD deve conter 2 dígitos (entre 11 e 99) e não pode começar com 0.'
          }, { status: 400 });
        }

        // Formatação legível padrão Brasil
        if (limpo.length === 11) {
          telefoneFormatado = `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`;
        } else {
          telefoneFormatado = `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
        }

        telefoneHash = crypto.createHash('sha256').update(limpo).digest('hex');
      }
    }

    // Salva a avaliação no banco de dados vinculada ao veterinário
    const novaAvaliacao = await prisma.avaliacao.create({
      data: {
        veterinarioId: targetVetId,
        nomeTutor: nomeTutor.trim(),
        telefone: telefoneFormatado,
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
