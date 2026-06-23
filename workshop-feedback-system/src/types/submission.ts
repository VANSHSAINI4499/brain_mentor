import type { Timestamp } from 'firebase/firestore';

export type CertificateStatus = 'pending' | 'sent' | 'failed';
export type DeliveryStatus = 'pending' | 'sent' | 'failed';

export interface Submission {
  id: string; // Deterministic hash: ${workshopId}_${normalizedPhone}_${normalizedEmail}
  workshopId: string;
  name: string;
  course: string;
  phone: string;
  email: string;
  feedback: string;
  rating?: number;
  phoneVerified: boolean;
  emailVerified: boolean;
  certificateStatus: CertificateStatus;
  certificateUrl: string | null;
  emailStatus: DeliveryStatus;
  whatsappStatus: DeliveryStatus;
  submittedAt: Timestamp;
}
