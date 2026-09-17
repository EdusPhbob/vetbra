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

      case 'LIBERAR_TRIAL': {
        const dias = parseInt(String(body.dias)) || 7;
        const dataFim = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);

        // Busca ou cria assinatura
        let assinatura = await prisma.assinatura.findFirst({
          where: { veterinarioId },
          orderBy: { createdAt: 'desc' }
        });

        if (assinatura) {
          await prisma.assinatura.update({
            where: { id: assinatura.id },
            data: {
              status: 'TRIAL',
              dataInicio: new Date(),
              dataFimPeriodo: dataFim
            }
          });
        } else {
          let planoDb = await prisma.plano.findFirst();
          if (!planoDb) {
            planoDb = await prisma.plano.create({
              data: {
                slug: 'profissional',
                nome: 'Plano Profissional',
                precoMensal: 149.90,
                ativo: true
              }
            });
          }
          await prisma.assinatura.create({
            data: {
              veterinarioId,
              planoId: planoDb.id,
              status: 'TRIAL',
              dataInicio: new Date(),
              dataFimPeriodo: dataFim,
              valorAtual: planoDb.precoMensal
            }
          });
        }

        // Ativa o veterinário e usuário durante o período de teste
        const updated = await prisma.veterinario.update({
          where: { id: veterinarioId },
          data: {
            statusGeral: 'ATIVO',
            destaqueBusca: true
          }
        });

        if (vet.userId) {
          await prisma.user.update({
            where: { id: vet.userId },
            data: { ativo: true }
          });
        }

        await registrarAuditoria({
          entidade: 'ASSINATURA',
          registroId: veterinarioId,
          acao: 'EDICAO',
          autorId: session.userId,
          autorEmail: adminEmail,
          autorRole: 'ADMIN',
          dadosNovos: { status: 'TRIAL', diasTrial: dias, dataFimPeriodo: dataFim },
          justificativa: motivo || `Concessão de período de teste gratuito de ${dias} dias pelo administrador`,
        });

        return NextResponse.json({
          success: true,
          message: `Período de teste de ${dias} dias liberado com sucesso!`,
          vet: updated
        });
      }

      case 'CONFIRMAR_PAGAMENTO': {
        const adminResponsavel = session.login || session.nome || session.email || 'admin';
        const comprovanteUrl = body.comprovanteUrl || null;

        const assinatura = await prisma.assinatura.findFirst({
          where: { veterinarioId },
          include: { faturas: { orderBy: { createdAt: 'desc' }, take: 1 } },
          orderBy: { createdAt: 'desc' }
        });

        const dataFim = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        if (assinatura) {
          await prisma.assinatura.update({
            where: { id: assinatura.id },
            data: {
              status: 'ATIVA',
              dataFimPeriodo: dataFim,
              aprovadoManualmente: true,
              aprovadoPor: adminResponsavel,
              comprovanteUrl: comprovanteUrl || assinatura.comprovanteUrl,
              comprovanteEnviadoEm: comprovanteUrl ? new Date() : assinatura.comprovanteEnviadoEm
            }
          });

          if (assinatura.faturas[0]) {
            await prisma.faturaCobranca.update({
              where: { id: assinatura.faturas[0].id },
              data: {
                status: 'PAGA',
                dataLiquidacao: new Date(),
                aprovadoManualmente: true,
                aprovadoPor: adminResponsavel,
                comprovanteUrl: comprovanteUrl || assinatura.faturas[0].comprovanteUrl,
                comprovanteEnviadoEm: comprovanteUrl ? new Date() : assinatura.faturas[0].comprovanteEnviadoEm
              }
            });
          }
        }

        const updated = await prisma.veterinario.update({
          where: { id: veterinarioId },
          data: {
            statusGeral: 'ATIVO',
            destaqueBusca: true
          }
        });

        if (vet.userId) {
          await prisma.user.update({
            where: { id: vet.userId },
            data: { ativo: true }
          });
        }

        await registrarAuditoria({
          entidade: 'FATURA',
          registroId: veterinarioId,
          acao: 'APROVACAO',
          autorId: session.userId,
          autorEmail: adminResponsavel,
          autorRole: 'ADMIN',
          dadosNovos: {
            aprovadoManualmente: true,
            comprovanteUrl: comprovanteUrl || null,
            faltaComprovante: !comprovanteUrl
          },
          justificativa: motivo || `Pagamento Pix confirmado manualmente por ${adminResponsavel}${comprovanteUrl ? ' (comprovante anexado)' : ' (sem comprovante)'}`,
        });

        return NextResponse.json({
          success: true,
          message: comprovanteUrl 
            ? 'Pagamento confirmado com comprovante Pix anexado com sucesso!'
            : 'Pagamento confirmado manualmente. Lembre-se de anexar o comprovante Pix.',
          vet: updated
        });
      }

      case 'VINCULAR_COMPROVANTE': {
        const adminResponsavel = session.login || session.nome || session.email || 'admin';
        const { comprovanteUrl } = body;

        if (!comprovanteUrl) {
          return NextResponse.json({ error: 'URL do comprovante é obrigatória.' }, { status: 400 });
        }

        const assinatura = await prisma.assinatura.findFirst({
          where: { veterinarioId },
          include: { faturas: { orderBy: { createdAt: 'desc' }, take: 1 } },
          orderBy: { createdAt: 'desc' }
        });

        if (assinatura) {
          await prisma.assinatura.update({
            where: { id: assinatura.id },
            data: {
              comprovanteUrl,
              comprovanteEnviadoEm: new Date(),
              aprovadoPor: adminResponsavel
            }
          });

          if (assinatura.faturas[0]) {
            await prisma.faturaCobranca.update({
              where: { id: assinatura.faturas[0].id },
              data: {
                comprovanteUrl,
                comprovanteEnviadoEm: new Date(),
                aprovadoPor: adminResponsavel
              }
            });
          }
        }

        await registrarAuditoria({
          entidade: 'FATURA',
          registroId: veterinarioId,
          acao: 'EDICAO',
          autorId: session.userId,
          autorEmail: adminResponsavel,
          autorRole: 'ADMIN',
          dadosNovos: { comprovanteUrl },
          justificativa: 'Comprovante Pix anexado ao cadastro do profissional',
        });

        return NextResponse.json({
          success: true,
          message: 'Comprovante Pix anexado com sucesso!'
        });
      }

      default:
        return NextResponse.json({ error: `Ação inválida: ${acao}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Erro na ação de moderação:', error);
    return NextResponse.json({ error: error.message || 'Erro ao processar ação administrativa.' }, { status: 500 });
  }
}
