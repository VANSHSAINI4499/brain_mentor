import React, { useState, useRef } from 'react';
import type { KeyboardEvent, ClipboardEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface OtpInputProps {
  length?: number;
  onChange?: (value: string) => void;
  onComplete?: (otp: string) => void;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({ 
  length = 6, 
  onChange,
  onComplete, 
  isLoading = false,
  error = null,
  disabled = false
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const focusInput = (index: number) => {
    if (index >= 0 && index < length) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Take only the last character in case they type multiple fast
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Combine and check if complete
    const combinedOtp = newOtp.join('');
    onChange?.(combinedOtp);
    
    if (value !== '') {
      focusInput(index + 1);
    }

    if (combinedOtp.length === length && !combinedOtp.includes('')) {
      onComplete?.(combinedOtp);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        focusInput(index - 1);
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length).split('');
    if (pastedData.some(char => isNaN(Number(char)))) return;

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      newOtp[index] = char;
    });
    setOtp(newOtp);

    focusInput(Math.min(pastedData.length, length - 1));

    const combinedOtp = newOtp.join('');
    onChange?.(combinedOtp);

    if (pastedData.length === length) {
      onComplete?.(combinedOtp);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="OTP Input">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={disabled || isLoading}
            aria-label={`Digit ${index + 1}`}
            className={`
              w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold
              border rounded-xl shadow-sm transition-all
              focus:outline-none focus:ring-2 focus:ring-primary-500
              disabled:bg-slate-50 disabled:text-slate-400
              ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'}
            `}
          />
        ))}
      </div>
      
      <div className="h-6 flex items-center justify-center" aria-live="polite">
        {isLoading ? (
          <div className="flex items-center text-sm text-primary-600">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 animate-in fade-in">{error}</p>
        ) : null}
      </div>
    </div>
  );
};
