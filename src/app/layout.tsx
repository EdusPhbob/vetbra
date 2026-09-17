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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        {children}
        <DevRouteNavigator />
      </body>
    </html>
  );
}
