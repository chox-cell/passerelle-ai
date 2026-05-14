import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import os
import logging

logger = logging.getLogger(__name__)

def extract_text_from_image(file_path: str) -> str:
    """Extract text from a single image file."""
    try:
        text = pytesseract.image_to_string(Image.open(file_path), lang='fra')
        return text
    except Exception as e:
        logger.error(f"OCR Image Error: {e}")
        return ""

def extract_text_from_pdf(file_path: str) -> dict:
    """Extract text from a PDF by converting pages to images."""
    try:
        # Convert PDF to a list of PIL images
        pages = convert_from_path(file_path)
        full_text = ""
        for i, page in enumerate(pages):
            text = pytesseract.image_to_string(page, lang='fra')
            full_text += f"--- Page {i+1} ---\n{text}\n\n"
        
        return {
            "text": full_text,
            "pages": len(pages)
        }
    except Exception as e:
        logger.error(f"OCR PDF Error: {e}")
        return {"text": "", "pages": 0}

def extract_text(file_path: str, mime_type: str) -> dict:
    """General extraction function based on MIME type."""
    if not os.path.exists(file_path):
        return {"error": "Fichier introuvable"}

    if mime_type == "application/pdf":
        result = extract_text_from_pdf(file_path)
        return {
            "text": result["text"],
            "engine": "tesseract",
            "pages_processed": result["pages"],
            "confidence_note": "OCR local — résultat à vérifier manuellement."
        }
    elif mime_type in ["image/jpeg", "image/png"]:
        text = extract_text_from_image(file_path)
        return {
            "text": text,
            "engine": "tesseract",
            "pages_processed": 1,
            "confidence_note": "OCR local — résultat à vérifier manuellement."
        }
    else:
        return {"error": f"Type MIME non supporté pour l'OCR: {mime_type}"}
