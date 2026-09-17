import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DevRouteNavigator from "@/components/DevRouteNavigator";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VetBra - Veterinária Mais Perto De Você",
  description: "Encontre o melhor veterinário para o seu pet com CRMV verificado no CFMV.",
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://vetbra.duosat.com.br/#organization',
      name: 'VetBra',
      url: 'https://vetbra.duosat.com.br',
      logo: 'https://vetbra.duosat.com.br/logo.png',
      description: 'Rede credenciada de clínicas e médicos veterinários com CRMV auditado e verificado no CFMV.',
      sameAs: [
        'https://instagram.com/vetbrabr'
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://vetbra.duosat.com.br/#website',
      url: 'https://vetbra.duosat.com.br',
      name: 'VetBra',
      publisher: {
        '@id': 'https://vetbra.duosat.com.br/#organization'
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://vetbra.duosat.com.br/buscar?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    }
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        {children}
        <DevRouteNavigator />
      </body>
    </html>
  );
}
