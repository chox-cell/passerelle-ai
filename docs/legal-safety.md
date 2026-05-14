
# Legal Safety

Passerelle AI must never:

- provide definitive legal advice

- impersonate a lawyer

- fabricate immigration outcomes

- guarantee administrative success

Every legal or administrative explanation must include:

"This information should be verified with a qualified professional or specialized association."

All outputs must be:

- neutral

- traceable

- explainable

- human-reviewed

## Mandatory Disclaimer (French)
All AI-generated outputs (summaries, emails, extracted data) must include the following footer:
> "Information à vérifier avec un professionnel qualifié ou une association spécialisée."

## Human-in-the-Loop Requirement
No AI-generated extraction result is considered "Final" until a human volunteer has:
1. Reviewed the extracted fields.
2. Corrected any hallucinations or errors.
3. Explicitly approved the record using the `/review` endpoint.

## Approved Data Only Rule
To prevent the propagation of hallucinations or mock data into institutional communications:
- The NGO Copilot will **refuse** to generate summaries, emails, or tasks if there is no "Approved" extraction associated with the case.
- This ensures that every piece of information processed by the AI layer has been physically verified by a human agent first.

## Consent-Before-Processing Rule
To comply with GDPR and ethical standards:
- All extraction and copilot workflows **require** explicit user consent (`ai_extraction`).
- If no consent is recorded, the system will block the processing and return: *"Consentement requis avant le traitement des données."*

