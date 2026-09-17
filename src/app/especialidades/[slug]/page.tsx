import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getVeterinariosPorEspecialidade } from '@/lib/seo-locations';
import { formatCrmv } from '@/lib/crmv';
import { 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  Home, 
  Star, 
  Stethoscope, 
  Clock, 
  Car 
} from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dados = await getVeterinariosPorEspecialidade(slug);

  if (!dados || dados.vets.length === 0) {
    return {
      title: 'Especialidade não encontrada | VetBra',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://vetbra.com.br/especialidades/${dados.especialidade.slug}`;
  const title = `Veterinários Especialistas em ${dados.especialidade.nome} | VetBra`;
  const description = `Encontre ${dados.vets.length} médico(s) veterinário(s) especialistas em ${dados.especialidade.nome} com CRMV ativo e verificado no CFMV. Agendamento rápido e seguro no VetBra.`;

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

export default async function EspecialidadeVeterinariosPage({ params }: Props) {
  const { slug } = await params;
  const dados = await getVeterinariosPorEspecialidade(slug);

  // Regra Anti-Spam: especialidade sem veterinários ativos -> 404
  if (!dados || dados.vets.length === 0) {
    notFound();
  }

  const { especialidade, vets } = dados;

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        '@id': `https://vetbra.com.br/especialidades/${especialidade.slug}#itemlist`,
        name: `Veterinários Especialistas em ${especialidade.nome}`,
        description: `Lista de médicos veterinários credenciados na especialidade de ${especialidade.nome}.`,
        numberOfItems: vets.length,
        itemListElement: vets.map((vet, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: vet.nomeCompleto,
          url: `https://vetbra.com.br/vets/${vet.slug}`,
        })),
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
            name: especialidade.nome,
            item: `https://vetbra.com.br/especialidades/${especialidade.slug}`,
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
        
        {/* Breadcrumb rastreável */}
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
          <span className="text-slate-800 font-semibold">{especialidade.nome}</span>
        </nav>

        {/* Topo da Especialidade */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#147A44] border border-emerald-200">
              Especialidade Médica Veterinária
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              CRMV Auditado
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Especialistas em {especialidade.nome}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            {especialidade.descricao ||
              `Encontre profissionais dedicados ao diagnóstico, tratamento e cuidados especializados na área de ${especialidade.nome}. Todos os profissionais possuem CRMV ativo e verificado.`}
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              {vets.length} especialista(s) credenciado(s)
            </span>
          </div>
        </div>

        {/* Lista de Especialistas */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#147A44]" />
            Profissionais Credenciados
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map((vet) => {
              const totalReviews = vet.avaliacoes.length;
              const mediaNota = totalReviews > 0
                ? (vet.avaliacoes.reduce((acc, it) => acc + it.nota, 0) / totalReviews).toFixed(1)
                : null;

              const endereco = vet.enderecos[0];
              const localTexto = endereco
                ? `${endereco.cidade} - ${endereco.estado}`
                : `${vet.cidadeBase} - ${vet.estadoBase}`;

              return (
                <article
                  key={vet.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        {vet.fotoPerfilUrl ? (
                          <img
                            src={vet.fotoPerfilUrl}
                            alt={vet.nomeCompleto}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                            Vet
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-900 truncate">
                          {vet.nomeCompleto}
                        </h3>
                        {vet.nomeSocialOuClinica && (
                          <p className="text-xs text-slate-500 font-medium truncate">
                            {vet.nomeSocialOuClinica}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>CRMV-{vet.crmvUf} {formatCrmv(vet.crmvNumero, vet.crmvUf)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{localTexto}</span>
                    </div>

                    {mediaNota && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-900">{mediaNota}</span>
                        <span className="text-slate-400">({totalReviews} avaliações)</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href={`/vets/${vet.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#147A44] hover:bg-[#106236] text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <span>Ver Perfil Completo</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
