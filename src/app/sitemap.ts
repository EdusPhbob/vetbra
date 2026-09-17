import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { 
  VET_PUBLIC_FILTER, 
  getEstadosComVeterinarios, 
  getCidadesDoEstado, 
  getEspecialidadesComVeterinarios 
} from '@/lib/seo-locations';

export const revalidate = 3600; // Revalidação a cada 1 hora

/**
 * Limite de URLs de veterinários por arquivo sitemap particionado.
 * O protocolo oficial do Google suporta até 50.000 URLs por arquivo XML.
 * Adotamos 40.000 URLs por fatia para garantir ampla margem de segurança e performance.
 */
const CHUNK_SIZE = 40000;

/**
 * Função nativa do Next.js para particionamento e geração de Sitemap Index.
 * Calcula via count() do banco quantas fatias de sitemap são necessárias.
 * Quando o número de veterinários ultrapassar 40.000 (ou 50.000), o sistema
 * gera automaticamente sitemap/0.xml, sitemap/1.xml, sitemap/2.xml, etc.
 */
export async function generateSitemaps() {
  try {
    const totalVets = await prisma.veterinario.count({
      where: VET_PUBLIC_FILTER,
    });

    const numSitemaps = Math.max(1, Math.ceil(totalVets / CHUNK_SIZE));

    return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }));
  } catch (error) {
    console.error('Erro ao calcular partição de sitemaps:', error);
    return [{ id: 0 }];
  }
}

interface SitemapProps {
  id: number;
}

export default async function sitemap(props: SitemapProps | any): Promise<MetadataRoute.Sitemap> {
  const resolvedId = typeof props?.id === 'object' && props?.id !== null && 'then' in props.id
    ? await props.id
    : props?.id;
  const sitemapId = Number(resolvedId ?? 0);

  const baseUrl = 'https://vetbra.com.br';
  const now = new Date();

  // No primeiro sitemap (id: 0) incluímos as rotas estruturais e geográficas
  let prefixRoutes: MetadataRoute.Sitemap = [];

  if (sitemapId === 0) {
    try {
      // 1. Rotas estáticas institucionais
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

      // 4. Especialidades com profissionais ativos reais
      const especialidades = await getEspecialidadesComVeterinarios();
      const especialidadeRoutes: MetadataRoute.Sitemap = especialidades.map((esp) => ({
        url: `${baseUrl}/especialidades/${esp.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.75,
      }));

      prefixRoutes = [
        ...staticRoutes,
        ...estadoRoutes,
        ...cidadesRoutes,
        ...especialidadeRoutes,
      ];
    } catch (err) {
      console.error('Erro ao montar rotas estruturais no sitemap 0:', err);
    }
  }

  // 5. Busca a fatia (chunk) de veterinários correspondente ao id do sitemap
  try {
    const vets = await prisma.veterinario.findMany({
      where: VET_PUBLIC_FILTER,
      select: {
        slug: true,
        updatedAt: true,
        destaqueBusca: true,
      },
      orderBy: { createdAt: 'asc' },
      skip: sitemapId * CHUNK_SIZE,
      take: CHUNK_SIZE,
    });

    const vetRoutes: MetadataRoute.Sitemap = vets.map((vet) => ({
      url: `${baseUrl}/vets/${vet.slug}`,
      lastModified: vet.updatedAt,
      changeFrequency: 'weekly',
      priority: vet.destaqueBusca ? 0.9 : 0.7,
    }));

    return [...prefixRoutes, ...vetRoutes];
  } catch (error) {
    console.error(`Erro ao gerar fatia do sitemap ${sitemapId}:`, error);
    return prefixRoutes;
  }
}
