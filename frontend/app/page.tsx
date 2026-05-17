"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, FolderOpen, CheckCircle2, 
  Search, Plus, Filter, 
  ChevronRight, ScanText, FileJson, Activity,
  Shield, AlertTriangle, RefreshCw, Clock, Wifi, WifiOff
} from "lucide-react";
import { API_BASE_URL, Case, getAuthHeaders, handleApiResponse } from "@/lib/api";

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Health check
      const health = await fetch(`${API_BASE_URL}/system/health`).catch(() => null);
      setBackendOnline(health?.ok ?? false);

      const profileRes = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
      const profile = await handleApiResponse(profileRes);
      setUserProfile(profile);

      const res = await fetch(`${API_BASE_URL}/cases/`, { headers: getAuthHeaders() });
      const data = await handleApiResponse(res);
      setCases(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = cases.filter(c =>
    c.migrant_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.case_number?.toLowerCase().includes(search.toLowerCase())
  );

  const role = userProfile?.role || "";
  const canCreate = role === "admin" || role === "volunteer";
  const pendingReview = cases.filter(c => c.status === "human_review_required").length;

  return (
    <div className="space-y-10">
      {/* Backend Status Banner */}
      {backendOnline === false && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 px-5 py-4 rounded-2xl">
          <WifiOff size={18} />
          <span className="text-sm font-medium">
            Impossible de se connecter au backend. Vérifiez que l'API FastAPI tourne sur le port 8000.
          </span>
          <button onClick={fetchData} className="ml-auto flex items-center gap-2 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-all">
            <RefreshCw size={12} /> Réessayer
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tableau de bord</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Bonjour, {userProfile?.full_name?.split(" ")[0] || "—"} 👋
          </h2>
          <p className="text-slate-500 mt-1 text-sm">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        {canCreate && (
          <Link
            href="/cases/new"
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Nouveau Dossier
          </Link>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5">
        <StatCard icon={FolderOpen}   label="Dossiers Actifs"    value={cases.length} color="blue"    />
        <StatCard icon={ScanText}     label="OCR en cours"       value={0}            color="amber"   />
        <StatCard icon={FileJson}     label="Attente de revue"   value={pendingReview} color="indigo" />
        <StatCard icon={CheckCircle2} label="Finalisés (7j)"     value={0}            color="emerald" />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-8">

        {/* Case List */}
        <div className="col-span-8 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Dossiers récents
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-blue-200 outline-none w-52 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="divide-y">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-5 animate-pulse">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                      <div className="h-2 bg-slate-50 rounded w-1/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-16 text-center">
                <AlertTriangle size={40} className="mx-auto text-red-400 mb-4" />
                <p className="text-sm font-medium text-slate-600 mb-1">{error}</p>
                <button onClick={fetchData} className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-700">
                  Réessayer
                </button>
              </div>
            ) : filtered.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <Link
                    key={c.id}
                    href={`/case/${c.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                        {c.migrant_name?.charAt(0) ?? "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{c.migrant_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">#{c.case_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-slate-600">{new Date(c.created_at).toLocaleDateString("fr-FR")}</p>
                        <p className="text-[10px] text-slate-400 uppercase">Création</p>
                      </div>
                      <StatusBadge status={c.status} />
                      <ChevronRight size={15} className="text-slate-300 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Users size={28} className="text-slate-200" />
                </div>
                <p className="font-bold text-slate-700 mb-1">Aucun dossier trouvé</p>
                <p className="text-xs text-slate-400 mb-6">
                  {search ? `Aucun résultat pour "${search}"` : "Créez le premier dossier de l'association."}
                </p>
                {canCreate && !search && (
                  <Link href="/cases/new" className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all">
                    <Plus size={13} /> Créer un dossier
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-6">
          {/* Activity Feed */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Activity size={16} className="text-blue-600" />
                Activité récente
              </h3>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
            <div className="space-y-5">
              <ActivityItem icon={CheckCircle2} label="Connexion effectuée" time="Il y a 2 min" color="emerald" />
              <ActivityItem icon={FolderOpen}   label="Dossier Dupont ouvert" time="Il y a 1h"    color="blue"    />
              <ActivityItem icon={ScanText}     label="OCR terminé — Doc #42" time="Il y a 3h"    color="indigo"  />
              <ActivityItem icon={FileJson}     label="Rapport PDF généré"    time="Hier"          color="amber"   />
            </div>
          </div>

          {/* Security Badge */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Shield size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-sm">Infrastructure locale</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Pilot v1.4</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-5">
                Toutes les données restent sur votre machine. Zéro cloud, zéro transmission externe.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-300">
                  <div className={`w-2 h-2 rounded-full ${backendOnline ? "bg-emerald-400" : "bg-red-400"}`} />
                  Backend API — {backendOnline === null ? "Vérification..." : backendOnline ? "En ligne" : "Hors ligne"}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  OCR Tesseract — Prêt
                </div>
                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-300">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  Extracteur local — Actif
                </div>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const palette: Record<string, string> = {
    blue:    "text-blue-600 bg-blue-50",
    amber:   "text-amber-600 bg-amber-50",
    indigo:  "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${palette[color]}`}>
        <Icon size={19} />
      </div>
      <p className="text-2xl font-bold text-slate-900 mb-0.5">{value}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open:                  "bg-emerald-50 text-emerald-600",
    human_review_required: "bg-amber-50 text-amber-600",
    approved:              "bg-blue-50 text-blue-600",
    closed:                "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

function ActivityItem({ icon: Icon, label, time, color }: { icon: any; label: string; time: string; color: string }) {
  const palette: Record<string, string> = {
    blue:    "text-blue-600 bg-blue-50",
    amber:   "text-amber-600 bg-amber-50",
    indigo:  "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${palette[color]}`}>
        <Icon size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-900 truncate">{label}</p>
        <p className="text-[10px] text-slate-400">{time}</p>
      </div>
    </div>
  );
}
