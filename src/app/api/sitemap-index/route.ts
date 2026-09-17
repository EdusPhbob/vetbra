import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { VET_PUBLIC_FILTER } from '@/lib/seo-locations';

export const revalidate = 3600; // Revalida o índice a cada 1 hora

const CHUNK_SIZE = 40000;

export async function GET() {
  const baseUrl = 'https://vetbra.com.br';
  const now = new Date().toISOString();

  try {
    const totalVets = await prisma.veterinario.count({
      where: VET_PUBLIC_FILTER,
    });

    const numSitemaps = Math.max(1, Math.ceil(totalVets / CHUNK_SIZE));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (let i = 0; i < numSitemaps; i++) {
      xml += `  <sitemap>\n`;
      xml += `    <loc>${baseUrl}/sitemap/${i}.xml</loc>\n`;
      xml += `    <lastmod>${now}</lastmod>\n`;
      xml += `  </sitemap>\n`;
    }

    xml += `</sitemapindex>\n`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Erro ao gerar índice sitemap.xml:', error);
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap>\n    <loc>${baseUrl}/sitemap/0.xml</loc>\n  </sitemap>\n</sitemapindex>\n`;
    return new NextResponse(fallbackXml, {
      status: 200,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }
}
