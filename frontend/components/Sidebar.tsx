"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Activity, Database, Settings, 
  LogOut, ChevronLeft, ChevronRight, Shield, Lock
} from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL, getAuthHeaders } from "@/lib/api";

const NAV = [
  { icon: LayoutDashboard, label: "Tableau de bord", href: "/" },
  { icon: Users,           label: "Dossiers actifs", href: "/cases" },
  { icon: Activity,        label: "File de revue",   href: "/review" },
  { icon: Database,        label: "Connaissances",    href: "/knowledge" },
];

const ROLE_COLORS: Record<string, string> = {
  admin:     "bg-purple-100 text-purple-700",
  volunteer: "bg-blue-100 text-blue-700",
  reviewer:  "bg-amber-100 text-amber-700",
  observer:  "bg-slate-100 text-slate-500",
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setProfile(d))
      .catch(() => {});

    fetch(`${API_BASE_URL}/workspace/me`, { headers: getAuthHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setWorkspace(d))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const role = profile?.role || "";

  const filteredNav = NAV.filter((item) => {
    if (item.href === "/") return true;
    if (item.href === "/knowledge") return true;
    if (item.href === "/cases") {
      return role === "admin" || role === "volunteer";
    }
    if (item.href === "/review") {
      return role === "admin" || role === "reviewer";
    }
    return false;
  });

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col bg-white border-r border-slate-100 shadow-sm z-50 transition-all duration-300"
      style={{ width: collapsed ? 64 : 256 }}
    >
      {/* Brand */}
      <div className="h-16 flex items-center border-b border-slate-100 px-4 flex-shrink-0 overflow-hidden">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-sm flex-shrink-0">
          P
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden">
            <p className="font-black text-slate-900 text-sm tracking-tight leading-none whitespace-nowrap">Passerelle</p>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 whitespace-nowrap">Pilot v1.4</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all flex-shrink-0"
          title={collapsed ? "Développer la barre" : "Réduire la barre"}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Workspace */}
      {!collapsed && profile && (
        <div className="mx-3 mt-4 mb-2 p-3 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Espace de travail</p>
          <p className="text-xs font-semibold text-slate-800 truncate">{workspace?.name || "Espace local"}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {filteredNav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl transition-all duration-150 overflow-hidden
                ${collapsed ? "w-10 h-10 justify-center mx-auto" : "px-3 py-2.5"}
                ${active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-semibold truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 py-3 px-2 flex-shrink-0 space-y-1">
        {/* User row */}
        {profile && !collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all mb-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {profile.full_name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-none">{profile.full_name}</p>
              <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded mt-1 inline-block ${ROLE_COLORS[profile.role] ?? ROLE_COLORS.observer}`}>
                {profile.role}
              </span>
            </div>
          </div>
        )}
        {profile && collapsed && (
          <div className="flex justify-center mb-1">
            <div
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs"
              title={`${profile.full_name} (${profile.role})`}
            >
              {profile.full_name?.charAt(0) ?? "?"}
            </div>
          </div>
        )}

        <Link
          href="/settings"
          title={collapsed ? "Paramètres" : undefined}
          className={`flex items-center gap-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all
            ${collapsed ? "w-10 h-10 justify-center mx-auto" : "px-3 py-2"}`}
        >
          <Settings size={17} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Paramètres</span>}
        </Link>

        <button
          onClick={handleLogout}
          title={collapsed ? "Déconnexion" : undefined}
          className={`flex items-center gap-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all w-full
            ${collapsed ? "w-10 h-10 justify-center mx-auto" : "px-3 py-2"}`}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Déconnexion</span>}
        </button>

        {/* Local-first badge */}
        {!collapsed && (
          <div className="flex items-center gap-2 px-3 py-2 mt-1 bg-slate-50 rounded-xl border border-slate-100">
            <Lock size={11} className="text-slate-400 flex-shrink-0" />
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">100% local · zéro cloud</p>
          </div>
        )}
      </div>
    </aside>
  );
}
