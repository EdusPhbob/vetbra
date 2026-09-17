import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403 });
    }

    const agora = new Date();

    // Início do Dia
    const inicioHoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

    // Início da Semana (Segunda-feira)
    const diaDaSemana = agora.getDay();
    const diffParaSegunda = agora.getDate() - diaDaSemana + (diaDaSemana === 0 ? -6 : 1);
    const inicioSemana = new Date(agora.getFullYear(), agora.getMonth(), diffParaSegunda);
    inicioSemana.setHours(0, 0, 0, 0);

    // Início do Mês
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    // Início do Ano
    const inicioAno = new Date(agora.getFullYear(), 0, 1);

    // Busca todas as faturas com seus dados
    const faturas = await prisma.faturaCobranca.findMany({
      include: {
        assinatura: {
          include: {
            plano: true,
            veterinario: {
              select: {
                id: true,
                nomeCompleto: true,
                crmvNumero: true,
                crmvUf: true,
                telefone: true,
                whatsapp: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Faturas Pagas
    const faturasPagas = faturas.filter(f => f.status === 'PAGA');

    // Cálculos de Receita Realizada
    const calcReceita = (faturasArr: typeof faturas) => 
      faturasArr.reduce((acc, cur) => acc + Number(cur.valor), 0);

    const receitaHoje = calcReceita(
      faturasPagas.filter(f => {
        const d = f.dataLiquidacao ? new Date(f.dataLiquidacao) : new Date(f.createdAt);
        return d >= inicioHoje;
      })
    );

    const receitaSemana = calcReceita(
      faturasPagas.filter(f => {
        const d = f.dataLiquidacao ? new Date(f.dataLiquidacao) : new Date(f.createdAt);
        return d >= inicioSemana;
      })
    );

    const receitaMes = calcReceita(
      faturasPagas.filter(f => {
        const d = f.dataLiquidacao ? new Date(f.dataLiquidacao) : new Date(f.createdAt);
        return d >= inicioMes;
      })
    );

    const receitaAnoAtual = calcReceita(
      faturasPagas.filter(f => {
        const d = f.dataLiquidacao ? new Date(f.dataLiquidacao) : new Date(f.createdAt);
        return d >= inicioAno;
      })
    );

    const totalPendente = calcReceita(
      faturas.filter(f => f.status === 'PENDENTE')
    );

    const totalFaturadoHistorico = calcReceita(faturasPagas);

    // Assinaturas Ativas e MRR
    const assinaturasAtivas = await prisma.assinatura.findMany({
      where: { status: 'ATIVA' },
      include: { plano: true }
    });

    const mrrAtual = assinaturasAtivas.reduce((acc, cur) => acc + Number(cur.valorAtual || cur.plano.precoMensal), 0);
    const arrAtual = mrrAtual * 12;

    // Projeção & Histórico de 10 Anos (2026 até 2036)
    const anosHistoricoEProjecao = [];
    const anoAtual = agora.getFullYear(); // 2026

    for (let ano = 2026; ano <= 2036; ano++) {
      const faturasDesteAno = faturasPagas.filter(f => {
        const d = f.dataLiquidacao ? new Date(f.dataLiquidacao) : new Date(f.createdAt);
        return d.getFullYear() === ano;
      });

      const faturadoReal = calcReceita(faturasDesteAno);

      // Fator de crescimento composto anual projetado de 18% para SaaS
      const anosFrente = ano - anoAtual;
      let projetado = arrAtual;
      if (anosFrente > 0) {
        projetado = arrAtual * Math.pow(1.22, anosFrente);
      }

      anosHistoricoEProjecao.push({
        ano,
        faturadoReal: Math.round(faturadoReal * 100) / 100,
        faturadoProjetado: Math.round(projetado * 100) / 100,
        estimativaAssinantes: Math.round(Math.max(assinaturasAtivas.length, 1) * Math.pow(1.20, Math.max(anosFrente, 0))),
        ehFuturo: ano > anoAtual,
      });
    }

    return NextResponse.json({
      metricas: {
        receitaHoje,
        receitaSemana,
        receitaMes,
        receitaAnoAtual,
        totalFaturadoHistorico,
        totalPendente,
        mrrAtual,
        arrAtual,
        assinantesAtivosCount: assinaturasAtivas.length,
        totalFaturasCount: faturas.length,
      },
      anosHistoricoEProjecao,
      faturasRecentes: faturas.slice(0, 50).map(f => ({
        id: f.id,
        numeroFatura: f.numeroFatura,
        valor: Number(f.valor),
        status: f.status,
        metodo: f.metodoPreferencial,
        vencimento: f.dataVencimento,
        liquidacao: f.dataLiquidacao,
        criadoEm: f.createdAt,
        veterinarioNome: f.assinatura.veterinario.nomeCompleto,
        veterinarioCrmv: `${f.assinatura.veterinario.crmvNumero}/${f.assinatura.veterinario.crmvUf}`,
        planoNome: f.assinatura.plano.nome,
      }))
    });
  } catch (error: any) {
    console.error('Erro na API financeira do admin:', error);
    return NextResponse.json({ error: 'Erro ao calcular métricas financeiras.' }, { status: 500 });
  }
}
