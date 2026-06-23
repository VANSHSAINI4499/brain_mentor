import type { Timestamp } from 'firebase/firestore';

export type WorkshopStatus = 'draft' | 'active' | 'inactive';

export interface Workshop {
  id: string;                     // This will be the formId/slug
  collegeName: string;
  workshopName: string;
  instructorName?: string;
  duration?: string;
  description?: string;
  dateTime: Timestamp;
  instructions: string;
  status: WorkshopStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
