import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getEstadosComVeterinarios, getEspecialidadesComVeterinarios } from '@/lib/seo-locations';
import { MapPin, ShieldCheck, ChevronRight, Stethoscope, Users, Home } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Veterinários por Estado e Região no Brasil | VetBra',
  description:
    'Encontre médicos veterinários e clínicas credenciadas com CRMV verificado no CFMV em todos os estados do Brasil. Escolha sua região e agende atendimento para o seu pet.',
  alternates: {
    canonical: 'https://vetbra.com.br/veterinarios',
  },
  openGraph: {
    title: 'Veterinários por Estado e Região no Brasil | VetBra',
    description:
      'Encontre médicos veterinários com CRMV verificado no CFMV em todos os estados do Brasil. Atendimento clínico, cirúrgico e domiciliar.',
    url: 'https://vetbra.com.br/veterinarios',
    siteName: 'VetBra',
    locale: 'pt_BR',
    type: 'website',
    images: ['https://vetbra.com.br/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Veterinários por Estado e Região no Brasil | VetBra',
    description:
      'Encontre médicos veterinários com CRMV verificado no CFMV em todos os estados do Brasil.',
    images: ['https://vetbra.com.br/og-image.jpg'],
  },
};

export default async function VeterinariosNacionalPage() {
  const estados = await getEstadosComVeterinarios();
  const especialidades = await getEspecialidadesComVeterinarios();

  const totalGeralVets = estados.reduce((acc, est) => acc + est.totalVets, 0);

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://vetbra.com.br/veterinarios#webpage',
        url: 'https://vetbra.com.br/veterinarios',
        name: 'Veterinários por Estado no Brasil | VetBra',
        description:
          'Diretório nacional de médicos veterinários com CRMV auditado e verificado no CFMV.',
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
        <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          <Link href="/" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            Início
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-slate-800 font-semibold">Veterinários</span>
        </nav>

        {/* Hero do Diretório */}
        <div className="bg-gradient-to-br from-[#147A44] to-[#0D522C] rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden">
          <div className="max-w-2xl space-y-3 relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white backdrop-blur-xs border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Diretório Nacional VetBra
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Veterinários Verificados em Todo o Brasil
            </h1>
            <p className="text-sm sm:text-base text-emerald-100 font-normal leading-relaxed">
              Encontre profissionais com CRMV ativo e consultórios auditados pelo CFMV. Selecione o seu estado abaixo para encontrar atendimento na sua cidade.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-100">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <Users className="w-4 h-4 text-emerald-300" />
              {totalGeralVets} profissional(is) cadastrado(s)
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-xl">
              <MapPin className="w-4 h-4 text-emerald-300" />
              {estados.length} estado(s) com cobertura ativa
            </span>
          </div>
        </div>

        {/* Estados Disponíveis */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#147A44]" />
              Estados com Atendimento Ativo
            </h2>
          </div>

          {estados.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">
                Novos veterinários estão em processo de auditoria e credenciamento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {estados.map((est) => (
                <Link
                  key={est.uf}
                  href={`/veterinarios/${est.uf.toLowerCase()}`}
                  className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-500 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#147A44] border border-emerald-200">
                        {est.uf}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Região {est.regiao}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#147A44] transition-colors pt-2">
                      {est.nome}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{est.totalVets} profissional(is)</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#147A44] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Especialidades com Atendimento Ativo */}
        {especialidades.length > 0 && (
          <section className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#147A44]" />
              Especialidades com Profissionais Credenciados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {especialidades.map((esp) => (
                <Link
                  key={esp.id}
                  href={`/especialidades/${esp.slug}`}
                  className="bg-white rounded-xl p-4 border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all flex items-center justify-between group"
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 group-hover:text-[#147A44] transition-colors">
                      {esp.nome}
                    </h3>
                    <p className="text-xs text-slate-400">{esp.totalVets} especialista(s)</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#147A44] group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
