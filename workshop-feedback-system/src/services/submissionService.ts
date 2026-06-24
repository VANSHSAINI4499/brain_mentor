import { collection,getDocs, getDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface SubmitFeedbackPayload {
  workshopId: string;
  name: string;
  course: string;
  phone: string;
  email: string;
  feedback: string;
  rating?: number;
  experience?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export interface Submission extends SubmitFeedbackPayload {
  id: string;
  submissionRef: string;
  certificateStatus: 'pending' | 'processing' | 'sent' | 'failed';
  emailStatus: 'pending' | 'processing' | 'sent' | 'failed';
  whatsappStatus: 'pending' | 'processing' | 'sent' | 'failed';
  certificateUrl?: string;
  submittedAt: any;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  id: string;
  submissionRef: string;
}

const SUBMISSIONS_COLLECTION = 'submissions';

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export const submissionService = {
  submitFeedback: async (payload: SubmitFeedbackPayload): Promise<SubmitFeedbackResponse> => {
    const submitFn = httpsCallable<SubmitFeedbackPayload, SubmitFeedbackResponse>(
      functions,
      'submitFeedback'
    );
    const result = await submitFn(payload);
    return result.data;
  },

  getSubmissions: async (): Promise<Submission[]> => {
    const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
  },

  getSubmissionsByWorkshop: async (workshopId: string): Promise<Submission[]> => {
    const q = query(
      collection(db, SUBMISSIONS_COLLECTION),
      where('workshopId', '==', workshopId),
      orderBy('submittedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
  },

  getSubmissionById: async (id: string): Promise<Submission | null> => {
    const docRef = doc(db, SUBMISSIONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Submission;
    }
    return null;
  }
};
