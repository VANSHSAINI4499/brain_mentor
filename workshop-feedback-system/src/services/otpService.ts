import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { OtpType, VerifyOtpResponse } from '../types/otp';

export const otpService = {
  generateOtp: async (type: OtpType, value: string): Promise<void> => {
    const generateOtpFn = httpsCallable<{ type: OtpType; value: string }, { success: boolean }>(
      functions,
      'generateOtp'
    );
    await generateOtpFn({ type, value });
  },

  verifyOtp: async (type: OtpType, value: string, code: string): Promise<VerifyOtpResponse> => {
    const verifyOtpFn = httpsCallable<
      { type: OtpType; value: string; code: string },
      VerifyOtpResponse
    >(functions, 'verifyOtp');
    
    const result = await verifyOtpFn({ type, value, code });
    return result.data;
  }
};
