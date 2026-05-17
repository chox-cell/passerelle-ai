"use client";

import { ShieldCheck, ServerOff, Database, Users, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

export default function Knowledge() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Centre de Ressources</p>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
          Base de connaissances <Database className="text-blue-600" size={28} />
        </h2>
        <p className="text-slate-500 mt-1 text-sm">Doctrine d'utilisation et règles de sécurité de Passerelle AI Pilot v1.4.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
          <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-4">
            <CheckCircle className="text-emerald-500" size={20} />
            Ce que Passerelle AI fait
          </h3>
          <ul className="space-y-3 text-sm text-emerald-800">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Lit le texte des documents numérisés (OCR local).
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Extrait les dates, types de documents et institutions.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Suggère des synthèses basées strictement sur les mots-clés.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Maintient une isolation totale des dossiers par association.
            </li>
          </ul>
        </section>

        <section className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <h3 className="font-bold text-red-900 flex items-center gap-2 mb-4">
            <XCircle className="text-red-500" size={20} />
            Ce que Passerelle AI ne fait pas
          </h3>
          <ul className="space-y-3 text-sm text-red-800">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Ne donne <strong>aucun avis juridique</strong>.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Ne prend aucune décision de recours de manière autonome.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              N'envoie aucune donnée à OpenAI, Google ou autres IA externes.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              Ne remplace pas la validation finale du bénévole.
            </li>
          </ul>
        </section>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <ShieldCheck className="text-blue-600" size={20} />
            Règles de sécurité & Confidentialité locale
          </h3>
          <div className="prose prose-sm prose-slate max-w-none">
            <p>
              Passerelle AI est conçu comme un système souverain. <strong>100% des traitements sont effectués localement</strong> sur la machine ou le réseau de l'association.
            </p>
            <ul>
              <li><strong>Consentement :</strong> Aucun document ne peut être analysé sans l'accord explicite de l'usager, consigné dans le système.</li>
              <li><strong>Isolation :</strong> Les bénévoles n'ont accès qu'aux dossiers de leur propre espace de travail.</li>
              <li><strong>Offline-First :</strong> Le moteur OCR (Tesseract) et l'extracteur déterministe fonctionnent sans connexion internet externe.</li>
            </ul>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Users className="text-blue-600" size={20} />
            Guide bénévole (Workflow)
          </h3>
          <div className="space-y-4">
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm shrink-0">1</div>
               <div>
                 <h4 className="font-bold text-slate-800 text-sm">Création et Consentement</h4>
                 <p className="text-xs text-slate-500 mt-1">Créez le dossier, expliquez le fonctionnement de l'outil et recueillez le consentement.</p>
               </div>
             </div>
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm shrink-0">2</div>
               <div>
                 <h4 className="font-bold text-slate-800 text-sm">Import et OCR</h4>
                 <p className="text-xs text-slate-500 mt-1">Importez le scan. Lancez l'OCR local. Un relecteur doit vérifier que le texte extrait est fidèle à l'image.</p>
               </div>
             </div>
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm shrink-0">3</div>
               <div>
                 <h4 className="font-bold text-slate-800 text-sm">Extraction Structurée</h4>
                 <p className="text-xs text-slate-500 mt-1">Générez les données structurées. Le relecteur valide les dates et types détectés.</p>
               </div>
             </div>
          </div>
        </section>

        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Info className="text-slate-500" size={20} />
            Questions fréquentes
          </h3>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-bold text-slate-800">L'outil peut-il se tromper sur une date d'OQTF ?</p>
              <p className="text-slate-600 mt-1">Oui. C'est pourquoi la validation humaine est <strong>obligatoire</strong>. L'outil signale une "urgence potentielle", mais le délai légal exact doit être vérifié par un humain.</p>
            </div>
            <hr className="border-slate-200" />
            <div>
              <p className="font-bold text-slate-800">Puis-je utiliser l'outil sur mon téléphone perso ?</p>
              <p className="text-slate-600 mt-1">La version actuelle est optimisée pour un usage sur le réseau sécurisé de l'association via un navigateur de bureau.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
