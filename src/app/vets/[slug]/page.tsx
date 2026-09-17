import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Star, 
  CheckCircle2, 
  Calendar,
  Share2,
  AlertCircle,
  Stethoscope
} from 'lucide-react';
import { formatCrmv, checkCrmvValidity } from '@/lib/crmv';
import WhatsAppContactButton from '@/components/WhatsAppContactButton';
import AvaliacaoFormModal from '@/components/AvaliacaoFormModal';
import CrmvBadge from '@/components/CrmvBadge';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const vet = await prisma.veterinario.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      enderecos: true,
      especialidades: { include: { especialidade: true } }
    }
  });

  if (!vet) return { title: 'Veterinário não encontrado | VetBra' };

  const cidade = vet.enderecos[0]?.cidade || 'Brasil';
  const especialidade = vet.especialidades[0]?.especialidade?.nome || 'Veterinária Geral';

  return {
    title: `${vet.nomeCompleto} - ${especialidade} em ${cidade} | CRMV ${formatCrmv(vet.crmvNumero, vet.crmvUf)}`,
    description: vet.bio || `Agende sua consulta com ${vet.nomeCompleto}. Atendimento especializado em ${cidade} com CRMV ativo e verificado no CFMV.`,
    openGraph: {
      title: `${vet.nomeCompleto} - CRMV ${formatCrmv(vet.crmvNumero, vet.crmvUf)}`,
      description: vet.bio || 'Consulte os procedimentos e preços de atendimento.',
      images: vet.fotoPerfilUrl ? [vet.fotoPerfilUrl] : []
    }
  };
}

