"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, ShieldCheck, Upload, FileCheck, Brain, 
  Mail, ClipboardList, Trash2, AlertCircle, CheckCircle2,
  Clock, Download, UserCheck, Shield
} from "lucide-react";
import { API_BASE_URL, Case, Document, Extraction, Task, Consent, Report, getAuthHeaders, handleApiResponse } from "@/lib/api";

export default function CaseDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [extractions, setExtractions] = useState<Record<string, Extraction>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  
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
      setError(null);

      // 1. Fetch Profile
      const profileRes = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
      const profile = await handleApiResponse(profileRes);
      setUserProfile(profile);

      // 2. Fetch Case
      const caseRes = await fetch(`${API_BASE_URL}/cases/${id}`, { headers: getAuthHeaders() });
      const caseData = await handleApiResponse(caseRes);
      setCaseData(caseData);

      // 3. Fetch Documents
      const docsRes = await fetch(`${API_BASE_URL}/documents/case/${id}`, { headers: getAuthHeaders() });
      const docs = await handleApiResponse(docsRes);
      setDocuments(docs);

      // 4. Fetch Consents
      const consentRes = await fetch(`${API_BASE_URL}/privacy/cases/${id}/consents`, { headers: getAuthHeaders() });
      setConsents(await handleApiResponse(consentRes));

      // 5. Fetch Reports
      const reportsRes = await fetch(`${API_BASE_URL}/reports/cases/${id}`, { headers: getAuthHeaders() });
      setReports(await handleApiResponse(reportsRes));

      // 6. Fetch Extractions for each document
      const extMap: Record<string, Extraction> = {};
      for (const doc of docs) {
        const extRes = await fetch(`${API_BASE_URL}/ai/documents/${doc.id}/extraction`, { headers: getAuthHeaders() });
        if (extRes.ok) {
          extMap[doc.id] = await extRes.json();
        }
      }
      setExtractions(extMap);

    } catch (err: any) {
      setError(err.message);
      if (err.message.includes("expirée")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const grantConsent = async () => {
    if (!canModify) return;
    try {
      const res = await fetch(`${API_BASE_URL}/privacy/cases/${id}/consent`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          consent_type: "ai_extraction",
          granted: true,
          granted_by: caseData?.migrant_name || "L'usager"
        })
      });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canModify) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const headers = getAuthHeaders();
    delete (headers as any)["Content-Type"]; // Let browser set boundary

    try {
      const res = await fetch(`${API_BASE_URL}/documents/upload/${id}`, {
        method: "POST",
        headers: headers,
        body: formData,
      });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const runMockExtract = async (docId: string) => {
    if (!canModify) return;
    try {
      const res = await fetch(`${API_BASE_URL}/ai/documents/${docId}/mock-extract`, { 
        method: "POST",
        headers: getAuthHeaders()
      });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const approveExtraction = async (extId: string) => {
    if (!canReview) return;
    try {
      const res = await fetch(`${API_BASE_URL}/ai/extractions/${extId}/review`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_verified: true, verified_by: userProfile?.id })
      });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const generateSummary = async () => {
    if (!canModify) return;
    try {
      const res = await fetch(`${API_BASE_URL}/copilot/cases/${id}/mock-summary`, { 
        method: "POST",
        headers: getAuthHeaders()
      });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const generateTasks = async () => {
    if (!canModify) return;
    try {
      const res = await fetch(`${API_BASE_URL}/copilot/cases/${id}/mock-tasks`, { 
        method: "POST",
        headers: getAuthHeaders()
      });
      const data = await handleApiResponse(res);
      setTasks(data.tasks);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const generatePDFReport = async () => {
    if (!canReport) return;
    setGeneratingReport(true);
    try {
      const res = await fetch(`${API_BASE_URL}/reports/cases/${id}/generate`, { 
        method: "POST",
        headers: getAuthHeaders()
      });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const downloadReport = (reportId: string) => {
    window.open(`${API_BASE_URL}/reports/${reportId}/download?token=${localStorage.getItem("token")}`, '_blank');
    // Note: In a real app, use a temporary download link or a dedicated token param
  };

  const deleteCase = async () => {
    if (!isAdmin) return;
    if (!confirm("Voulez-vous vraiment supprimer définitivement toutes les données de ce dossier ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/privacy/cases/${id}/delete-all`, { 
        method: "DELETE",
        headers: getAuthHeaders()
      });
      await handleApiResponse(res);
      router.push("/");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const role = userProfile?.role || "observer";
  const isAdmin = role === "admin";
  const canModify = role === "admin" || role === "volunteer";
  const canReview = role === "admin" || role === "reviewer";
  const canReport = role === "admin" || role === "volunteer" || role === "reviewer";

  if (loading) return <div className="p-20 text-center animate-pulse">Chargement du dossier...</div>;
  if (error) return (
    <div className="p-20 text-center">
      <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
      <h2 className="text-xl font-bold mb-2">Erreur d'accès</h2>
      <p className="text-slate-500 mb-8">{error}</p>
      <Link href="/" className="bg-slate-900 text-white px-6 py-2 rounded-xl">Retour</Link>
    </div>
  );

  const hasConsent = consents.some(c => c.consent_type === "ai_extraction" && c.granted);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors font-medium">
        <ArrowLeft size={18} />
        Retour au tableau de bord
      </Link>

      <div className="flex justify-between items-start mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-slate-900">{caseData?.migrant_name}</h1>
            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Dossier #{id.toString().slice(0, 8)}
            </span>
          </div>
          <div className="flex gap-4 items-center">
             <span className="text-slate-400 text-sm font-medium">
               Créé le {new Date(caseData?.created_at || "").toLocaleDateString('fr-FR')}
             </span>
             {caseData?.status && (
               <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase">
                 {caseData.status}
               </span>
             )}
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={deleteCase}
            className="text-red-400 hover:text-red-600 p-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <Trash2 size={18} />
            Supprimer tout
          </button>
        )}
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
              {canModify && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                >
                  <Upload size={16} />
                  {uploading ? "Chargement..." : "Ajouter un document"}
                </button>
              )}
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
                      {canModify && !extractions[doc.id] && hasConsent && (
                        <button 
                          onClick={() => runMockExtract(doc.id)}
                          className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                        >
                          <Brain size={14} />
                          Extraire les données
                        </button>
                      )}
                    </div>
                  </div>

                  {extractions[doc.id] && (
                    <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          Analyse AI effectuée
                        </span>
                        {canReview && !extractions[doc.id].is_verified && (
                          <button 
                            onClick={() => approveExtraction(extractions[doc.id].id)}
                            className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                          >
                            <UserCheck size={14} />
                            Approuver la revue
                          </button>
                        )}
                      </div>
                      <pre className="text-[11px] bg-white p-3 rounded-lg border overflow-x-auto text-slate-600 leading-relaxed">
                        {JSON.stringify(extractions[doc.id].raw_json, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm italic">
                  Aucun document pour cet usager.
                </div>
              )}
            </div>
          </section>

          {/* Section Copilot */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Brain className="text-indigo-600" />
                NGO Copilot
              </h2>
              {canModify && (
                <div className="flex gap-2">
                  <button 
                    onClick={generateSummary}
                    className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2"
                  >
                    <Mail size={16} />
                    Synthèse
                  </button>
                  <button 
                    onClick={generateTasks}
                    className="bg-teal-50 text-teal-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-100 transition-colors flex items-center gap-2"
                  >
                    <ClipboardList size={16} />
                    Tâches
                  </button>
                </div>
              )}
            </div>

            {caseData?.summary && (
              <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-6 mb-6">
                <h4 className="text-sm font-bold text-indigo-900 mb-3 uppercase tracking-widest flex items-center gap-2">
                  Synthèse opérationnelle
                </h4>
                <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {caseData.summary}
                </div>
              </div>
            )}

            {!caseData?.summary && (
              <div className="text-center py-10 text-slate-400 text-sm italic">
                {canModify ? "Générez une synthèse pour faciliter le suivi." : "Aucune synthèse disponible."}
              </div>
            )}
          </section>

          {/* Section Rapports */}
          <section className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileCheck className="text-emerald-600" />
                Sorties PDF
              </h2>
              {canReport && (
                <button 
                  onClick={generatePDFReport}
                  disabled={generatingReport}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-100"
                >
                  <Download size={16} />
                  {generatingReport ? "Génération..." : "Générer rapport"}
                </button>
              )}
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
                      <p className="text-[11px] text-slate-500">Créé le {new Date(report.created_at).toLocaleString('fr-FR')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => downloadReport(report.id)}
                    className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <Download size={14} />
                    Télécharger
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          {/* Section Privacy/Consent */}
          <div className={`rounded-3xl p-6 border ${hasConsent ? "bg-emerald-50 border-emerald-100" : "bg-amber-50 border-amber-100"}`}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className={hasConsent ? "text-emerald-600" : "text-amber-600"} size={24} />
              <h3 className="font-bold text-slate-900">Confidentialité</h3>
            </div>
            
            {hasConsent ? (
              <div>
                <p className="text-sm text-emerald-800 mb-4 font-medium">
                  Accord RGPD actif pour cet usager. Les outils AI sont opérationnels.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-amber-800 mb-6">
                  L'accord explicite de l'usager est requis avant toute extraction automatique.
                </p>
                {canModify && (
                  <button 
                    onClick={grantConsent}
                    className="w-full bg-amber-600 text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors"
                  >
                    Recueillir le consentement
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
             <div className="flex items-center gap-2 mb-4">
                <Shield className="text-slate-400" size={20} />
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-widest">Rôle Actuel</h3>
             </div>
             <p className="text-sm text-slate-600 font-medium capitalize">{role}</p>
             <p className="text-[10px] text-slate-400 mt-2 leading-relaxed italic">
               Vos permissions sont limitées par le protocole de sécurité de votre association.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
