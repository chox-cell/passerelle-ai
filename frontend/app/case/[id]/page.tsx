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
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{caseData?.migrant_name}</h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
              Dossier #{id.toString().slice(0, 8)}
            </span>
          </div>
          <div className="flex flex-wrap gap-6 items-center">
             <div className="flex items-center gap-2 text-slate-500 text-sm">
               <Clock size={14} />
               <span>Ouvert le {new Date(caseData?.created_at || "").toLocaleDateString('fr-FR')}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${caseData?.status === 'open' ? 'bg-emerald-500' : caseData?.status === 'human_review_required' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <span className="text-sm font-semibold text-slate-700 capitalize">{caseData?.status?.replace(/_/g, " ") || 'Inconnu'}</span>
             </div>
          </div>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
             <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200">
               <Trash2 size={16} /> Supprimer le dossier
             </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Timeline & Summary */}
        <div className="col-span-1 lg:col-span-3 space-y-8">
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
            <div className="flex items-center gap-2 mb-6 text-slate-900">
               <History size={18} className="text-blue-600" />
               <h2 className="font-bold">Progression du Dossier</h2>
            </div>
            
            <div className="space-y-0 relative before:absolute before:left-[15px] before:top-4 before:bottom-4 before:w-[2px] before:bg-slate-100">
              <TimelineItem 
                active={true} 
                icon={ShieldCheck} 
                label="Consentement" 
                status="completed" 
                current={!hasConsent} 
              />
              <TimelineItem 
                active={hasConsent} 
                icon={Download} 
                label="Import documents" 
                status={documents.length > 0 ? "completed" : "pending"} 
                current={hasConsent && documents.length === 0} 
              />
              <TimelineItem 
                active={documents.length > 0} 
                icon={ScanText} 
                label="Extraction OCR" 
                status={Object.keys(ocrResults).length > 0 ? "completed" : "pending"} 
                current={documents.length > 0 && Object.keys(ocrResults).length === 0} 
              />
              <TimelineItem 
                active={Object.keys(ocrResults).some(k => ocrResults[k].is_reviewed)} 
                icon={FileJson} 
                label="Analyse structurée" 
                status={Object.keys(extractions).length > 0 ? "completed" : "pending"} 
                current={Object.keys(ocrResults).some(k => ocrResults[k].is_reviewed) && Object.keys(extractions).length === 0} 
              />
              <TimelineItem 
                active={Object.keys(extractions).length > 0} 
                icon={CheckCircle2} 
                label="Revue finale" 
                status={caseData?.status === 'approved' ? "completed" : "pending"} 
                current={Object.keys(extractions).length > 0 && caseData?.status !== 'approved'} 
                isLast
              />
            </div>
          </section>

          <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
             <div className="flex items-center gap-2 mb-4">
                <Brain className="text-blue-400" size={20} />
                <h3 className="font-bold text-sm uppercase tracking-wider">Résumé Pilot</h3>
             </div>
             <p className="text-slate-300 text-sm leading-relaxed mb-6 italic">
               "{caseData?.summary || "Aucun résumé généré pour le moment."}"
             </p>
          </section>
        </div>

        {/* Right: Split-View Workspace */}
        <div className="col-span-1 lg:col-span-9 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
            {/* Workspace Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
               <div className="flex flex-wrap gap-2">
                 {documents.map(doc => (
                   <button 
                     key={doc.id}
                     onClick={() => setActiveDoc(doc)}
                     className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                       activeDoc?.id === doc.id 
                         ? "bg-white border-blue-200 text-blue-700 shadow-sm" 
                         : "bg-transparent border-transparent text-slate-500 hover:bg-slate-200"
                     }`}
                   >
                     {doc.file_name}
                   </button>
                 ))}
                 
                 <button 
                   onClick={() => canModify ? fileInputRef.current?.click() : alert("Seuls les admins/bénévoles peuvent ajouter un document.")}
                   className={`w-10 h-9 flex items-center justify-center rounded-lg border border-dashed transition-all ${
                     canModify 
                       ? "border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50" 
                       : "border-slate-200 text-slate-300 cursor-not-allowed"
                   }`}
                   title={canModify ? "Ajouter un document" : "Permissions insuffisantes"}
                 >
                   <PlusIcon />
                 </button>
                 <input type="file" ref={fileInputRef} className="hidden" />
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Vue :</span>
                 <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 shadow-sm pointer-events-none">
                    <Split size={14} /> Côte à côte
                 </button>
               </div>
            </div>

            {/* Workspace Content */}
            <div className="flex-1 flex flex-col md:flex-row">
               {/* Left: Preview */}
               <div className="w-full md:w-1/2 border-r border-slate-200 bg-slate-100 flex flex-col items-center justify-center p-6 md:p-8">
                  {activeDoc ? (
                    <div className="w-full h-full max-h-[600px] bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden flex flex-col">
                       <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                          <span className="text-[10px] font-bold text-slate-500 uppercase truncate pr-4">{activeDoc.file_name}</span>
                          <ExternalLink size={14} className="text-slate-400 shrink-0" />
                       </div>
                       <div className="flex-1 flex items-center justify-center text-slate-300 bg-slate-50/50">
                          <span className="text-6xl opacity-50">📄</span>
                       </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400">
                      <Download size={48} className="mx-auto mb-4 opacity-30" />
                      <p className="text-sm font-medium">Sélectionnez ou importez un document</p>
                    </div>
                  )}
               </div>

               {/* Right: Intelligence & Actions */}
               <div className="w-full md:w-1/2 flex flex-col bg-white">
                  {activeDoc ? (
                    <div className="flex-1 flex flex-col">
                       <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
                          <div>
                            <h3 className="font-bold text-slate-900">Intelligence Documentaire</h3>
                            <p className="text-[11px] text-slate-500 uppercase font-medium tracking-wide mt-0.5">Traitement Local</p>
                          </div>
                          {hasConsent ? (
                            <div className="flex items-center gap-1.5 text-emerald-700 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                               <ShieldCheck size={14} /> Consentement
                            </div>
                          ) : (
                            <button 
                              onClick={grantConsent} 
                              className="text-amber-700 text-[10px] font-bold uppercase tracking-widest bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md hover:bg-amber-100 transition-colors"
                            >
                               Consentement Requis
                            </button>
                          )}
                       </div>

                       <div className="flex-1 overflow-y-auto p-6 space-y-8">
                          {/* OCR Section */}
                          <div className="space-y-4">
                             <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                  <ScanText size={16} className="text-blue-500" /> Texte OCR
                                </h4>
                                {hasConsent && (
                                   <button 
                                    onClick={() => runOCR(activeDoc.id)}
                                    disabled={ocrProcessing === activeDoc.id || !canModify}
                                    className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                                      canModify 
                                        ? "text-blue-600 hover:bg-blue-50" 
                                        : "text-slate-400 cursor-not-allowed"
                                    }`}
                                    title={!canModify ? "Seuls les admins/bénévoles peuvent lancer l'OCR" : ""}
                                   >
                                      {ocrProcessing === activeDoc.id ? "Traitement..." : "Lancer l'OCR local"}
                                   </button>
                                )}
                             </div>
                             
                             {ocrResults[activeDoc.id] ? (
                               <div className="group relative">
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 italic leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap shadow-inner">
                                    {ocrResults[activeDoc.id].extracted_text}
                                  </div>
                                  {!ocrResults[activeDoc.id].is_reviewed ? (
                                     <button 
                                      onClick={() => reviewOCR(ocrResults[activeDoc.id].id)}
                                      disabled={!canReview}
                                      className={`mt-3 w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                        canReview 
                                          ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200" 
                                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                      }`}
                                      title={!canReview ? "Seuls les admins/relecteurs peuvent valider" : ""}
                                     >
                                        Valider la lecture OCR
                                     </button>
                                  ) : (
                                    <div className="mt-2 flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase bg-emerald-50 px-2 py-1 rounded inline-flex">
                                      <CheckCircle2 size={12} /> Validé par un humain
                                    </div>
                                  )}
                               </div>
                             ) : (
                               <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500 text-xs italic">
                                  {hasConsent ? "Aucun texte extrait. Lancez l'OCR local." : "Le consentement est requis pour l'OCR."}
                                </div>
                             )}
                          </div>

                          {/* Extraction Section */}
                          <div className="space-y-4 pt-2">
                             <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                  <FileJson size={16} className="text-indigo-500" /> Données Structurées
                                </h4>
                                {ocrResults[activeDoc.id]?.is_reviewed && !extractions[activeDoc.id] && (
                                   <button 
                                    onClick={() => extractFromOCR(activeDoc.id)}
                                    disabled={extracting === activeDoc.id || !canReview}
                                    className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                                      canReview 
                                        ? "text-indigo-600 hover:bg-indigo-50" 
                                        : "text-slate-400 cursor-not-allowed"
                                    }`}
                                   >
                                      {extracting === activeDoc.id ? "Extraction..." : "Générer les champs"}
                                   </button>
                                )}
                             </div>

                             {extractions[activeDoc.id] ? (
                               <div className="space-y-4">
                                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 space-y-4 shadow-sm">
                                     <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Type de Document</p>
                                          <p className="text-sm font-bold text-slate-900">{JSON.parse(extractions[activeDoc.id].raw_json).document_type || "Non détecté"}</p>
                                        </div>
                                        <div>
                                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Institution</p>
                                          <p className="text-sm font-bold text-slate-900">{JSON.parse(extractions[activeDoc.id].raw_json).institution || "Non détectée"}</p>
                                        </div>
                                     </div>
                                     <div className="pt-2 border-t border-indigo-100/50">
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Dates détectées</p>
                                        <div className="flex flex-wrap gap-2">
                                          {JSON.parse(extractions[activeDoc.id].raw_json).important_dates?.length > 0 ? (
                                            JSON.parse(extractions[activeDoc.id].raw_json).important_dates.map((d: string) => (
                                              <span key={d} className="px-2 py-1 bg-white border border-indigo-100 rounded-md text-xs font-mono font-medium text-indigo-700 shadow-sm">{d}</span>
                                            ))
                                          ) : (
                                            <span className="text-xs text-slate-500 italic">Aucune date reconnue</span>
                                          )}
                                        </div>
                                     </div>
                                  </div>
                                  
                                  {!extractions[activeDoc.id].is_verified ? (
                                     <button 
                                      onClick={() => approveExtraction(extractions[activeDoc.id].id)}
                                      disabled={!canReview}
                                      className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                        canReview 
                                          ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200" 
                                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                      }`}
                                     >
                                        Approuver l'analyse structurée
                                     </button>
                                  ) : (
                                    <div className="mt-2 flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold uppercase bg-emerald-50 px-2 py-1 rounded inline-flex">
                                      <CheckCircle2 size={12} /> Analyse approuvée
                                    </div>
                                  )}
                               </div>
                             ) : (
                               <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500 text-xs italic">
                                  {ocrResults[activeDoc.id]?.is_reviewed ? "Prêt pour l'extraction déterministe." : "Attente de validation OCR humaine."}
                               </div>
                             )}
                          </div>
                       </div>

                       {/* Mandatory Disclaimer */}
                       <div className="p-4 bg-amber-50 border-t border-amber-100 flex items-start gap-3">
                          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                          <p className="text-[10px] text-amber-800 font-medium leading-relaxed">
                             {extractions[activeDoc.id] && JSON.parse(extractions[activeDoc.id].raw_json).disclaimer 
                               ? JSON.parse(extractions[activeDoc.id].raw_json).disclaimer 
                               : "Rappel : Les informations extraites doivent toujours être vérifiées. Cet outil ne fournit pas de conseil juridique."}
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

function PlusIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
}

function TimelineItem({ icon: Icon, label, date, status, active, current, isLast }: any) {
  const isCompleted = status === 'completed';
  return (
    <div className={`flex items-start gap-4 py-3 relative ${active ? "opacity-100" : "opacity-40 grayscale"}`}>
      <div className={`z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
        isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : 
        current ? "bg-white border-blue-500 text-blue-500 ring-4 ring-blue-50" : 
        "bg-white border-slate-300 text-slate-400"
      }`}>
        <Icon size={14} strokeWidth={isCompleted || current ? 3 : 2} />
      </div>
      <div className="pt-1.5 flex-1">
        <h4 className={`text-sm font-bold ${current ? "text-blue-700" : isCompleted ? "text-slate-900" : "text-slate-500"}`}>
          {label}
        </h4>
        {date && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{date}</p>}
        {current && <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mt-1">Étape actuelle</p>}
      </div>
    </div>
  );
}
