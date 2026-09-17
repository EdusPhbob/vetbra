import { 
  PrismaClient, 
  CrmvStatus, 
  Role, 
  VetStatusGeral, 
  AssinaturaStatus, 
  AssinaturaCiclo, 
  ProcedimentoCategoria 
} from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Populando Artigos, Avaliações e Novos Perfis (v2) ---');

  // Buscar plano profissional para associar
  const planoProfissional = await prisma.plano.findFirst({
    where: { slug: 'profissional' }
  });

  // Buscar veterinários existentes
  const vetAlexandre = await prisma.veterinario.findFirst({
    where: { nomeCompleto: { contains: 'Alexandre' } }
  });

  const vetCamila = await prisma.veterinario.findFirst({
    where: { nomeCompleto: { contains: 'Camila' } }
  });

  // Criar 2 novos veterinários verificados para a seção "Novos perfis no VetBra"
  const userVeronika = await prisma.user.upsert({
    where: { email: 'veronica.kasper@vetbra.com' },
    update: {},
    create: {
      email: 'veronica.kasper@vetbra.com',
      senhaHash: '$2a$10$7Z2WzYg2K8i8h1m2z3v4pe5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0',
      nome: 'Dra. Verônica Kasper',
      role: Role.VET
    }
  });

  const vetVeronika = await prisma.veterinario.upsert({
    where: { userId: userVeronika.id },
    update: {},
    create: {
      userId: userVeronika.id,
      slug: 'dra-veronica-kasper-sp-28114',
      nomeCompleto: 'Dra. Verônica Kasper',
      nomeSocialOuClinica: 'Clínica Integrada Pet Saúde',
      whatsapp: '11977771234',
      crmvNumero: '28114',
      crmvUf: 'SP',
      crmvStatus: CrmvStatus.VERIFICADO,
      crmvValidade: new Date('2028-05-10'),
      statusGeral: VetStatusGeral.ATIVO,
      fotoPerfilUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80',
      tipoEstabelecimento: 'Clínica',
      atende24h: false,
      atendeDomiciliar: true,
      enderecos: {
        create: {
          cep: '04538-133',
          logradouro: 'Rua Joaquim Floriano',
          numero: '466',
          bairro: 'Itaim Bibi',
          cidade: 'São Paulo',
          estado: 'SP'
        }
      },
      procedimentos: {
        create: [
          { nome: 'Consulta Dermatológica Pet', categoria: ProcedimentoCategoria.CONSULTA, preco: 210, tempoMedioMinutos: 45 },
          { nome: 'Raspagem de Pele e Citologia', categoria: ProcedimentoCategoria.EXAME, preco: 130, tempoMedioMinutos: 30 }
        ]
      }
    }
  });

  const userThiago = await prisma.user.upsert({
    where: { email: 'thiago.silva@vetbra.com' },
    update: {},
    create: {
      email: 'thiago.silva@vetbra.com',
      senhaHash: '$2a$10$7Z2WzYg2K8i8h1m2z3v4pe5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0',
      nome: 'Dr. Thiago Lima Maurício da Silva',
      role: Role.VET
    }
  });

  const vetThiago = await prisma.veterinario.upsert({
    where: { userId: userThiago.id },
    update: {},
    create: {
      userId: userThiago.id,
      slug: 'dr-thiago-lima-sp-31205',
      nomeCompleto: 'Dr. Thiago Lima Maurício da Silva',
      nomeSocialOuClinica: 'Centro de Fisioterapia Animal Movimento',
      whatsapp: '11988889999',
      crmvNumero: '31205',
      crmvUf: 'SP',
      crmvStatus: CrmvStatus.VERIFICADO,
      crmvValidade: new Date('2028-08-20'),
      statusGeral: VetStatusGeral.ATIVO,
      fotoPerfilUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=80',
      tipoEstabelecimento: 'Clínica',
      atende24h: false,
      atendeDomiciliar: true,
      enderecos: {
        create: {
          cep: '06501-001',
          logradouro: 'Avenida Brasil',
          numero: '310',
          bairro: 'Centro',
          cidade: 'Santana de Parnaíba',
          estado: 'SP'
        }
      },
      procedimentos: {
        create: [
          { nome: 'Sessão de Fisioterapia e Reabilitação', categoria: ProcedimentoCategoria.CONSULTA, preco: 180, tempoMedioMinutos: 60 }
        ]
      }
    }
  });

  // Assinaturas v2
  if (planoProfissional) {
    await prisma.assinatura.upsert({
      where: { id: `ass-${vetVeronika.id}` },
      update: {},
      create: {
        id: `ass-${vetVeronika.id}`,
        veterinarioId: vetVeronika.id,
        planoId: planoProfissional.id,
        status: AssinaturaStatus.ATIVA,
        ciclo: AssinaturaCiclo.MENSAL,
        valorAtual: planoProfissional.precoMensal,
        dataInicio: new Date()
      }
    });

    await prisma.assinatura.upsert({
      where: { id: `ass-${vetThiago.id}` },
      update: {},
      create: {
        id: `ass-${vetThiago.id}`,
        veterinarioId: vetThiago.id,
        planoId: planoProfissional.id,
        status: AssinaturaStatus.ATIVA,
        ciclo: AssinaturaCiclo.MENSAL,
        valorAtual: planoProfissional.precoMensal,
        dataInicio: new Date()
      }
    });
  }

  // Conectar especialidades aos novos veterinários
  const espDerma = await prisma.especialidade.findFirst({ where: { nome: 'Dermatologia' } });
  const espFisio = await prisma.especialidade.findFirst({ where: { nome: 'Fisioterapia Veterinária' } });
  const espClinica = await prisma.especialidade.findFirst({ where: { nome: 'Clínica Geral' } });

  if (espDerma) {
    await prisma.veterinarioEspecialidade.upsert({
      where: { veterinarioId_especialidadeId: { veterinarioId: vetVeronika.id, especialidadeId: espDerma.id } },
      update: {},
      create: { veterinarioId: vetVeronika.id, especialidadeId: espDerma.id, principal: true }
    });
  }
  if (espClinica) {
    await prisma.veterinarioEspecialidade.upsert({
      where: { veterinarioId_especialidadeId: { veterinarioId: vetVeronika.id, especialidadeId: espClinica.id } },
      update: {},
      create: { veterinarioId: vetVeronika.id, especialidadeId: espClinica.id }
    });
  }
  if (espFisio) {
    await prisma.veterinarioEspecialidade.upsert({
      where: { veterinarioId_especialidadeId: { veterinarioId: vetThiago.id, especialidadeId: espFisio.id } },
      update: {},
      create: { veterinarioId: vetThiago.id, especialidadeId: espFisio.id, principal: true }
    });
  }

  // 3. Artigos de Blog
  if (vetAlexandre) {
    await prisma.artigo.upsert({
      where: { slug: 'sistema-endocrino-caes-gatos-como-funciona' },
      update: {},
      create: {
        veterinarioId: vetAlexandre.id,
        slug: 'sistema-endocrino-caes-gatos-como-funciona',
        titulo: 'Sistema Endócrino: O Que É, Como Funciona e Principais Hormônios em Pets',
        categoria: 'Endocrinologia Pet',
        resumo: 'Entenda como o sistema hormonal regula desde o apetite até a disposição do seu pet e conheça os sinais clássicos de problemas na tireoide e diabetes.',
        conteudo: 'O sistema endócrino veterinário é uma complexa rede de glândulas responsáveis por liberar hormônios que controlam o metabolismo, crescimento e equilíbrio hídrico dos cães e gatos...',
        fotoUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
        publicado: true,
        visualizacoes: 480
      }
    });

    await prisma.artigo.upsert({
      where: { slug: 'exames-cardiologicos-mais-solicitados-caes-idosos' },
      update: {},
      create: {
        veterinarioId: vetAlexandre.id,
        slug: 'exames-cardiologicos-mais-solicitados-caes-idosos',
        titulo: 'Quais São os Exames Mais Solicitados para o Coração de Cães e Gatos?',
        categoria: 'Cardiologia',
        resumo: 'Descubra quais são os exames essenciais solicitados por cardiologistas veterinários para prevenir síncopes, cansaço fácil e insuficiência cardíaca congestiva.',
        conteudo: 'A partir dos 7 anos, animais de pequeno e grande porte devem passar por avaliação cardiológica periódica com ecodopplercardiograma e eletrocardiograma contínuo...',
        fotoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
        publicado: true,
        visualizacoes: 620
      }
    });
  }

  if (vetCamila) {
    await prisma.artigo.upsert({
      where: { slug: 'nutricao-e-cuidados-preventivos-aves-e-silvestres' },
      update: {},
      create: {
        veterinarioId: vetCamila.id,
        slug: 'nutricao-e-cuidados-preventivos-aves-e-silvestres',
        titulo: 'Diferenças Entre Ração Extrusada e Mix de Sementes para Aves: Guia Completo',
        categoria: 'Nutrição Animal',
        resumo: 'Entenda por que a dieta exclusiva de sementes gordurosas adoece papagaios e calopsitas e como fazer a transição para uma alimentação balanceada e segura.',
        conteudo: 'Muitos tutores acreditam que apenas girassol é suficiente, mas a deficiência de vitamina A e cálcio é a principal causa de internação de aves em consultórios especializados...',
        fotoUrl: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop&q=80',
        publicado: true,
        visualizacoes: 390
      }
    });
  }

  // 4. Avaliações Recentes com Depoimentos
  if (vetVeronika) {
    await prisma.avaliacao.create({
      data: {
        veterinarioId: vetVeronika.id,
        nomeTutor: 'Anelise Santos',
        nota: 5,
        comentario: 'Dra. Verônica é uma excelente profissional, cuida da minha cadelinha há anos. Sempre muito atenciosa, pontual e muito educada!'
      }
    });
  }

  if (vetThiago) {
    await prisma.avaliacao.create({
      data: {
        veterinarioId: vetThiago.id,
        nomeTutor: 'Danielle Horne',
        nota: 5,
        comentario: 'Atendimento de altíssimo nível, o Dr. Thiago foi extremamente cuidadoso na reabilitação pós-cirúrgica do meu labrador.'
      }
    });
  }

  if (vetAlexandre) {
    await prisma.avaliacao.create({
      data: {
        veterinarioId: vetAlexandre.id,
        nomeTutor: 'Gabriela Lima',
        nota: 5,
        comentario: 'Ótimo profissional, explicou detalhadamente todo o diagnóstico cardiológico e me passou muita segurança.'
      }
    });
  }

  console.log('✓ Artigos, avaliações e novos perfis v2 adicionados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
