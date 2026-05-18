"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FolderPlus, User, Hash, AlertTriangle, 
  CheckCircle2, ArrowLeft, Loader2 
} from "lucide-react";
import { API_BASE_URL, getAuthHeaders, handleApiResponse } from "@/lib/api";

export default function NewCasePage() {
  const [migrantName, setMigrantName] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState("normal");
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and is admin/volunteer
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() })
      .then(r => {
        if (!r.ok) throw new Error("Session invalide");
        return r.json();
      })
      .then(d => {
        if (d.role !== "admin" && d.role !== "volunteer") {
          setError("Accès refusé. Seuls les administrateurs et bénévoles peuvent créer un dossier.");
        } else {
          setProfile(d);
        }
      })
      .catch(() => {
        router.push("/login?expired=true");
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Form validation
    if (!migrantName.trim()) {
      setError("Le nom de l'usager est obligatoire.");
      setLoading(false);
      return;
    }
    if (!caseNumber.trim()) {
      setError("Le numéro de dossier est obligatoire.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        workspace_id: profile.workspace_id,
        creator_id: profile.id,
        migrant_name: migrantName.trim(),
        case_number: caseNumber.trim(),
        summary: summary.trim() || null,
        priority: priority,
        status: "open"
      };

      const res = await fetch(`${API_BASE_URL}/cases/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      await handleApiResponse(res);
      setSuccess(true);
      
      // Redirect after a small delay
      setTimeout(() => {
        router.push("/");
      }, 1500);

    } catch (err: any) {
      let errMsg = "Une erreur est survenue lors de la création du dossier.";
      if (typeof err.message === "string") {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const isAccessBlocked = error && error.includes("Accès refusé");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <div>
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-widest transition-colors">
          <ArrowLeft size={12} /> Retour au tableau de bord
        </Link>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-xl p-8 md:p-10">
        {/* Header */}
        <div className="flex items-center gap-4 border-b pb-6 mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
            <FolderPlus size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nouveau Dossier Usager</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Création de fiche d'aide locale</p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-xs font-semibold flex items-start gap-3">
            <AlertTriangle className="shrink-0 text-red-500" size={16} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-xs font-semibold flex items-start gap-3 animate-pulse">
            <CheckCircle2 className="shrink-0 text-emerald-500" size={16} />
            <p>Dossier créé avec succès ! Redirection en cours...</p>
          </div>
        )}

        {/* Access Restriction */}
        {isAccessBlocked ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">Vous n'avez pas les autorisations nécessaires pour accéder à cette page.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Migrant Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Nom de l'Usager <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={migrantName}
                    onChange={(e) => setMigrantName(e.target.value)}
                    placeholder="ex. Jean Dupont"
                    disabled={loading || success}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>

              {/* Case Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Numéro de Dossier <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    placeholder="ex. 2026-X789"
                    disabled={loading || success}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Priority Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Priorité du Dossier
              </label>
              <div className="flex gap-4">
                {["normal", "high"].map((p) => (
                  <label 
                    key={p} 
                    className={`flex-1 flex items-center justify-center py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider cursor-pointer transition-all
                      ${priority === p 
                        ? p === "high" 
                          ? "bg-red-50 border-red-200 text-red-700 ring-2 ring-red-200" 
                          : "bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-200"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={priority === p}
                      onChange={() => setPriority(p)}
                      disabled={loading || success}
                      className="sr-only"
                    />
                    {p === "high" ? "🚨 Haute" : "🟢 Standard"}
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Notes de Synthèse / Description
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Renseignez les détails initiaux du dossier, demandes, contraintes de temps..."
                rows={4}
                disabled={loading || success}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all resize-none"
              />
            </div>

            {/* Local Security Disclaimer */}
            <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <p className="text-[10px] text-amber-800 leading-relaxed font-semibold uppercase tracking-wider">
                Sécurisé localement : ce dossier restera uniquement stocké sur cette machine physique.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-2">
              <Link 
                href="/" 
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-center text-slate-500 hover:bg-slate-50 active:scale-95 transition-all"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading || success}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Création...
                  </>
                ) : (
                  "Créer le dossier"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
