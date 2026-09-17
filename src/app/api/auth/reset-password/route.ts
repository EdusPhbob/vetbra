import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codigo, novaSenha } = body;

    if (!codigo || !novaSenha) {
      return NextResponse.json({ error: 'Código de verificação e nova senha são obrigatórios.' }, { status: 400 });
    }

    if (novaSenha.length < 6) {
      return NextResponse.json({ error: 'A nova senha deve possuir no mínimo 6 caracteres.' }, { status: 400 });
    }

    // Busca token ativo
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        codigo: codigo.trim(),
        usado: false,
        expiraEm: { gt: new Date() }
      }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Código de verificação inválido ou expirado. Solicite um novo código.' }, { status: 400 });
    }

    // Criptografa nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza usuário e queima o token
    await prisma.$transaction([
      prisma.user.update({
        where: { email: tokenRecord.email },
        data: { senhaHash: novaSenhaHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usado: true }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova credencial.'
    });
  } catch (error: any) {
    console.error('Erro em reset-password:', error);
    return NextResponse.json({ error: 'Erro ao redefinir senha.' }, { status: 500 });
  }
}
