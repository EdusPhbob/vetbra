import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://vetbra.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "VetBra – Veterinária Mais Perto De Você | CRMV Verificado",
    template: "%s | VetBra"
  },

  description:
    "Encontre o veterinário ideal para o seu pet com CRMV auditado e verificado no CFMV. Consultas, cirurgias, vacinas e atendimento domiciliar em todo o Brasil.",

  keywords: [
    "veterinário", "veterinária", "CRMV", "CFMV", "médico veterinário",
    "clínica veterinária", "atendimento domiciliar", "pet", "animal",
    "cachorro", "gato", "cavalo", "vacina animal", "VetBra"
  ],

  authors: [{ name: "VetBra", url: BASE_URL }],

  creator: "VetBra",
  publisher: "VetBra Tecnologia Animal Ltda",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ===========================
  // OPEN GRAPH (Facebook, WhatsApp, LinkedIn, Google)
  // ===========================
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: BASE_URL,
    siteName: "VetBra",
    title: "VetBra – Veterinária Mais Perto De Você",
    description:
      "Encontre o veterinário ideal para o seu pet com CRMV auditado e verificado no CFMV. Atendimento em todo o Brasil.",
    images: [
      {
        url: `${BASE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "VetBra – Veterinária Mais Perto De Você",
        type: "image/jpeg",
      },
    ],
  },

  // ===========================
  // TWITTER / X CARD
  // ===========================
  twitter: {
    card: "summary_large_image",
    title: "VetBra – Veterinária Mais Perto De Você",
    description:
      "Encontre veterinários com CRMV verificado no CFMV. Consultas, vacinas e atendimento domiciliar em todo o Brasil.",
    images: [`${BASE_URL}/og-image.jpg`],
    creator: "@vetbrabr",
    site: "@vetbrabr",
  },

  // ===========================
  // ÍCONE / FAVICON
  // ===========================
  icons: {
    icon: [
      { url: "/icon.jpg", type: "image/jpeg", sizes: "512x512" },
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
    ],
    apple: [
      { url: "/icon.jpg", sizes: "180x180", type: "image/jpeg" },
    ],
    shortcut: "/favicon.ico",
  },

  // ===========================
  // VERIFICAÇÃO DO GOOGLE SEARCH CONSOLE
  // (adicione aqui quando tiver o código)
  // ===========================
  // verification: {
  //   google: "SEU_CÓDIGO_AQUI",
  // },

  // ===========================
  // CANONICAL
  // ===========================
  alternates: {
    canonical: BASE_URL,
    languages: {
      "pt-BR": BASE_URL,
    },
  },

  // ===========================
  // MANIFEST PWA
  // ===========================
  manifest: "/manifest.json",

  category: "veterinary",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "VetBra",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.jpg`,
        width: 512,
        height: 512,
      },
      description:
        "Rede credenciada de clínicas e médicos veterinários com CRMV auditado e verificado no CFMV. Atendimento em todo o Brasil.",
      sameAs: [
        "https://instagram.com/vetbrabr",
        "https://vetbra.com.br",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: "Portuguese",
        areaServed: "BR",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}/#website`,
      url: BASE_URL,
      name: "VetBra",
      description:
        "Encontre o veterinário mais perto de você com CRMV auditado no CFMV.",
      publisher: {
        "@id": `${BASE_URL}/#organization`,
      },
      inLanguage: "pt-BR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${BASE_URL}/buscar?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "MedicalBusiness",
      "@id": `${BASE_URL}/#medicalbusiness`,
      name: "VetBra – Rede Veterinária",
      url: BASE_URL,
      image: `${BASE_URL}/og-image.jpg`,
      description:
        "Plataforma que conecta tutores de pets a veterinários verificados com CRMV auditado no CFMV em todo o Brasil.",
      medicalSpecialty: "Veterinary",
      areaServed: {
        "@type": "Country",
        name: "Brazil",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Charset & Viewport já injetados pelo Next.js */}
        {/* Cor da barra do navegador (mobile) */}
        <meta name="theme-color" content="#147A44" />
        <meta name="msapplication-TileColor" content="#147A44" />
        <meta name="msapplication-TileImage" content="/icon.jpg" />

        {/* Geo SEO Brasil */}
        <meta name="geo.region" content="BR" />
        <meta name="geo.placename" content="Brasil" />
        <meta name="language" content="Portuguese" />
        <meta name="content-language" content="pt-BR" />

        {/* Schema.org JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col relative">
        {children}
      </body>
    </html>
  );
}
