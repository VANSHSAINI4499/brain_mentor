import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import type { OtpType, VerifyOtpResponse } from '../types/otp';

// TODO: Set USE_MOCKS to false once Firebase CLI access is restored
const USE_MOCKS = true;

const MOCK_OTP = '123456';
const NETWORK_DELAY = 800;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const otpService = {
  generateOtp: async (type: OtpType, value: string): Promise<void> => {
    if (USE_MOCKS) {
      await delay(NETWORK_DELAY);
      console.log(`[Mock] OTP generated for ${type}: ${value}. Valid code is ${MOCK_OTP}`);
      return;
    }

    const generateOtpFn = httpsCallable<{ type: OtpType; value: string }, { success: boolean }>(
      functions,
      'generateOtp'
    );
    await generateOtpFn({ type, value });
  },

  verifyOtp: async (type: OtpType, value: string, code: string): Promise<VerifyOtpResponse> => {
    if (USE_MOCKS) {
      await delay(NETWORK_DELAY);
      
      if (code === MOCK_OTP) {
        return { verified: true };
      }
      
      throw new Error('Invalid OTP code. Please try again.');
    }

    const verifyOtpFn = httpsCallable<
      { type: OtpType; value: string; code: string },
      VerifyOtpResponse
    >(functions, 'verifyOtp');
    
    const result = await verifyOtpFn({ type, value, code });
    return result.data;
  }
};
