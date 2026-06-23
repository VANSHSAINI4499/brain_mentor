import { z } from 'zod';

export const generateOtpSchema = z.object({
  type: z.enum(['phone', 'email']),
  value: z.string().min(1, 'Contact value is required'),
});

export const verifyOtpSchema = z.object({
  type: z.enum(['phone', 'email']),
  value: z.string().min(1, 'Contact value is required'),
  code: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

export type GenerateOtpPayload = z.infer<typeof generateOtpSchema>;
export type VerifyOtpPayload = z.infer<typeof verifyOtpSchema>;
