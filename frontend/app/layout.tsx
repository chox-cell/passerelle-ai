import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Passerelle AI — Pilot v1.4",
  description: "Infrastructure opérationnelle locale pour l'aide aux migrants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-[#F8FAFC]">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen relative">
            {/* App Header */}
            <header className="h-16 border-b bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                  <span>Passerelle</span>
                  <span>/</span>
                  <span className="text-slate-900">Tableau de bord</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <span className="sr-only">Notifications</span>
                  <div className="w-2 h-2 bg-blue-600 rounded-full absolute translate-x-3 -translate-y-1" />
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </button>
              </div>
            </header>

            {/* Main Content Area */}
            <div className="p-8">
              {children}
            </div>

            {/* Global Legal Footer */}
            <footer className="p-8 text-center text-[10px] text-slate-400 font-medium uppercase tracking-widest border-t bg-slate-50">
              Passerelle AI — Système Local Sécurisé — Aucune donnée n'est transmise hors de votre infrastructure.
            </footer>
          </main>
        </div>
      </body>
    </html>
  );
}
