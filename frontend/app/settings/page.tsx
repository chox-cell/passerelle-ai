"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, User, Briefcase, Lock, Check, Server } from "lucide-react";
import { API_BASE_URL, getAuthHeaders, handleApiResponse } from "@/lib/api";

export default function Settings() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
        const profile = await handleApiResponse(profileRes);
        setUserProfile(profile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return <div className="p-12 text-center animate-pulse text-slate-400">Chargement des paramètres...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Configuration</p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Paramètres</h2>
      </div>

      {/* Profile Section */}
      <section className="bg-white border rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User className="text-blue-600" size={18} /> Profil Utilisateur
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 border-b pb-4">
            <div className="col-span-1 text-sm font-semibold text-slate-500">Nom complet</div>
            <div className="col-span-2 text-sm font-bold text-slate-900">{userProfile?.full_name || "—"}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-b pb-4">
            <div className="col-span-1 text-sm font-semibold text-slate-500">Rôle d'accès</div>
            <div className="col-span-2">
               <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                 {userProfile?.role || "—"}
               </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1 text-sm font-semibold text-slate-500">Espace de travail</div>
            <div className="col-span-2 flex items-center gap-2 text-sm font-bold text-slate-900">
               <Briefcase size={16} className="text-slate-400" /> ONG France Solidarité
            </div>
          </div>
        </div>
      </section>

      {/* System Warning */}
      <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex gap-4">
          <ShieldAlert className="text-amber-500 shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-amber-900 mb-2">Mode Local (Non-Production)</h3>
            <p className="text-sm text-amber-800 leading-relaxed">
              Vous utilisez actuellement <strong>Passerelle Pilot v1.4</strong>. Ce système tourne sur une infrastructure locale. 
              Il ne s'agit pas d'un système de production à grande échelle. Assurez-vous de suivre le protocole de test interne.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Checklist */}
      <section className="bg-white border rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Lock className="text-emerald-600" size={18} /> Check-list de sécurité
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
             <Check size={16} className="text-emerald-500 shrink-0" /> Serveur API fonctionnant en localhost
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
             <Check size={16} className="text-emerald-500 shrink-0" /> Moteur OCR hors-ligne configuré
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
             <Check size={16} className="text-emerald-500 shrink-0" /> Moteur d'extraction déterministe actif (sans IA cloud)
          </div>
        </div>
      </section>

      {/* Logout */}
      <div className="pt-4 flex justify-end">
        <button 
          onClick={handleLogout}
          className="bg-red-50 text-red-600 hover:bg-red-100 px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
        >
          <LogOut size={16} /> Déconnexion de la session
        </button>
      </div>
    </div>
  );
}
