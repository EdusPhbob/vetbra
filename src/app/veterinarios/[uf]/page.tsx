import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ESTADOS_BRASIL, getCidadesDoEstado } from '@/lib/seo-locations';
import { MapPin, ShieldCheck, ChevronRight, Users, Home } from 'lucide-react';

interface Props {
  params: Promise<{ uf: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uf } = await params;
  const ufUpper = uf.toUpperCase();
  const estado = ESTADOS_BRASIL[ufUpper];

  if (!estado) {
    return { title: 'Estado não encontrado | VetBra', robots: { index: false, follow: false } };
  }

  const cidades = await getCidadesDoEstado(ufUpper);

  if (cidades.length === 0) {
    return { title: `Veterinários em ${estado.nome} | VetBra`, robots: { index: false, follow: false } };
  }

  const cidadesTexto = cidades.slice(0, 4).map((c) => c.cidade).join(', ');
  const canonicalUrl = `https://vetbra.com.br/veterinarios/${uf.toLowerCase()}`;
  const title = `Veterinários em ${estado.nome} (${estado.uf}) | Clínicas e Médicos Verificados | VetBra`;
  const description = `Encontre médicos veterinários e clínicas em ${estado.nome} (${estado.uf}) com CRMV verificado no CFMV. Atendimento em ${cidadesTexto} e região. Agende consulta no VetBra.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'VetBra',
      locale: 'pt_BR',
      type: 'website',
      images: ['https://vetbra.com.br/og-image.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://vetbra.com.br/og-image.jpg'],
    },
  };
}

export default async function EstadoVeterinariosPage({ params }: Props) {
  const { uf } = await params;
  const ufUpper = uf.toUpperCase();
  const estado = ESTADOS_BRASIL[ufUpper];

  if (!estado) notFound();

  const cidades = await getCidadesDoEstado(ufUpper);

  // Regra Anti-Spam: Se não há veterinários credenciados no estado, 404
  if (cidades.length === 0) {
    notFound();
  }

  const totalVetsEstado = cidades.reduce((acc, c) => acc + c.totalVets, 0);

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `https://vetbra.com.br/veterinarios/${uf.toLowerCase()}#webpage`,
        url: `https://vetbra.com.br/veterinarios/${uf.toLowerCase()}`,
        name: `Veterinários em ${estado.nome} (${estado.uf}) | VetBra`,
        description: `Diretório de veterinários credenciados com CRMV verificado no estado de ${estado.nome}.`,
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://vetbra.com.br/#website',
          name: 'VetBra',
          url: 'https://vetbra.com.br',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Início',
            item: 'https://vetbra.com.br',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Veterinários',
            item: 'https://vetbra.com.br/veterinarios',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: estado.nome,
            item: `https://vetbra.com.br/veterinarios/${uf.toLowerCase()}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Breadcrumb navegável */}
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <Link href="/veterinarios" className="hover:text-emerald-700 transition-colors">
            Veterinários
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-semibold">{estado.nome} ({estado.uf})</span>
        </nav>

        {/* Topo do Estado */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#147A44] border border-emerald-200">
              Região {estado.regiao}
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              CRMV Auditado no CFMV
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Veterinários e Clínicas em {estado.nome} ({estado.uf})
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Consulte a lista de médicos veterinários e clínicas com atendimento verificado no estado de {estado.nome}. Selecione uma das cidades abaixo para conferir avaliações de tutores, especialidades e formas de agendamento.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              {totalVetsEstado} profissional(is) cadastrado(s)
            </span>
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" />
              {cidades.length} município(s) com cobertura
            </span>
          </div>
        </div>

        {/* Municípios do Estado */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#147A44]" />
            Cidades com Veterinários Disponíveis
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cidades.map((cid) => (
              <Link
                key={cid.slug}
                href={`/veterinarios/${uf.toLowerCase()}/${cid.slug}`}
                className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#147A44] transition-colors">
                    {cid.cidade}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Estado de {estado.nome}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-medium text-emerald-700">{cid.totalVets} profissional(is)</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#147A44] group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
