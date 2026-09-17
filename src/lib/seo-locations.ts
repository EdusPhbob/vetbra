import prisma from '@/lib/prisma';
import { VetStatusGeral, CrmvStatus } from '@prisma/client';

export interface EstadoBrasil {
  uf: string;
  nome: string;
  regiao: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
}

export const ESTADOS_BRASIL: Record<string, EstadoBrasil> = {
  AC: { uf: 'AC', nome: 'Acre', regiao: 'Norte' },
  AL: { uf: 'AL', nome: 'Alagoas', regiao: 'Nordeste' },
  AP: { uf: 'AP', nome: 'Amapá', regiao: 'Norte' },
  AM: { uf: 'AM', nome: 'Amazonas', regiao: 'Norte' },
  BA: { uf: 'BA', nome: 'Bahia', regiao: 'Nordeste' },
  CE: { uf: 'CE', nome: 'Ceará', regiao: 'Nordeste' },
  DF: { uf: 'DF', nome: 'Distrito Federal', regiao: 'Centro-Oeste' },
  ES: { uf: 'ES', nome: 'Espírito Santo', regiao: 'Sudeste' },
  GO: { uf: 'GO', nome: 'Goiás', regiao: 'Centro-Oeste' },
  MA: { uf: 'MA', nome: 'Maranhão', regiao: 'Nordeste' },
  MT: { uf: 'MT', nome: 'Mato Grosso', regiao: 'Centro-Oeste' },
  MS: { uf: 'MS', nome: 'Mato Grosso do Sul', regiao: 'Centro-Oeste' },
  MG: { uf: 'MG', nome: 'Minas Gerais', regiao: 'Sudeste' },
  PA: { uf: 'PA', nome: 'Pará', regiao: 'Norte' },
  PB: { uf: 'PB', nome: 'Paraíba', regiao: 'Nordeste' },
  PR: { uf: 'PR', nome: 'Paraná', regiao: 'Sul' },
  PE: { uf: 'PE', nome: 'Pernambuco', regiao: 'Nordeste' },
  PI: { uf: 'PI', nome: 'Piauí', regiao: 'Nordeste' },
  RJ: { uf: 'RJ', nome: 'Rio de Janeiro', regiao: 'Sudeste' },
  RN: { uf: 'RN', nome: 'Rio Grande do Norte', regiao: 'Nordeste' },
  RS: { uf: 'RS', nome: 'Rio Grande do Sul', regiao: 'Sul' },
  RO: { uf: 'RO', nome: 'Rondônia', regiao: 'Norte' },
  RR: { uf: 'RR', nome: 'Roraima', regiao: 'Norte' },
  SC: { uf: 'SC', nome: 'Santa Catarina', regiao: 'Sul' },
  SP: { uf: 'SP', nome: 'São Paulo', regiao: 'Sudeste' },
  SE: { uf: 'SE', nome: 'Sergipe', regiao: 'Nordeste' },
  TO: { uf: 'TO', nome: 'Tocantins', regiao: 'Norte' },
};

/**
 * Normaliza qualquer texto para um slug amigável de URL
 * Ex: "São Paulo" -> "sao-paulo"
 * Ex: "Ribeirão Pires" -> "ribeirao-pires"
 */
