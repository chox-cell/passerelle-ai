"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, ShieldCheck, Upload, FileCheck, Brain, 
  Mail, ClipboardList, Trash2, AlertCircle, CheckCircle2,
  Clock, Download
} from "lucide-react";
import { API_BASE_URL, Case, Document, Extraction, Task, Consent, Report } from "@/lib/api";

export default function CaseDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [extractions, setExtractions] = useState<Record<string, Extraction>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Case
      const caseRes = await fetch(`${API_BASE_URL}/cases/${id}`);
      if (!caseRes.ok) throw new Error("Dossier introuvable");
      setCaseData(await caseRes.json());

      // Fetch Documents
      const docsRes = await fetch(`${API_BASE_URL}/documents/case/${id}`);
      const docs = await docsRes.json();
      setDocuments(docs);

      // Fetch Consents
      const consentRes = await fetch(`${API_BASE_URL}/privacy/cases/${id}/consents`);
      setConsents(await consentRes.json());

      // Fetch Reports
      const reportsRes = await fetch(`${API_BASE_URL}/reports/cases/${id}`);
      setReports(await reportsRes.json());

      // Fetch Extractions for each document
      const extMap: Record<string, Extraction> = {};
      for (const doc of docs) {
        const extRes = await fetch(`${API_BASE_URL}/ai/documents/${doc.id}/extraction`);
        if (extRes.ok) {
          extMap[doc.id] = await extRes.json();
        }
      }
      setExtractions(extMap);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const grantConsent = async () => {
    try {
      await fetch(`${API_BASE_URL}/privacy/cases/${id}/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent_type: "ai_extraction",
          granted: true,
          granted_by: caseData?.migrant_name || "L'usager"
        })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/documents/upload/${id}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erreur lors du chargement");
      }
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const runMockExtract = async (docId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/documents/${docId}/mock-extract`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Erreur d'extraction");
      }
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const approveExtraction = async (extId: string) => {
    try {
      await fetch(`${API_BASE_URL}/ai/extractions/${extId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_verified: true })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const generateSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/copilot/cases/${id}/mock-summary`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail);
      }
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const generateTasks = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/copilot/cases/${id}/mock-tasks`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail);
      }
      const data = await res.json();
      setTasks(data.tasks);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const generatePDFReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reports/cases/${id}/generate`, { method: "POST" });
      if (!res.ok) throw new Error("Erreur de génération du rapport");
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = (reportId: string) => {
    window.open(`${API_BASE_URL}/reports/${reportId}/download`, '_blank');
  };

  const deleteCase = async () => {
    if (!confirm("Voulez-vous vraiment supprimer définitivement toutes les données de ce dossier ?")) return;
    try {
      await fetch(`${API_BASE_URL}/privacy/cases/${id}/delete-all`, { method: "DELETE" });
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-20 text-center">Chargement...</div>;
  if (error) return <div className="p-20 text-center text-red-600">{error}</div>;

  const hasConsent = consents.some(c => c.consent_type === "ai_extraction" && c.granted);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
        <ArrowLeft size={18} />
        Retour au tableau de bord
      </Link>

      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{caseData?.migrant_name}</h1>
          <div className="flex gap-4 items-center">
             <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
               ID: {id.toString().slice(0, 8)}
             </span>
             <span className="text-slate-400 text-sm">
               Créé le {new Date(caseData?.created_at || "").toLocaleDateString('fr-FR')}
             </span>
          </div>
        </div>
        <button 
          onClick={deleteCase}
          className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Trash2 size={18} />
          Supprimer tout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Section Documents */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileCheck className="text-blue-600" />
                Documents
              </h2>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
              >
                <Upload size={16} />
                {uploading ? "Chargement..." : "Ajouter un document"}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleUpload} 
                className="hidden" 
                accept=".pdf,.png,.jpg,.jpeg"
              />
            </div>

            <div className="space-y-4">
              {documents.map(doc => (
                <div key={doc.id} className="border rounded-xl p-4 hover:border-blue-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center">
                        <Download size={20} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{doc.file_name}</h4>
                        <p className="text-xs text-slate-500 uppercase tracking-tighter">
                          Statut: <span className={doc.status === "approved" ? "text-emerald-600 font-bold" : "text-blue-500"}>{doc.status}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!extractions[doc.id] && (
                        <button 
                          onClick={() => runMockExtract(doc.id)}
                          className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Brain size={14} />
                          Lancer l'Extraction (Mock)
                        </button>
                      )}
                    </div>
                  </div>

                  {extractions[doc.id] && (
                    <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          Résultat d'extraction AI
                        </span>
                        {!extractions[doc.id].is_verified && (
                          <button 
                            onClick={() => approveExtraction(extractions[doc.id].id)}
                            className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                          >
                            Approuver la revue humaine
                          </button>
                        )}
                      </div>
                      <pre className="text-[11px] bg-white p-3 rounded-lg border overflow-x-auto text-slate-600 leading-relaxed">
                        {JSON.stringify(extractions[doc.id].raw_json, null, 2)}
                      </pre>
                      <p className="mt-2 text-[10px] text-slate-400 italic">
                        Information à vérifier avec un professionnel qualifié ou une association spécialisée.
                      </p>
                    </div>
                  )}
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Aucun document chargé pour le moment.
                </div>
              )}
            </div>
          </section>

          {/* Section Synthèse & Copilot */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Brain className="text-indigo-600" />
                NGO Copilot
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={generateSummary}
                  className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2"
                >
                  <Mail size={16} />
                  Générer Synthèse
                </button>
                <button 
                  onClick={generateTasks}
                  className="bg-teal-50 text-teal-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors flex items-center gap-2"
                >
                  <ClipboardList size={16} />
                  Générer Tâches
                </button>
              </div>
            </div>

            {caseData?.summary && (
              <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-6 mb-6">
                <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Mail size={16} />
                  Résumé opérationnel
                </h4>
                <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {caseData.summary}
                </div>
              </div>
            )}

            {tasks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tâches suggérées</h4>
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm">
                    <div className="w-5 h-5 border-2 rounded-full border-teal-200" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                      <p className="text-[11px] text-slate-500">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!caseData?.summary && tasks.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
                Utilisez le Copilot pour générer des synthèses à partir des documents approuvés.
              </div>
            )}
          </section>

          {/* Section Rapports */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileCheck className="text-emerald-600" />
                Rapports Générés
              </h2>
              <button 
                onClick={generatePDFReport}
                disabled={generatingReport}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-100"
              >
                <Download size={16} />
                {generatingReport ? "Génération..." : "Générer rapport PDF"}
              </button>
            </div>

            <div className="space-y-3">
              {reports.map(report => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-slate-50 border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border rounded-lg flex items-center justify-center text-emerald-600">
                      <span>📄</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Rapport de synthèse</p>
                      <p className="text-[11px] text-slate-500">Généré le {new Date(report.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => downloadReport(report.id)}
                    className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <Download size={14} />
                    Télécharger
                  </button>
                </div>
              ))}
              {reports.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Aucun rapport généré pour le moment.
                </div>
              )}
            </div>
            <p className="mt-6 text-[10px] text-slate-400 italic text-center">
              Les rapports exportés contiennent des données sensibles. Veuillez les manipuler avec précaution conformément au RGPD.
            </p>
          </section>
        </div>

        <div className="space-y-6">
          {/* Section Privacy/Consent */}
          <div className={`rounded-2xl p-6 border ${hasConsent ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className={hasConsent ? "text-emerald-600" : "text-amber-600"} size={24} />
              <h3 className="font-bold text-slate-900">Protection des données</h3>
            </div>
            
            {hasConsent ? (
              <div>
                <p className="text-sm text-emerald-800 mb-4">
                  Le consentement pour l'analyse AI a été accordé. Les fonctionnalités d'extraction sont activées.
                </p>
                <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Conforme RGPD
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-amber-800 mb-6">
                  Le traitement AI nécessite l'accord explicite de l'usager. Veuillez recueillir sa signature numérique.
                </p>
                <button 
                  onClick={grantConsent}
                  className="w-full bg-amber-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200"
                >
                  Accorder le consentement
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
             <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
               <Clock size={16} />
               Aide & Sécurité
             </h3>
             <ul className="space-y-4">
               <li className="flex gap-3 text-xs text-slate-600">
                 <AlertCircle size={14} className="flex-shrink-0 text-blue-500" />
                 L'IA ne remplace pas l'avis d'un travailleur social qualifié.
               </li>
               <li className="flex gap-3 text-xs text-slate-600">
                 <AlertCircle size={14} className="flex-shrink-0 text-blue-500" />
                 Toutes les extractions doivent être validées manuellement.
               </li>
               <li className="flex gap-3 text-xs text-slate-600">
                 <AlertCircle size={14} className="flex-shrink-0 text-blue-500" />
                 Les données sont stockées localement et peuvent être supprimées à tout moment.
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
