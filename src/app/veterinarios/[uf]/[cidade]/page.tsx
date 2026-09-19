import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getVeterinariosDaCidade, ESTADOS_BRASIL } from '@/lib/seo-locations';
import { formatCrmv, getCfmvConsultaUrl } from '@/lib/crmv';
import { 
  MapPin, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  Home, 
  ExternalLink, 
  Star, 
  Stethoscope, 
  Clock, 
  Car, 
  Calendar 
} from 'lucide-react';

interface Props {
  params: Promise<{ uf: string; cidade: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uf, cidade } = await params;
  const dados = await getVeterinariosDaCidade(uf, cidade);

  if (!dados || dados.vets.length === 0) {
    return {
      title: 'Município não encontrado | VetBra',
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `https://vetbra.com.br/veterinarios/${uf.toLowerCase()}/${cidade.toLowerCase()}`;
  const title = `Veterinários em ${dados.cidade} - ${dados.estado.uf} | Clínicas e Médicos com CRMV | VetBra`;
  const description = `Encontre ${dados.vets.length} médico(s) veterinário(s) e clínicas com atendimento em ${dados.cidade} - ${dados.estado.uf}. CRMV verificado no CFMV, agendamento de consultas e atendimento domiciliar.`;

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

export default async function CidadeVeterinariosPage({ params }: Props) {
  const { uf, cidade } = await params;
  const dados = await getVeterinariosDaCidade(uf, cidade);

  // Regra Anti-Spam: se não existem veterinários ativos na cidade, 404
  if (!dados || dados.vets.length === 0) {
    notFound();
  }

  const { estado, cidade: nomeCidade, vets } = dados;

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        '@id': `https://vetbra.com.br/veterinarios/${uf.toLowerCase()}/${cidade.toLowerCase()}#itemlist`,
        name: `Veterinários em ${nomeCidade} - ${estado.uf}`,
        description: `Lista de médicos veterinários credenciados com atendimento em ${nomeCidade} - ${estado.uf}.`,
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
            name: estado.nome,
            item: `https://vetbra.com.br/veterinarios/${uf.toLowerCase()}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: nomeCidade,
            item: `https://vetbra.com.br/veterinarios/${uf.toLowerCase()}/${cidade.toLowerCase()}`,
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
          <Link href={`/veterinarios/${uf.toLowerCase()}`} className="hover:text-emerald-700 transition-colors">
            {estado.nome}
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="text-slate-800 font-semibold">{nomeCidade}</span>
        </nav>

        {/* Topo da Cidade */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-[#147A44] border border-emerald-200">
              {estado.uf} — Região {estado.regiao}
            </span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Profissionais Auditados
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Veterinários em {nomeCidade} - {estado.uf}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
            Encontre profissionais com registro CRMV ativo e verificado para consultas, exames, vacinação e cirurgias em {nomeCidade}. Clique no perfil para ver detalhes de atendimento e contato.
          </p>

          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="bg-slate-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              {vets.length} médico(s) veterinário(s) disponível(is)
            </span>
          </div>
        </div>

        {/* Lista de Veterinários em Cards HTML com Links Rastreáveis */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-[#147A44]" />
            Profissionais Disponíveis em {nomeCidade}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vets.map((vet) => {
              const totalReviews = vet.avaliacoes.length;
              const mediaNota = totalReviews > 0
                ? (vet.avaliacoes.reduce((acc, it) => acc + it.nota, 0) / totalReviews).toFixed(1)
                : null;

              const espNomes = vet.especialidades.map((e) => e.especialidade?.nome).filter(Boolean);

              return (
                <article
                  key={vet.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header do Card */}
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
                        {vet.crmvStatus === 'VERIFICADO' ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>CRMV-{vet.crmvUf} {formatCrmv(vet.crmvNumero, vet.crmvUf)}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-800 font-bold">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>CRMV-{vet.crmvUf} {formatCrmv(vet.crmvNumero, vet.crmvUf)} • Pendente</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nota / Avaliações */}
                    {mediaNota && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-900">{mediaNota}</span>
                        <span className="text-slate-400">({totalReviews} avaliações)</span>
                      </div>
                    )}

                    {/* Especialidades */}
                    {espNomes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {espNomes.slice(0, 3).map((esp, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-[#147A44] border border-emerald-200 font-medium"
                          >
                            {esp}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Características */}
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500 pt-1">
                      {vet.atendeDomiciliar && (
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Car className="w-3 h-3 text-emerald-600" />
                          Atende a domicílio
                        </span>
                      )}
                      {vet.atende24h && (
                        <span className="flex items-center gap-1 bg-rose-50 text-rose-700 px-2 py-0.5 rounded-md font-medium">
                          <Clock className="w-3 h-3" />
                          24h
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Link Direto HTML para o Perfil (Rastreável pelo Googlebot) */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href={`/vets/${vet.slug}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#147A44] hover:bg-[#106236] text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <span>Ver Perfil Completo e Agendar</span>
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
