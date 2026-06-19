import type { Timestamp } from 'firebase/firestore';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin';
  createdAt: Timestamp;
}
