import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role, CrmvStatus, PlanoTipo, AssinaturaStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nomeCompleto,
      email,
      senha,
      whatsapp,
      crmvNumero,
      crmvUf,
      nomeClinica,
      cep,
      cidade,
      estado,
      tipoEstabelecimento,
      meioTransporte,
      atende24h,
      atendeDomiciliar,
      plano
    } = body;

    if (!nomeCompleto || !email || !crmvNumero || !whatsapp) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos.' }, { status: 400 });
    }

    // Checa se email já existe
    const existeEmail = await prisma.user.findUnique({ where: { email } });
    if (existeEmail) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    // Cria User
    const user = await prisma.user.create({
      data: {
        email,
        senhaHash: senha || '123456',
        nome: nomeCompleto,
        role: Role.VET
      }
    });

    // Cria Slug único
    const baseSlug = nomeCompleto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const slug = `${baseSlug}-${crmvUf.toLowerCase()}-${crmvNumero}`;

    // Cria Perfil de Veterinário com status PENDENTE
    const vet = await prisma.veterinario.create({
      data: {
        userId: user.id,
        slug,
        nomeCompleto,
        nomeSocialOuClinica: nomeClinica || null,
        whatsapp,
        crmvNumero,
        crmvUf,
        crmvStatus: CrmvStatus.PENDENTE,
        tipoEstabelecimento: tipoEstabelecimento || 'Clínica',
        meioTransporte: meioTransporte || (atendeDomiciliar ? 'Carro' : 'Nenhum'),
        atende24h: !!atende24h,
        atendeDomiciliar: !!atendeDomiciliar,
        plano: (plano as PlanoTipo) || PlanoTipo.BASICO,
        statusAssinatura: AssinaturaStatus.ATIVO,
        enderecos: {
          create: {
            cep: cep || '01000-000',
            logradouro: 'Avenida Principal',
            numero: '100',
            bairro: 'Centro',
            cidade: cidade || 'São Paulo',
            estado: estado || 'SP'
          }
        },
        procedimentos: {
          create: [
            { nome: 'Consulta Clínica Geral', categoria: 'Consulta', preco: 150, tempoMedioMinutos: 40 },
            { nome: 'Vacina Importada V10', categoria: 'Vacinação', preco: 95, tempoMedioMinutos: 20 },
            { nome: 'Castração', categoria: 'Cirurgia', preco: 350, tempoMedioMinutos: 90 }
          ]
        }
      }
    });

    return NextResponse.json({ success: true, user, vet });
  } catch (error: any) {
    console.error('Erro ao cadastrar veterinário:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar cadastro.' }, { status: 500 });
  }
}
