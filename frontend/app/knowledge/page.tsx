"use client";

import { BookOpen, Shield, HelpCircle, HardDrive, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

export default function KnowledgePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Documentation</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          Base de Connaissances <BookOpen className="text-blue-600" size={28} />
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Guide d'utilisation et cadre de sécurité de l'infrastructure Passerelle OS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 space-y-2">
          <a href="#guide-benevole" className="block px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
            Guide Bénévole
          </a>
          <a href="#securite" className="block px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
            Sécurité & RGPD
          </a>
          <a href="#limites" className="block px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
            Limites du système
          </a>
          <a href="#demo" className="block px-4 py-2 bg-white rounded-lg border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all">
            Mode Démo
          </a>
        </div>

        {/* Content */}
        <div className="md:col-span-8 space-y-8">
          
          <section id="guide-benevole" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="text-blue-500" size={20} /> Guide Bénévole
            </h2>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <p>
                <strong>1. Création de dossier :</strong> Chaque nouvel usager doit avoir un dossier unique. Le recueil de son <strong>consentement éclairé</strong> est une étape préalable stricte et obligatoire.
              </p>
              <p>
                <strong>2. Import de documents :</strong> Importez des scans lisibles (PDF, JPG). L'outil OCR local analysera le contenu sans l'envoyer sur Internet.
              </p>
              <p>
                <strong>3. Validation humaine :</strong> La machine propose, <strong>l'humain dispose</strong>. Vous devez impérativement relire et valider l'extraction automatique avant de finaliser la synthèse d'un dossier.
              </p>
            </div>
          </section>

          <section id="securite" className="bg-emerald-50 rounded-2xl border border-emerald-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
              <Shield className="text-emerald-500" size={20} /> Sécurité & RGPD
            </h2>
            <div className="space-y-4 text-sm text-emerald-800 leading-relaxed">
              <p>
                L'infrastructure Passerelle est construite selon le principe du <strong>Local-First</strong>.
              </p>
              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Aucun Cloud :</strong> Les données de vos bénéficiaires ne sont jamais envoyées à des services tiers comme OpenAI ou Google.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Stockage Local :</strong> Base de données et fichiers résident exclusivement sur le disque dur de la machine physique exécutant le logiciel.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Isolation des Espaces :</strong> Les accès sont compartimentés par rôle (Admin, Bénévole, Relecteur).</span>
                </li>
              </ul>
            </div>
          </section>

          <section id="limites" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} /> Limites du système
            </h2>
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">Outil d'assistance, non de décision</p>
                <p>Passerelle ne fournit aucun conseil juridique. Les extractions déterministes servent à accélérer la saisie, mais le travailleur social reste le seul décisionnaire.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-800 mb-1">Performance OCR (Tesseract)</p>
                <p>L'OCR local peut rencontrer des difficultés sur des documents manuscrits ou des photos floues. Une correction manuelle du texte est parfois requise.</p>
              </div>
            </div>
          </section>

          <section id="demo" className="bg-blue-50/50 rounded-2xl border border-blue-100 p-8 shadow-sm">
            <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
              <HardDrive className="text-blue-500" size={20} /> Mode Démo
            </h2>
            <div className="space-y-4 text-sm text-blue-800 leading-relaxed">
              <p>
                Pour présenter Passerelle à des partenaires sans exposer de vraies données :
              </p>
              <code className="block bg-white p-3 rounded-lg border border-blue-200 font-mono text-xs shadow-sm">
                # Dans votre terminal<br/>
                ./scripts/demo_reset.sh
              </code>
              <p className="text-xs">
                Cette commande réinitialise la base et injecte un dossier factice de démonstration ("Jean Dupont"), sans aucun risque pour le secret professionnel.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
