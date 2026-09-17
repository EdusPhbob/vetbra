import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role, CrmvStatus, PlanoTipo, AssinaturaStatus, FaturaStatus, MetodoPagamento } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nomeCompleto,
      email,
      login,
      senha,
      whatsapp,
      fotoPerfilUrl,
      // CRMV & Validação Anti-Fraude
      crmvNumero,
      crmvUf,
      crmvValidade,
      crmvDocumentoUrl,
      crmvSelfieUrl,
      // Estabelecimento & Atendimento
      nomeClinica,
      tipoEstabelecimento,
      meiosTransporte = [],
      raioAtendimentoKm = 15,
      cidadeBase,
      estadoBase,
      permiteVetMovelApp = false,
      atende24h = false,
      atendeDomiciliar = false,
      // Endereço Principal (Obrigatório)
      cep,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      latitude,
      longitude,
      // Segundo Endereço (Opcional)
      temSegundoEndereco = false,
      segundoEndereco,
      // Plano
      plano = 'PROFISSIONAL'
    } = body;

    // Validações de campos essenciais
    if (!nomeCompleto || !email || !senha || !whatsapp || !crmvNumero || !crmvUf) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios do profissional e CRMV.' }, { status: 400 });
    }

    if (!numero) {
      return NextResponse.json({ error: 'O número do endereço principal é obrigatório.' }, { status: 400 });
    }

    if (!meiosTransporte || meiosTransporte.length === 0) {
      return NextResponse.json({ error: 'Selecione pelo menos 1 meio de transporte / deslocamento para o mapa.' }, { status: 400 });
    }

    // Checa duplicidade de email
    const existeEmail = await prisma.user.findUnique({ where: { email } });
    if (existeEmail) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado no sistema.' }, { status: 400 });
    }

    // Checa duplicidade de login se informado
    const userLogin = (login || email).trim().toLowerCase();
    const existeLogin = await prisma.user.findUnique({ where: { login: userLogin } });
    if (existeLogin) {
      return NextResponse.json({ error: 'Este login de usuário já está em uso. Escolha outro.' }, { status: 400 });
    }

    // Checa duplicidade de CRMV no mesmo estado
    const existeCrmv = await prisma.veterinario.findFirst({
      where: {
        crmvNumero: crmvNumero.trim(),
        crmvUf: crmvUf.toUpperCase()
      }
    });
    if (existeCrmv) {
      return NextResponse.json({ error: `O CRMV ${crmvNumero}/${crmvUf} já está cadastrado na base de dados.` }, { status: 400 });
    }

    // Criptografa a senha com bcrypt (Hash padrão SaaS)
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Cria o User
    const user = await prisma.user.create({
      data: {
        email,
        login: userLogin,
        senhaHash,
        nome: nomeCompleto,
        role: Role.VET
      }
    });

    // Cria o Slug único amigável para SEO
    const baseSlug = nomeCompleto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${crmvUf.toLowerCase()}-${crmvNumero.replace(/[^a-z0-9]/gi, '')}`;

    // Converte a data de validade do CRMV
    let dataValidadeCrmv: Date | null = null;
    if (crmvValidade) {
      dataValidadeCrmv = new Date(crmvValidade);
    }

    // Mapeamento de planos e valores
    const planoEnum = (plano.toUpperCase() as PlanoTipo) || PlanoTipo.PROFISSIONAL;
    const valoresPlanos: Record<PlanoTipo, number> = {
      [PlanoTipo.BASICO]: 79.90,
      [PlanoTipo.PROFISSIONAL]: 149.90,
      [PlanoTipo.PREMIUM]: 299.90
    };
    const valorPlano = valoresPlanos[planoEnum] || 149.90;

    // Lista de endereços para criar
    const enderecosData = [
      {
        tipoEndereco: 'PRINCIPAL',
        cep: cep || '01000-000',
        logradouro: logradouro || 'Endereço Comercial',
        numero: String(numero || 'S/N'),
        complemento: complemento || null,
        bairro: bairro || 'Centro',
        cidade: cidade || cidadeBase || 'São Paulo',
        estado: estado || estadoBase || 'SP',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        raioKmAtendimento: parseInt(String(raioAtendimentoKm)) || 15
      }
    ];

    if (temSegundoEndereco && segundoEndereco?.cep && segundoEndereco?.numero) {
      enderecosData.push({
        tipoEndereco: 'FILIAL',
        cep: segundoEndereco.cep,
        logradouro: segundoEndereco.logradouro || 'Filial / Base Secundária',
        numero: String(segundoEndereco.numero),
        complemento: segundoEndereco.complemento || null,
        bairro: segundoEndereco.bairro || 'Bairro',
        cidade: segundoEndereco.cidade || cidade || 'São Paulo',
        estado: segundoEndereco.estado || estado || 'SP',
        latitude: segundoEndereco.latitude ? parseFloat(segundoEndereco.latitude) : null,
        longitude: segundoEndereco.longitude ? parseFloat(segundoEndereco.longitude) : null,
        raioKmAtendimento: parseInt(String(segundoEndereco.raioKmAtendimento || raioAtendimentoKm)) || 15
      });
    }

    // Cria o perfil do Veterinário
    const vet = await prisma.veterinario.create({
      data: {
        userId: user.id,
        slug,
        nomeCompleto,
        nomeSocialOuClinica: nomeClinica || null,
        whatsapp: whatsapp.replace(/\D/g, ''),
        telefone: whatsapp.replace(/\D/g, ''),
        fotoPerfilUrl: fotoPerfilUrl || null,
        // Anti-fraude & CRMV
        crmvNumero: crmvNumero.trim(),
        crmvUf: crmvUf.toUpperCase(),
        crmvValidade: dataValidadeCrmv,
        crmvDocumentoUrl: crmvDocumentoUrl || null,
        crmvSelfieUrl: crmvSelfieUrl || null,
        crmvStatus: CrmvStatus.PENDENTE,
        // Atendimento & Mobilidade
        tipoEstabelecimento: tipoEstabelecimento || 'Clinica',
        meioTransporte: meiosTransporte[0] || 'Nenhum',
        meiosTransporte: meiosTransporte,
        raioAtendimentoKm: parseInt(String(raioAtendimentoKm)) || 15,
        cidadeBase: cidadeBase || cidade || 'São Paulo',
        estadoBase: estadoBase || estado || 'SP',
        permiteVetMovelApp: !!permiteVetMovelApp,
        atende24h: !!atende24h,
        atendeDomiciliar: !!atendeDomiciliar,
        // Plano & Assinatura
        plano: planoEnum,
        statusAssinatura: AssinaturaStatus.PENDENTE,
        // Endereços vinculados
        enderecos: {
          create: enderecosData
        },
        // Procedimentos padrão
        procedimentos: {
          create: [
            { nome: 'Consulta Clínica Geral', categoria: 'Consulta', preco: 160, tempoMedioMinutos: 40 },
            { nome: 'Vacina Importada V10 / Quádrupla', categoria: 'Vacinação', preco: 98, tempoMedioMinutos: 20 },
            { nome: 'Atendimento Domiciliar Preventivo', categoria: 'Consulta', preco: 220, tempoMedioMinutos: 60 }
          ]
        },
        // Gera fatura inicial de ativação (Pix / Boleto)
        faturas: {
          create: {
            plano: planoEnum,
            valor: valorPlano,
            status: FaturaStatus.PENDENTE,
            metodo: MetodoPagamento.PIX,
            pixCopiaCola: `00020126580014BR.GOV.BCB.PIX0136vetbra-${user.id.slice(0, 8)}520400005303986540${valorPlano.toFixed(2)}5802BR5906VETBRA6009SAO PAULO62070503***6304ABCD`,
            dataVencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 dias para pagamento
          }
        }
      },
      include: {
        enderecos: true,
        faturas: true
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        login: user.login
      },
      vet: {
        id: vet.id,
        slug: vet.slug,
        nomeCompleto: vet.nomeCompleto,
        crmvNumero: vet.crmvNumero,
        crmvUf: vet.crmvUf,
        crmvStatus: vet.crmvStatus,
        plano: vet.plano,
        faturaId: vet.faturas[0]?.id
      }
    });
  } catch (error: any) {
    console.error('Erro detalhado no cadastro de veterinário:', error);
    return NextResponse.json({ error: error.message || 'Erro interno ao salvar cadastro.' }, { status: 500 });
  }
}
