import { PrismaClient, Role, CrmvStatus, PlanoTipo, AssinaturaStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed VetBra ---');

  // 1. Especialidades
  const especialidadesNomes = [
    'Clínica Geral',
    'Cardiologia',
    'Medicina Felina',
    'Dermatologia',
    'Odontologia',
    'Ortopedia',
    'Oftalmologia',
    'Animais Exóticos e Silvestres',
    'Cirurgia Geral',
    'Acupuntura',
    'Nutrologia',
    'Oncologia',
    'Fisioterapia Veterinária'
  ];

  const especialidadesMap = new Map<string, string>();

  for (const nome of especialidadesNomes) {
    const esp = await prisma.especialidade.upsert({
      where: { nome },
      update: {},
      create: { nome, descricao: `Atendimento veterinário especializado em ${nome}` }
    });
    especialidadesMap.set(nome, esp.id);
  }
  console.log(`✓ ${especialidadesNomes.length} especialidades inseridas.`);

  // 2. Admin VetBra
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vetbra.com.br' },
    update: {},
    create: {
      email: 'admin@vetbra.com.br',
      senhaHash: 'admin123', // Em prod usar bcrypt
      nome: 'Administrador VetBra',
      role: Role.ADMIN
    }
  });
  console.log('✓ Usuário Admin criado:', adminUser.email);

  // 3. Veterinário 1 - Dr. Alexandre Mendes (São Paulo / Jardins - Verificado)
  const user1 = await prisma.user.upsert({
    where: { email: 'alexandre.mendes@vetbra.com' },
    update: {},
    create: {
      email: 'alexandre.mendes@vetbra.com',
      senhaHash: 'vet123',
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
      crmvNumero: '14839',
      crmvUf: 'SP',
      crmvStatus: CrmvStatus.VERIFICADO,
      crmvValidade: new Date('2027-12-31'),
      crmvUltimaVerificacao: new Date(),
      tipoEstabelecimento: 'Clínica',
      meioTransporte: 'Carro',
      atende24h: false,
      atendeDomiciliar: true,
      atendeEmergencia: true,
      horarioFuncionamento: 'Segunda a Sexta - 08:00 às 20:00 | Sábados 08:00 às 14:00',
      tiposPets: ['Cães', 'Gatos'],
      instagram: '@dr.alexandremendes',
      site: 'https://vetbrajardins.com.br',
      plano: PlanoTipo.PREMIUM,
      statusAssinatura: AssinaturaStatus.ATIVO,
      destaqueBusca: true,
      visualizacoesCount: 1420,
      contatosWhatsappCount: 380,
      enderecos: {
        create: {
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
          { nome: 'Consulta Clínica Geral', categoria: 'Consulta', preco: 180, tempoMedioMinutos: 45 },
          { nome: 'Consulta Cardiológica + Eletrocardiograma', categoria: 'Consulta', preco: 350, tempoMedioMinutos: 60 },
          { nome: 'Vacina Importada V10 (Cães)', categoria: 'Vacinação', preco: 110, tempoMedioMinutos: 20 },
          { nome: 'Vacina Quádrupla Felina', categoria: 'Vacinação', preco: 120, tempoMedioMinutos: 20 },
          { nome: 'Castração Felina Macho', categoria: 'Cirurgia', preco: 450, tempoMedioMinutos: 90 },
          { nome: 'Atendimento Domiciliar', categoria: 'Consulta', preco: 250, tempoMedioMinutos: 60 }
        ]
      },
      especialidades: {
        connect: [
          { id: especialidadesMap.get('Clínica Geral')! },
          { id: especialidadesMap.get('Cardiologia')! },
          { id: especialidadesMap.get('Cirurgia Geral')! }
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

  // 4. Veterinária 2 - Dra. Camila Barros (Animais Silvestres & Acupuntura - Verificada)
  const user2 = await prisma.user.upsert({
    where: { email: 'camila.silvestres@vetbra.com' },
    update: {},
    create: {
      email: 'camila.silvestres@vetbra.com',
      senhaHash: 'vet123',
      nome: 'Dra. Camila Barros',
      role: Role.VET
    }
  });

  await prisma.veterinario.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      slug: 'dra-camila-barros-sp-22180',
      nomeCompleto: 'Dra. Camila Barros',
      nomeSocialOuClinica: 'Instituto Silvestre & Integrativa',
      cpfCnpj: '23.456.789/0001-11',
      telefone: '(11) 3214-5500',
      whatsapp: '11977771234',
      bio: 'Ex-veterinária residente do Zoológico de São Paulo. Especialista em atendimento clínico de animais não convencionais (aves, répteis, roedores) e fisioterapia integrativa.',
      tempoExperienciaAnos: 9,
      fotoPerfilUrl: 'https://images.unsplash.com/photo-1594824813590-482a0b4d455e?w=500&auto=format&fit=crop&q=80',
      crmvNumero: '22180',
      crmvUf: 'SP',
      crmvStatus: CrmvStatus.VERIFICADO,
      crmvValidade: new Date('2028-06-30'),
      crmvUltimaVerificacao: new Date(),
      tipoEstabelecimento: 'Autônomo Domiciliar',
      meioTransporte: 'Moto',
      atende24h: false,
      atendeDomiciliar: true,
      atendeEmergencia: false,
      horarioFuncionamento: 'Segunda a Sexta - 09:00 às 18:00',
      tiposPets: ['Aves', 'Répteis', 'Roedores', 'Coelhos', 'Cães', 'Gatos'],
      instagram: '@dra.camilasilvestres',
      plano: PlanoTipo.PROFISSIONAL,
      statusAssinatura: AssinaturaStatus.ATIVO,
      destaqueBusca: true,
      visualizacoesCount: 980,
      contatosWhatsappCount: 210,
      enderecos: {
        create: {
          cep: '04530-001',
          logradouro: 'Rua Tabapuã',
          numero: '800',
          bairro: 'Itaim Bibi',
          cidade: 'São Paulo',
          estado: 'SP',
          latitude: -23.5855,
          longitude: -46.6784,
          raioKmAtendimento: 25
        }
      },
      procedimentos: {
        create: [
          { nome: 'Consulta de Animais Silvestres / Aves / Répteis', categoria: 'Consulta', preco: 220, tempoMedioMinutos: 60 },
          { nome: 'Sessão de Acupuntura Veterinária', categoria: 'Consulta', preco: 190, tempoMedioMinutos: 50 },
          { nome: 'Corte de Unhas / Bico de Aves e Roedores', categoria: 'Estética', preco: 70, tempoMedioMinutos: 20 },
          { nome: 'Atendimento Domiciliar Silvestres', categoria: 'Consulta', preco: 300, tempoMedioMinutos: 70 }
        ]
      },
      especialidades: {
        connect: [
          { id: especialidadesMap.get('Animais Exóticos e Silvestres')! },
          { id: especialidadesMap.get('Acupuntura')! },
          { id: especialidadesMap.get('Fisioterapia Veterinária')! }
        ]
      },
      avaliacoes: {
        create: [
          {
            nomeTutor: 'Fernanda Rocha',
            nota: 5,
            comentario: 'A Dra. Camila é maravilhosa! Cuidou do meu papagaio com um carinho ímpar.'
          }
        ]
      }
    }
  });

  // 5. Veterinário 3 - Dr. Roberto Silveira (CRMV PENDENTE PARA AUDITORIA NO PAINEL ADMIN)
  const user3 = await prisma.user.upsert({
    where: { email: 'roberto.silveira@hospitalvet.com.br' },
    update: {},
    create: {
      email: 'roberto.silveira@hospitalvet.com.br',
      senhaHash: 'vet123',
      nome: 'Dr. Roberto Silveira',
      role: Role.VET
    }
  });

  await prisma.veterinario.upsert({
    where: { userId: user3.id },
    update: {},
    create: {
      userId: user3.id,
      slug: 'dr-roberto-silveira-sp-34991',
      nomeCompleto: 'Dr. Roberto Silveira',
      nomeSocialOuClinica: 'Hospital Veterinário 24 Horas Pinheiros',
      cpfCnpj: '34.567.890/0001-22',
      telefone: '(11) 3812-9900',
      whatsapp: '11966665432',
      bio: 'Especialista em cirurgias ortopédicas complexas e atendimento emergencial 24h. Unidade com UTI equipada e pronto-socorro cirúrgico.',
      tempoExperienciaAnos: 15,
      fotoPerfilUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80',
      crmvNumero: '34991',
      crmvUf: 'SP',
      crmvStatus: CrmvStatus.PENDENTE, // PENDENTE DE APROVAÇÃO
      crmvNotasAuditoria: 'Cadastrou há pouco, anexou Cédula do CRMV-SP para validação.',
      tipoEstabelecimento: 'Hospital 24h',
      atende24h: true,
      atendeDomiciliar: false,
      atendeEmergencia: true,
      horarioFuncionamento: 'Plantão 24 Horas Ininterrupto',
      tiposPets: ['Cães', 'Gatos'],
      plano: PlanoTipo.BASICO,
      statusAssinatura: AssinaturaStatus.ATIVO,
      destaqueBusca: false,
      visualizacoesCount: 120,
      contatosWhatsappCount: 15,
      enderecos: {
        create: {
          cep: '05422-001',
          logradouro: 'Rua dos Pinheiros',
          numero: '1200',
          bairro: 'Pinheiros',
          cidade: 'São Paulo',
          estado: 'SP',
          latitude: -23.5658,
          longitude: -46.6895
        }
      },
      procedimentos: {
        create: [
          { nome: 'Plantão Emergencial 24h', categoria: 'Emergência', preco: 250, tempoMedioMinutos: 40 },
          { nome: 'Cirurgia Ortopédica (Fratura / Ruptura de Ligamento)', categoria: 'Cirurgia', preco: 1800, tempoMedioMinutos: 180 },
          { nome: 'Raio-X Digital (2 Projeções)', categoria: 'Exame', preco: 180, tempoMedioMinutos: 30 }
        ]
      },
      especialidades: {
        connect: [
          { id: especialidadesMap.get('Ortopedia')! },
          { id: especialidadesMap.get('Cirurgia Geral')! }
        ]
      }
    }
  });

  console.log('✓ Veterinários e procedimentos semeados com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
