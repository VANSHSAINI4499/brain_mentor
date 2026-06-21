export type OtpType = 'email' | 'phone';

export interface OtpVerificationState {
  email: boolean;
  phone: boolean;
}

export interface VerifyOtpResponse {
  verified: boolean;
}
