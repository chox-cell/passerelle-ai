"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, LogOut, User, Briefcase, Lock, Check, ShieldCheck, Mail, Key } from "lucide-react";
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
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return <div className="p-12 text-center animate-pulse text-slate-400">Chargement des paramètres...</div>;
  }

  const isAdmin = userProfile?.role === "admin";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Configuration</p>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Paramètres</h2>
        </div>
        <button 
          onClick={handleLogout}
          className="bg-slate-100 text-slate-600 hover:bg-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 active:scale-95"
        >
          <LogOut size={16} /> Se déconnecter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Profile Section */}
          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-4">
              <User className="text-blue-600" size={20} /> Mon Profil
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nom Complet</p>
                <p className="font-bold text-slate-900">{userProfile?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail size={14} className="text-slate-400" />
                  {userProfile?.email || "—"}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rôle</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  isAdmin ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                }`}>
                  {isAdmin && <Key size={12} />}
                  {userProfile?.role || "—"}
                </span>
              </div>
            </div>
          </section>

          {/* Workspace Section */}
          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-4">
              <Briefcase className="text-indigo-600" size={20} /> Espace de travail
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Association / ONG</p>
                <p className="font-bold text-slate-900">Workspace Actif</p>
              </div>
              {isAdmin && (
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <p className="text-xs font-bold text-indigo-900 mb-2">Gestion des membres</p>
                  <p className="text-[11px] text-indigo-700 leading-relaxed mb-3">
                    En tant qu'administrateur, vous pouvez gérer les accès des bénévoles et relecteurs directement depuis l'interface locale (Bientôt disponible).
                  </p>
                  <button disabled className="text-[10px] font-bold uppercase px-3 py-1.5 bg-indigo-200 text-indigo-700 rounded-lg cursor-not-allowed opacity-70">
                    Gérer l'équipe
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          {/* Privacy Checklist */}
          <section className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b pb-4">
              <ShieldCheck className="text-emerald-600" size={20} /> Sécurité Système
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" /> 
                <div>
                  <p className="font-bold mb-1">Serveur API Localhost</p>
                  <p className="text-xs text-slate-500">Le serveur tourne en vase clos sur la machine physique.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" /> 
                <div>
                  <p className="font-bold mb-1">OCR Hors-ligne (Tesseract)</p>
                  <p className="text-xs text-slate-500">Aucune donnée documentaire n'est transmise sur le web.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Check size={18} className="text-emerald-500 shrink-0 mt-0.5" /> 
                <div>
                  <p className="font-bold mb-1">Extraction Déterministe</p>
                  <p className="text-xs text-slate-500">Structuration de données locale garantie sans IA cloud générative.</p>
                </div>
              </div>
            </div>
          </section>

          {/* System Warning */}
          <section className="bg-amber-50 border border-amber-200 rounded-3xl shadow-sm p-8">
            <div className="flex gap-4">
              <ShieldAlert className="text-amber-500 shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Pilote V1.4 (Pre-prod)</h3>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Cette instance est une version <strong>Pilote Hardened</strong>. L'infrastructure est stable et sécurisée, mais veillez à maintenir des sauvegardes de vos bases de données en production (à l'avenir).
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
