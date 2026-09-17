import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';
import { registrarAuditoria } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const body = await request.json();
    const { veterinarioId, acao, motivo } = body;

    if (!veterinarioId || !acao) {
      return NextResponse.json({ error: 'veterinarioId e acao são obrigatórios.' }, { status: 400 });
    }

    const vet = await prisma.veterinario.findUnique({
      where: { id: veterinarioId },
      include: { user: true }
    });

    if (!vet) {
      return NextResponse.json({ error: 'Veterinário não encontrado.' }, { status: 404 });
    }

    const adminEmail = session.email || 'admin@vetbra.com.br';

    switch (acao) {
      case 'SUSPENDER': {
        const updated = await prisma.veterinario.update({
          where: { id: veterinarioId },
          data: {
            statusGeral: 'SUSPENSO',
            crmvStatus: 'SUSPENSO',
            destaqueBusca: false,
          },
        });

        await registrarAuditoria({
          entidade: 'VETERINARIO',
          registroId: veterinarioId,
          acao: 'SUSPENSAO',
          autorId: session.userId,
          autorEmail: adminEmail,
          autorRole: 'ADMIN',
          dadosAnteriores: { statusGeral: vet.statusGeral, crmvStatus: vet.crmvStatus },
          dadosNovos: { statusGeral: 'SUSPENSO', crmvStatus: 'SUSPENSO' },
          justificativa: motivo || 'Suspensão aplicada pelo painel administrativo',
        });

        return NextResponse.json({ success: true, message: 'Veterinário suspenso com sucesso.', vet: updated });
      }

      case 'REATIVAR': {
        const updated = await prisma.veterinario.update({
          where: { id: veterinarioId },
          data: {
            statusGeral: 'ATIVO',
            crmvStatus: 'VERIFICADO',
            destaqueBusca: true,
          },
        });

        if (vet.userId) {
          await prisma.user.update({
            where: { id: vet.userId },
            data: { ativo: true }
          });
        }

        await registrarAuditoria({
          entidade: 'VETERINARIO',
          registroId: veterinarioId,
          acao: 'APROVACAO',
          autorId: session.userId,
          autorEmail: adminEmail,
          autorRole: 'ADMIN',
          dadosAnteriores: { statusGeral: vet.statusGeral, crmvStatus: vet.crmvStatus },
          dadosNovos: { statusGeral: 'ATIVO', crmvStatus: 'VERIFICADO' },
          justificativa: motivo || 'Reativação efetuada pelo painel administrativo',
        });

        return NextResponse.json({ success: true, message: 'Veterinário reativado com sucesso.', vet: updated });
      }

      case 'BLOQUEAR': {
        if (vet.userId) {
          await prisma.user.update({
            where: { id: vet.userId },
            data: { ativo: false }
          });
        }

        const updated = await prisma.veterinario.update({
          where: { id: veterinarioId },
          data: {
            statusGeral: 'BLOQUEADO',
            destaqueBusca: false,
          },
        });

        await registrarAuditoria({
          entidade: 'USUARIO',
          registroId: vet.userId,
          acao: 'EDICAO',
          autorId: session.userId,
          autorEmail: adminEmail,
          autorRole: 'ADMIN',
          dadosAnteriores: { ativo: vet.user?.ativo },
          dadosNovos: { ativo: false, statusGeral: 'BLOQUEADO' },
          justificativa: motivo || 'Bloqueio total de login efetuado pelo administrador',
        });

        return NextResponse.json({ success: true, message: 'Usuário bloqueado com sucesso (login impedido).', vet: updated });
      }

      case 'DESBLOQUEAR': {
        if (vet.userId) {
          await prisma.user.update({
            where: { id: vet.userId },
            data: { ativo: true }
          });
        }

        const updated = await prisma.veterinario.update({
          where: { id: veterinarioId },
          data: {
            statusGeral: 'ATIVO',
          },
        });

        await registrarAuditoria({
          entidade: 'USUARIO',
          registroId: vet.userId,
          acao: 'EDICAO',
          autorId: session.userId,
          autorEmail: adminEmail,
          autorRole: 'ADMIN',
          dadosAnteriores: { ativo: vet.user?.ativo },
          dadosNovos: { ativo: true, statusGeral: 'ATIVO' },
          justificativa: motivo || 'Desbloqueio de login efetuado pelo administrador',
        });

        return NextResponse.json({ success: true, message: 'Usuário desbloqueado com sucesso.', vet: updated });
      }

      case 'EXCLUIR': {
        // Exclui o User (cascade remove Veterinario e relações)
        if (vet.userId) {
          await prisma.user.delete({
            where: { id: vet.userId },
          });
        } else {
          await prisma.veterinario.delete({
            where: { id: veterinarioId },
          });
        }

        await registrarAuditoria({
          entidade: 'VETERINARIO',
          registroId: veterinarioId,
          acao: 'CANCELAMENTO',
          autorId: session.userId,
          autorEmail: adminEmail,
          autorRole: 'ADMIN',
          dadosAnteriores: { nome: vet.nomeCompleto, crmv: `${vet.crmvNumero}/${vet.crmvUf}` },
          justificativa: motivo || 'Exclusão definitiva de cadastro pelo administrador',
        });

        return NextResponse.json({ success: true, message: 'Veterinário e credenciais excluídos definitivamente.' });
      }

      default:
        return NextResponse.json({ error: `Ação inválida: ${acao}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Erro na ação de moderação:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar ação administrativa.' }, { status: 500 });
  }
}
