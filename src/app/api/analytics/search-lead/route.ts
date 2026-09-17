import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { termo, cep, cidade, estado, tipoPet, especialidade } = body;

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'desconhecido';

    const log = await prisma.buscaLeadLog.create({
      data: {
        termo: termo || null,
        cep: cep || null,
        cidade: cidade || null,
        estado: estado || null,
        tipoPet: tipoPet || null,
        especialidade: especialidade || null,
        ip
      }
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error: any) {
    console.error('Erro ao salvar log de busca:', error);
    return NextResponse.json({ error: 'Erro ao registrar busca.' }, { status: 500 });
  }
}
