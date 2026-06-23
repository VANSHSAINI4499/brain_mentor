import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// TODO: Set USE_MOCKS to false once Firebase CLI access is restored
const USE_MOCKS = true;
const NETWORK_DELAY = 1200;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SubmitFeedbackPayload {
  workshopId: string;
  name: string;
  course: string;
  phone: string;
  email: string;
  feedback: string;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  id: string;
}

export const submissionService = {
  submitFeedback: async (payload: SubmitFeedbackPayload): Promise<SubmitFeedbackResponse> => {
    if (USE_MOCKS) {
      await delay(NETWORK_DELAY);
      console.log('[Mock] Feedback submitted:', payload);
      // Generate a mock deterministic ID for the frontend to use if needed
      const mockId = `${payload.workshopId}_${payload.phone}_${payload.email}`;
      return { success: true, id: mockId };
    }

    const submitFn = httpsCallable<SubmitFeedbackPayload, SubmitFeedbackResponse>(
      functions,
      'submitFeedback'
    );
    const result = await submitFn(payload);
    return result.data;
  }
};
