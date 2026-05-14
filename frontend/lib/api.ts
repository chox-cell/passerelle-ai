export const API_BASE_URL = "http://localhost:8000/api/v1";

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
}

export interface Extraction {
  id: string;
  document_id: string;
  raw_json: any;
  is_verified: boolean;
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
