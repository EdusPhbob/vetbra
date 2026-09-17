import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { VetStatusGeral, CrmvStatus } from '@prisma/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vetbra.com.br';

  // 1. Rotas estáticas essenciais
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/planos`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cadastro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  try {
    // 2. Perfis públicos de veterinários ativos
    const vets = await prisma.veterinario.findMany({
      where: {
        statusGeral: VetStatusGeral.ATIVO,
        crmvStatus: CrmvStatus.VERIFICADO,
      },
      select: {
        slug: true,
        updatedAt: true,
        destaqueBusca: true,
      },
      take: 1000,
    });

    const vetRoutes: MetadataRoute.Sitemap = vets.map((vet) => ({
      url: `${baseUrl}/vets/${vet.slug}`,
      lastModified: vet.updatedAt,
      changeFrequency: 'weekly',
      priority: vet.destaqueBusca ? 0.9 : 0.7,
    }));

    // 3. Artigos de Blog publicados
    const artigos = await prisma.artigo.findMany({
      where: { publicado: true },
      select: { slug: true, updatedAt: true },
      take: 500,
    });

    const artigoRoutes: MetadataRoute.Sitemap = artigos.map((artigo) => ({
      url: `${baseUrl}/blog/${artigo.slug}`,
      lastModified: artigo.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    return [...staticRoutes, ...vetRoutes, ...artigoRoutes];
  } catch (error) {
    console.error('Erro ao gerar sitemap dinâmico:', error);
    return staticRoutes;
  }
}
