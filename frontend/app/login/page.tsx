"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Mail, Lock, AlertTriangle, CheckCircle2, WifiOff, Terminal } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`${API_BASE_URL}/system/health`)
      .then(res => setBackendOnline(res.ok))
      .catch(() => setBackendOnline(false));

    if (typeof window !== "undefined" && window.location.search.includes("expired=true")) {
      setError("Session expirée. Veuillez vous reconnecter.");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data));
        router.push("/");
      } else {
        const data = await res.json();
        let errMsg = "Erreur de connexion";
        if (typeof data.detail === "string") {
          errMsg = data.detail;
        } else if (Array.isArray(data.detail)) {
          errMsg = data.detail.map((e: any) => e.msg).join(", ");
        }
        setError(errMsg);
      }
    } catch (err) {
      setError("Erreur réseau. Vérifiez que le backend est lancé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Connexion</h1>
          <p className="text-slate-500 text-sm mt-2">Accédez à votre espace Passerelle AI</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3 border border-red-100">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@ong.org"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            S'inscrire
          </Link>
        </p>

        <div className="mt-8 p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b pb-1">Assistance Démo & Admin</p>
          
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Statut API Backend :</span>
            {backendOnline === null ? (
              <span className="text-slate-400 animate-pulse font-medium">Vérification...</span>
            ) : backendOnline ? (
              <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase text-[9px] flex items-center gap-1">
                <CheckCircle2 size={10} /> En ligne
              </span>
            ) : (
              <span className="text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded font-bold uppercase text-[9px] flex items-center gap-1">
                <WifiOff size={10} /> Hors-ligne
              </span>
            )}
          </div>

          <div className="text-[11px] text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100/60">
            <span className="font-bold text-slate-800">🔑 Identifiants de Démo :</span>
            <div className="mt-1 font-mono text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded flex flex-col gap-0.5">
              <div>Email : demo@passerelle.ai</div>
              <div>Pass  : demo123 (Rôle: Bénévole)</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 leading-relaxed flex gap-2 items-start">
            <Terminal size={14} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-left">
              Pour créer un compte <strong>Admin (Fondateur)</strong>, lancez :<br/>
              <code className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1 py-0.5 rounded mt-1 block w-fit">python scripts/create_admin.py</code>
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0" size={18} />
          <p className="text-[11px] text-amber-800 leading-tight text-left">
            <strong>Mode développement local</strong> — Ne pas utiliser avec des données réelles d'usagers tant que le chiffrement complet n'est pas activé.
          </p>
        </div>
      </div>
    </div>
  );
}
