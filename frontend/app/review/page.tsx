"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, ScanText, FileJson, FileCheck, ChevronRight, AlertCircle, Shield } from "lucide-react";
import { API_BASE_URL, Case, getAuthHeaders, handleApiResponse } from "@/lib/api";

export default function ReviewQueue() {
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

  const role = userProfile?.role || "observer";
  const canReview = role === "admin" || role === "reviewer";

  const ocrPending = cases.filter(c => c.status === "processing" || c.status === "open"); // In a real app, we'd have a more precise OCR pending state
  const extractionPending = cases.filter(c => c.status === "human_review_required");

  if (loading) {
    return <div className="p-12 text-center animate-pulse text-slate-400">Chargement de la file de revue...</div>;
  }

  if (!canReview) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Accès restreint</h2>
        <p className="text-slate-500 text-sm max-w-md">
          Seuls les administrateurs et les relecteurs peuvent accéder à la file de revue.
          Votre rôle actuel est : <span className="font-bold uppercase">{role}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gestion Qualité</p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          File de revue <Shield className="text-blue-600" size={28} />
        </h2>
        <p className="text-slate-500 mt-1 text-sm">Validez les extractions locales avant la génération des rapports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* OCR Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ScanText size={18} className="text-amber-500" /> OCR à valider
            </h3>
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{ocrPending.length}</span>
          </div>
          
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden min-h-[300px]">
            {ocrPending.length > 0 ? (
              <div className="divide-y">
                {ocrPending.map(c => (
                  <Link key={c.id} href={`/case/${c.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all group">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{c.migrant_name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><AlertCircle size={12}/> Attente de lecture</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <FileCheck size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Aucun élément en attente</p>
              </div>
            )}
          </div>
        </div>

        {/* Extraction Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileJson size={18} className="text-indigo-500" /> Extractions à valider
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{extractionPending.length}</span>
          </div>
          
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden min-h-[300px]">
             {extractionPending.length > 0 ? (
              <div className="divide-y">
                {extractionPending.map(c => (
                  <Link key={c.id} href={`/case/${c.id}`} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-all group">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{c.migrant_name}</p>
                      <p className="text-xs text-indigo-600 font-medium">Analyse structurée générée</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <FileCheck size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Aucun élément en attente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
