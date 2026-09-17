import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Obter dados completos do veterinário para o dashboard
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vetId = searchParams.get('vetId');

    let vet;
    const includeConfig = {
      user: { select: { id: true, email: true, login: true, nome: true, role: true } },
      enderecos: true,
      especialidades: { include: { especialidade: true } },
      procedimentos: true,
      artigos: true,
      documentosCrmv: { orderBy: { enviadoEm: 'desc' as const } },
      cliquesWhatsapp: { take: 10, orderBy: { createdAt: 'desc' as const } },
      assinaturas: {
        include: {
          plano: true,
          faturas: { orderBy: { createdAt: 'desc' as const }, take: 5 }
        },
        orderBy: { createdAt: 'desc' as const },
        take: 1
      }
    };

    if (vetId) {
      vet = await prisma.veterinario.findUnique({
        where: { id: vetId },
        include: includeConfig
      });
    } else {
      // Fallback para primeiro veterinário para preview de desenvolvimento
      vet = await prisma.veterinario.findFirst({
        include: includeConfig
      });
    }

    if (!vet) {
      return NextResponse.json({ error: 'Veterinário não encontrado.' }, { status: 404 });
    }

    // Calcula dias restantes para validade do CRMV
    let diasParaVencerCrmv: number | null = null;
    let alerta30DiasAtivo = false;

    if (vet.crmvValidade) {
      const hoje = new Date();
      const validade = new Date(vet.crmvValidade);
      const diffTime = validade.getTime() - hoje.getTime();
      diasParaVencerCrmv = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diasParaVencerCrmv <= 30) {
        alerta30DiasAtivo = true;
      }
    }

    const assinaturaAtiva = vet.assinaturas?.[0];
    const planoNome = assinaturaAtiva?.plano?.nome?.replace('Plano ', '') || 'Profissional';

    return NextResponse.json({
      ...vet,
      plano: planoNome,
      planoDetalhes: assinaturaAtiva?.plano || null,
      assinaturaAtiva,
      diasParaVencerCrmv,
      alerta30DiasAtivo,
      especialidades: vet.especialidades.map(ve => ve.especialidade)
    });
  } catch (error: any) {
    console.error('Erro ao carregar perfil do veterinário:', error);
    return NextResponse.json({ error: 'Erro ao carregar perfil.' }, { status: 500 });
  }
}

// Atualização de dados cadastrais com travas anti-fraude
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      vetId,
      // Campos permitidos para edição livre:
      nomeSocialOuClinica,
      bio,
      whatsapp,
      telefone,
      instagram,
      facebook,
      site,
      horarioFuncionamento,
      tiposPets,
      fotoPerfilUrl,
      bannerUrl,
      atende24h,
      atendeDomiciliar,
      atendeEmergencia,
      raioAtendimentoKm,
      meiosTransporte,
      permiteVetMovelApp,
      // Tentativa de alterar campos sensíveis protegidos:
      nomeCompleto,
      crmvNumero,
      crmvUf,
      cpfCnpj
    } = body;

    if (!vetId) {
      return NextResponse.json({ error: 'vetId é obrigatório.' }, { status: 400 });
    }

    // TRAVA ANTI-FRAUDE NO BACKEND:
    const vetAtual = await prisma.veterinario.findUnique({ where: { id: vetId } });
    if (!vetAtual) {
      return NextResponse.json({ error: 'Veterinário não encontrado.' }, { status: 404 });
    }

    const tentativaFraudeNome = nomeCompleto && nomeCompleto.trim() !== vetAtual.nomeCompleto.trim();
    const tentativaFraudeCrmv = crmvNumero && crmvNumero.trim() !== vetAtual.crmvNumero.trim();
    const tentativaFraudeUf = crmvUf && crmvUf.trim().toUpperCase() !== vetAtual.crmvUf.toUpperCase();
    const tentativaFraudeCpf = cpfCnpj && vetAtual.cpfCnpj && cpfCnpj.trim() !== vetAtual.cpfCnpj.trim();

    if (tentativaFraudeNome || tentativaFraudeCrmv || tentativaFraudeUf || tentativaFraudeCpf) {
      return NextResponse.json({
        error: 'Segurança Anti-Fraude: Dados de identificação oficial (Nome Completo, CRMV, UF e CPF) são estritamente bloqueados contra alteração pelo painel. Entre em contato com o suporte jurídico do portal VetBra para solicitar auditoria cadastral.'
      }, { status: 403 });
    }

    const updated = await prisma.veterinario.update({
      where: { id: vetId },
      data: {
        ...(nomeSocialOuClinica !== undefined ? { nomeSocialOuClinica } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(whatsapp !== undefined ? { whatsapp: whatsapp.replace(/\D/g, '') } : {}),
        ...(telefone !== undefined ? { telefone: telefone.replace(/\D/g, '') } : {}),
        ...(instagram !== undefined ? { instagram } : {}),
        ...(facebook !== undefined ? { facebook } : {}),
        ...(site !== undefined ? { site } : {}),
        ...(horarioFuncionamento !== undefined ? { horarioFuncionamento } : {}),
        ...(tiposPets !== undefined ? { tiposPets } : {}),
        ...(fotoPerfilUrl !== undefined ? { fotoPerfilUrl } : {}),
        ...(bannerUrl !== undefined ? { bannerUrl } : {}),
        ...(atende24h !== undefined ? { atende24h: !!atende24h } : {}),
        ...(atendeDomiciliar !== undefined ? { atendeDomiciliar: !!atendeDomiciliar } : {}),
        ...(atendeEmergencia !== undefined ? { atendeEmergencia: !!atendeEmergencia } : {}),
        ...(raioAtendimentoKm !== undefined ? { raioAtendimentoKm: parseInt(String(raioAtendimentoKm)) } : {}),
        ...(meiosTransporte !== undefined ? { meiosTransporte } : {}),
        ...(permiteVetMovelApp !== undefined ? { permiteVetMovelApp: !!permiteVetMovelApp } : {})
      }
    });

    return NextResponse.json({ success: true, vet: updated });
  } catch (error: any) {
    console.error('Erro ao atualizar perfil do veterinário:', error);
    return NextResponse.json({ error: 'Erro ao salvar alterações.' }, { status: 500 });
  }
}
