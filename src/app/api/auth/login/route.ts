import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loginOrEmail, senha } = body;

    if (!loginOrEmail || !senha) {
      return NextResponse.json({ error: 'Informe login/e-mail e senha.' }, { status: 400 });
    }

    const term = loginOrEmail.trim().toLowerCase();

    // Busca usuário por email ou login
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: term },
          { login: term }
        ]
      },
      include: {
        veterinario: {
          include: {
            enderecos: true,
            assinaturas: {
              include: {
                plano: true,
                faturas: {
                  take: 1,
                  orderBy: { createdAt: 'desc' }
                }
              },
              take: 1,
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Credenciais inválidas. Usuário não encontrado.' }, { status: 401 });
    }

    // Verifica a senha criptografada via bcrypt
    const senhaCorreta = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaCorreta) {
      return NextResponse.json({ error: 'Credenciais inválidas. Senha incorreta.' }, { status: 401 });
    }

    // Cria token de sessão seguro com JWT
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      nome: user.nome,
      vetId: user.veterinario?.id || null,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        login: user.login,
        nome: user.nome,
        role: user.role
      },
      vet: user.veterinario || null
    });

    // Define cookie HTTP-Only seguro (válido por 7 dias)
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  } catch (error: any) {
    console.error('Erro na rota de login:', error);
    return NextResponse.json({ error: 'Erro interno ao realizar autenticação.' }, { status: 500 });
  }
}
