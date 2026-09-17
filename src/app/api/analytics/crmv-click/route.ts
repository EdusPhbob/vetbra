import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { veterinarioId } = body;

    if (!veterinarioId) {
      return NextResponse.json({ error: 'veterinarioId é obrigatório.' }, { status: 400 });
    }

    const vet = await prisma.veterinario.update({
      where: { id: veterinarioId },
      data: {
        cliquesCrmvCount: { increment: 1 },
      },
      select: { id: true, cliquesCrmvCount: true },
    });

    return NextResponse.json({
      success: true,
      cliquesCrmvCount: vet.cliquesCrmvCount,
    });
  } catch (error: any) {
    console.error('Erro ao registrar clique no CRMV:', error);
    return NextResponse.json({ error: 'Erro ao registrar métrica.' }, { status: 500 });
  }
}
