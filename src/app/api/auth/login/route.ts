import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rateLimit';
import { registrarAuditoria } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { loginOrEmail, senha } = body;

    if (!loginOrEmail || !senha) {
      return NextResponse.json({ error: 'Informe login/e-mail e senha.' }, { status: 400 });
    }

    const term = loginOrEmail.trim().toLowerCase();
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const rateKey = `${ip}_${term}`;

    // 1. Verificação de Ataques de Força Bruta (Rate Limiting)
    const rateCheck = checkRateLimit(rateKey);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        error: `Muitas tentativas consecutivas. Por segurança contra ataques, o acesso foi temporariamente bloqueado. Tente novamente em ${rateCheck.blockedSeconds} segundos.`,
        isBlocked: true,
        blockedSeconds: rateCheck.blockedSeconds,
      }, { status: 429 });
    }

    // 2. Busca o usuário por email ou login
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
      const fail = recordFailedAttempt(rateKey);
      if (fail.isBlocked) {
        return NextResponse.json({
          error: 'Limite de 5 tentativas excedido. Acesso bloqueado por 2 minutos para proteger o sistema.',
          isBlocked: true,
          blockedSeconds: fail.blockedSeconds,
        }, { status: 429 });
      }

      return NextResponse.json({
        error: `Credenciais inválidas. Restam ${fail.remainingAttempts} tentativa(s) antes do bloqueio temporário de 2 minutos.`,
        remainingAttempts: fail.remainingAttempts,
      }, { status: 401 });
    }

    // 3. Verifica se a conta está ativa ou foi bloqueada pelo admin
    if (!user.ativo) {
      return NextResponse.json({
        error: 'Sua conta está bloqueada ou suspensa pela administração. Entre em contato com o suporte do VetBra.',
        isBlockedAccount: true
      }, { status: 403 });
    }

    // 4. Verifica a senha criptografada via bcryptjs (10 rounds de salt)
    const senhaCorreta = await bcrypt.compare(senha, user.senhaHash);
    if (!senhaCorreta) {
      const fail = recordFailedAttempt(rateKey);
      if (fail.isBlocked) {
        return NextResponse.json({
          error: 'Limite de 5 tentativas incorretas excedido. Acesso temporariamente bloqueado por 2 minutos.',
          isBlocked: true,
          blockedSeconds: fail.blockedSeconds,
        }, { status: 429 });
      }

      return NextResponse.json({
        error: `Senha incorreta. Restam ${fail.remainingAttempts} tentativa(s) antes do bloqueio temporário de 2 minutos.`,
        remainingAttempts: fail.remainingAttempts,
      }, { status: 401 });
    }

    // 5. Sucesso! Limpa o contador de tentativas daquele IP
    clearRateLimit(rateKey);

    // 6. Atualiza data do último login e acesso
    const agora = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ultimoLoginEm: agora,
        ultimoAcessoEm: agora,
      },
    });

    // 7. Gera token de sessão seguro com JWT assinado (jose)
    const token = await signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      nome: user.nome,
      vetId: user.veterinario?.id || null,
    });

    // 6. Registra login na trilha de auditoria
    await registrarAuditoria({
      entidade: 'USUARIO',
      registroId: user.id,
      acao: 'EDICAO',
      autorId: user.id,
      autorEmail: user.email,
      autorRole: user.role,
      ip,
      justificativa: 'Autenticação bem-sucedida no SaaS VetBra',
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
      vet: user.veterinario || null,
      redirectTo: user.role === 'ADMIN' ? '/admin' : '/dashboard'
    });

    // Protocolo da requisição (compatível com Cloudflare, proxy reverso e rede local)
    const isHttps = request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https:');

    // Define cookie HTTP-Only seguro (7 dias)
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Erro na rota de login:', error);
    return NextResponse.json({ error: 'Erro interno ao realizar autenticação.' }, { status: 500 });
  }
}
