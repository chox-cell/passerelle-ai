"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileText, Calendar, ArrowRight, User } from "lucide-react";
import { API_BASE_URL, Case } from "@/lib/api";

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/cases/`);
      const data = await res.json();
      setCases(data);
    } catch (err) {
      console.error("Failed to fetch cases", err);
    } finally {
      setLoading(false);
    }
  };

  const createCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/cases/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspace_id: "00000000-0000-0000-0000-000000000000", // Placeholder
          migrant_name: newName,
        }),
      });
      if (res.ok) {
        setNewName("");
        setShowForm(false);
        fetchCases();
      }
    } catch (err) {
      console.error("Failed to create case", err);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
          <p className="text-slate-500 mt-1">Gérez les dossiers et l'accompagnement des usagers.</p>
        </div>
        <div className="flex gap-4">
          <SystemStatus />
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Nouveau Dossier
          </button>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border">
            <h2 className="text-xl font-bold mb-6">Créer un nouveau dossier</h2>
            <form onSubmit={createCase}>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nom de l'usager</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none mb-6"
                required
              />
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border font-medium hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map((c) => (
            <Link key={c.id} href={`/case/${c.id}`} className="group">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-slate-200/50 hover:border-blue-200 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
                    {c.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {c.migrant_name}
                </h3>
                <p className="text-sm text-slate-500 flex items-center gap-2 mb-6">
                  <FileText size={14} />
                  Dossier #{c.id.slice(0, 8)}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <div className="text-blue-600 flex items-center gap-1 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    Ouvrir <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {cases.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center">
                <FileText size={32} />
              </div>
              <div>
                <p className="text-slate-900 font-semibold">Aucun dossier trouvé</p>
                <p className="text-slate-500 text-sm">Commencez par créer votre premier dossier migrant.</p>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="text-blue-600 font-medium hover:underline"
              >
                Créer un dossier maintenant
              </button>
            </div>
          )}
        </div>
      )}
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
