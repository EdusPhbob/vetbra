import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://vetbra.com.br';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/buscar',
          '/planos',
          '/veterinarios',
          '/veterinarios/',
          '/vets/',
          '/especialidades/',
        ],
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/login',
          '/cadastro',
          '/_next/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
