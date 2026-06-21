import { useState, useCallback } from 'react';
import { otpService } from '../services/otpService';
import type { OtpType } from '../types/otp';

interface VerificationState {
  isGenerating: boolean;
  isVerifying: boolean;
  error: string | null;
  success: boolean;
}

const initialState: VerificationState = {
  isGenerating: false,
  isVerifying: false,
  error: null,
  success: false,
};

export const useOtpVerification = () => {
  const [state, setState] = useState<VerificationState>(initialState);

  const generateOtp = useCallback(async (type: OtpType, value: string) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));
    try {
      await otpService.generateOtp(type, value);
      setState(prev => ({ ...prev, isGenerating: false }));
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate OTP';
      setState(prev => ({ ...prev, isGenerating: false, error: errorMsg }));
      return false;
    }
  }, []);

  const verifyOtp = useCallback(async (type: OtpType, value: string, code: string) => {
    setState(prev => ({ ...prev, isVerifying: true, error: null }));
    try {
      const result = await otpService.verifyOtp(type, value, code);
      if (result.verified) {
        setState(prev => ({ ...prev, isVerifying: false, success: true }));
        return true;
      }
      return false; // Should not reach here based on mock implementation, but good for completeness
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to verify OTP';
      setState(prev => ({ ...prev, isVerifying: false, error: errorMsg }));
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    generateOtp,
    verifyOtp,
    reset,
  };
};