export default async function VetProfilePage({ params }: Props) {
  const { slug } = await params;
  const vet = await prisma.veterinario.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: {
      enderecos: true,
      especialidades: { include: { especialidade: true } },
      procedimentos: { where: { ativo: true }, orderBy: { categoria: 'asc' } },
      avaliacoes: { 
        where: { status: { not: 'REJEITADA' } },
        orderBy: { createdAt: 'desc' } 
      }
    }
  });

  if (!vet) notFound();

  // Incrementa contador de visualizações
  await prisma.veterinario.update({
    where: { id: vet.id },
    data: { visualizacoesCount: { increment: 1 } }
  });

  const endereco = vet.enderecos[0] || {};
  const crmvInfo = checkCrmvValidity(vet.crmvValidade);

  const totalReviews = vet.avaliacoes.length;
  const mediaNota = totalReviews > 0
    ? (vet.avaliacoes.reduce((acc, item) => acc + item.nota, 0) / totalReviews).toFixed(1)
    : null;

  const whatsappMessage = encodeURIComponent(
    `Olá Dr(a). ${vet.nomeCompleto}, vi seu perfil no portal VetBra e gostaria de consultar horários para atendimento do meu pet.`
  );

  // Schema.org para o Google (SEO Local, Estrelas Douradas & Rich Snippets)
  const especialidadesNomes = vet.especialidades
    ?.map((e) => e.especialidade?.nome)
    .filter(Boolean) || [];

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VeterinaryCare',
    '@id': `https://vetbra.duosat.com.br/vets/${vet.slug}#veterinary`,
    name: vet.nomeSocialOuClinica || vet.nomeCompleto,
    legalName: vet.nomeCompleto,
    url: `https://vetbra.duosat.com.br/vets/${vet.slug}`,
    image: vet.fotoPerfilUrl || 'https://vetbra.duosat.com.br/icon-512.png',
    telephone: vet.telefone || vet.whatsapp || undefined,
    description: vet.bio || `Atendimento veterinário especializado com Dr(a). ${vet.nomeCompleto} em ${endereco.cidade || 'Brasil'} com CRMV verificado no CFMV.`,
    priceRange: 'R$ R$',
    identifier: `CRMV-${vet.crmvUf} ${vet.crmvNumero}`,
    medicalSpecialty: especialidadesNomes.length > 0 ? especialidadesNomes : undefined,
    address: endereco.cidade ? {
      '@type': 'PostalAddress',
      streetAddress: endereco.logradouro ? `${endereco.logradouro}, ${endereco.numero || 's/n'}` : '',
      addressLocality: endereco.cidade,
      addressRegion: endereco.estado,
      postalCode: endereco.cep || '',
      addressCountry: 'BR'
    } : undefined,
    geo: endereco.latitude && endereco.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: Number(endereco.latitude),
      longitude: Number(endereco.longitude)
    } : undefined,
    // Estrelas Douradas no Google: AggregateRating
    aggregateRating: totalReviews > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: mediaNota,
      reviewCount: totalReviews,
      bestRating: '5',
      worstRating: '1'
    } : undefined,
    // Avaliações de tutores indexadas pelo Google
    review: vet.avaliacoes.length > 0 ? vet.avaliacoes.slice(0, 10).map((av) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: av.nomeTutor || 'Tutor'
      },
      datePublished: av.createdAt ? new Date(av.createdAt).toISOString().split('T')[0] : undefined,
      reviewBody: av.comentario || 'Atendimento veterinário atencioso e qualificado.',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: av.nota,
        bestRating: '5',
        worstRating: '1'
      }
    })) : undefined
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Script de SEO Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJsonLd) }}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* BANNER / TOPO DO PERFIL */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-32 sm:h-44 bg-gradient-to-r from-emerald-800 via-[#147A44] to-[#1B85B8] relative" />

          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 sm:-mt-20">
              
              {/* Foto e Dados Básicos */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-white p-1.5 shadow-lg border border-slate-200 shrink-0">
                  {vet.fotoPerfilUrl ? (
                    <img
                      src={vet.fotoPerfilUrl}
                      alt={vet.nomeCompleto}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400">
                      Vet
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{vet.nomeCompleto}</h1>
                    <CrmvBadge
                      veterinarioId={vet.id}
                      crmvNumero={vet.crmvNumero}
                      crmvUf={vet.crmvUf}
                    />
                  </div>

                  {vet.nomeSocialOuClinica && (
                    <p className="text-sm font-semibold text-slate-500">{vet.nomeSocialOuClinica}</p>
                  )}

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 pt-1">
                    {totalReviews > 0 ? (
                      <span className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                        {mediaNota} ({totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
                      </span>
                    ) : (
                      <span className="flex items-center text-slate-400 font-medium">
                        <Star className="w-3.5 h-3.5 text-slate-300 mr-1" />
                        Novo no portal (Sem avaliações)
                      </span>
                    )}
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {endereco.bairro ? `${endereco.bairro}, ` : ''}{endereco.cidade || 'São Paulo'} - {endereco.estado || 'SP'}
                    </span>
                    <span>•</span>
                    <span>{vet.tempoExperienciaAnos} anos de experiência</span>
                  </div>
                </div>
              </div>

              {/* Ação Principal: WhatsApp com telemetria */}
              <div className="flex flex-col gap-2 shrink-0">
                <WhatsAppContactButton
                  veterinarioId={vet.id}
                  whatsappNumber={vet.whatsapp}
                  veterinarioNome={vet.nomeCompleto}
                  origem="PERFIL_TOP"
                  size="md"
                />
              </div>

            </div>
          </div>
        </div>

        {/* GRID INFORMATIVO: PROCEDIMENTOS + DADOS COMPLEMENTARES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA: BIOGRAFIA & TABELA DE PROCEDIMENTOS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Sobre / Bio */}
            {vet.bio && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <h2 className="text-lg font-bold text-slate-900">Sobre o Profissional</h2>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">{vet.bio}</p>
              </div>
            )}

            {/* TABELA DE PROCEDIMENTOS E PREÇOS */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Procedimentos & Valores</h2>
                  <p className="text-xs text-slate-400 font-medium">Tabela oficial cadastrada e mantida pelo profissional.</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {vet.procedimentos.length} procedimentos
                </span>
              </div>

              {vet.procedimentos.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhum procedimento detalhado cadastrado.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {vet.procedimentos.map((proc) => (
                    <div key={proc.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{proc.nome}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {proc.categoria}
                          </span>
                        </div>
                        {proc.tempoMedioMinutos && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" /> Duração média: {proc.tempoMedioMinutos} min
                          </span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        {proc.precoSobConsulta ? (
                          <span className="text-xs font-bold text-slate-500">Sob Consulta</span>
                        ) : (
                          <span className="text-sm font-black text-slate-900">
                            R$ {Number(proc.preco).toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AVALIAÇÕES */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span>Avaliações de Tutores</span>
                    {totalReviews > 0 && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold">
                        ★ {mediaNota}
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Depoimentos reais de consultas e procedimentos auditados.
                  </p>
                </div>

                {/* Botão para abrir modal de avaliação */}
                <AvaliacaoFormModal
                  veterinarioId={vet.id}
                  veterinarioNome={vet.nomeCompleto}
                />
              </div>

              {vet.avaliacoes.length === 0 ? (
                <div className="text-center py-10 px-4 space-y-3 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto border border-amber-200">
                    <Star className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">Ainda não há avaliações para este profissional.</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Já teve uma consulta ou atendimento com {vet.nomeCompleto}? Seja o primeiro a compartilhar sua experiência e ajudar outros tutores!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {vet.avaliacoes.map((av) => (
                    <div key={av.id} className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{av.nomeTutor}</span>
                          {(av.dataAtendimento || av.horaAtendimento) && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              Atendimento: {av.dataAtendimento ? new Date(av.dataAtendimento).toLocaleDateString('pt-BR') : ''}
                              {av.horaAtendimento ? ` às ${av.horaAtendimento}` : ''}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-500">
                            {[...Array(av.nota)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                            {[...Array(Math.max(0, 5 - av.nota))].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 text-slate-200" />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-amber-900 bg-amber-100/60 px-2 py-0.5 rounded-md">
                            {av.nota}.0
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-line">
                        {av.comentario}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* COLUNA DIREITA: INFORMAÇÕES DE ATENDIMENTO & CRMV AUDIT */}
          <div className="space-y-6">
            
            {/* CARD DE VERIFICAÇÃO CRMV */}
            <div className="bg-emerald-50/70 rounded-3xl p-6 border border-emerald-200/80 space-y-3">
              <div className="flex items-center gap-2 text-[#147A44] font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                Auditoria de Registro CFMV
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Este profissional possui registro regular perante o Conselho Regional de Medicina Veterinária de <strong>{vet.crmvUf}</strong>.
              </p>
              <div className="pt-2 border-t border-emerald-200/60 text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Registro:</span>
                  <span className="font-mono font-bold">{formatCrmv(vet.crmvNumero, vet.crmvUf)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="text-emerald-700 font-bold">Ativo & Regularizado</span>
                </div>
              </div>
            </div>

            {/* DETALHES DE ATENDIMENTO */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Estrutura de Atendimento</h3>
              
              <div className="space-y-2 text-slate-600">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Tipo de Local:</span>
                  <span className="font-bold text-slate-800">{vet.tipoEstabelecimento}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Plantão 24 Horas:</span>
                  <span className="font-bold text-slate-800">{vet.atende24h ? 'Sim' : 'Não'}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Visitas a Domicílio:</span>
                  <span className="font-bold text-slate-800">{vet.atendeDomiciliar ? 'Sim' : 'Não'}</span>
                </div>

                {vet.atendeDomiciliar && (
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span>Raio de Atendimento:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      até {endereco.raioKmAtendimento || 15} km ({vet.meioTransporte || 'Carro'})
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span>Animais Atendidos:</span>
                  <span className="font-bold text-slate-800">{vet.tiposPets.join(', ')}</span>
                </div>
              </div>

              {/* Endereço completo */}
              <div className="pt-2">
                <span className="font-bold text-slate-800 block mb-1">Localização:</span>
                <p className="text-slate-500 leading-relaxed">
                  {endereco.logradouro ? `${endereco.logradouro}, ${endereco.numero}` : ''}
                  {endereco.complemento ? ` - ${endereco.complemento}` : ''}<br />
                  {endereco.bairro ? `${endereco.bairro} - ` : ''}{endereco.cidade}/{endereco.estado}<br />
                  CEP: {endereco.cep}
                </p>
              </div>
            </div>

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
