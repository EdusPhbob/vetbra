import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { 
  VET_PUBLIC_FILTER, 
  getEstadosComVeterinarios, 
  getCidadesDoEstado, 
  getEspecialidadesComVeterinarios 
} from '@/lib/seo-locations';

export const revalidate = 3600; // Revalida o sitemap a cada 1 hora automaticamente

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vetbra.com.br';
  const now = new Date();

  // 1. Rotas estáticas institucionais e diretório raiz
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/veterinarios`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/buscar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/planos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  try {
    // 2. Estados com veterinários ativos reais
    const estados = await getEstadosComVeterinarios();
    const estadoRoutes: MetadataRoute.Sitemap = estados.map((est) => ({
      url: `${baseUrl}/veterinarios/${est.uf.toLowerCase()}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    }));

    // 3. Municípios com veterinários ativos reais (evita 100% páginas vazias)
    const cidadesRoutes: MetadataRoute.Sitemap = [];
    for (const est of estados) {
      const cidades = await getCidadesDoEstado(est.uf);
      for (const cid of cidades) {
        cidadesRoutes.push({
          url: `${baseUrl}/veterinarios/${est.uf.toLowerCase()}/${cid.slug}`,
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.8,
        });
      }
    }

    // 4. Especialidades que possuem profissionais ativos
    const especialidades = await getEspecialidadesComVeterinarios();
    const especialidadeRoutes: MetadataRoute.Sitemap = especialidades.map((esp) => ({
      url: `${baseUrl}/especialidades/${esp.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.75,
    }));

    // 5. Todos os veterinários ativos e verificados (sem limite artificial de 1000)
    const vets = await prisma.veterinario.findMany({
      where: VET_PUBLIC_FILTER,
      select: {
        slug: true,
        updatedAt: true,
        destaqueBusca: true,
      },
      take: 50000, // Limite oficial do protocolo Sitemaps por arquivo XML
    });

    const vetRoutes: MetadataRoute.Sitemap = vets.map((vet) => ({
      url: `${baseUrl}/vets/${vet.slug}`,
      lastModified: vet.updatedAt,
      changeFrequency: 'weekly',
      priority: vet.destaqueBusca ? 0.9 : 0.7,
    }));

    return [
      ...staticRoutes,
      ...estadoRoutes,
      ...cidadesRoutes,
      ...especialidadeRoutes,
      ...vetRoutes,
    ];
  } catch (error) {
    console.error('Erro ao gerar sitemap dinâmico escalável:', error);
    return staticRoutes;
  }
}