export function slugify(text: string): string {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Filtro padrão para veterinários públicos, verificados e auditados
 */
export const VET_PUBLIC_FILTER = {
  statusGeral: VetStatusGeral.ATIVO,
  crmvStatus: CrmvStatus.VERIFICADO,
};

/**
 * Retorna todos os estados que possuem pelo menos 1 veterinário ativo
 */
export async function getEstadosComVeterinarios(): Promise<
  (EstadoBrasil & { totalVets: number })[]
> {
  const vets = await prisma.veterinario.findMany({
    where: VET_PUBLIC_FILTER,
    select: {
      id: true,
      estadoBase: true,
      crmvUf: true,
      enderecos: {
        select: { estado: true },
      },
    },
  });

  const estadoContagem = new Map<string, Set<string>>();

  for (const vet of vets) {
    const ufs = new Set<string>();
    if (vet.crmvUf) ufs.add(vet.crmvUf.toUpperCase());
    if (vet.estadoBase) ufs.add(vet.estadoBase.toUpperCase());
    for (const end of vet.enderecos) {
      if (end.estado) ufs.add(end.estado.toUpperCase());
    }

    for (const uf of ufs) {
      if (ESTADOS_BRASIL[uf]) {
        if (!estadoContagem.has(uf)) {
          estadoContagem.set(uf, new Set());
        }
        estadoContagem.get(uf)!.add(vet.id);
      }
    }
  }

  const resultado: (EstadoBrasil & { totalVets: number })[] = [];

  estadoContagem.forEach((vetIds, uf) => {
    if (vetIds.size > 0 && ESTADOS_BRASIL[uf]) {
      resultado.push({
        ...ESTADOS_BRASIL[uf],
        totalVets: vetIds.size,
      });
    }
  });

  return resultado.sort((a, b) => b.totalVets - a.totalVets || a.nome.localeCompare(b.nome));
}

export interface CidadeComVeterinarios {
  cidade: string;
  slug: string;
  uf: string;
  totalVets: number;
}

/**
 * Retorna municípios de um determinado estado que possuem veterinários ativos
 */
export async function getCidadesDoEstado(ufParam: string): Promise<CidadeComVeterinarios[]> {
  const ufUpper = ufParam.toUpperCase();
  if (!ESTADOS_BRASIL[ufUpper]) return [];

  const vets = await prisma.veterinario.findMany({
    where: {
      ...VET_PUBLIC_FILTER,
      OR: [
        { crmvUf: ufUpper },
        { estadoBase: ufUpper },
        { enderecos: { some: { estado: ufUpper } } },
      ],
    },
    select: {
      id: true,
      cidadeBase: true,
      estadoBase: true,
      enderecos: {
        select: { cidade: true, estado: true },
      },
    },
  });

  const cidadeMap = new Map<string, { nomeReal: string; vetIds: Set<string> }>();

  for (const vet of vets) {
    const cidadesDoVet = new Map<string, string>(); // slug -> nomeOriginal

    if (vet.estadoBase?.toUpperCase() === ufUpper && vet.cidadeBase) {
      cidadesDoVet.set(slugify(vet.cidadeBase), vet.cidadeBase.trim());
    }

    for (const end of vet.enderecos) {
      if (end.estado?.toUpperCase() === ufUpper && end.cidade) {
        cidadesDoVet.set(slugify(end.cidade), end.cidade.trim());
      }
    }

    cidadesDoVet.forEach((nomeOriginal, slug) => {
      if (!cidadeMap.has(slug)) {
        cidadeMap.set(slug, { nomeReal: nomeOriginal, vetIds: new Set() });
      }
      cidadeMap.get(slug)!.vetIds.add(vet.id);
    });
  }

  const cidades: CidadeComVeterinarios[] = [];
  cidadeMap.forEach((data, slug) => {
    if (data.vetIds.size > 0) {
      cidades.push({
        cidade: data.nomeReal,
        slug,
        uf: ufUpper,
        totalVets: data.vetIds.size,
      });
    }
  });

  return cidades.sort((a, b) => b.totalVets - a.totalVets || a.cidade.localeCompare(b.cidade));
}

/**
 * Busca veterinários ativos para uma cidade específica de um estado
 */
export async function getVeterinariosDaCidade(ufParam: string, cidadeSlug: string) {
  const ufUpper = ufParam.toUpperCase();
  if (!ESTADOS_BRASIL[ufUpper]) return null;

  // Busca todos os veterinários que atendem no estado
  const vets = await prisma.veterinario.findMany({
    where: {
      ...VET_PUBLIC_FILTER,
      OR: [
        { crmvUf: ufUpper },
        { estadoBase: ufUpper },
        { enderecos: { some: { estado: ufUpper } } },
      ],
    },
    include: {
      enderecos: true,
      especialidades: {
        include: { especialidade: true },
      },
      procedimentos: {
        where: { ativo: true },
        take: 5,
      },
      avaliacoes: {
        where: { status: { not: 'REJEITADA' } },
        select: { nota: true },
      },
    },
    orderBy: [
      { destaqueBusca: 'desc' },
      { visualizacoesCount: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Filtra aqueles cuja cidade bate com o slug fornecido
  let nomeRealCidade = '';

  const vetsFiltrados = vets.filter((vet) => {
    let bateu = false;
    if (vet.estadoBase?.toUpperCase() === ufUpper && vet.cidadeBase) {
      if (slugify(vet.cidadeBase) === cidadeSlug) {
        nomeRealCidade = vet.cidadeBase.trim();
        bateu = true;
      }
    }
    for (const end of vet.enderecos) {
      if (end.estado?.toUpperCase() === ufUpper && end.cidade) {
        if (slugify(end.cidade) === cidadeSlug) {
          if (!nomeRealCidade) nomeRealCidade = end.cidade.trim();
          bateu = true;
        }
      }
    }
    return bateu;
  });

  if (vetsFiltrados.length === 0) {
    return null;
  }

  return {
    estado: ESTADOS_BRASIL[ufUpper],
    cidade: nomeRealCidade,
    cidadeSlug,
    vets: vetsFiltrados,
  };
}

/**
 * Busca especialidades que possuem pelo menos 1 veterinário ativo
 */
export async function getEspecialidadesComVeterinarios() {
  const especialidades = await prisma.especialidade.findMany({
    where: {
      ativa: true,
      veterinarios: {
        some: {
          veterinario: VET_PUBLIC_FILTER,
        },
      },
    },
    include: {
      _count: {
        select: {
          veterinarios: {
            where: {
              veterinario: VET_PUBLIC_FILTER,
            },
          },
        },
      },
    },
  });

  return especialidades
    .map((esp) => ({
      id: esp.id,
      nome: esp.nome,
      slug: esp.slug || slugify(esp.nome),
      descricao: esp.descricao,
      totalVets: esp._count.veterinarios,
    }))
    .filter((esp) => esp.totalVets > 0)
    .sort((a, b) => b.totalVets - a.totalVets || a.nome.localeCompare(b.nome));
}

/**
 * Busca veterinários ativos vinculados a uma especialidade
 */
export async function getVeterinariosPorEspecialidade(especialidadeSlug: string) {
  const especialidade = await prisma.especialidade.findFirst({
    where: {
      OR: [
        { slug: especialidadeSlug },
        { nome: { equals: especialidadeSlug.replace(/-/g, ' '), mode: 'insensitive' } },
      ],
      ativa: true,
    },
    include: {
      veterinarios: {
        where: {
          veterinario: VET_PUBLIC_FILTER,
        },
        include: {
          veterinario: {
            include: {
              enderecos: true,
              especialidades: {
                include: { especialidade: true },
              },
              procedimentos: {
                where: { ativo: true },
                take: 5,
              },
              avaliacoes: {
                where: { status: { not: 'REJEITADA' } },
                select: { nota: true },
              },
            },
          },
        },
      },
    },
  });

  if (!especialidade || especialidade.veterinarios.length === 0) {
    return null;
  }

  const vets = especialidade.veterinarios.map((ev) => ev.veterinario);

  return {
    especialidade: {
      id: especialidade.id,
      nome: especialidade.nome,
      slug: especialidade.slug || slugify(especialidade.nome),
      descricao: especialidade.descricao,
    },
    vets,
  };
}
