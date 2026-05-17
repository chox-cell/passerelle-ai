"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  // Sidebar width as a number for the main content margin
  const sidebarWidth = collapsed ? 64 : 256; // px

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      {/* Sidebar — passes collapse state down */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(p => !p)} />

      {/* Main Panel */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Top bar */}
        <header className="h-16 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40 flex items-center px-8 justify-between shrink-0">
          <nav className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-medium">Passerelle</span>
            <span>/</span>
            <span className="font-semibold text-slate-800">Tableau de bord</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Système opérationnel" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Système local actif</span>
          </div>
        </header>

        {/* Demo Mode Banner */}
        <div className="bg-amber-100 border-b border-amber-200 text-amber-800 px-4 py-2 text-center text-[11px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shrink-0">
          <span className="animate-pulse">⚠️</span>
          Mode démonstration local — n'utilisez pas de données réelles sans consentement écrit.
        </div>

        {/* Page */}
        <main className="flex-1 p-4 md:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t bg-white px-8 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Passerelle AI — Infrastructure Locale Sécurisée — Aucune donnée transmise hors de votre réseau
        </footer>
      </div>
    </div>
  );
}
