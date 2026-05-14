"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Calendar, ArrowRight, User, AlertTriangle, RefreshCw, Shield, Users, Building } from "lucide-react";
import { API_BASE_URL, Case, getAuthHeaders, handleApiResponse } from "@/lib/api";

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Cases
      const casesRes = await fetch(`${API_BASE_URL}/cases/`, { headers: getAuthHeaders() });
      const casesData = await handleApiResponse(casesRes);
      setCases(casesData);

      // 2. Fetch Profile
      const profileRes = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
      const profileData = await handleApiResponse(profileRes);
      setUserProfile(profileData);
        
      // 3. Fetch Workspace & Members if Admin
      const wsRes = await fetch(`${API_BASE_URL}/workspace/me`, { headers: getAuthHeaders() });
      const wsData = await handleApiResponse(wsRes);
      setWorkspace(wsData);

      if (profileData.role === "admin") {
        const membersRes = await fetch(`${API_BASE_URL}/workspace/members`, { headers: getAuthHeaders() });
        const membersData = await handleApiResponse(membersRes);
        setMembers(membersData);
      }
    } catch (err: any) {
      console.error("Dashboard data fetch failed", err);
      setError(err.message || "Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/cases/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          workspace_id: workspace?.id,
          migrant_name: newName,
        }),
      });
      if (res.ok) {
        setNewName("");
        setShowForm(false);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create case", err);
    }
  };

  const canCreateCase = userProfile?.role === "admin" || userProfile?.role === "volunteer";
  const isAdmin = userProfile?.role === "admin";

  if (!localStorage.getItem("token")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-6">
          <Shield size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Accès Restreint</h1>
        <p className="text-slate-500 mb-8 max-w-sm">Veuillez vous connecter pour accéder à l'espace de votre association.</p>
        <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all">
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
            {userProfile && (
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                {userProfile.role === "admin" ? "Administrateur" : 
                 userProfile.role === "volunteer" ? "Bénévole" : 
                 userProfile.role === "reviewer" ? "Relecteur" : "Observateur"}
              </span>
            )}
          </div>
          <p className="text-slate-500">
            {workspace ? `Espace : ${workspace.name}` : "Gérez les dossiers et l'accompagnement."}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <SystemStatus />
          
          <div className="flex gap-2">
            {isAdmin && (
              <button 
                onClick={() => setShowMembers(true)}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <Users size={18} />
                Membres
              </button>
            )}
            
            {canCreateCase && (
              <button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Nouveau Dossier
              </button>
            )}

            <button 
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.reload();
              }}
              className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
              title="Déconnexion"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-red-50 rounded-3xl border-2 border-red-100 p-8 text-center">
          <AlertTriangle size={32} className="text-red-600 mb-4" />
          <h3 className="text-xl font-bold text-red-900 mb-2">Erreur</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button onClick={fetchData} className="bg-white text-red-600 border border-red-200 px-6 py-2 rounded-xl font-medium">Réessayer</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <Link key={c.id} href={`/case/${c.id}`} className="group">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                    {c.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600">{c.migrant_name}</h3>
                <p className="text-sm text-slate-500 mb-6 flex items-center gap-2">
                  <FileText size={14} /> Dossier #{c.id.slice(0, 8)}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <ArrowRight size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </div>
            </Link>
          ))}
          {cases.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
              <FileText size={32} className="text-slate-300" />
              <p className="text-slate-900 font-semibold">Aucun dossier trouvé</p>
              {canCreateCase && (
                <button onClick={() => setShowForm(true)} className="text-blue-600 font-medium hover:underline">Créer un dossier maintenant</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals: Form, Members */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">Nouveau Dossier</h2>
            <form onSubmit={createCase}>
              <label className="block text-sm font-medium mb-2">Nom de l'usager</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-3 rounded-xl border mb-6" required />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 border rounded-xl">Annuler</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl">Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMembers && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Users className="text-blue-600" /> Membres de l'association
              </h2>
              <button onClick={() => setShowMembers(false)} className="text-slate-400 hover:text-slate-600 font-bold">Fermer</button>
            </div>
            
            <div className="space-y-4 mb-10">
              {members.map(m => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border rounded-full flex items-center justify-center font-bold text-slate-500">
                      {m.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{m.full_name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    m.role === "admin" ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600"
                  }`}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={18}/> Ajouter un membre</h3>
              <p className="text-xs text-blue-600 mb-6">Le nouveau membre pourra se connecter avec son email et le mot de passe temporaire.</p>
              {/* Simplified add member form placeholder */}
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Ajouter un bénévole</button>
            </div>
          </div>
        </div>
      )}

      {/* Dev Warning */}
      <div className="mt-20 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
        <AlertTriangle className="text-amber-600 shrink-0" size={24} />
        <div>
          <p className="text-amber-900 font-bold">Authentification locale de développement</p>
          <p className="text-amber-800 text-sm">Ce système d'accès est conçu pour tester l'isolation des données entre associations. Ne pas utiliser pour des dossiers réels tant que le déploiement sur infrastructure sécurisée n'est pas validé.</p>
        </div>
      </div>
    </div>
  );
}

function SystemStatus() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/system/health`)
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(() => setStatus({ status: "offline", database: "Error", storage: "Error" }));
  }, []);

  if (!status) return null;

  return (
    <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-white border rounded-xl shadow-sm text-[10px] font-bold uppercase tracking-widest">
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${status.status === "online" ? "bg-emerald-500" : "bg-red-500"}`} />
        <span className="text-slate-400">API</span>
      </div>
      <div className="flex items-center gap-1.5 border-l pl-4">
        <div className={`w-2 h-2 rounded-full ${status.database === "OK" ? "bg-emerald-500" : "bg-red-500"}`} />
        <span className="text-slate-400">DB</span>
      </div>
      <div className="flex items-center gap-1.5 border-l pl-4">
        <div className={`w-2 h-2 rounded-full ${status.storage === "OK" ? "bg-emerald-500" : "bg-red-500"}`} />
        <span className="text-slate-400">Disk</span>
      </div>
    </div>
  );
}
