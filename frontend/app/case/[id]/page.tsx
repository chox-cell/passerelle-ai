"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, ShieldCheck, Upload, FileCheck, Brain, 
  Mail, ClipboardList, Trash2, AlertCircle, CheckCircle2,
  Clock, Download, UserCheck, Shield, ScanText, FileJson,
  ChevronRight, ExternalLink, Filter, Eye, History, Split
} from "lucide-react";
import { API_BASE_URL, Case, Document, Extraction, Task, Consent, Report, OCRResult, getAuthHeaders, handleApiResponse } from "@/lib/api";

export default function CaseDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [consents, setConsents] = useState<Consent[]>([]);
  const [extractions, setExtractions] = useState<Record<string, Extraction>>({});
  const [ocrResults, setOcrResults] = useState<Record<string, OCRResult>>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState<string | null>(null);
  const [extracting, setExtracting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profileRes = await fetch(`${API_BASE_URL}/auth/me`, { headers: getAuthHeaders() });
      const profile = await handleApiResponse(profileRes);
      setUserProfile(profile);

      const caseRes = await fetch(`${API_BASE_URL}/cases/${id}`, { headers: getAuthHeaders() });
      const caseData = await handleApiResponse(caseRes);
      setCaseData(caseData);

      const docsRes = await fetch(`${API_BASE_URL}/documents/case/${id}`, { headers: getAuthHeaders() });
      const docs = await handleApiResponse(docsRes);
      setDocuments(docs);
      if (docs.length > 0) setActiveDoc(docs[0]);

      const consentRes = await fetch(`${API_BASE_URL}/privacy/cases/${id}/consents`, { headers: getAuthHeaders() });
      setConsents(await handleApiResponse(consentRes));

      const reportsRes = await fetch(`${API_BASE_URL}/reports/cases/${id}`, { headers: getAuthHeaders() });
      setReports(await handleApiResponse(reportsRes));

      const extMap: Record<string, Extraction> = {};
      const ocrMap: Record<string, OCRResult> = {};
      
      for (const doc of docs) {
        const ocrRes = await fetch(`${API_BASE_URL}/ocr/documents/${doc.id}`, { headers: getAuthHeaders() });
        if (ocrRes.ok) {
          const ocrData = await ocrRes.json();
          if (ocrData) ocrMap[doc.id] = ocrData;
        }

        const extRes = await fetch(`${API_BASE_URL}/ai/documents/${doc.id}/extraction`, { headers: getAuthHeaders() });
        if (extRes.ok) {
          extMap[doc.id] = await extRes.json();
        }
      }
      setOcrResults(ocrMap);
      setExtractions(extMap);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const grantConsent = async () => {
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
    } catch (err: any) { alert(err.message); }
  };

  const runOCR = async (docId: string) => {
    setOcrProcessing(docId);
    try {
      const res = await fetch(`${API_BASE_URL}/ocr/documents/${docId}/extract`, { method: "POST", headers: getAuthHeaders() });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setOcrProcessing(null); }
  };

  const reviewOCR = async (ocrId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ocr/${ocrId}/review`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_reviewed: true })
      });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const extractFromOCR = async (docId: string) => {
    setExtracting(docId);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/documents/${docId}/extract-from-reviewed-ocr`, { method: "POST", headers: getAuthHeaders() });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setExtracting(null); }
  };

  const approveExtraction = async (extId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/ai/extractions/${extId}/review`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_verified: true, verified_by: userProfile?.id })
      });
      await handleApiResponse(res);
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const role = userProfile?.role || "observer";
  const isAdmin = role === "admin";
  const canModify = role === "admin" || role === "volunteer";
  const canReview = role === "admin" || role === "reviewer";
  const hasConsent = consents.some(c => c.consent_type === "ai_extraction" && c.granted);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse text-sm">Initialisation de l'espace de travail...</p>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header Info */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{caseData?.migrant_name}</h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              Dossier #{id.toString().slice(0, 8)}
            </span>
          </div>
          <div className="flex gap-6 items-center">
             <div className="flex items-center gap-2 text-slate-500 text-sm">
               <Clock size={14} />
               <span>Ouvert le {new Date(caseData?.created_at || "").toLocaleDateString('fr-FR')}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${caseData?.status === 'open' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                <span className="text-sm font-semibold text-slate-700 capitalize">{caseData?.status || 'Inconnu'}</span>
             </div>
          </div>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
             <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
               <Trash2 size={16} /> Supprimer le dossier
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Timeline & Summary */}
        <div className="col-span-3 space-y-8">
          <section className="bg-white rounded-2xl border shadow-sm p-6 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-6 text-slate-900">
               <History size={18} className="text-blue-600" />
               <h2 className="font-bold">Timeline du Dossier</h2>
            </div>
            
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              <TimelineItem active icon={ShieldCheck} label="Consentement validé" date="Aujourd'hui" status="completed" />
              <TimelineItem active={documents.length > 0} icon={Download} label="Documents importés" date={documents.length > 0 ? "Aujourd'hui" : "--"} status={documents.length > 0 ? "completed" : "pending"} />
              <TimelineItem active={Object.keys(ocrResults).length > 0} icon={ScanText} label="Extraction OCR" status={Object.keys(ocrResults).length > 0 ? "completed" : "pending"} />
              <TimelineItem active={Object.keys(extractions).length > 0} icon={FileJson} label="Analyse structurée" status={Object.keys(extractions).length > 0 ? "completed" : "pending"} />
              <TimelineItem active={caseData?.status === 'approved'} icon={CheckCircle2} label="Approbation finale" status="pending" />
            </div>
          </section>

          <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200">
             <div className="flex items-center gap-2 mb-4">
                <Brain className="text-blue-400" size={20} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Résumé Pilot</h3>
             </div>
             <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
               "{caseData?.summary || "Aucun résumé généré pour le moment."}"
             </p>
             <Link href={`/case/${id}/copilot`} className="block w-full text-center bg-white/10 hover:bg-white/20 py-2 rounded-xl text-xs font-bold transition-all">
                Ouvrir NGO Copilot
             </Link>
          </section>
        </div>

        {/* Right: Split-View Workspace */}
        <div className="col-span-9 space-y-8">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden min-h-[700px] flex flex-col">
            {/* Workspace Header */}
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
               <div className="flex gap-4">
                 {documents.map(doc => (
                   <button 
                     key={doc.id}
                     onClick={() => setActiveDoc(doc)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                       activeDoc?.id === doc.id 
                         ? "bg-white border-blue-200 text-blue-600 shadow-sm" 
                         : "bg-transparent border-transparent text-slate-400 hover:text-slate-600"
                     }`}
                   >
                     {doc.file_name}
                   </button>
                 ))}
                 {canModify && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-all"
                    >
                      +
                    </button>
                 )}
                 <input type="file" ref={fileInputRef} className="hidden" />
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[10px] text-slate-400 font-bold uppercase mr-2">Mode:</span>
                 <button className="flex items-center gap-2 px-3 py-1 bg-white border rounded-lg text-[10px] font-bold text-slate-600 shadow-sm">
                    <Split size={12} /> Split View
                 </button>
               </div>
            </div>

            {/* Workspace Content */}
            <div className="flex-1 grid grid-cols-2">
               {/* Left: Preview */}
               <div className="border-r bg-slate-50/50 flex flex-col items-center justify-center p-8 relative">
                  {activeDoc ? (
                    <div className="w-full h-full bg-white border rounded-xl shadow-2xl overflow-hidden flex flex-col">
                       <div className="p-3 border-b flex justify-between items-center bg-slate-50">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{activeDoc.file_name}</span>
                          <ExternalLink size={12} className="text-slate-400" />
                       </div>
                       <div className="flex-1 flex items-center justify-center text-slate-300">
                          <FileText size={64} strokeWidth={1} />
                       </div>
                       <div className="p-4 border-t bg-slate-50 text-center">
                          <p className="text-[10px] text-slate-400 font-medium">Prévisualisation locale sécurisée</p>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Download size={48} className="mx-auto mb-4 opacity-20" />
                      <p className="text-sm font-medium">Sélectionnez un document</p>
                    </div>
                  )}
               </div>

               {/* Right: Intelligence & Actions */}
               <div className="flex flex-col bg-white">
                  {activeDoc ? (
                    <div className="flex-1 flex flex-col">
                       <div className="p-6 border-b flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-slate-900">Intelligence Documentaire</h3>
                            <p className="text-xs text-slate-400">Status: <span className="text-blue-600 font-bold">{activeDoc.status}</span></p>
                          </div>
                          {hasConsent ? (
                            <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold uppercase bg-emerald-50 px-2 py-1 rounded">
                               <ShieldCheck size={12} /> Consent OK
                            </div>
                          ) : (
                            <button onClick={grantConsent} className="text-amber-600 text-[10px] font-bold uppercase bg-amber-50 px-2 py-1 rounded hover:bg-amber-100">
                               Consentement Requis
                            </button>
                          )}
                       </div>

                       <div className="flex-1 overflow-y-auto p-6 space-y-6">
                          {/* OCR Section */}
                          <div className="space-y-3">
                             <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Texte OCR (Brut)</h4>
                                {canModify && !ocrResults[activeDoc.id] && hasConsent && (
                                   <button 
                                    onClick={() => runOCR(activeDoc.id)}
                                    disabled={ocrProcessing === activeDoc.id}
                                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                                   >
                                      {ocrProcessing === activeDoc.id ? "Traitement..." : "Lancer l'OCR local"}
                                   </button>
                                )}
                             </div>
                             {ocrResults[activeDoc.id] ? (
                               <div className="group relative">
                                  <div className="bg-slate-50 border rounded-xl p-4 text-[11px] text-slate-600 italic leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                                    {ocrResults[activeDoc.id].extracted_text}
                                  </div>
                                  {!ocrResults[activeDoc.id].is_reviewed && canReview && (
                                     <button 
                                      onClick={() => reviewOCR(ocrResults[activeDoc.id].id)}
                                      className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                                     >
                                        Valider la lecture OCR
                                     </button>
                                  )}
                               </div>
                             ) : (
                               <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-400 text-xs italic">
                                  {hasConsent ? "L'OCR local permet de lire le texte sur votre machine." : "Consentement requis."}
                                </div>
                             )}
                          </div>

                          {/* Extraction Section */}
                          <div className="space-y-3 pt-6 border-t">
                             <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Données Structurées</h4>
                                {canReview && ocrResults[activeDoc.id]?.is_reviewed && !extractions[activeDoc.id] && (
                                   <button 
                                    onClick={() => extractFromOCR(activeDoc.id)}
                                    disabled={extracting === activeDoc.id}
                                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                   >
                                      {extracting === activeDoc.id ? "Extraction..." : "Générer les champs"}
                                   </button>
                                )}
                             </div>
                             {extractions[activeDoc.id] ? (
                               <div className="space-y-4">
                                  <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-4 space-y-3">
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Type de Document</p>
                                          <p className="text-xs font-bold text-slate-900">{JSON.parse(extractions[activeDoc.id].raw_json).document_type}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Institution</p>
                                          <p className="text-xs font-bold text-slate-900">{JSON.parse(extractions[activeDoc.id].raw_json).institution}</p>
                                        </div>
                                     </div>
                                     <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Dates détectées</p>
                                        <div className="flex flex-wrap gap-1">
                                          {JSON.parse(extractions[activeDoc.id].raw_json).important_dates?.map((d: string) => (
                                            <span key={d} className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono text-indigo-600">{d}</span>
                                          ))}
                                        </div>
                                     </div>
                                  </div>
                                  {!extractions[activeDoc.id].is_verified && canReview && (
                                     <button 
                                      onClick={() => approveExtraction(extractions[activeDoc.id].id)}
                                      className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                                     >
                                        Approuver l'analyse structurée
                                     </button>
                                  )}
                               </div>
                             ) : (
                               <div className="bg-slate-50 border border-dashed rounded-xl p-8 text-center text-slate-400 text-xs italic">
                                  {ocrResults[activeDoc.id]?.is_reviewed ? "Prêt pour l'extraction structurée." : "Attente de validation OCR."}
                               </div>
                             )}
                          </div>
                       </div>

                       <div className="p-4 bg-slate-50 border-t text-center">
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                             {extractions[activeDoc.id] ? JSON.parse(extractions[activeDoc.id].raw_json).disclaimer : "Espace de revue sécurisé"}
                          </p>
                       </div>
                    </div>
                  ) : null}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ icon: Icon, label, date, status, active }: any) {
  const isCompleted = status === 'completed';
  return (
    <div className={`flex items-start gap-4 transition-all ${active ? "opacity-100" : "opacity-30"}`}>
      <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
        isCompleted ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-300"
      }`}>
        <Icon size={12} strokeWidth={3} />
      </div>
      <div>
        <h4 className={`text-xs font-bold ${active ? "text-slate-900" : "text-slate-400"}`}>{label}</h4>
        {date && <p className="text-[10px] text-slate-400 font-medium">{date}</p>}
      </div>
    </div>
  );
}
