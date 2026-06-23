import { z } from 'zod';

export const submitFeedbackSchema = z.object({
  workshopId: z.string().min(1, 'Workshop ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  course: z.string().min(2, 'Course must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  feedback: z.string().min(10, 'Feedback must be at least 10 characters'),
  phoneVerified: z.boolean().refine((val) => val === true, 'Phone must be verified'),
  emailVerified: z.boolean().refine((val) => val === true, 'Email must be verified'),
});

export type SubmitFeedbackPayload = z.infer<typeof submitFeedbackSchema>;
