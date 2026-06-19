import type { Timestamp } from 'firebase/firestore';

export interface Submission {
  id: string;
  workshopId: string;
  name: string;
  course: string;
  phone: string;
  email: string;
  feedback: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  submittedAt: Timestamp;
  certificateStatus: 'pending' | 'sent' | 'failed';
  certificateUrl: string | null;
  deliveredAt: Timestamp | null;
  deliveryErrors: string[];
}
