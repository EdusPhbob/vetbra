import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from '@/lib/auth';

// Login do superadmin — único autorizado a criar/remover outros admins
const SUPERADMIN_LOGIN = 'steffinity';

function isSuperAdmin(session: any): boolean {
  return session?.login === SUPERADMIN_LOGIN || session?.email === `${SUPERADMIN_LOGIN}@vetbra.com.br`;
}

// GET — Lista todos os admins
export async function GET() {
  try {
    const session = await getServerSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Apenas o superadmin steffinity pode gerenciar administradores.' }, { status: 403 });
    }

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        login: true,
        email: true,
        nome: true,
        ativo: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ admins });
  } catch (err) {
    console.error('Erro ao listar admins:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

// POST — Cria novo admin (apenas steffinity)
export async function POST(request: Request) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Apenas o superadmin steffinity pode criar administradores.' }, { status: 403 });
    }

    const body = await request.json();
    const { login, email, nome, senha } = body;

    if (!login || !email || !senha) {
      return NextResponse.json({ error: 'Login, email e senha são obrigatórios.' }, { status: 400 });
    }

    if (senha.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
    }

    // Não permite criar outro superadmin com o mesmo login
    if (login.toLowerCase() === SUPERADMIN_LOGIN) {
      return NextResponse.json({ error: 'Esse login é reservado.' }, { status: 400 });
    }

    const existeEmail = await prisma.user.findUnique({ where: { email } });
    if (existeEmail) {
      return NextResponse.json({ error: 'Este e-mail já está em uso.' }, { status: 400 });
    }

    const existeLogin = await prisma.user.findUnique({ where: { login: login.toLowerCase() } });
    if (existeLogin) {
      return NextResponse.json({ error: 'Este login já está em uso.' }, { status: 400 });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const novoAdmin = await prisma.user.create({
      data: {
        login: login.toLowerCase(),
        email: email.toLowerCase(),
        nome: nome || login,
        senhaHash,
        role: 'ADMIN',
        ativo: true,
      },
      select: {
        id: true,
        login: true,
        email: true,
        nome: true,
        ativo: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ success: true, admin: novoAdmin });
  } catch (err) {
    console.error('Erro ao criar admin:', err);
    return NextResponse.json({ error: 'Erro interno ao criar administrador.' }, { status: 500 });
  }
}

// PATCH — Ativa/desativa ou troca senha de um admin (apenas steffinity)
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Apenas o superadmin steffinity pode alterar administradores.' }, { status: 403 });
    }

    const body = await request.json();
    const { adminId, ativo, novaSenha } = body;

    if (!adminId) {
      return NextResponse.json({ error: 'adminId é obrigatório.' }, { status: 400 });
    }

    // Protege o próprio superadmin de ser desativado
    const target = await prisma.user.findUnique({ where: { id: adminId } });
    if (!target) {
      return NextResponse.json({ error: 'Administrador não encontrado.' }, { status: 404 });
    }
    if (target.login === SUPERADMIN_LOGIN || target.email === `${SUPERADMIN_LOGIN}@vetbra.com.br`) {
      return NextResponse.json({ error: 'Não é possível modificar o superadmin steffinity por aqui.' }, { status: 403 });
    }

    const updateData: any = {};
    if (ativo !== undefined) updateData.ativo = Boolean(ativo);
    if (novaSenha) {
      if (novaSenha.length < 8) return NextResponse.json({ error: 'Nova senha muito curta (mín. 8 chars).' }, { status: 400 });
      updateData.senhaHash = await bcrypt.hash(novaSenha, 12);
    }

    const atualizado = await prisma.user.update({
      where: { id: adminId },
      data: updateData,
      select: { id: true, login: true, email: true, nome: true, ativo: true }
    });

    return NextResponse.json({ success: true, admin: atualizado });
  } catch (err) {
    console.error('Erro ao atualizar admin:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}

// DELETE — Remove um admin (apenas steffinity)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    if (!isSuperAdmin(session)) {
      return NextResponse.json({ error: 'Apenas o superadmin steffinity pode remover administradores.' }, { status: 403 });
    }

    const body = await request.json();
    const { adminId } = body;

    if (!adminId) {
      return NextResponse.json({ error: 'adminId é obrigatório.' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id: adminId } });
    if (!target) {
      return NextResponse.json({ error: 'Administrador não encontrado.' }, { status: 404 });
    }

    // Protege superadmin e a própria conta
    if (target.login === SUPERADMIN_LOGIN || target.email === `${SUPERADMIN_LOGIN}@vetbra.com.br`) {
      return NextResponse.json({ error: 'Não é possível remover o superadmin steffinity.' }, { status: 403 });
    }

    if (target.id === session.userId) {
      return NextResponse.json({ error: 'Você não pode remover a própria conta de administrador.' }, { status: 403 });
    }

    await prisma.user.delete({ where: { id: adminId } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Erro ao remover admin:', err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 });
  }
}
