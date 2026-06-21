import type { OtpType, VerifyOtpResponse } from '../types/otp';

const MOCK_OTP = '123456';
const NETWORK_DELAY = 800;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const otpService = {
  generateOtp: async (type: OtpType, value: string): Promise<void> => {
    await delay(NETWORK_DELAY);
    // Mock success - in reality this would call Firebase Functions
    console.log(`[Mock] OTP generated for ${type}: ${value}. Valid code is ${MOCK_OTP}`);
  },

  verifyOtp: async (_type: OtpType, _value: string, code: string): Promise<VerifyOtpResponse> => {
    await delay(NETWORK_DELAY);
    
    if (code === MOCK_OTP) {
      return { verified: true };
    }
    
    throw new Error('Invalid OTP code. Please try again.');
  }
};
