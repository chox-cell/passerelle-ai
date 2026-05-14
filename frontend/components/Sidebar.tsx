"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, Users, FileText, Settings, Shield, 
  HelpCircle, LogOut, LayoutDashboard, Database,
  Activity, Bell
} from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() })
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(() => {});
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: "Tableau de bord", href: "/" },
    { icon: Users, label: "Dossiers actifs", href: "/cases" },
    { icon: Activity, label: "File de revue", href: "/review" },
    { icon: Database, label: "Base de connaissances", href: "/knowledge" },
  ];

  return (
    <aside className="w-64 border-r bg-white h-screen fixed left-0 top-0 flex flex-col z-50">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          P
        </div>
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight">Passerelle OS</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pilot v1.4</p>
        </div>
      </div>

      {/* Workspace */}
      <div className="px-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Espace de travail</p>
          <p className="text-xs font-semibold text-slate-700 truncate">
            {profile?.workspace_id ? "ONG France Solidarité" : "Chargement..."}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive 
                  ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-blue-600" : "text-slate-400"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-4">
        {profile && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
              {profile.full_name?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-slate-900 truncate">{profile.full_name}</p>
              <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                {profile.role}
              </span>
            </div>
          </div>
        )}
        <div className="space-y-1">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:bg-slate-50 transition-all">
            <Settings size={18} />
            Paramètres
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-all">
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
}
