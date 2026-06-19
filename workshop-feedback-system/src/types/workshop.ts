import type { Timestamp } from 'firebase/firestore';

export interface Workshop {
  id: string;
  collegeName: string;
  workshopName: string;
  dateTime: Timestamp;
  instructions: string;
  status: 'draft' | 'active' | 'inactive';
  formLink: string | null;        // unique slug, set when first activated
  createdBy: string;              // admin uid
  createdAt: Timestamp;
  updatedAt: Timestamp;
  certificateTemplateId: string | null;
}

export interface CertificateTemplate {
  id: string;
  workshopId: string;
  storagePath: string;            // path in Firebase Storage
  namePosition: { x: number; y: number; fontSize: number };
  version: number;
  uploadedAt: Timestamp;
}
