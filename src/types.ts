export interface InspectionRow {
  idx: string;
  content: string;
  result: string;
  recommendation: string;
  note: string;
  status?: 'completed' | 'in_progress' | 'pending';
}

export interface InspectionGroup {
  stt: string;
  title: string;
  rows: InspectionRow[];
}

export interface Member {
  name: string;
  role: string;
  signatureUrl?: string;
}

export interface ReportImage {
  id: string;
  stt: number;
  side: 'ST' | 'MR'; // ST: Ialy thường / Gian máy, MR: Ialy Mở Rộng
  caption: string;
  dataUrl: string;
  filename: string;
}

export interface ReportData {
  id: string;
  thang_nam: string;
  ngay: string;
  so_van_ban: string;
  gio_bd: string;
  gio_kt: string;
  ngay_bd: string;
  ngay_kt: string;
  members: Member[];
  groups: InspectionGroup[];
  recommendations: string[];
  images: ReportImage[];
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'colleague';
export type ViewTab = 'history' | 'preview' | 'edit';
