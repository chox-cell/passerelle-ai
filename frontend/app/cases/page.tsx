"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, Search, Plus, Clock, Filter, AlertCircle } from "lucide-react";
import { API_BASE_URL, Case, getAuthHeaders, handleApiResponse } from "@/lib/api";

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/cases/`, { headers: getAuthHeaders() });
      const data = await handleApiResponse(res);
      setCases(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.migrant_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.case_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "open") return matchesSearch && c.status === "open";
    if (filter === "urgent") return matchesSearch && c.priority === "high";
    if (filter === "review") return matchesSearch && c.status === "human_review_required";
    return matchesSearch;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Base de Données</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Dossiers Usagers <FolderOpen className="text-blue-600" size={28} />
          </h1>
        </div>
        <Link 
          href="/cases/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18} /> Nouveau Dossier
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-center gap-3 border border-red-100">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un nom, un numéro..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button 
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Tous
          </button>
          <button 
            onClick={() => setFilter("open")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === "open" ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
          >
            En cours
          </button>
          <button 
            onClick={() => setFilter("review")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === "review" ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"}`}
          >
            À relire
          </button>
          <button 
            onClick={() => setFilter("urgent")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${filter === "urgent" ? "bg-red-500 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
          >
            Urgents
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-white border border-slate-100 rounded-2xl shadow-sm animate-pulse"></div>
          ))}
        </div>
      ) : filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCases.map(c => (
            <Link key={c.id} href={`/case/${c.id}`} className="group block bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {c.case_number}
                  </span>
                  {c.priority === "high" && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {c.migrant_name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {c.summary || "Aucun résumé disponible pour ce dossier."}
                </p>
              </div>
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                 </div>
                 <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    c.status === 'open' ? 'bg-blue-100 text-blue-700' : 
                    c.status === 'human_review_required' ? 'bg-amber-100 text-amber-700' :
                    c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-200 text-slate-600'
                 }`}>
                    {c.status.replace(/_/g, " ")}
                 </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <FolderOpen size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">Aucun dossier trouvé</h3>
          <p className="text-slate-500 text-sm max-w-sm mb-6">
            Essayez de modifier vos filtres ou créez un nouveau dossier usager.
          </p>
          <Link 
            href="/cases/new" 
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
          >
            Créer un dossier
          </Link>
        </div>
      )}
    </div>
  );
}
