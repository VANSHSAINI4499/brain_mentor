import { z } from 'zod';

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const NAME_REGEX = /^[a-zA-Z\s]+$/;

export const studentInfoSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .regex(NAME_REGEX, 'Name can only contain letters and spaces'),
  course: z.string()
    .min(1, 'Course is required'),
  phone: z.string()
    .regex(INDIAN_PHONE_REGEX, 'Please enter a valid 10-digit Indian mobile number'),
  email: z.string()
    .email('Please enter a valid email address'),
});

export const otpVerificationSchema = z.object({
  // This schema is mainly to ensure both are verified before proceeding
  phoneVerified: z.boolean().refine(val => val === true, {
    message: 'Phone number must be verified',
  }),
  emailVerified: z.boolean().refine(val => val === true, {
    message: 'Email address must be verified',
  }),
});

export const feedbackSchema = z.object({
  feedback: z.string()
    .min(10, 'Feedback must be at least 10 characters long')
    .max(1000, 'Feedback is too long (maximum 1000 characters)'),
});

export const feedbackSubmissionSchema = z.object({
  ...studentInfoSchema.shape,
  ...otpVerificationSchema.shape,
  ...feedbackSchema.shape,
});

export type StudentInfoFormData = z.infer<typeof studentInfoSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSubmissionSchema>;
