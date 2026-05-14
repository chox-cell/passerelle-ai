import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Passerelle AI | Assistant Opérationnel pour les ONG",
  description: "Simplifier l'accompagnement des migrants par l'intelligence artificielle respectueuse et sécurisée.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full bg-slate-50/50`}>
        {children}
      </body>
    </html>
  );
}
