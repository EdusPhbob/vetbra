import { 
  PrismaClient, 
  Role, 
  VetStatusGeral, 
  CrmvStatus, 
  DocumentoTipo, 
  DocumentoStatus, 
  AssinaturaStatus, 
  AssinaturaCiclo, 
  FaturaStatus, 
  MetodoPagamento, 
  ProcedimentoCategoria 
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed VetBra Arquitetura v2 ---');

  // 1. Planos do SaaS
  const planoBasico = await prisma.plano.upsert({
    where: { slug: 'basico' },
    update: {},
    create: {
      slug: 'basico',
      nome: 'Plano Básico',
      descricao: 'Para veterinários autônomos que desejam presença e agendamentos no mapa.',
      precoMensal: 79.90,
      precoAnual: 799.00,
      limiteEnderecos: 1,
      destaqueBusca: false,
      relatoriosAvanc: false,
      ativo: true
    }
  });

  const planoProfissional = await prisma.plano.upsert({
    where: { slug: 'profissional' },
    update: {},
    create: {
      slug: 'profissional',
      nome: 'Plano Profissional',
      descricao: 'O mais escolhido por clínicas e especialistas: selo oficial e relatórios.',
      precoMensal: 149.90,
      precoAnual: 1499.00,
      limiteEnderecos: 2,
      destaqueBusca: true,
      relatoriosAvanc: true,
      ativo: true
    }
  });

  const planoPremium = await prisma.plano.upsert({
    where: { slug: 'premium' },
    update: {},
    create: {
      slug: 'premium',
      nome: 'Plano Premium Top',
      descricao: 'Destaque máximo nas buscas por CEP, selo dourado e prioridade total.',
      precoMensal: 299.90,
      precoAnual: 2999.00,
      limiteEnderecos: 5,
      destaqueBusca: true,
      relatoriosAvanc: true,
      ativo: true
    }
  });
  console.log('✓ 3 Planos SaaS inseridos: Básico, Profissional, Premium.');

  // 2. Especialidades
  const especialidadesNomes = [
    { nome: 'Clínica Geral', slug: 'clinica-geral' },
    { nome: 'Cardiologia', slug: 'cardiologia' },
    { nome: 'Medicina Felina', slug: 'medicina-felina' },
    { nome: 'Dermatologia', slug: 'dermatologia' },
    { nome: 'Odontologia', slug: 'odontologia' },
    { nome: 'Ortopedia', slug: 'ortopedia' },
    { nome: 'Oftalmologia', slug: 'oftalmologia' },
    { nome: 'Animais Exóticos e Silvestres', slug: 'exoticos-silvestres' },
    { nome: 'Cirurgia Geral', slug: 'cirurgia-geral' },
    { nome: 'Acupuntura', slug: 'acupuntura' },
    { nome: 'Nutrologia', slug: 'nutrologia' },
    { nome: 'Oncologia', slug: 'oncologia' },
    { nome: 'Fisioterapia Veterinária', slug: 'fisioterapia' }
  ];

  const especialidadesMap = new Map<string, string>();

  for (const esp of especialidadesNomes) {
    const item = await prisma.especialidade.upsert({
      where: { nome: esp.nome },
      update: { slug: esp.slug },
      create: { 
        nome: esp.nome, 
        slug: esp.slug,
        descricao: `Atendimento veterinário especializado em ${esp.nome}`,
        ativa: true 
      }
    });
    especialidadesMap.set(esp.nome, item.id);
  }
  console.log(`✓ ${especialidadesNomes.length} especialidades inseridas.`);

  // 3. Admin VetBra
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vetbra.com.br' },
    update: {},
    create: {
      email: 'admin@vetbra.com.br',
      login: 'admin',
      senhaHash: '$2a$10$7Z2WzYg2K8i8h1m2z3v4pe5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0', // admin123
      nome: 'Administrador VetBra',
      role: Role.ADMIN
    }
  });
  console.log('✓ Usuário Admin configurado:', adminUser.email);

  // 4. Veterinário 1 - Dr. Alexandre Mendes (São Paulo / Jardins - Verificado)
  const user1 = await prisma.user.upsert({
    where: { email: 'alexandre.mendes@vetbra.com' },
    update: {},
    create: {
      email: 'alexandre.mendes@vetbra.com',
      login: 'dr.alexandre',
      senhaHash: '$2a$10$7Z2WzYg2K8i8h1m2z3v4pe5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0', // vet123
      nome: 'Dr. Alexandre Mendes',
      role: Role.VET
    }
  });

  const vet1 = await prisma.veterinario.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      slug: 'dr-alexandre-mendes-sp-14839',
      nomeCompleto: 'Dr. Alexandre Mendes',
      nomeSocialOuClinica: 'Clínica VetBra Jardim Paulista',
      cpfCnpj: '12.345.678/0001-90',
      telefone: '(11) 3088-4321',
      whatsapp: '11988884321',
      bio: 'Médico Veterinário com mais de 12 anos de experiência dedicado a clínica médica, cardiologia preventiva e cirurgias de tecidos moles para cães e gatos em ambiente hospitalar moderno.',
      tempoExperienciaAnos: 12,
      fotoPerfilUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
      statusGeral: VetStatusGeral.ATIVO,
      crmvNumero: '14839',
      crmvUf: 'SP',
      crmvStatus: CrmvStatus.VERIFICADO,
      crmvValidade: new Date('2027-12-31'),
      crmvUltimaVerificacao: new Date(),
      tipoEstabelecimento: 'Clínica Veterinária Fixa',
      meioTransporte: 'Carro',
      meiosTransporte: ['Carro / PetMóvel', 'Atendimento Fixo'],
      raioAtendimentoKm: 20,
      cidadeBase: 'São Paulo',
      estadoBase: 'SP',
      permiteVetMovelApp: true,
      atende24h: false,
      atendeDomiciliar: true,
      atendeEmergencia: true,
      horarioFuncionamento: 'Segunda a Sexta - 08:00 às 20:00 | Sábados 08:00 às 14:00',
      tiposPets: ['Cães', 'Gatos'],
      instagram: '@dr.alexandremendes',
      site: 'https://vetbrajardins.com.br',
      destaqueBusca: true,
      visualizacoesCount: 1420,
      contatosWhatsappCount: 380,
      enderecos: {
        create: {
          tipoEndereco: 'PRINCIPAL',
          cep: '01424-001',
          logradouro: 'Alameda Lorena',
          numero: '1500',
          complemento: 'Conjunto 10',
          bairro: 'Jardim Paulista',
          cidade: 'São Paulo',
          estado: 'SP',
          latitude: -23.5673,
          longitude: -46.6668,
          raioKmAtendimento: 20
        }
      },
      procedimentos: {
        create: [
          { nome: 'Consulta Clínica Geral', categoria: ProcedimentoCategoria.CONSULTA, preco: 180, tempoMedioMinutos: 45 },
          { nome: 'Consulta Cardiológica + Eletrocardiograma', categoria: ProcedimentoCategoria.CONSULTA, preco: 350, tempoMedioMinutos: 60 },
          { nome: 'Vacina Importada V10 (Cães)', categoria: ProcedimentoCategoria.VACINACAO, preco: 110, tempoMedioMinutos: 20 },
          { nome: 'Vacina Quádrupla Felina', categoria: ProcedimentoCategoria.VACINACAO, preco: 120, tempoMedioMinutos: 20 },
          { nome: 'Castração Felina Macho', categoria: ProcedimentoCategoria.CIRURGIA, preco: 450, tempoMedioMinutos: 90 },
          { nome: 'Atendimento Domiciliar', categoria: ProcedimentoCategoria.CONSULTA, preco: 250, tempoMedioMinutos: 60 }
        ]
      },
      documentosCrmv: {
        create: [
          {
            tipo: DocumentoTipo.CARTEIRA_FRENTE,
            arquivoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
            status: DocumentoStatus.APROVADO,
            analisadoPor: 'admin@vetbra.com.br',
            analisadoEm: new Date()
          },
          {
            tipo: DocumentoTipo.SELFIE_COM_DOCUMENTO,
            arquivoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80',
            status: DocumentoStatus.APROVADO,
            analisadoPor: 'admin@vetbra.com.br',
            analisadoEm: new Date()
          }
        ]
      },
      avaliacoes: {
        create: [
          {
            nomeTutor: 'Mariana Silveira',
            nota: 5,
            comentario: 'Excelente atendimento. O Dr. Alexandre salvou o meu cão com diagnóstico rápido do problema cardíaco.'
          },
          {
            nomeTutor: 'Carlos Eduardo',
            nota: 5,
            comentario: 'Clínica impecável, pontualidade britânica e muito amor pelos animais.'
          }
        ]
      }
    }
  });

  // Associa especialidades explicitamente
  await prisma.veterinarioEspecialidade.upsert({
    where: { veterinarioId_especialidadeId: { veterinarioId: vet1.id, especialidadeId: especialidadesMap.get('Clínica Geral')! } },
    update: {},
    create: { veterinarioId: vet1.id, especialidadeId: especialidadesMap.get('Clínica Geral')!, principal: true }
  });
  await prisma.veterinarioEspecialidade.upsert({
    where: { veterinarioId_especialidadeId: { veterinarioId: vet1.id, especialidadeId: especialidadesMap.get('Cardiologia')! } },
    update: {},
    create: { veterinarioId: vet1.id, especialidadeId: especialidadesMap.get('Cardiologia')! }
  });

  // Assinatura e Fatura Ativas para o Dr. Alexandre
  const assinaturaVet1 = await prisma.assinatura.upsert({
    where: { id: `ass-${vet1.id}` },
    update: {},
    create: {
      id: `ass-${vet1.id}`,
      veterinarioId: vet1.id,
      planoId: planoPremium.id,
      status: AssinaturaStatus.ATIVA,
      ciclo: AssinaturaCiclo.MENSAL,
      valorAtual: 299.90,
      dataInicio: new Date(),
      faturas: {
        create: {
          numeroFatura: `FAT-${new Date().getFullYear()}-0001`,
          valor: 299.90,
          status: FaturaStatus.PAGA,
          metodoPreferencial: MetodoPagamento.PIX,
          dataVencimento: new Date(),
          dataLiquidacao: new Date()
        }
      }
    }
  });

  console.log(`✓ Dr. Alexandre Mendes cadastrado com CRMV Verificado e Assinatura Ativa (ID: ${assinaturaVet1.id}).`);

  // 5. Veterinária 2 - Dra. Camila Barros (Animais Silvestres & Acupuntura - Verificada)
  const user2 = await prisma.user.upsert({
    where: { email: 'camila.silvestres@vetbra.com' },
    update: {},
    create: {
      email: 'camila.silvestres@vetbra.com',
      login: 'dra.camila',
      senhaHash: '$2a$10$7Z2WzYg2K8i8h1m2z3v4pe5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0',
      nome: 'Dra. Camila Barros',
      role: Role.VET
    }
  });

  const vet2 = await prisma.veterinario.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      slug: 'dra-camila-barros-sp-28941',
      nomeCompleto: 'Dra. Camila Barros',
      nomeSocialOuClinica: 'Espaço Fauna & Equilíbrio',
      cpfCnpj: '98.765.432/0001-10',
      telefone: '(11) 3214-9988',
      whatsapp: '11977779988',
      bio: 'Especialista pós-graduada em animais silvestres, aves e répteis, com formação em acupuntura veterinária e reabilitação integrativa.',
      tempoExperienciaAnos: 8,
      fotoPerfilUrl: 'https://images.unsplash.com/photo-1594824813593-630e2f9cb798?w=500&auto=format&fit=crop&q=80',
      statusGeral: VetStatusGeral.ATIVO,
      crmvNumero: '28941',
      crmvUf: 'SP',
      crmvStatus: CrmvStatus.VERIFICADO,
      crmvValidade: new Date('2028-06-30'),
      crmvUltimaVerificacao: new Date(),
      tipoEstabelecimento: 'Consultório Fixo',
      meioTransporte: 'Carro',
      meiosTransporte: ['Carro / PetMóvel'],
      raioAtendimentoKm: 30,
      cidadeBase: 'São Paulo',
      estadoBase: 'SP',
      permiteVetMovelApp: true,
      atende24h: false,
      atendeDomiciliar: true,
      atendeEmergencia: false,
      tiposPets: ['Cães', 'Gatos', 'Aves', 'Silvestres'],
      visualizacoesCount: 980,
      contatosWhatsappCount: 240,
      enderecos: {
        create: {
          tipoEndereco: 'PRINCIPAL',
          cep: '05010-000',
          logradouro: 'Rua Cardoso de Almeida',
          numero: '820',
          bairro: 'Perdizes',
          cidade: 'São Paulo',
          estado: 'SP',
          latitude: -23.5385,
          longitude: -46.6698,
          raioKmAtendimento: 30
        }
      },
      procedimentos: {
        create: [
          { nome: 'Consulta de Aves e Silvestres', categoria: ProcedimentoCategoria.CONSULTA, preco: 220, tempoMedioMinutos: 50 },
          { nome: 'Sessão de Acupuntura Veterinária', categoria: ProcedimentoCategoria.CONSULTA, preco: 190, tempoMedioMinutos: 45 }
        ]
      }
    }
  });

  await prisma.veterinarioEspecialidade.upsert({
    where: { veterinarioId_especialidadeId: { veterinarioId: vet2.id, especialidadeId: especialidadesMap.get('Animais Exóticos e Silvestres')! } },
    update: {},
    create: { veterinarioId: vet2.id, especialidadeId: especialidadesMap.get('Animais Exóticos e Silvestres')!, principal: true }
  });

  await prisma.assinatura.upsert({
    where: { id: `ass-${vet2.id}` },
    update: {},
    create: {
      id: `ass-${vet2.id}`,
      veterinarioId: vet2.id,
      planoId: planoProfissional.id,
      status: AssinaturaStatus.ATIVA,
      ciclo: AssinaturaCiclo.MENSAL,
      valorAtual: 149.90,
      dataInicio: new Date()
    }
  });

  console.log('✓ Dra. Camila Barros inserida com sucesso.');
  console.log('--- Seed VetBra v2 Finalizado com Êxito! ---');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
