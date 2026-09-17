import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { veterinarioId, origem = 'PERFIL' } = body;

    if (!veterinarioId) {
      return NextResponse.json({ error: 'veterinarioId é obrigatório.' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'desconhecido';
    const userAgent = request.headers.get('user-agent') || 'desconhecido';

    // Incrementa o contador do veterinário e registra o log analítico
    const [vet, log] = await prisma.$transaction([
      prisma.veterinario.update({
        where: { id: veterinarioId },
        data: {
          contatosWhatsappCount: { increment: 1 }
        },
        select: { id: true, contatosWhatsappCount: true }
      }),
      prisma.cliqueWhatsappLog.create({
        data: {
          veterinarioId,
          origem,
          ip,
          userAgent
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      contatosWhatsappCount: vet.contatosWhatsappCount,
      logId: log.id
    });
  } catch (error: any) {
    console.error('Erro ao registrar clique de WhatsApp:', error);
    return NextResponse.json({ error: 'Erro ao registrar métrica.' }, { status: 500 });
  }
}
