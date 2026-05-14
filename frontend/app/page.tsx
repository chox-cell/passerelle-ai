"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, FolderOpen, AlertCircle, CheckCircle2, 
  ArrowRight, Search, Plus, Filter, Clock, 
  ChevronRight, ScanText, FileJson, Activity
} from "lucide-react";
import { API_BASE_URL, Case, getAuthHeaders, handleApiResponse } from "@/lib/api";

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
    fetchData();
  }, []);

  const pendingOCR = cases.filter(c => c.status === "processing").length;
  const pendingReview = cases.filter(c => c.status === "human_review_required").length;

  return (
    <div className="space-y-12">
      {/* Welcome & Stats */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Bonjour, {userProfile?.full_name?.split(' ')[0] || "Bénévole"} 👋
          </h2>
          <p className="text-slate-500 font-medium">Prêt pour les permanences d'aujourd'hui ?</p>
        </div>
        <Link 
          href="/cases/new" 
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Nouveau Dossier
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatCard icon={FolderOpen} label="Dossiers Actifs" value={cases.length} color="blue" />
        <StatCard icon={ScanText} label="OCR en cours" value={pendingOCR} color="amber" />
        <StatCard icon={FileJson} label="Attente de revue" value={pendingReview} color="indigo" />
        <StatCard icon={CheckCircle2} label="Finalisés (7j)" value={0} color="emerald" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main: Cases List */}
        <div className="col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Dossiers Récents
            </h3>
            <div className="flex items-center gap-2">
               <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="pl-9 pr-4 py-1.5 rounded-lg border bg-white text-xs focus:ring-2 focus:ring-blue-100 outline-none w-48 transition-all"
                  />
               </div>
               <button className="p-1.5 border rounded-lg bg-white text-slate-400 hover:text-slate-600">
                  <Filter size={14} />
               </button>
            </div>
          </div>

          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
             {loading ? (
                <div className="p-12 text-center animate-pulse text-slate-400 text-sm">Chargement des dossiers...</div>
             ) : cases.length > 0 ? (
               <div className="divide-y">
                 {cases.map((c) => (
                   <Link 
                    key={c.id} 
                    href={`/case/${c.id}`}
                    className="flex items-center justify-between p-5 hover:bg-slate-50 transition-all group"
                   >
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                           {c.migrant_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{c.migrant_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">#{c.case_number}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <p className="text-xs font-bold text-slate-700">{new Date(c.created_at).toLocaleDateString('fr-FR')}</p>
                           <p className="text-[10px] text-slate-400 uppercase font-medium">Création</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'open' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {c.status}
                        </span>
                        <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                     </div>
                   </Link>
                 ))}
               </div>
             ) : (
               <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                     <Users size={32} className="text-slate-200" />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Aucun dossier</h4>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto mb-8">Commencez par créer votre premier dossier pour accompagner un usager.</p>
                  <Link href="/cases/new" className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-bold">Créer maintenant</Link>
               </div>
             )}
          </div>
        </div>

        {/* Sidebar: Activity & Queue */}
        <div className="col-span-4 space-y-8">
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Activity size={18} className="text-blue-600" />
                  Activités
                </h3>
                <span className="text-[10px] font-bold text-blue-600 uppercase">Live</span>
             </div>
             <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                <ActivityItem label="Connexion effectuée" time="2m ago" />
                <ActivityItem label="Dossier Dupont créé" time="1h ago" />
                <ActivityItem label="OCR terminé (ID: 42)" time="3h ago" />
                <ActivityItem label="Rapport généré" time="Hier" />
             </div>
          </section>

          <section className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden">
             <div className="relative z-10">
                <h3 className="font-bold mb-2">Passerelle PRO</h3>
                <p className="text-xs text-blue-100 mb-6">Optimisez vos permanences avec l'intelligence locale.</p>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 bg-white/10 p-2 rounded-lg border border-white/10">
                      <Shield size={14} className="text-blue-200" />
                      <p className="text-[10px] font-bold uppercase tracking-tight">Sécurisé & Hors-ligne</p>
                   </div>
                </div>
             </div>
             <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50",
    amber: "text-amber-600 bg-amber-50",
    indigo: "text-indigo-600 bg-indigo-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm card-hover">
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
          <Icon size={20} />
       </div>
       <p className="text-2xl font-bold text-slate-900 mb-1">{value}</p>
       <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function ActivityItem({ label, time }: any) {
  return (
    <div className="flex items-center gap-4 relative z-10">
       <div className="w-1.5 h-1.5 rounded-full bg-slate-300 ring-4 ring-white" />
       <div className="flex-1">
          <p className="text-xs font-bold text-slate-900">{label}</p>
          <p className="text-[10px] text-slate-400 font-medium">{time}</p>
       </div>
    </div>
  );
}
