export const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

export function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {
      "Content-Type": "application/json",
    };
  }

  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}


export const handleApiResponse = async (res: Response) => {
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login?expired=true";
    }
    throw new Error("Session expirée. Veuillez vous reconnecter.");
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Erreur serveur: ${res.status}`);
  }
  return res.json();
};

export interface Case {
  id: string;
  migrant_name: string;
  case_number: string;
  status: string;
  summary?: string;
  created_at: string;
}

export interface Document {
  id: string;
  case_id: string;
  file_name: string;
  status: string;
  mime_type?: string;
  file_size?: number;
  checksum?: string;
  ocr_status?: string;
  file_type?: string;
}

export interface OCRResult {
  id: string;
  document_id: string;
  extracted_text: string;
  corrected_text?: string;
  engine: string;
  pages_processed: number;
  is_reviewed: boolean;
  created_at: string;
}

export interface Extraction {
  id: string;
  document_id: string;
  raw_json: any;
  is_verified: boolean;
  confidence_score?: number;
}

export interface Consent {
  id: string;
  case_id: string;
  consent_type: string;
  granted: boolean;
  granted_by: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
}

export interface Report {
  id: string;
  case_id: string;
  report_type: string;
  file_path: string;
  created_at: string;
}
