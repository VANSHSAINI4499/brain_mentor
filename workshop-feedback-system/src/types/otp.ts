import type { Timestamp } from 'firebase/firestore';

export type OtpType = 'email' | 'phone';

export interface OtpDocument {
  hashedCode: string;
  expiresAt: Timestamp;
  attempts: number;
  verified: boolean;
  createdAt: Timestamp;
  requestCount: number;
  lastRequestedAt: Timestamp;
}

export interface OtpVerificationState {
  email: boolean;
  phone: boolean;
}

export interface VerifyOtpResponse {
  verified: boolean;
}
