import re
from datetime import datetime

# Rule sets for deterministic detection
DOC_TYPES = {
    "Récépissé de demande de titre de séjour": [r"récépissé", r"demande de titre de séjour"],
    "Titre de Séjour": [r"titre de séjour", r"carte de séjour"],
    "OQTF (Obligation de Quitter le Territoire)": [r"obligation de quitter", r"oqtf", r"quitter le territoire"],
    "Convocation": [r"convocation", r"êtes invité"],
    "Demande d'Asile (PADA/GUDA)": [r"demande d'asile", r"guda", r"pada"],
    "Document OFPRA": [r"ofpra", r"office français de protection"],
    "Document CNDA": [r"cnda", r"cour nationale du droit d'asile"],
}

INSTITUTIONS = {
    "Préfecture": [r"préfecture", r"préfet"],
    "OFPRA": [r"ofpra"],
    "CNDA": [r"cnda"],
    "OFII": [r"ofii"],
    "Mairie": [r"mairie", r"hôtel de ville"],
    "Tribunal Administratif": [r"tribunal administratif"],
}

DATE_PATTERN = r"(\d{1,2}[/-]\d{1,2}[/-]\d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})"

def extract_structured_data_from_text(text: str) -> dict:
    """Rules-based deterministic extractor for French administrative documents."""
    text_lower = text.lower()
    
    # 1. Detect Document Type
    detected_type = "Document Inconnu"
    type_confidence = 0.1
    for doc_name, keywords in DOC_TYPES.items():
        if any(re.search(kw, text_lower) for kw in keywords):
            detected_type = doc_name
            type_confidence = 0.8
            break

    # 2. Detect Institution
    detected_inst = "Institution Inconnue"
    inst_confidence = 0.1
    for inst_name, keywords in INSTITUTIONS.items():
        if any(re.search(kw, text_lower) for kw in keywords):
            detected_inst = inst_name
            inst_confidence = 0.8
            break

    # 3. Extract Dates
    found_dates = re.findall(DATE_PATTERN, text)
    unique_dates = sorted(list(set(found_dates)))
    
    # 4. Possible Deadline (Simple heuristic: latest date)
    deadline = unique_dates[-1] if unique_dates else None
    
    # 5. Summary and Actions
    summary = f"Analyse locale d'un document de type '{detected_type}' émis par '{detected_inst}'."
    actions = "Vérifier les dates d'échéance et les prochaines étapes auprès de votre conseiller."
    
    if "oqtf" in text_lower:
        actions = "URGENT : Un recours doit être déposé rapidement (souvent sous 48h, 15j ou 30j). Consultez un avocat immédiatement."
        summary += " ATTENTION : Ce document semble être une mesure d'éloignement."

    # 6. Overall Confidence
    overall_confidence = (type_confidence + inst_confidence) / 2
    if not unique_dates:
        overall_confidence -= 0.1

    return {
        "document_type": detected_type,
        "institution": detected_inst,
        "important_dates": unique_dates,
        "possible_deadline": deadline,
        "required_actions": actions,
        "summary_fr": summary,
        "confidence_score": round(max(0.1, overall_confidence), 2),
        "uncertainty_notes": "Extraction basée sur des mots-clés locaux. La lecture des dates peut être incomplète.",
        "source": "reviewed_ocr",
        "disclaimer": "Information à vérifier avec un professionnel qualifié ou une association spécialisée."
    }
