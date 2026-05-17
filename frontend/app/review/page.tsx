export default function ReviewQueue() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">⏳</div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">File de revue</h2>
      <p className="text-slate-500 text-sm max-w-md">
        Les dossiers en attente de validation OCR ou d'approbation d'extraction apparaîtront ici. Disponible en V1.4 Phase 2B.
      </p>
    </div>
  );
}
