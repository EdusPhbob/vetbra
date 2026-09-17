import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier } = body; // email, login ou whatsapp

    if (!identifier) {
      return NextResponse.json({ error: 'Informe seu e-mail, login ou WhatsApp cadastrado.' }, { status: 400 });
    }

    const term = identifier.trim().toLowerCase();
    const cleanNumbers = identifier.replace(/\D/g, '');

    // Busca usuário
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: term },
          { login: term },
          ...(cleanNumbers.length >= 8 ? [{ veterinario: { whatsapp: { contains: cleanNumbers } } }] : [])
        ]
      },
      include: {
        veterinario: true
      }
    });

    if (!user) {
      // Por segurança, retorna mensagem neutra para evitar enumeração de usuários
      return NextResponse.json({
        success: true,
        message: 'Se as credenciais estiverem corretas, você receberá o código de recuperação.'
      });
    }

    // Gera código numérico de 6 dígitos e token
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomUUID();
    const expiraEm = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Invalida tokens anteriores
    await prisma.passwordResetToken.updateMany({
      where: { email: user.email, usado: false },
      data: { usado: true }
    });

    // Salva novo token
    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        codigo,
        token,
        expiraEm
      }
    });

    // Em produção: envio real via Resend/SendGrid ou WhatsApp Cloud API.
    // Aqui retornamos o código também para facilitar o teste imediato no desenvolvimento
    return NextResponse.json({
      success: true,
      message: `Código de verificação enviado para o e-mail cadastrado (${user.email}) e WhatsApp.`,
      emailMasked: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      whatsappMasked: user.veterinario?.whatsapp ? user.veterinario.whatsapp.slice(-4).padStart(11, '*') : null,
      debugCodigo: process.env.NODE_ENV !== 'production' ? codigo : undefined
    });
  } catch (error: any) {
    console.error('Erro em forgot-password:', error);
    return NextResponse.json({ error: 'Erro ao processar recuperação de senha.' }, { status: 500 });
  }
}
